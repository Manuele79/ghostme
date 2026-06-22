# GHOSTME SYSTEM MAP V6 - FLOW AUDIT

Data audit: 2026-06-19  
Modalita: analisi statica in sola lettura del workspace.  
Perimetro: `app`, `app/api`, `components`, `hooks`, `lib`, `lib/ghostme`, `public`, `scripts`, `package.json`, `vercel.json`, migration SQL e schema Supabase fornito.

## 1. Inventario

- File nelle aree applicative analizzate: 164.
- File TypeScript: 132; TSX: 16.
- Route API: 26.
- Moduli `lib/ghostme`: 99.
- File oltre 200 righe: 42.
- Framework: Next.js 16 App Router, React 19, TypeScript, Supabase, OpenAI SDK.
- Cron dichiarati: solo `/api/worker/proactive`, ogni 5 minuti.
- Canali HA: webhook event-driven e worker house manuale/backup.

## 2. Topologia Reale

```text
UI (app/chat + GhostChat + GhostDrawers)
  -> /api/chat -> ghostChatOrchestrator -> OpenAI streaming
       -> chatContextBuilder -> GhostBrainSnapshot + retrieval -> prompt
       -> chatCalendarFlow -> calendarService -> calendar/proactive DB
       -> after(runChatPostProcessing) -> memory/topics/goals/actions/etc.
  -> /api/ghostme/brain -> GhostBrainSnapshot -> adapter legacy -> useGhostBrain
  -> API CRUD calendar/location/goals/actions/proactive

Cron + boot browser
  -> /api/worker/proactive -> proactiveUserFlow
       -> maintenance -> reminder/summary/retention/people/calendar cleanup
       -> candidateBuilder -> engine AI storici
       -> ranker -> proactiveMessageService
       -> daily briefing + agenda

Home Assistant webhook
  -> /api/home-assistant/event -> significance -> house_entities/house_events

Worker house manuale
  -> snapshot HA -> entities/events -> patterns/routes/suggestions/controls
```

Esistono due layer cognitivi sovrapposti:

1. Runtime storico: `situationEngine`, `contextBuilder`, `proactiveDecisionEngine`, observation/pattern/curiosity AI engines.
2. Snapshot: `reasoningService`, `DecisionSnapshot`, People/Memory/Project/House/Curiosity/TrueProactive snapshots.

La chat usa il GhostBrainSnapshot come sorgente primaria. Il worker proactive lo usa per ricostruire parte del vecchio `GhostCurrentContext`, ma la selezione delle card continua a dipendere dagli engine storici. `trueProactiveSnapshot.selected` non alimenta il writer delle card.

## 3. Catalogo Funzioni e Dipendenze

Legenda: R = lettura DB; W = scrittura DB; UI/API/worker indica il consumer effettivo. Le funzioni private sono descritte nel flusso del file che le contiene.

### Chat, analisi e post-processing

| Funzione | File | Chi la chiama | Chi chiama | DB R/W | API/UI/worker | Stato |
|---|---|---|---|---|---|---|
| `runGhostChatFlow` | `chat/ghostChatOrchestrator.ts` | `/api/chat` | analyzer, decay, relationships, context, services, calendar, prompt, OpenAI | indiretto | chat UI | CORE |
| `analyzeChatMessage` | `chat/chatMessageAnalyzer.ts` | orchestrator | classifier, topic detector, entity extractor, resolver | indiretto | chat | CORE |
| `classifyGhostMessage` | `core/messageClassifier.ts` | analyzer | regole locali | - | chat | ATTIVO |
| `extractEntitiesWithAI` | `entityExtractor.ts` | analyzer | topic detector, OpenAI | - | chat | ATTIVO |
| `buildChatContext` | `chat/chatContextBuilder.ts` | orchestrator | GhostBrainSnapshot, retrieval, prompt helpers | molte R indirette | chat | CORE |
| `createEmptyChatContext` | stesso file | `buildChatContext` | - | - | chat | helper |
| `resolveChatExternalService` | `chat/chatExternalServices.ts` | orchestrator | router, weather, web | - | chat | ATTIVO |
| `buildSystemPrompt` | `chat/chatPromptBuilder.ts` | orchestrator | `trimBlock` | - | chat/OpenAI | CORE |
| `trimBlock` | stesso file | prompt/context builders | - | - | chat | helper condiviso |
| `handleChatCalendarFlow` | `chat/chatCalendarFlow.ts` | orchestrator | parser + create event | W calendar/proactive indiretta | chat | ATTIVO |
| `runChatPostProcessing` | `chat/chatPostProcessing.ts` | `/api/chat` via `after()` | memory, topics, contradictions, mental, goals, timeline, actions, behavior | R/W molte | post-response | CORE/GOD FLOW |
| `detectTopicsFromMessage`, `isPossibleEpisode`, `detectEmotionalTone`, `shouldSaveActiveMemory`, `detectImportanceLevel`, `detectMemoryCategory` | `topicDetector.ts` | analyzer/post-processing | regole locali | - | chat | ATTIVE |

Helper privati principali di `chatPostProcessing`: `saveActiveMemory`, `saveLifeTopics`, `saveEpisodicMemory`, classificazione chiarimenti e memoria relazionale. Tutti vengono orchestrati con `Promise.allSettled`; un errore non blocca gli altri writer e non viene riportato alla UI.

### Memory, topic, profilo e comportamento

| Funzione | File | Caller | DB | Consumer | Stato |
|---|---|---|---|---|---|
| `buildContextualMemory` | `retrieval.ts` | chatContextBuilder | R memories/topics/links/episodes/summaries | prompt chat | ATTIVO |
| `buildMemorySnapshot` | `memory/memorySnapshot.ts` | reasoningService | R 6 famiglie memory | Brain/chat/projects | CORE |
| `memorySearchFlow` | `memory/memorySearchFlow.ts` | `/api/memory/search` | R 8 famiglie | Memory drawer | ATTIVO |
| `saveTopicLinks`, `getRelatedTopicContext` | `topicLinks.ts` | post-processing/retrieval | R/W life_topics/topic_links | memory | ATTIVE |
| `applyMemoryDecay` | `memoryDecay.ts` | orchestrator | R/W life_topics | chat | ATTIVO a ogni chat |
| `detectAndSaveContradictions` | `contradictions.ts` | post-processing | R memories/topics; W contradictions | situation/curiosity | ATTIVO |
| `detectAndSaveTimelineEvent`, `getTimelineContext` | `timeline.ts` | post-processing; getter senza caller | W/R timeline | Brain | writer attivo, getter morto |
| `generateDailyConversationSummary` | `conversationSummary.ts` | maintenance + API | R chat; W summaries | memory | ATTIVO |
| `updateMentalState` | `mentalState.ts` | post-processing | W mental_states | situation/Brain | ATTIVO |
| `updateDynamicSelfProfile`, `getDynamicSelfProfileContext` | `dynamicSelfProfile.ts` | post-processing; getter senza caller | W/R dynamic profile | Brain | writer attivo, getter morto |
| `detectAndSaveBehaviorRule`, `buildBehaviorPrompt`, `getActiveBehaviorRules`, `saveBehaviorRule` | `behaviorRulesEngine.ts` | post-processing/proactive/profile | R/W rules | chat/proactive | ATTIVE |
| `seedBehaviorFromProfile` | `profile/profileBehaviorSeed.ts` | setup profile | R traits/profile; W profile/rules | setup | ATTIVO |

### Goals e actions

| Funzione | File | Caller | DB | Consumer | Stato/limite |
|---|---|---|---|---|---|
| `detectAndSaveGoalsDesires` | `goalsDesires.ts` | post-processing | R/W goals_desires | GoalsSnapshot | ATTIVO |
| `getGoalsDesiresContext` | stesso file | nessun caller | R goals_desires | nessuno | EXPORT MORTO |
| `detectAndSaveActionIntent` | `actionLayer.ts` | post-processing | W action_intents | GoalsSnapshot/Brain | ATTIVO |
| `detectAndCompleteActionIntent` | stesso file | post-processing | R/W action_intents | Brain | ATTIVO, AI-based |
| `cleanupOldActionIntents` | stesso file | proactive maintenance | W action_intents | worker | ATTIVO |
| `getActionIntentContext` | stesso file | nessun caller | R action_intents | nessuno | EXPORT MORTO |
| `buildGoalsSnapshot` | `goals/goalsSnapshot.ts` | reasoningService | R goals + actions | Brain/UI/projects | CORE |

`goals_desires` e `action_intents` condividono solo testo/topic; non esiste FK o `goal_id`. Gli snapshot tentano collegamenti lessicali, non relazioni persistite.

### Calendar, agenda e reminder

| Funzione | File | Caller | DB | Consumer | Stato |
|---|---|---|---|---|---|
| `parseCalendarIntent` | `calendar/calendarIntent.ts` | chatCalendarFlow | - + OpenAI | chat | ATTIVO |
| `createCalendarEvent` | `calendar/calendarService.ts` | chat flow + calendar API | W calendar; W proactive indiretto | UI/agenda | CORE |
| `getUpcomingCalendarEvents` | stesso file | nessun caller | R calendar | nessuno | EXPORT MORTO |
| `refreshAgendaMessage` | stesso file | create/update/delete, proactive flow/trigger | R calendar/situation; R/W proactive | card | CORE |
| `cleanupExpiredEvents` | stesso file | maintenance | W calendar | worker | ATTIVO |
| `buildAgendaMessage` | `agenda/agendaEngine.ts` | calendar + candidate builder | dati situation | card agenda | ATTIVO |
| `refreshReminderMessage` | `agenda/reminderEngine.ts` | agenda refresh + maintenance | R calendar; W proactive | card reminder | CORE |
| `sendAppointmentReminderNotification` | `agenda/appointmentReminderNotification.ts` | nessuno | - | nessuno | FILE MORTO |

### Context, reasoning e snapshot

| Funzione | File | Caller | Dipendenze/DB | Consumer | Stato |
|---|---|---|---|---|---|
| `buildGhostSituation` | `situation/situationEngine.ts` | reasoning, agenda, legacy engines | R 15 tabelle | chat/proactive | CORE, query-heavy |
| `loadUserContextGraph` | `context/userContextGraph.ts` | reasoningService | R 17 query parallele | snapshot | CORE loader |
| `buildGhostBrainSnapshot` | `context/reasoningService.ts` | Brain API, chat, candidate builder, debug | graph + situation + domain snapshots | chat/Brain/proactive | ORCHESTRATOR CENTRALE |
| `buildReasoningSnapshot` | stesso file | nessuno | situation + signals + home reasoning | nessuno | EXPORT MORTO/LEGACY |
| `buildContextSignals` | `context/contextSignals.ts` | reasoning, contextBuilder, curiosity | dati situation | snapshot/proactive | ATTIVO |
| `buildGhostBrainSimpleSignals` | stesso file | reasoning | dati gia caricati | snapshot | ATTIVO |
| `buildDecisionSnapshot` | `context/decisionSnapshot.ts` | reasoning + debug + trueProactive | snapshot read-only | debug/true proactive | ATTIVO MA NON UI |
| `buildCurrentContext` | `context/contextBuilder.ts` | proactiveTrigger | situation + HA + proactive | legacy proactive | ATTIVO solo trigger location |

`reasoningService.ts` e `decisionSnapshot.ts` sono rispettivamente 851 e 700 righe. Il primo orchestra loader, snapshot e derivazioni; il secondo concentra molte regole di priorita. Il ciclo di import `reasoningService -> decisionSnapshot -> type reasoningService` e analogo con `trueProactiveSnapshot` e solo type-level, quindi viene eliminato a runtime, ma segnala forte accoppiamento dei contratti.

### People e relationships

| Funzione | File | Caller | DB | Consumer | Stato |
|---|---|---|---|---|---|
| `resolveNamedRelationship`, `removeGenericRelationshipTopics` | `relationshipResolver.ts` | chat analyzer/orchestrator | R/W topics/memories | post-processing | ATTIVO |
| `syncPeopleGraphFromTopics` | `peopleGraphService.ts` | proactive maintenance | R life_topics; W people_graph | snapshot | ATTIVO solo worker |
| `upsertPersonFromTopic` | stesso file | sync | R/W people_graph | snapshot | ATTIVO |
| `getPeopleGraphContext` | stesso file | situationEngine | R people_graph | situation | ATTIVO |
| `buildPeopleSnapshot` | `people/peopleSnapshot.ts` | reasoningService | R people_graph/topics/memories | Brain | CORE |
| `buildRelationshipMemorySnapshot` | `people/relationshipMemorySnapshot.ts` | reasoningService | usa snapshot gia caricati | Brain/projects | DERIVATO |
| `buildSocialSuggestionSnapshot` | `people/socialSuggestionSnapshot.ts` | reasoningService | usa snapshot | Brain/trueProactive | DERIVATO |

`people_graph_links` non ha reader o writer. `people_graph` puo essere popolata solo da topic con `entity_type = person` durante maintenance proactive.

### Projects e curiosity

| Funzione | File | Caller | Input | Consumer effettivo | Stato |
|---|---|---|---|---|---|
| `buildProjectMemorySnapshot` | `projects/projectMemorySnapshot.ts` | reasoningService | memory/goals/people/calendar | decision, advisor, curiosity | DERIVATO |
| `buildGoalProjectConsistencySnapshot` | `projects/goalProjectConsistencySnapshot.ts` | reasoningService | goals/projects | decision/advisor/curiosity | DERIVATO |
| `buildProjectAdvisorSnapshot` | `projects/projectAdvisorSnapshot.ts` | reasoningService | project/goals/consistency/relationships | decision/curiosity | DERIVATO |
| `buildCuriositySnapshot` | `curiosity/curiositySnapshot.ts` | reasoningService | tutti gli snapshot | trueProactive/debug | DERIVATO |
| `generateCuriosityMessage` | `curiosity/curiosityEngine.ts` | proactiveCandidateBuilder | DB + situation + OpenAI | candidato card | RUNTIME |
| `buildTrueProactiveSnapshot` | `proactive/trueProactiveSnapshot.ts` | reasoningService | snapshot + decision | campo snapshot | DEBUG/INERTE PER CARD |

Non esiste un modulo `projectSuggestions`. Le suggestion progetto sono inferenze del DecisionSnapshot/TrueProactive, non writer DB e non card runtime.

### Proactive runtime

| Funzione | File | Caller | DB/side effect | Stato |
|---|---|---|---|---|
| `runProactiveFlowForUser` | `proactiveUserFlow.ts` | worker proactive | maintenance + best candidate + agenda + briefing | ORCHESTRATOR |
| `runProactiveMaintenanceFlow` | `proactiveMaintenanceFlow.ts` | user flow | reminder, summaries, retention, actions, people, calendar cleanup | MULTI-SIDE-EFFECT |
| `buildProactiveCandidatesForUser` | `proactiveCandidateBuilder.ts` | user flow | snapshot + 4 engine OpenAI + decay | GOD BUILDER |
| `pickBestProactiveCandidate` | `proactiveCandidateRanker.ts` | user flow | sort solo priority | ATTIVO, ranking minimo |
| `decideProactiveMessage` | `proactiveDecisionEngine.ts` | candidate builder + trigger | OpenAI | ATTIVO |
| `upsertProactiveMessage` | `proactiveMessageService.ts` | calendar, reminder, proactive, house | R/W proactive | WRITER CENTRALE PARZIALE |
| `buildDailyProactiveLogicalKey` | stesso file | agenda/reminder/briefing | - | ATTIVO |
| `dedupeProactiveMessages` | `proactiveMessageDedupe.ts` | Brain/proactive APIs | read-time only | ATTIVO |
| `runProactiveTrigger` | `proactiveTrigger.ts` | locationUpdateFlow | context + AI decision + card | EVENT-DRIVEN LOCATION |
| `generateObservationInsight` | `observationInsightEngine.ts` | candidate builder | R proactive/situation + OpenAI | candidato |
| `generatePatternInsight` | `patternInsightEngine.ts` | candidate builder | R patterns/proactive + OpenAI | candidato |
| `generateButlerMessage` | `butlerEngine.ts` | candidate builder | OpenAI | candidato |
| `buildDailyBriefingMessage` / `loadDailyBriefingContext` | proactive briefing files | user flow | OpenAI + R calendar/goals/actions/etc. | card briefing |

### Home Assistant e home reasoning

| Funzione | File | Caller | DB | Stato |
|---|---|---|---|---|
| `getHAStates` | `haClient.ts` | snapshots, worker, test | HA HTTP | CORE integration |
| `getEntityInfo` | `homeEntityMapper.ts` | webhook/logger/snapshots | - | CORE mapping |
| `classifyHomeEventSignificance` | `homeEventSignificance.ts` | webhook/logger | - | CORE filter |
| `logHomeAssistantSnapshot` | `homeEventLogger.ts` | house worker | R/W house_events | backup polling |
| `syncHouseEntities` | `houseEntityRegistry.ts` | house worker | W house_entities | backup sync |
| `analyzeHousePatterns` | `housePatternEngine.ts` | house worker + suggestion engine | R events; R/W house_patterns | ATTIVO solo worker |
| `learnHouseRoutes` | `houseRouteLearningEngine.ts` | house worker | R events; R/W learned_rules | ATTIVO solo worker |
| `generateHouseSuggestions` | `houseSuggestionEngine.ts` | house worker | R/W suggestions + proactive | ATTIVO solo worker |
| `generateHouseAutomationSuggestions` | automation suggestion engine | house worker | R events; W suggestions/proactive | ATTIVO solo worker |
| `planHouseAutomationControls` | control planner | house worker | R events/rules; W controls/proactive | ATTIVO solo worker |
| `buildHouseStateSnapshot` | `home/houseStateSnapshot.ts` | reasoningService | HA live + R entities/events | Brain/chat |
| `buildHouseRouteSnapshot` | `home/houseRouteSnapshot.ts` | reasoningService | R rules/events | Brain |
| `buildHomeComfortRiskSnapshot` | `home/homeComfortRiskSnapshot.ts` | reasoningService | R events + snapshot | Brain/decision |
| `buildHomeLocationConsistency` | home consistency | reasoningService | input gia caricato | Brain/decision |
| `bridgeHomeAssistantLocationFlow` | location HA bridge | house worker | HA + W location state | worker only |
| `buildHomeContext` | HA context builder | test route soltanto | HA | TEST/LEGACY |
| `buildHomeReasoning` | HA reasoning builder | contextBuilder, legacy reasoning, test | HA | LEGACY ACTIVE |
| `buildHouseAutomationContext` | HA automation context | nessuno | R events | FILE MORTO |
| `buildHouseLearnedRulesContext` | HA learned context | nessuno | R rules | FILE MORTO; omonimo helper chat |

### Location, services e observations

| Funzione | File | Caller | DB/esterno | Stato |
|---|---|---|---|---|
| `saveSignificantPlace`, `getSignificantPlaces`, `detectCurrentPlace`, `getCurrentLocationState` | `location/placeService.ts` | location flows/situation | R/W places/location | ATTIVE |
| `getLastKnownPlace` | stesso file | nessuno | R location | EXPORT MORTO |
| location flow functions | `location/*Flow.ts` | API location | R/W location/places | ATTIVE |
| `classifyLocationSignal` | `location/locationEngine.ts` | nessuno | - | FILE MORTO |
| `recordObservation`, `analyzeLocationPatterns` | `observationEngine.ts` | location update | R/W observations/patterns | ATTIVE |
| `decideGhostService` | `serviceRouter.ts` | chat external services | - | ATTIVO |
| `runWeatherSearch`, `runWebSearch` | services | chat external services | HTTP/OpenAI web search | ATTIVE |
| `getLocalTimeContext` | `timeService.ts` | nessuno | - | FILE MORTO |

## 4. API -> Moduli -> Tabelle -> Consumer

| API | Metodo | Moduli/tabelle | Consumer | Osservazioni |
|---|---|---|---|---|
| `/api/chat` | POST | orchestrator + post-processing | chat UI | auth server; OpenAI streaming |
| `/api/ghostme/brain` | POST | GhostBrainSnapshot + proactive DB | `useGhostBrain` | adapter legacy; hook ignora `snapshot` completo |
| `/api/debug-reasoning` | GET | snapshot + decision | manuale | debug autenticato/override controllato |
| `/api/proactive/messages` | POST | R proactive | GhostDrawers | solo 6 categorie e unread/read |
| `/api/ghostme/proactive/read` | POST | R/W proactive; W calendar reminder | chat/drawers | auth; dipende da logical_key |
| `/api/worker/proactive` | GET | profiles -> proactive flow | cron + boot browser | nessuna auth/secret nella route |
| `/api/worker/house` | GET | houseWorkerFlow | manuale | secret solo se env presente |
| `/api/home-assistant/event` | POST | mapper/significance; W entities/events | HA webhook | token opzionale se env assente |
| `/api/calendar-events` | POST/PATCH/DELETE | calendar service; R/W calendar/proactive | drawer calendario | usa userId body, nessuna auth server |
| `/api/goals/update-status` | POST | W goals | Memory drawer | usa userId body, nessuna auth server |
| `/api/actions/update-status` | PATCH | W actions | Services drawer | auth server |
| `/api/memory` | POST | W memories_active via client Supabase | non rilevato chiaramente | usa client anon server-side |
| `/api/memory/search` | POST | memorySearchFlow, molte R | Memory drawer | userId body, nessuna auth nel flow/route |
| `/api/conversation-summary` | POST | summary engine | chat background | userId body, nessuna auth |
| `/api/house-suggestion-response` | POST | suggestion flow, W suggestions/rules/proactive | GhostChat | nessuna auth rilevata |
| location `current-place`, `places`, `current-state`, `save-place`, `delete-place`, `update-current` | POST/DELETE | location flows/service | chat + drawers | prevalentemente userId body; auth non centralizzata |
| `/api/debug-ha-entities`, `/api/debug-house-logger`, `/api/test-ha`, `/api/test-home-context`, `/api/test-home-reasoning` | GET | HA live/context | manuale | route debug/test esposte |

## 5. Tabelle: Writer, Reader e Connessione

| Tabella | Writer | Reader | Stato flow |
|---|---|---|---|
| `chat_messages` | chat UI | chat boot, summary | attiva; insert dipende da contratto `message_order` |
| `memories_active` | post-processing/API | retrieval, snapshots, people/projects | core |
| `life_topics` | post-processing/resolver/decay | quasi tutto il cognition layer | core |
| `topic_links` | post-processing | retrieval/memory | attiva |
| `episodic_memories` | post-processing | retrieval/snapshots/situation | attiva |
| `conversation_summaries` | maintenance/API | retrieval/snapshots | attiva |
| `autobiographical_timeline` | post-processing | snapshots/situation/curiosity | attiva |
| `goals_desires` | goal detector/API | snapshots/projects/curiosity | attiva ma scollegata dalle actions |
| `action_intents` | action detector/API/cleanup | snapshots/projects/briefing | attiva ma scollegata dai goals |
| `calendar_events` | chat/calendar API/cleanup/reminder completion | context/agenda/reminder/UI | attiva |
| `ghost_proactive_messages` | service + calendar + house + lifecycle | APIs/context/engines | attiva, molti writer |
| `people_graph` | proactive maintenance sync | situation/PeopleSnapshot | pipeline parziale; DB fornito vuoto |
| `people_graph_links` | nessuno | nessuno | scollegata |
| `observation_events` | location observation | situation/patterns | attiva |
| `behavior_patterns` | observation/decay | situation/pattern/graph | attiva |
| `mental_states` | post-processing | situation/briefing | attiva |
| `dynamic_self_profile` | post-processing/profile seed | situation/curiosity | attiva |
| `contradictions` | post-processing | situation/curiosity | attiva |
| `house_entities` | webhook/house worker | HouseStateSnapshot | attiva |
| `house_events` | webhook/house worker | tutti gli engine home | core, volume elevato |
| `house_patterns` | house worker | UserContextGraph | contratto SQL presente in migration, applicazione DB non verificata |
| `house_learned_rules` | route learning/response | snapshots/planner | attiva |
| `house_suggestions` | house engines | response | attiva solo house worker |
| `house_automation_controls` | planner | graph/comfort | quasi vuota per pipeline manuale e condizioni strette |
| `house_paths`, `house_rooms` | nessuno | nessuno | dati DB scollegati |
| `answers`, `traits`, `users`, `user_profiles` | setup | setup/profile/worker/context | setup/profile |
| `significant_places`, `user_location_state` | location flows/HA bridge | situation/graph/UI | attive |
| `memories`, `questions`, `triggers` | nessuno runtime | nessuno runtime | legacy/scollegate |

Non risultano writer persistenti completamente privi di reader fra le tabelle usate. Non risultano reader attivi completamente privi di writer. Il problema dominante non e R/W unidirezionale, ma writer e reader collegati da identita deboli, worker non garantiti o adapter che scartano parte dei dati.

## 6. Flussi Completi

### Chat

```text
GhostChat/app chat
 -> POST /api/chat (user autenticato)
 -> analyzeChatMessage (classifier + topics + entities/relationships)
 -> memory decay + relationship resolution
 -> buildGhostBrainSnapshot + buildContextualMemory
 -> external service router
 -> parseCalendarIntent; se evento: save + risposta immediata
 -> altrimenti buildSystemPrompt -> OpenAI stream
 -> UI salva user/assistant in chat_messages
 -> server after(): runChatPostProcessing
 -> UI refresh Brain dopo timer
```

Il post-processing viene saltato interamente quando `shouldRunHeavyEngines` e falso. La risposta immediata calendario non contiene `postProcessingPayload`, quindi il messaggio calendario non passa dal normale post-processing di goals/actions/memory.

### Goals

```text
chat post-processing
 -> detectAndSaveGoalsDesires (OpenAI)
 -> insert/update goals_desires status active
 -> buildGoalsSnapshot
 -> GhostBrainSnapshot.goals.activeGoals
 -> Brain API goals[]
 -> useGhostBrain
 -> MemoryDrawer tab Goals
 -> Completa/Archivia -> /api/goals/update-status -> refreshBrain
```

Possono non apparire se il post-processing e classificato leggero, se l'`after()` non termina nel runtime, se il refresh avviene prima della scrittura, se l'API Brain fallisce, o se il goal viene archiviato. L'attuale drawer non persiste piu gli ID goal in `ghost_hidden_cards`.

### Actions

```text
chat post-processing
 -> detectAndCompleteActionIntent e detectAndSaveActionIntent in parallelo
 -> action_intents detected/completed
 -> buildGoalsSnapshot.pendingActions
 -> GhostBrainSnapshot.actions
 -> Brain API actions[]
 -> ServicesDrawer tab Azioni
 -> PATCH /api/actions/update-status
```

Creazione e completamento girano nello stesso `Promise.allSettled`: sullo stesso messaggio possono competere senza ordine. Non esiste relazione DB con un goal, quindi completare un'action non completa con certezza alcun goal.

### Calendar, agenda e reminder

```text
chat -> parseCalendarIntent -> createCalendarEvent
UI -> /api/calendar-events POST/PATCH/DELETE
create/PATCH/DELETE -> refreshAgendaMessage
refreshAgendaMessage -> refreshReminderMessage
                    -> buildGhostSituation -> buildAgendaMessage
                    -> upsertProactiveMessage
worker proactive maintenance -> refreshReminderMessage ogni 5 minuti
Brain/proactive API -> unread/read categorie ammesse -> UI
```

Le card sono generate realmente da `calendarService` e `reminderEngine`, non da `agendaEngine` da solo. `agendaEngine` formatta soltanto testo. Reminder usa finestra da -30 a +30 minuti su `start_at`. Quando non trova eventi nella finestra marca expired tutte le reminder card ancora unread/read.

### Proactive cards

Writer effettivi:

- `proactiveMessageService`: writer centrale usato da agenda, reminder, worker, trigger e house.
- `calendarService`: aggiornamenti diretti per scadere/deduplicare agenda.
- `reminderEngine`: aggiornamento diretto per scadere reminder.
- `proactive/read`: lifecycle read/dismissed/answered/expired e completamento calendar reminder.
- `houseSuggestionResponseFlow`: aggiorna proactive collegata.
- retention: archivia/scade messaggi vecchi.

Categorie effettive:

- `agenda`: calendar service e proactive user flow.
- `reminder`: reminder engine.
- `daily_briefing`: proactive user flow.
- `observation`: proactive decision, observation insight, pattern insight, butler candidati.
- `curiosity`: vecchio Curiosity Engine candidato.
- `home_question`: house suggestions e controls.
- `suggestion`, `project`, `social`: nessun writer runtime dedicato rilevato.

Solo il miglior candidato generico viene scritto per esecuzione utente. Agenda e briefing vengono gestiti separatamente. Questo spiega perche observation e curiosity possono essere calcolate ma non apparire: competono fra loro e con decision/butler, e il ranker considera solo `priority`.

### People

```text
chat analyzer/resolver -> life_topics/memories
worker proactive maintenance -> syncPeopleGraphFromTopics
 -> solo life_topics entity_type=person -> people_graph
PeopleSnapshot -> merge people_graph + topic/memory fallback
RelationshipMemory/SocialSuggestions -> Brain/Decision/TrueProactive
```

`people_graph_links` non partecipa. Con il DB fornito `people_graph` e vuota: o non esistono topic classificati `person`, o maintenance non ha completato il sync, o gli upsert hanno fallito. PeopleSnapshot puo comunque mostrare persone da topic/memorie, mascherando il vuoto della tabella principale.

### Projects

```text
MemorySnapshot + GoalsSnapshot + PeopleSnapshot + Calendar
 -> ProjectMemorySnapshot
 -> consistency + advisor
 -> DecisionSnapshot + CuriositySnapshot + TrueProactiveSnapshot
```

Il progetto influenza il DecisionSnapshot e il TrueProactiveSnapshot. Tuttavia il DecisionSnapshot non e consumato dalla UI ordinaria e `trueProactive.selected` non viene passato al proactive writer. Nel candidate builder storico i progetti vengono ricostruiti dai topic, non da ProjectAdvisor. Impatto runtime card: indiretto o nullo.

### Curiosity

- Vecchio `curiosityEngine`: query DB + OpenAI, produce una stringa candidata; puo diventare card se vince il ranker.
- Nuovo `curiositySnapshot`: deterministico/read-only, entra in snapshot, decision e true proactive; non crea card.

Sono due implementazioni con stesso scopo cognitivo ma consumer diversi.

### True Proactive

`buildTrueProactiveSnapshot` raccoglie safety, calendario, open loop, progetti, curiosity e relationships; deduplica e seleziona massimo tre candidati. Il risultato viene restituito dentro `snapshot.trueProactive`. Nessun runtime usa `selected` per chiamare `upsertProactiveMessage`. E quindi un layer di osservazione/debug, non il selettore delle card.

### House / Home Assistant

```text
HA state_changed -> POST /api/home-assistant/event
 -> map entity -> update house_entities
 -> significance filter -> insert house_events se significativo

GET /api/worker/house (manuale)
 -> log snapshot HA
 -> HA -> location bridge
 -> sync entities
 -> analyze house_patterns
 -> learn house routes/rules
 -> suggestions + automation suggestions + controls
 -> proactive home_question

GhostBrain
 -> HA live + entities/events -> HouseStateSnapshot
 -> rules/events -> routes
 -> events -> comfort/risk
 -> DecisionSnapshot
```

Il webhook non avvia pattern/rule/suggestion/control learning. Poiche non esiste cron house, tali tabelle avanzano solo quando il worker house viene invocato manualmente. `house_paths` e `house_rooms` non sono lette; route reasoning usa costanti statiche e `house_learned_rules`.

## 7. UI Flow

- `useGhostBrain` chiama Brain API e conserva solo adapter legacy: memories, timeline, goals, mentalState, actions, calendarEvents e proactiveMessages. Scarta il campo `snapshot` completo.
- `GhostChat` mostra le proactive principali; reminder espone Fatto/Archivia, altre categorie spunta/Rispondi.
- `ServicesDrawer` mostra actions, calendar, places e observations. Observations vengono ricaricate da `/api/proactive/messages`.
- `MemoryDrawer` mostra memories, timeline, goals e mental state.
- Goals vengono letti da `data.goals`, cioe `snapshot.goals.activeGoals` adattato dalla Brain API.
- Actions vengono lette da `data.actions`, cioe `snapshot.goals.pendingActions`.
- Calendar viene letto da `snapshot.calendar.upcoming`; eventi passati o non active non arrivano.
- Il local storage `ghost_hidden_cards` continua per memory/timeline, ma filtra fuori chiavi `goals-*`.
- Dopo chat il refresh Brain e schedulato a 5 secondi; il salvataggio conversazione esegue anche un refresh dopo summary. Il post-processing server resta asincrono e puo concludersi dopo entrambi.

## 8. File Morti o Quasi Morti

Certi, nessun caller applicativo:

- `agenda/appointmentReminderNotification.ts`
- `homeAssistant/houseAutomationContext.ts`
- `homeAssistant/houseLearnedRulesContext.ts`
- `location/locationEngine.ts`
- `services/timeService.ts`
- export `buildReasoningSnapshot`
- export `getActionIntentContext`
- export `getGoalsDesiresContext`
- export `getTimelineContext`
- export `getDynamicSelfProfileContext`
- export `getUpcomingCalendarEvents`
- export `getLastKnownPlace`

Quasi isolati/test-only:

- `homeAssistant/homeContextBuilder.ts`: usato solo da route test.
- route `debug-*` e `test-*`: cinque entry point HA/debug fuori dai flow utente.
- `scripts/project-audit.mjs`: tool manuale che genera artefatti audit, non runtime.

## 9. Doppioni e Sovrapposizioni

- `buildGhostSituation` e `loadUserContextGraph`: molte query sovrapposte.
- `buildCurrentContext` e adapter snapshot nel candidate builder: stesso contratto costruito da sorgenti diverse.
- vecchio `curiosityEngine` e nuovo `curiositySnapshot`.
- `proactiveDecisionEngine` e `DecisionSnapshot`/`TrueProactiveSnapshot`.
- `homeContextBuilder`, `homeReasoningBuilder`, `HouseStateSnapshot` e comfort/route snapshots.
- `housePatternEngine` e `behavior_patterns` engine: pattern casa e pattern generali separati ma con schema simile.
- dedup proactive alla scrittura (`upsertProactiveMessage`) e alla lettura (`dedupeProactiveMessages`) piu dedup speciale agenda.
- normalizzazione titolo calendario duplicata in API, chat flow e calendar service.
- helper `buildHouseLearnedRulesContext` omonimo in file morto HA e helper locale chat.

## 10. Cicli e Accoppiamento

- Cicli type-only: reasoningService <-> decisionSnapshot e reasoningService <-> trueProactiveSnapshot. Non sono cicli runtime, ma i tipi dipendono dall'orchestratore concreto.
- `reasoningService` e un god orchestrator: importa 19 moduli dominio e costruisce tutto in una chiamata.
- `buildGhostBrainSnapshot` richiama sia UserContextGraph sia SituationEngine sia snapshot separati, provocando query duplicate.
- `proactiveCandidateBuilder` richiama GhostBrainSnapshot e poi quattro/cinque engine AI storici: e il principale collo di bottiglia cognitivo e di costo.
- `GhostDrawers.tsx` (1700 righe) e `app/chat/page.tsx` (755) accoppiano fetch, stato, lifecycle e rendering.

## 11. Bug Certi

1. Il DB fornito non contiene `house_patterns`, `logical_key`, `answered_at`; il codice li usa. La migration V1 esiste nel workspace, ma la sua esecuzione sul DB non e verificata.
2. `action_intents` non ha relazione strutturale con `goals_desires`; completare un'action non puo completare con certezza il goal.
3. `detectAndCompleteActionIntent` e `detectAndSaveActionIntent` girano in parallelo sullo stesso messaggio.
4. `trueProactiveSnapshot.selected` non alimenta alcuna card.
5. Project Advisor e nuova Curiosity influenzano snapshot/decision, ma non il writer proactive runtime.
6. `house_paths`, `house_rooms` e `people_graph_links` non hanno accessi applicativi.
7. Il webhook HA aggiorna eventi/entita ma non avvia il learning; il worker house non ha cron.
8. `/api/worker/proactive` non verifica sessione o secret e processa tutti i profili; viene chiamato sia dal cron sia dal boot browser.
9. `/api/goals/update-status` e `/api/calendar-events` usano `supabaseAdmin` fidandosi del `userId` del body, senza `getAuthenticatedUserId`.
10. `/api/memory/search`, `/api/conversation-summary` e vari endpoint location/house response non applicano uniformemente l'helper auth server.
11. L'API Brain filtra le proactive a sei categorie; eventuali future categorie `project`, `social`, `suggestion` sarebbero invisibili.
12. `runProactiveFlowForUser.created` conta solo il best candidate, non agenda o briefing creati/aggiornati.
13. La UI non consuma il GhostBrainSnapshot completo restituito dalla Brain API.
14. Nessun writer o reader usa `people_graph_links`; la relazione persone-dati resta testuale.

## 12. Bug Probabili / Da Verificare Runtime

1. `chat_messages.message_order` e NOT NULL senza default nello schema fornito, ma il frontend non lo invia. Un trigger DB potrebbe salvarlo; senza trigger, gli insert falliscono.
2. `people_graph` vuota nonostante dati topic/memory: probabile classificazione `entity_type` insufficiente o maintenance non completata.
3. Refresh Brain a 5 secondi puo precedere il completamento di `after(runChatPostProcessing)`, facendo apparire goals/actions solo al refresh successivo.
4. La finestra reminder basata su `start_at` e l'expire globale quando non ci sono eventi nella finestra possono rendere le card apparentemente intermittenti.
5. Senza migrazione DB applicata, il fallback proactive non copre in modo affidabile anche `answered_at`, quindi update lifecycle possono fallire.
6. Le chiamate OpenAI multiple del worker proactive ogni cinque minuti per ogni profilo possono causare timeout, costi e salti parziali del flow.
7. `house_automation_controls` quasi vuota e coerente con un worker manuale piu condizioni molto strette, non necessariamente con un errore DB.
8. La codifica mojibake visibile in diversi sorgenti (`Ã`, `â†’`) puo produrre testo UI/prompt corrotto e rompere confronti di route se presente realmente nei byte, non solo nella console.
9. Il webhook HA accetta `userId` dal payload e diventa aperto se entrambi i secret env mancano; impatto dipendente dalla configurazione deploy.
10. API CRUD miste fra Supabase client, admin e auth helper producono isolamento utente non uniforme.

## 13. Verdetto di Connessione

GhostMe possiede una catena completa Chat -> Memory/Context -> Snapshot -> Brain UI e una catena Proactive separata e funzionante. Il problema principale non e assenza di moduli: e la presenza di due cervelli concorrenti. Il nuovo GhostBrain calcola molte informazioni corrette, ma il runtime proactive continua a decidere con l'architettura precedente. Home learning dipende da un worker non schedulato; People dipende da maintenance e classificazione topic; Goals e Actions non condividono identita persistita. La UI riceve un adapter ridotto e non vede gran parte dello snapshot che il backend calcola.
