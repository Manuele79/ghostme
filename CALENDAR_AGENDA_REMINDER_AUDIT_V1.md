# CALENDAR + AGENDA + REMINDER UNIFICATION V1

Data audit: 2026-06-20

## Esito

Calendar, Agenda e Reminder usano ora una pipeline unica. Tutte le mutazioni evento passano da `calendarService`; agenda e reminder producono card con identità deterministica; Brain API e Proactive API leggono le card tramite lo stesso loader e gli stessi filtri.

Non sono stati modificati Goals/Actions, Curiosity, TrueProactive o Home Assistant. Le sole modifiche UI sono correzioni di wiring e azioni card, senza variazioni grafiche.

## Flow finale

```text
Chat calendar / Drawer calendar
  ↓
calendarService (validazione e normalizzazione unica)
  ↓
calendar_events
  ↓
refreshCalendarMessages
  ├─ refreshAgendaMessage → agenda_YYYY-MM-DD
  └─ reminderEngine       → reminder_YYYY-MM-DD_EVENTID
  ↓
ghost_proactive_messages
  ↓
loadVisibleProactiveMessages
  ├─ Brain API / front cards
  └─ Proactive API / drawer osservazioni
```

Il worker reminder entra direttamente nel ramo `reminderEngine` e non costruisce agenda, Brain o contesti AI/HA.

## Bug trovati

### Calendar contract

- Gli appuntamenti ricevevano sempre un `remind_at` automatico un'ora prima, anche senza richiesta esplicita.
- Le note create dal drawer ricevevano automaticamente `end_at` e `remind_at`.
- La PATCH aveva una normalizzazione separata e assumeva `type=note` quando il campo mancava, con rischio di convertire un appuntamento durante una modifica parziale.
- La PATCH riportava sempre lo status ad `active`, potendo riattivare record chiusi.
- Appointment senza `start_at` e reminder senza `remind_at` non erano rifiutati in modo uniforme.
- La maintenance poteva portare note datate allo status `completed`, fuori dal contratto note.

### Agenda

- `refreshAgendaMessage` dipendeva da `buildGhostSituation`, caricando molto più del calendario.
- La card agenda includeva anche eventi futuri anziché solo il giorno corrente.
- Agenda e reminder erano accoppiati dentro `refreshAgendaMessage`.
- Il giorno veniva calcolato col timezone del processo invece di `Europe/Rome`.
- Le card legacy potevano non avere `logical_key`; la deduplica era basata in parte su `created_at` e stato visibile.

### Reminder

- La finestra imminente interrogava `start_at` invece di `remind_at`.
- Quando esisteva almeno un reminder imminente, altre card reminder stale non venivano scadute.
- La scadenza non era per identità evento.
- `reminder` era trattato come categoria one-per-day nel fallback del service, pur essendo one-per-event.
- Il fallback legacy poteva riutilizzare una card con stesso testo per due eventi diversi.

### Reader e UI

- Brain API applicava un filtro giornaliero locale; Proactive API no. Le due API potevano mostrare set diversi.
- Il drawer creava date reminder implicite per note/appuntamenti.
- Modificare un reminder dal drawer poteva convertirlo in nota.
- Agenda mostrava l'azione `Rispondi`, non utile per una card riepilogativa.

## Fix applicati

### `calendar_events`

- Contratto centralizzato in `calendarService` per create e update.
- `appointment`: `start_at` obbligatorio; `end_at` predefinito a +1 ora se assente; `remind_at` solo se esplicito.
- `reminder`: `remind_at` obbligatorio; `start_at=remind_at` se mancante; `end_at=null`.
- `note`/`voice_note`: `start_at` opzionale; `end_at=null`; `remind_at` conservato solo se esplicito.
- Date invalide e `end_at < start_at` vengono rifiutati con `400`.
- Gli eventi non active non sono modificabili o cancellabili nuovamente.
- La maintenance completa automaticamente solo appointment terminati; non completa note/reminder.

### Agenda giornaliera

- Query diretta a `calendar_events`, senza `buildGhostSituation`.
- Confini giorno calcolati in `Europe/Rome`, DST incluso.
- Solo eventi active di oggi.
- Identità: `agenda_YYYY-MM-DD`.
- Una sola card visibile per giorno; card visibili stale/duplicate diventano `expired`.
- Card dismissed + stesso contenuto resta dismissed.
- Card dismissed + contenuto cambiato torna unread tramite l'upsert centrale.

### Reminder per evento

- Query su `remind_at` nella finestra `[now-30m, now+30m]`.
- Identità: `reminder_YYYY-MM-DD_EVENTID`.
- Ogni evento imminente viene upsertato indipendentemente.
- Card non più corrispondenti a eventi active/imminenti diventano `expired`; le card `answered` restano answered.
- Duplicati della stessa logical key vengono scaduti.
- `Fatto` completa l'evento active, marca la card answered e aggiorna subito agenda/reminder.
- Un retry di `Fatto` su evento già completed è idempotente.
- `Archivia` marca solo la card dismissed; l'evento resta active.
- Cancellazione/completamento esterni fanno scadere la card al refresh.

### Worker reminder

- `/api/worker/reminder` chiama solo `refreshActiveReminderUsers` del reminder engine.
- Gli utenti vengono ricavati da eventi imminenti o card reminder ancora da riconciliare.
- Nessun import o chiamata OpenAI, HA, GhostBrain, reasoning o agenda.
- Protezione secret invariata tramite `requireWorkerRequest`.

### Reader coerenti

- Brain API e Proactive API usano `loadVisibleProactiveMessages`.
- Status visibili: `unread`, `read`.
- Status esclusi: `dismissed`, `answered`, `expired`.
- Categorie ammesse: `agenda`, `reminder`, `observation`, `curiosity`, `home_question`, `daily_briefing`.
- Le agenda devono avere la logical key del giorno corrente.
- La deduplica applicativa è identica per front cards e drawer.

### UI essenziale

- Reminder: `Fatto` e `Archivia` restano disponibili sia nelle front card sia nel drawer.
- Agenda: solo `Archivia`; `Rispondi` è stato rimosso.
- Le card vengono nascoste localmente e il refresh le mantiene nascoste grazie ai filtri server.
- Il drawer non genera più reminder impliciti per note/appuntamenti e conserva il tipo reale durante l'editing.

## Stato DB reale rilevato

Lettura aggregata, senza titoli o contenuti:

- 8 eventi totali: 5 appointment, 3 reminder;
- nessun appointment senza `start_at`;
- nessun reminder senza `remind_at`;
- 1 reminder legacy senza `start_at`;
- 6 agenda visibili prima della normalizzazione;
- nessun gruppo duplicato visibile con logical key già valorizzata;
- 38 card agenda legacy e 6 card reminder legacy senza logical key.

## Migration

`supabase/migrations/calendar_agenda_reminder_unification_v1.sql`:

- backfill `start_at=remind_at` per reminder legacy;
- ricostruisce la logical key giornaliera delle agenda legacy usando `Europe/Rome`;
- scade reminder legacy senza event UUID, perché non collegabili in sicurezza;
- scade duplicati visibili conservando il record più recente;
- aggiunge un indice unico parziale sulle logical key visibili;
- aggiunge il check DB per i campi temporali obbligatori per tipo.

La migration deve essere applicata prima del deploy del nuovo runtime.

## File modificati

- `lib/ghostme/calendar/calendarService.ts`
- `lib/ghostme/agenda/agendaEngine.ts`
- `lib/ghostme/agenda/reminderEngine.ts`
- `lib/ghostme/proactive/proactiveMessageService.ts`
- `lib/ghostme/proactive/visibleProactiveMessages.ts` (nuovo)
- `app/api/calendar-events/route.ts`
- `app/api/worker/reminder/route.ts`
- `app/api/proactive/messages/route.ts`
- `app/api/ghostme/brain/route.ts`
- `app/api/ghostme/proactive/read/route.ts`
- `components/ghost/GhostChat.tsx`
- `components/ghost/GhostDrawers.tsx`
- `supabase/migrations/calendar_agenda_reminder_unification_v1.sql` (nuova)

## Rischi residui

- Le card reminder legacy senza event UUID vengono scadute, non collegate euristicamente.
- Il refresh calendario aggiorna evento e card in operazioni DB separate. I logical key e gli upsert rendono sicuro il retry, ma non costituiscono una singola transazione SQL.
- Le card reminder vengono riconciliate al massimo al successivo worker (5 minuti) se un evento cambia fuori da `calendarService`.
- `voice_note` segue il contratto note per compatibilità con il tipo esistente.
- Il parser chat usa OpenAI prima di entrare nel service; output incompleti vengono ora rifiutati invece di creare eventi invalidi.

## Test manuali

Prerequisito: applicare la migration e configurare il cron reminder ogni 5 minuti con secret.

1. Creare un appointment per oggi dal drawer o dalla chat.
   - Verificare `type=appointment`, `start_at` valorizzato, status active.
   - Verificare una sola card `agenda_YYYY-MM-DD`.
2. Modificare titolo/orario dello stesso appointment.
   - La stessa agenda cambia contenuto e resta una sola card.
3. Archiviare l'agenda, quindi fare refresh senza cambiare calendario.
   - La card non ricompare.
4. Cambiare il calendario di oggi dopo aver archiviato l'agenda.
   - La stessa logical key torna unread con contenuto aggiornato.
5. Creare dalla chat un reminder con `remind_at` tra 10 minuti.
   - Verificare `start_at=remind_at` e una card `reminder_YYYY-MM-DD_EVENTID`.
6. Premere `Archivia` sul reminder.
   - La card sparisce; `calendar_events.status` resta active.
7. Creare un secondo reminder imminente e premere `Fatto`.
   - La card sparisce con status answered; l'evento diventa completed.
8. Aggiornare Brain e drawer osservazioni.
   - Entrambi mostrano lo stesso set di card unread/read.
9. Eseguire più volte il worker reminder.
   - Nessun duplicato visibile per logical key.
10. Verificare import worker/reminder.
    - Nessun riferimento OpenAI, Home Assistant, GhostBrain o reasoning.

## Verifiche automatiche

- TypeScript: PASS.
- Lint mirato sui file pipeline/API: PASS.
- Build di produzione Next.js: PASS.
- Import audit worker reminder: PASS.
- `git diff --check`: PASS.
