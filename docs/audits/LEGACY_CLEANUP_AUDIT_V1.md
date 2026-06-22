# LEGACY CLEANUP AUDIT V1

## Perimetro e metodo

Audit statico in sola lettura eseguito sul workspace corrente il 20 giugno 2026.

Perimetro analizzato:

- 157 file sorgente in `app`, `components`, `hooks`, `lib` e `scripts`;
- 27 API route Next.js;
- 109 moduli sotto `lib`;
- 13 file UI/hook;
- 3 migration SQL;
- configurazione cron, package e documentazione tecnica.

Sono stati esclusi dalla classificazione di codice morto i contenuti generati o di terze parti: `.next`, `node_modules`, `.git` e `.agents`.

Metodo:

1. Inventario degli entrypoint Next, cron e webhook.
2. Grafo degli import locali e dei caller.
3. Ricerca dei simboli esportati senza riferimenti.
4. Verifica manuale dei candidati morti e delle catene di import.
5. Lettura dei side effect DB, delle chiamate AI e dei consumer UI.

Un file e classificato **morto certo** soltanto se non e un entrypoint, non ha importer, non ha riferimenti ai suoi export e non e richiesto dal framework.

## Sintesi

| Classe | Esito |
| --- | --- |
| Core/runtime attivo | Chat, Brain, snapshot, calendar/reminder, goals/actions, people, house learning, location, UI |
| Legacy ancora attivo | Candidate proactive storico, Curiosity Engine AI, contextBuilder, home reasoning/cognitive builders |
| Solo debug/test | Sei route protette e `homeContextBuilder` |
| Morti certi | Cinque moduli |
| Export inutilizzati in file attivi | Sette |
| God files | `GhostDrawers.tsx`, `reasoningService.ts`, `app/chat/page.tsx` |
| Sovrapposizione dominante | Loader Brain/context e quattro rappresentazioni Home |

Il sistema non ha un semplice blocco “vecchio” sostituibile in una volta. Il runtime e ibrido: nuovo snapshot deterministico e vecchi generatori AI vengono eseguiti nello stesso worker.

## File attivi

### Entrypoint applicativi

Sono entrypoint Next attivi, indipendentemente dal fatto che abbiano link interni:

- `app/page.tsx`
- `app/login/page.tsx`
- `app/setup/page.tsx`
- `app/setup/profile/page.tsx`
- `app/chat/page.tsx`
- `app/memory/page.tsx`
- `app/layout.tsx`

Route applicative con caller UI, cron o integrazione esterna:

- `app/api/chat/route.ts`
- `app/api/ghostme/brain/route.ts`
- `app/api/ghostme/proactive/read/route.ts`
- `app/api/proactive/messages/route.ts`
- `app/api/actions/update-status/route.ts`
- `app/api/goals/update-status/route.ts`
- `app/api/calendar-events/route.ts`
- `app/api/conversation-summary/route.ts`
- `app/api/memory/search/route.ts`
- tutte le route `app/api/location/*`
- `app/api/home-assistant/event/route.ts`
- `app/api/house-suggestion-response/route.ts`
- `app/api/worker/reminder/route.ts`
- `app/api/worker/proactive/route.ts`
- `app/api/worker/house/route.ts`

I tre worker sono anche entrypoint cron dichiarati in `vercel.json`: reminder ogni 5 minuti, proactive alle 06/12/18, house ogni ora.

### Chat e memoria

Pipeline chat attiva:

- `lib/ghostme/chat/ghostChatOrchestrator.ts`
- `lib/ghostme/chat/chatMessageAnalyzer.ts`
- `lib/ghostme/chat/chatCalendarFlow.ts`
- `lib/ghostme/chat/chatContextBuilder.ts`
- `lib/ghostme/chat/chatExternalServices.ts`
- `lib/ghostme/chat/chatPromptBuilder.ts`
- `lib/ghostme/chat/chatPostProcessing.ts`
- `lib/ghostme/chat/chatTypes.ts`
- `lib/ghostme/core/messageClassifier.ts`
- `lib/ghostme/retrieval.ts`
- `lib/ghostme/topicDetector.ts`
- `lib/ghostme/topicLinks.ts`
- `lib/ghostme/entityExtractor.ts`
- `lib/ghostme/mentalState.ts`
- `lib/ghostme/dynamicSelfProfile.ts`
- `lib/ghostme/contradictions.ts`
- `lib/ghostme/timeline.ts`
- `lib/ghostme/memoryDecay.ts`
- `lib/ghostme/memory/memorySnapshot.ts`
- `lib/ghostme/memory/memorySearchFlow.ts`
- `lib/ghostme/conversationSummary.ts`

### Brain e snapshot

Core Brain attivo:

- `lib/ghostme/context/reasoningService.ts`
- `lib/ghostme/context/decisionSnapshot.ts`
- `lib/ghostme/context/userContextGraph.ts`
- `lib/ghostme/context/contextSignals.ts`
- `lib/ghostme/situation/situationEngine.ts`
- `lib/ghostme/memory/memorySnapshot.ts`
- `lib/ghostme/people/peopleSnapshot.ts`
- `lib/ghostme/people/relationshipMemorySnapshot.ts`
- `lib/ghostme/people/socialSuggestionSnapshot.ts`
- `lib/ghostme/goals/goalsSnapshot.ts`
- `lib/ghostme/projects/projectMemorySnapshot.ts`
- `lib/ghostme/projects/goalProjectConsistencySnapshot.ts`
- `lib/ghostme/projects/projectAdvisorSnapshot.ts`
- `lib/ghostme/curiosity/curiositySnapshot.ts`
- `lib/ghostme/proactive/trueProactiveSnapshot.ts`
- `lib/ghostme/home/houseStateSnapshot.ts`
- `lib/ghostme/home/houseRouteSnapshot.ts`
- `lib/ghostme/home/homeComfortRiskSnapshot.ts`
- `lib/ghostme/home/homeLocationConsistency.ts`

`buildGhostBrainSnapshot` ha caller runtime in Brain API, chat context e worker proactive. `DecisionSnapshot`, CuriositySnapshot e TrueProactiveSnapshot non sono piu solo debug: alimentano API/UI e writer proactive.

### Proactive attivo

Contratto e writer comuni:

- `lib/ghostme/proactive/proactiveMessageService.ts`
- `lib/ghostme/proactive/proactiveMessageDedupe.ts`
- `lib/ghostme/proactive/proactiveCardLifecycle.ts`
- `lib/ghostme/proactive/visibleProactiveMessages.ts`

Nuovo percorso deterministico:

- `lib/ghostme/proactive/trueProactiveSnapshot.ts`
- `lib/ghostme/proactive/trueProactiveCardWriter.ts`
- `lib/ghostme/curiosity/curiositySnapshot.ts`
- `lib/ghostme/proactive/curiosityCardWriter.ts`

Orchestrazione ibrida e manutenzione:

- `lib/ghostme/proactive/proactiveUserFlow.ts`
- `lib/ghostme/proactive/proactiveMaintenanceFlow.ts`
- `lib/ghostme/proactive/dailyBriefingRepository.ts`
- `lib/ghostme/proactive/dailyBriefingBuilder.ts`

### Calendar, reminder, goals e actions

Attivi:

- `lib/ghostme/calendar/calendarIntent.ts`
- `lib/ghostme/calendar/calendarService.ts`
- `lib/ghostme/chat/chatCalendarFlow.ts`
- `lib/ghostme/agenda/agendaEngine.ts`
- `lib/ghostme/agenda/reminderEngine.ts`
- `lib/ghostme/actionLayer.ts`
- `lib/ghostme/goalsDesires.ts`
- `lib/ghostme/goals/goalsActionsLifecycle.ts`
- `lib/ghostme/goals/goalsSnapshot.ts`

I detector e i lifecycle writer non sono duplicati dei relativi snapshot: i primi persistono, gli snapshot leggono e derivano stato.

### People e location

Attivi:

- `lib/ghostme/people/peopleGraphService.ts`
- `lib/ghostme/people/peopleSnapshot.ts`
- `lib/ghostme/people/relationshipMemorySnapshot.ts`
- `lib/ghostme/people/socialSuggestionSnapshot.ts`
- `lib/ghostme/relationshipResolver.ts`
- `lib/ghostme/location/placeService.ts`
- tutti i flow `lib/ghostme/location/*Flow.ts`
- `lib/ghostme/observation/observationEngine.ts`

### House

Attivi nel webhook o nel worker:

- `lib/ghostme/home/houseWorkerFlow.ts`
- `lib/ghostme/home/houseSuggestionResponseFlow.ts`
- `lib/ghostme/homeAssistant/haClient.ts`
- `lib/ghostme/homeAssistant/homeAssistantAccess.ts`
- `lib/ghostme/homeAssistant/homeEntityMapper.ts`
- `lib/ghostme/homeAssistant/homeEventSignificance.ts`
- `lib/ghostme/homeAssistant/homeEventLogger.ts`
- `lib/ghostme/homeAssistant/houseEntityRegistry.ts`
- `lib/ghostme/homeAssistant/houseLightLearningFlow.ts`
- `lib/ghostme/homeAssistant/housePatternEngine.ts`
- `lib/ghostme/homeAssistant/houseRouteLearningEngine.ts`
- `lib/ghostme/homeAssistant/houseSuggestionEngine.ts`
- `lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts`
- `lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts`
- `lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts`
- `lib/ghostme/homeAssistant/homeReasoningBuilder.ts`

### UI

Tutti i componenti e hook sotto `components/ghost` e `hooks` hanno caller attivi. Non risultano componenti React scollegati.

- `app/chat/page.tsx`: 763 righe, orchestratore pagina.
- `components/ghost/GhostDrawers.tsx`: 1.798 righe, massimo god file UI.
- `components/ghost/GhostChat.tsx`: 340 righe.
- `components/ghost/GhostCanvasCore.tsx`: 320 righe.
- `hooks/useGhostVoice.ts`: 158 righe.
- `hooks/useGhostBrain.ts` e `lib/ghostme/ui/brainUiAdapter.ts`: adapter attivi.

## Legacy ma ancora necessario

### Vecchio proactive runtime

Questi file sono legacy architetturale ma ancora eseguiti dal worker proactive:

- `lib/ghostme/proactive/proactiveCandidateBuilder.ts`
- `lib/ghostme/proactive/proactiveCandidateRanker.ts`
- `lib/ghostme/proactive/proactiveDecisionEngine.ts`
- `lib/ghostme/observation/observationInsightEngine.ts`
- `lib/ghostme/patterns/patternInsightEngine.ts`
- `lib/ghostme/butler/butlerEngine.ts`
- `lib/ghostme/curiosity/curiosityEngine.ts`
- `lib/ghostme/proactive/dailyBriefingBuilder.ts`

`proactiveUserFlow` prima scrive CuriositySnapshot e TrueProactive, poi costruisce ancora i candidati storici, sceglie il migliore e scrive anche quello. Il vecchio runtime non e fallback passivo: observation, pattern, decision e butler vengono ancora calcolati a ogni run.

`lib/ghostme/proactive/proactiveTrigger.ts` e un secondo ingresso legacy attivo sui cambi posizione tramite `locationUpdateFlow`. Usa `buildCurrentContext` e `proactiveDecisionEngine`, separatamente dal worker schedulato. Gli altri valori del suo enum trigger non hanno caller correnti.

### Vecchio Curiosity Engine

`lib/ghostme/curiosity/curiosityEngine.ts` e ancora importato dal candidate builder e usa OpenAI. Il candidato viene escluso dal ranker soltanto quando il writer CuriositySnapshot ha gia processato una curiosity. Se lo snapshot non produce card, il motore storico resta il fallback effettivo.

Quindi:

- CuriositySnapshot: attivo, deterministico, writer reale.
- Curiosity Engine: attivo, AI, fallback legacy.
- Non sono duplicati morti; sono due implementazioni concorrenti dello stesso dominio.

### Context builder storico

`lib/ghostme/context/contextBuilder.ts` resta necessario per `proactiveTrigger` e per i tipi usati da decision/butler legacy. Ricostruisce `GhostCurrentContext` da SituationEngine, Home Reasoning, behavior rules e proactive DB.

`proactiveCandidateBuilder` contiene un secondo adapter locale `buildCurrentContextFromSnapshot` con lo stesso output concettuale. Nel worker normale viene usato l'adapter da snapshot; nei trigger location viene usato il builder storico con query proprie.

### Home legacy ancora necessario

- `homeReasoningBuilder.ts`: attivo nel vecchio contextBuilder e nella test route.
- `cognitiveHouseBuilder.ts`: attivo nel suggestion engine del worker house.
- `houseStateSnapshot.ts`: rappresentazione core del Brain.
- `homeContextBuilder.ts`: solo debug/test, non produzione ordinaria.

I primi tre non sono intercambiabili senza cambiare consumer e semantica.

## Solo debug o tooling

### Route debug/test

Le seguenti route sono entrypoint reali ma solo diagnostici; tutte richiedono development o worker secret:

- `app/api/debug-ha-entities/route.ts`
- `app/api/debug-house-logger/route.ts`
- `app/api/debug-reasoning/route.ts`
- `app/api/test-ha/route.ts`
- `app/api/test-home-context/route.ts`
- `app/api/test-home-reasoning/route.ts`

`lib/ghostme/homeAssistant/homeContextBuilder.ts` e importato esclusivamente da `test-home-context`: e quindi **debug-only**, non morto.

### Tooling/documentazione

- `scripts/project-audit.mjs`: tool manuale, non runtime.
- `PROJECT_AUDIT*.md/json`: output generati e datati 13 giugno 2026; non descrivono tutte le integrazioni correnti.
- I documenti `*_AUDIT_V1.md`, system map e priority list sono documentazione, non moduli runtime.
- Le migration SQL sono artefatti operativi, non devono essere giudicate dal grafo import TypeScript.

## File morti certi

### `lib/ghostme/agenda/appointmentReminderNotification.ts`

- Nessun import.
- `sendAppointmentReminderNotification` non ha caller.
- Contiene un vecchio invio diretto Home Assistant che il reminder worker corrente non usa.

### `lib/ghostme/homeAssistant/houseAutomationContext.ts`

- Nessun import.
- `buildHouseAutomationContext` non ha caller.
- Il worker usa entity registry, cognitive house e planner, non questo formatter.

### `lib/ghostme/homeAssistant/houseLearnedRulesContext.ts`

- Nessun import.
- `buildHouseLearnedRulesContext` non ha caller.
- `chatContextBuilder.ts` contiene un helper locale omonimo che formatta le regole gia presenti nello snapshot.

### `lib/ghostme/location/locationEngine.ts`

- Nessun import.
- Tipi `RawLocationSignal`/`SignificantPlace` e `classifyLocationSignal` non hanno riferimenti.
- La location runtime usa `placeService` e i flow API.

### `lib/ghostme/services/timeService.ts`

- Nessun import.
- `getLocalTimeContext` non ha caller.
- Il service router corrente gestisce web, news e weather; l'orario e gia incluso nei context builder.

`next-env.d.ts` compare tecnicamente senza importer, ma e framework-managed e **non** e codice morto.

## Export mai usati dentro file attivi

Questi simboli non hanno caller, ma i rispettivi file contengono altre funzioni attive. Non sono motivo per eliminare l'intero file.

| Export | File | Stato del file |
| --- | --- | --- |
| `getActionIntentContext` | `lib/ghostme/actionLayer.ts` | attivo per detect/complete/cleanup |
| `getUpcomingCalendarEvents` | `lib/ghostme/calendar/calendarService.ts` | core Calendar attivo |
| `buildReasoningSnapshot` | `lib/ghostme/context/reasoningService.ts` | `buildGhostBrainSnapshot` core attivo |
| `getDynamicSelfProfileContext` | `lib/ghostme/dynamicSelfProfile.ts` | update post-processing attivo |
| `getGoalsDesiresContext` | `lib/ghostme/goalsDesires.ts` | detector goal attivo |
| `getLastKnownPlace` | `lib/ghostme/location/placeService.ts` | save/detect/current state attivi |
| `getTimelineContext` | `lib/ghostme/timeline.ts` | timeline writer attivo |

`buildReasoningSnapshot` e la porzione legacy piu rilevante: ricostruisce Situation e Home Reasoning, ma nessuna route o orchestratore la chiama. La route debug usa invece `buildGhostBrainSnapshot` + `buildDecisionSnapshot`.

## Route legacy o uso esterno non verificato

### `app/api/memory/route.ts`

E un entrypoint Next e quindi non puo essere dichiarato morto staticamente. Non ha caller interni nel workspace; la UI usa `/api/memory/search` e il post-processing scrive direttamente le memorie. Resta classificato **legacy/esposto, uso esterno non verificato**.

### Boot browser del proactive worker

`app/chat/page.tsx` contiene ancora un fetch a `/api/worker/proactive` ogni 30 minuti di boot locale. La route worker richiede un secret, mentre il browser non lo invia. Il cron Vercel resta il caller operativo affidabile. Questo blocco client e quindi **attivo nel bundle ma normalmente inefficace in produzione**, non codice morto statico.

## Duplicati e sovrapposizioni

### 1. Proactive nuovo e storico

```text
GhostBrainSnapshot
  -> CuriositySnapshot writer
  -> TrueProactive writer
  -> candidate builder storico
     -> decision AI
     -> observation AI
     -> pattern AI
     -> curiosity AI fallback
     -> butler AI
  -> best candidate legacy
  -> daily briefing AI
```

Il contratto card e condiviso, ma selezione e generazione restano doppie. TrueProactive non sostituisce ancora observation, pattern, butler e daily briefing.

### 2. Curiosity

- `curiositySnapshot.ts`: derivazione deterministica da snapshot strutturati.
- `curiosityCardWriter.ts`: writer deterministico.
- `curiosityEngine.ts`: query proprie + OpenAI.

La condivisione delle logical key evita la collisione principale con TrueProactive, ma il dominio cognitivo resta implementato due volte.

### 3. Home context/reasoning

Quattro rappresentazioni sovrapposte:

| Modulo | Sorgente | Consumer |
| --- | --- | --- |
| `homeContextBuilder.ts` | HA live | test route soltanto |
| `homeReasoningBuilder.ts` | HA live | contextBuilder legacy + test |
| `cognitiveHouseBuilder.ts` | HA live | houseSuggestionEngine |
| `houseStateSnapshot.ts` | HA live + entities/events DB | Brain, route/risk/consistency snapshot |

Duplicano filtri di presence, rooms, media, lights, persone e formatting. `homeEntityMapper` e condiviso solo da parte della pipeline.

### 4. House learned rules context

- File morto `houseLearnedRulesContext.ts` esegue una query propria.
- Helper locale omonimo in `chatContextBuilder.ts` formatta `snapshot.home.learnedRules`.

Il secondo e quello effettivamente usato.

### 5. Loader Brain

`buildGhostBrainSnapshot` avvia in parallelo:

- `loadUserContextGraph`;
- `buildGhostSituation`;
- `buildPeopleSnapshot`;
- `buildMemorySnapshot`;
- `buildGoalsSnapshot`.

Sovrapposizioni DB certe:

- `life_topics`: graph + situation + people + memory;
- `memories_active`: graph + people + memory;
- `people_graph`: graph + people;
- `goals_desires`: graph + situation + goals;
- `action_intents`: graph + situation + goals;
- `calendar_events`: graph + situation;
- `conversation_summaries` e `episodic_memories`: graph + situation + memory;
- `topic_links` e timeline: situation + memory.

Questa e la principale duplicazione di query del core Brain.

### 6. Chat retrieval

`chatContextBuilder` costruisce l'intero GhostBrainSnapshot e, in parallelo logico, usa `buildContextualMemory`, che rilegge `life_topics`, `memories_active`, `topic_links`, episodi e summary. La chat duplica quindi parte del costo gia sostenuto dal Brain snapshot.

### 7. Context adapter

- `contextBuilder.buildCurrentContext`: Situation + Home Reasoning + behavior + proactive query.
- `proactiveCandidateBuilder.buildCurrentContextFromSnapshot`: adapter locale dallo snapshot precompilato.

Producono lo stesso contratto `GhostCurrentContext` da fonti diverse.

### 8. Agenda

- Calendar service aggiorna l'agenda tramite `refreshAgendaMessage`.
- Proactive user flow ricostruisce ancora `agendaMessage` dal candidate builder e la upserta.

La logical key impedisce duplicati visibili, ma esistono due trigger writer.

### 9. Daily briefing

`dailyBriefingRepository` rilegge calendar, goals, actions, mental state, timeline e topics dopo che il worker ha gia costruito il GhostBrainSnapshot. E un loader parallelo ancora attivo.

### 10. UI god files

`GhostDrawers.tsx` concentra:

- rendering di tre drawer;
- fetch location/proactive;
- lifecycle goal/action/calendar;
- stato locale e optimistic updates;
- rendering memory, home, profile, traits e observations.

`app/chat/page.tsx` concentra boot auth/chat, geolocation, voice, proactive lifecycle, refresh Brain e composizione UI.

Sono sovrapposti a hook esistenti (`useGhostBrain`, `useGhostChat`, `useGhostVoice`) ma continuano a possedere molta orchestrazione direttamente.

### 11. Debug HA

`debug-ha-entities`, `debug-house-logger` e `test-ha` leggono tutti HA live con presentazioni diverse. Sono diagnostici sovrapposti, non runtime core.

## File da NON eliminare ancora

- Tutto il proactive candidate stack storico: copre ancora observation, pattern, butler e decision AI.
- `curiosityEngine.ts`: resta fallback quando CuriositySnapshot non seleziona card.
- `proactiveTrigger.ts` e `contextBuilder.ts`: il cambio posizione li usa realmente.
- `homeReasoningBuilder.ts`: consumer runtime nel trigger location.
- `cognitiveHouseBuilder.ts`: necessario al suggestion engine orario.
- `houseStateSnapshot.ts`: core Brain e base dei nuovi snapshot Home.
- `homeContextBuilder.ts`: solo debug, ma la sua test route e ancora un entrypoint esplicito.
- `situationEngine.ts`, `userContextGraph.ts` e i domain snapshot: sono sovrapposti nelle query ma tutti hanno consumer correnti.
- `dailyBriefingRepository.ts`/`dailyBriefingBuilder.ts`: il worker li usa ancora.
- `app/api/memory/route.ts`: uso esterno non dimostrabile dal solo workspace.
- Route debug/test: finche resta necessaria diagnostica operativa protetta.
- `next-env.d.ts`, migration SQL e file di configurazione framework.
- I file che contengono export inutilizzati ma anche writer attivi.

## Ordine consigliato di pulizia

L'ordine seguente descrive dipendenze e rischio; non contiene patch.

1. **Conferma esterna degli entrypoint**  
   Inventariare chiamate esterne a `/api/memory` e uso reale delle route debug/test. E il prerequisito per distinguere legacy esposto da morto.

2. **Artefatti morti certi**  
   Valutare i cinque file senza importer e i sette export isolati. E il blocco con rischio runtime piu basso.

3. **Tooling e documentazione generata**  
   Separare gli audit storici dagli audit correnti ed evitare che i report generati datati vengano scambiati per mappa runtime.

4. **Ingressi proactive duplicati**  
   Chiarire il ruolo del boot browser, del cron e del trigger location prima di toccare i generatori. Il cron e il trigger location sono oggi percorsi distinti.

5. **Curiosity duale**  
   Misurare copertura e output del writer snapshot rispetto al fallback AI. Il motore storico puo essere considerato superato solo quando non copre piu casi unici.

6. **Candidate proactive storico**  
   Valutare separatamente decision, observation, pattern, butler e daily briefing. Non vanno trattati come un unico blocco: TrueProactive non li sostituisce tutti.

7. **Home representations**  
   Stabilire una sorgente canonica fra HouseStateSnapshot e i builder live, mantenendo prima i consumer suggestion e location-trigger. `homeContextBuilder` debug-only e il candidato meno accoppiato.

8. **Context adapter**  
   Allineare il contratto prodotto da `buildCurrentContext` e dall'adapter locale del candidate builder soltanto dopo aver stabilizzato gli ingressi proactive.

9. **Loader Brain e chat retrieval**  
   E la pulizia con massimo impatto prestazionale ma anche massimo rischio. Richiede una ownership chiara dei dati caricati prima di ridurre query duplicate.

10. **UI god files**  
    Separare fetch/state/lifecycle dal rendering solo dopo che il contratto Brain UI e stabile. La suddivisione anticipata sposterebbe la complessita senza ridurla.

## Verdetto finale

Il workspace contiene poco codice totalmente morto ma molta duplicazione attiva.

- Morti certi: 5 file.
- Export inutilizzati: 7 in file altrimenti attivi.
- Debug-only certo: `homeContextBuilder` piu 6 route.
- Legacy critico ancora necessario: proactive candidate stack, Curiosity Engine, contextBuilder, Home Reasoning e Cognitive House.
- Nuovi moduli realmente attivi: TrueProactive writer, CuriositySnapshot writer, DecisionSnapshot API/UI, House light learning e Brain UI adapter.

La priorita di cleanup non e eliminare subito il legacy, ma ridurre prima gli ingressi e i loader concorrenti mantenendo osservabile quale percorso produce ancora output unico.
