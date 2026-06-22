# BRAIN UI ADAPTER AUDIT V1

## Esito

La UI conserva ora l'intero `GhostBrainSnapshot` restituito dalla Brain API. Il nuovo adapter mantiene contemporaneamente i campi legacy usati dai componenti esistenti e i moduli strutturati dello snapshot.

Non sono state aggiunte query o route. I builder Brain e gli snapshot non sono stati modificati.

## Dati precedentemente persi

`useGhostBrain` ricostruiva lo stato usando soltanto:

- memories;
- timeline;
- goals;
- mentalState;
- actions;
- calendarEvents;
- proactiveMessage/proactiveMessages.

Il campo `snapshot` della risposta veniva quindi scartato insieme a:

- `people.socialSuggestions`;
- `people.relationshipMemory`;
- `projects.advisor`;
- `projects.consistency`;
- `curiosity`;
- `trueProactive`;
- `house`;
- segnali, location, profile strutturato e gli altri campi presenti nello snapshot.

`DecisionSnapshot` veniva calcolato durante la costruzione Brain ma non era esposto dalla route ordinaria.

## Adapter aggiunto

`adaptBrainApiResponse()` centralizza il contratto API -> stato UI.

Lo stato `BrainData` contiene ora:

- `snapshot` completo;
- alias legacy `goals`, `actions`, `calendarEvents`, `proactiveMessages`;
- `people`;
- `projects`;
- `curiosity`;
- `trueProactive`;
- `house`;
- `decisionSnapshot`.

Gli alias strutturati leggono prima eventuali campi top-level e poi il campo corrispondente nello snapshot. Il raw snapshot resta disponibile, quindi campi futuri non vengono persi anche se non hanno ancora un alias dedicato.

## DecisionSnapshot

La Brain API riusa `buildDecisionSnapshot(snapshot)` e restituisce il risultato come campo top-level. È una funzione deterministica gia esistente e non esegue query né OpenAI.

Il calcolo Brain e il tipo dello snapshot non sono stati modificati.

## Fallback mantenuti

- Goals: top-level legacy, poi `snapshot.goals.activeGoals`.
- Actions: top-level legacy, poi `snapshot.actions`.
- Calendar: top-level legacy, poi `snapshot.calendar.upcoming`.
- Memories/timeline: top-level legacy, poi snapshot memory.
- Proactive: lista top-level visibile, poi `snapshot.proactive.recent`.
- Proactive singola: campo legacy, poi primo elemento della lista adattata.
- Observations drawer: usa prima `brainData.proactiveMessages`; `/api/proactive/messages` resta fallback quando il payload Brain non contiene card.
- Services drawer: conserva i vecchi props `actions` e `calendarEvents`, usando `BrainData` come sorgente primaria.
- Decision: top-level API, con fallback a un eventuale campo futuro nello snapshot.

Nessun adapter legacy e stato rimosso.

## Campi ora consumati dalla UI

| Sezione esistente | Dati usati |
| --- | --- |
| Memoria | memories legacy + riepilogo relationship memory, social suggestions, project advisor/consistency, curiosity e true proactive |
| Goals | goals adattati con fallback snapshot |
| Mental | mental state + DecisionSnapshot |
| Azioni | actions adattate con fallback legacy |
| Calendario | calendarEvents adattati con fallback legacy |
| Osservazioni | proactiveMessages Brain con fetch legacy di fallback |
| Home Assistant | house state, stanze attive, pattern, learned rules e automation controls |

Non sono state create nuove tab. Il tab Home Assistant gia esistente ora mostra lo snapshot disponibile invece del placeholder generico.

## File modificati

- `app/api/ghostme/brain/route.ts`
- `hooks/useGhostBrain.ts`
- `lib/ghostme/ui/brainUiAdapter.ts` (nuovo)
- `components/ghost/types.ts`
- `components/ghost/GhostDrawers.tsx`
- `app/chat/page.tsx`
- `BRAIN_UI_ADAPTER_AUDIT_V1.md`

## File deliberatamente non modificati

- `lib/ghostme/context/reasoningService.ts`
- tutti gli snapshot Brain;
- TrueProactive e Curiosity;
- Calendar/Reminder;
- Goals/Actions;
- engine House;
- proactive lifecycle.

## Query e API

- Nuove query: 0.
- Nuovi endpoint: 0.
- Nuove chiamate OpenAI: 0.
- Il fetch proactive gia esistente rimane soltanto come fallback legacy.

## Test manuali

1. Aprire la chat e verificare che il caricamento Brain non produca errori console.
2. Controllare nello stato React che `brainData.snapshot` mantenga il payload completo.
3. Aprire Memoria e verificare il riepilogo Contesto Brain.
4. Aprire Mental e verificare DecisionSnapshot anche in assenza di mental state salvato.
5. Aprire Azioni, Goals e Calendario e verificare la compatibilita dei dati esistenti.
6. Aprire Osservazioni con proactive Brain presenti: le card devono apparire senza attendere il fetch fallback.
7. Simulare un payload legacy senza snapshot: i campi top-level devono continuare a funzionare.
8. Simulare un payload con soli dati snapshot: goals/actions/calendar/proactive devono usare i fallback strutturati.
9. Aprire Home Assistant e verificare occupancy, stanze, pattern, regole e controlli.
10. Archiviare una card o completare goal/action e verificare il refresh senza perdita dei campi avanzati.

## Verifiche automatiche

- TypeScript: PASS (`tsc --noEmit`)
- Lint adapter: PASS
- Build Next.js: PASS (`npm run build`)

## Rischi residui

- Le sezioni avanzate sono mostrate come riepilogo compatto; non sono stati aggiunti editor o nuove tab.
- `decisionSnapshot` viene ricostruito deterministicamente nella route perche il tipo GhostBrainSnapshot corrente non lo conserva nel valore restituito.
- Il fallback proactive puo ancora effettuare il fetch legacy quando la lista Brain e vuota; e comportamento preesistente mantenuto per compatibilita.
