# GOALS ↔ ACTIONS CONSISTENCY V1

Data audit: 2026-06-20

## Esito

Il lifecycle Goals/Actions è stato stabilizzato con una relazione strutturata nullable e backward-compatible. Una action completata non completa mai automaticamente il goal: quando termina l'ultima action aperta collegata, il goal resta attivo e viene marcato per review esplicita.

Non sono stati modificati UI, Brain, Curiosity, Proactive, Calendar o Reminder.

## Stato iniziale verificato

Il DB reale è stato letto in modalità metadata/lifecycle-only, senza riportare contenuti personali:

- 44 goal: 6 active, 37 completed, 1 archived;
- 36 action: 7 aperte, 29 completed;
- 0 action con relazione strutturata, perché `goal_id` non esisteva;
- 36 action strutturalmente orfane;
- 44 goal senza action strutturalmente collegate;
- 2 gruppi di action duplicate per stesso utente/titolo;
- nessun gruppo di goal duplicato per stesso utente/titolo.

I doppi completamenti storici non sono dimostrabili perché `action_intents` non aveva `completed_at` né uno storico transizioni. La route permetteva però di completare più volte la stessa action, aggiornando ogni volta `updated_at`.

## Analisi del flow precedente

### Creazione

- `detectAndSaveGoalsDesires` e `detectAndSaveActionIntent` venivano eseguiti in parallelo dentro `runChatPostProcessing`.
- Il detector action non poteva quindi conoscere il goal appena creato dallo stesso messaggio.
- Non esisteva ricerca di un goal già attivo durante la creazione action.
- Non esisteva FK o identificatore comune; `related_topics`, titolo e testo erano solo segnali non persistenti di relazione.

### Completamento

- `detectAndCompleteActionIntent` aggiornava soltanto `action_intents.status`.
- La route action consentiva update ripetuti e riattivazione a `pending` di righe terminali.
- Nessun goal veniva portato a review dopo la chiusura delle action.

### Goal

- Un goal `completed` trovato nuovamente per titolo veniva riportato automaticamente ad `active` e perdeva `completed_at`.
- Solo i goal `archived` erano considerati terminali.

### Snapshot e adapter

- Non esiste un `buildActionSnapshot` separato.
- `buildGoalsSnapshot` legge goal e action in due query separate e restituisce le action in `pendingActions`.
- `reasoningService`, `decisionSnapshot` e l'adapter Brain/UI consumano questi array senza una relazione strutturata.
- Gli snapshot usano `select("*")`, quindi ricevono automaticamente `goal_id`, `needs_review` e i nuovi timestamp senza richiedere modifiche a Brain/UI.

## Flow finale

```text
Messaggio utente
  ↓
verifica completamento di una action aperta
  ↓
detect/update goal (senza riattivare goal terminali)
  ↓
link conservativo di eventuali action orfane aperte
  ↓
detect action
  ↓
goal_id dal goal dello stesso messaggio
oppure match forte e univoco con un goal già attivo
  ↓
Action completed (idempotente)
  ↓
esistono altre action aperte collegate?
  ├─ sì → goal invariato
  └─ no → goal active/learning + needs_review=true
                ↓
         decisione esplicita
         ├─ completed → consentito solo senza action aperte
         └─ active → review chiusa, goal ancora attivo
```

## Relazione e criteri di linking

- `action_intents.goal_id` è nullable: i dati esistenti restano validi.
- Il goal creato/aggiornato dallo stesso messaggio è il candidato preferito.
- Per una action indipendente, il link avviene solo verso goal `active`/`learning` con evidenza forte:
  - stesso source message;
  - titolo goal contenuto nel testo action;
  - combinazione sufficiente di topic e parole significative condivise.
- Se i due migliori candidati sono troppo vicini, nessun link viene creato.
- Il backlink di action legacy considera solo action aperte, senza `goal_id`, e usa una soglia più alta.
- Nessun backfill SQL testuale assegna automaticamente i 36 record legacy: l'ambiguità resta visibile invece di creare relazioni sbagliate.

## Lifecycle e casi gestiti

### Action

- `detected → pending/completed/archived`: consentito.
- `pending → completed/archived`: consentito.
- `completed → completed`: idempotente, nessun nuovo timestamp o review duplicata.
- `completed/archived → pending`: rifiutato con `409`.
- Una nuova action con stesso titolo di una action già aperta non crea un duplicato; può completare il link mancante.
- Il completamento salva `completed_at`.

### Goal

- Un detector non riattiva più goal `completed` o `archived`.
- Un goal terminale non viene riattivato dalla route.
- Il goal non viene completato automaticamente dalla chiusura action.
- L'ultima action completata imposta `needs_review` e `review_requested_at`.
- Confermare `active` durante la review chiude la review senza completare il goal.
- Completare un goal con action collegate ancora aperte viene rifiutato con `409`.
- Completamento/archiviazione espliciti chiudono la review.

### Goal o action senza relazione

- Un goal senza action è valido: non viene completato o alterato automaticamente.
- Una action con match ambiguo resta orfana (`goal_id = null`).
- Completare una action orfana non modifica alcun goal.

## File modificati

- `lib/ghostme/goalsDesires.ts`
- `lib/ghostme/actionLayer.ts`
- `lib/ghostme/chat/chatPostProcessing.ts`
- `lib/ghostme/goals/goalsActionsLifecycle.ts` (nuovo)
- `app/api/actions/update-status/route.ts`
- `app/api/goals/update-status/route.ts`
- `supabase/migrations/goals_actions_consistency_v1.sql` (nuova)

## Migration

La migration è additive e idempotente:

- aggiunge `action_intents.goal_id uuid nullable`;
- aggiunge FK verso `goals_desires(id)` con `ON DELETE SET NULL`;
- aggiunge `action_intents.completed_at`;
- aggiunge `goals_desires.needs_review` con default `false`;
- aggiunge `goals_desires.review_requested_at`;
- aggiunge gli indici per lookup goal/status/review;
- valorizza `completed_at = updated_at` per le action legacy già completed;
- non assegna `goal_id` ai dati legacy in modo euristico.

La migration deve essere applicata prima del deploy del codice che legge le nuove colonne.

## Rischi residui

- Le 36 action legacy restano inizialmente senza relazione. Solo action aperte con match futuro molto forte possono essere collegate automaticamente.
- I 2 gruppi duplicati legacy non vengono eliminati: una deduplicazione distruttiva richiederebbe revisione manuale.
- Il linking testuale è intenzionalmente prudente e può produrre falsi negativi; questo è preferibile a collegare e completare il goal sbagliato.
- `needs_review` è disponibile negli snapshot ma non viene visualizzato esplicitamente perché la UI è fuori scope.
- Non esiste una tabella storico transizioni; `completed_at` evita ambiguità futura ma non ricostruisce eventi passati.
- Gli update goal/action e il review marker sono più operazioni DB, non una transazione SQL unica. I filtri di stato rendono i retry idempotenti, ma un'interruzione tra le operazioni può ritardare il marker di review.

## Verifiche

- TypeScript: PASS.
- Lint mirato sui nuovi componenti lifecycle e sulle route: PASS.
- Build di produzione Next.js: PASS.
- Nessun file Calendar, Reminder, Brain, Curiosity, Proactive o UI modificato.
