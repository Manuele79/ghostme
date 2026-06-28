# PROJECT KNOWLEDGE BASE

Generated: 2026-06-28T01:30:56.860Z

Questa è la mappa centrale automatica del progetto GhostMe.

Serve per capire **cosa esiste**, **chi chiama cosa**, **quali dati entrano/escono** e **dove controllare prima di modificare codice**.

## 1. Documenti collegati

- **systemMap**: OK — `docs/maps/GHOSTME_SYSTEM_MAP_V6.md` (3243 righe)
- **cognitiveRouting**: OK — `docs/maps/COGNITIVE_ROUTING_MAP.md` (147 righe)
- **databaseUsage**: OK — `docs/maps/DATABASE_USAGE_MAP.md` (296 righe)
- **fileUsage**: OK — `docs/maps/FILE_USAGE_MAP.md` (1995 righe)
- **supabaseSchemaMd**: OK — `docs/maps/SUPABASE_SCHEMA_MAP.md` (1811 righe)
- **supabaseSchemaJson**: OK — `docs/state/SUPABASE_SCHEMA_MAP.json` (6270 righe)
- **priorityFix**: OK — `docs/maps/GHOSTME_PRIORITY_FIX_LIST.md` (31 righe)
- **dependencyText**: OK — `docs/maps/DEPENDENCY_TEXT_MAP.txt` (501 righe)

## 2. Regola operativa

Prima di aggiungere funzioni nuove:

1. controllare se il dato esiste già;
2. controllare chi lo scrive;
3. controllare chi lo legge;
4. controllare se arriva alla UI o al prompt;
5. solo dopo modificare codice.

## 3. Flussi cognitivi principali

### Chat → Cognitive Core → Risposta

**Obiettivo**

Capire il messaggio, costruire contesto, rispondere e avviare post-processing.

**File coinvolti**

- app/api/chat/route.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts
- lib/ghostme/core/messageClassifier.ts
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/chatPromptBuilder.ts
- lib/ghostme/chat/chatPostProcessing.ts

**Tabelle coinvolte**

- chat_messages — reader: 2, writer: 3
- memories_active — reader: 11, writer: 4
- episodic_memories — reader: 8, writer: 1
- life_topics — reader: 14, writer: 4
- topic_links — reader: 5, writer: 1
- goals_desires — reader: 10, writer: 3
- action_intents — reader: 10, writer: 4
- calendar_events — reader: 8, writer: 5
- ghost_behavior_rules — reader: 3, writer: 2
- mental_states — reader: 3, writer: 1

**Output**

Risposta chat + aggiornamenti memoria/goal/action/behavior.

### Memoria → Topic → People Graph

**Obiettivo**

Trasformare messaggi e ricordi in persone, relazioni e collegamenti.

**File coinvolti**

- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/topicDetector.ts
- lib/ghostme/topicLinks.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleSnapshot.ts

**Tabelle coinvolte**

- memories_active — reader: 11, writer: 4
- episodic_memories — reader: 8, writer: 1
- life_topics — reader: 14, writer: 4
- topic_links — reader: 5, writer: 1
- people_graph — reader: 4, writer: 1
- people_graph_links — reader: 1, writer: 1

**Output**

People Snapshot, relationship context, deep recall.

### Luoghi → Observation → Pattern

**Obiettivo**

Capire dove si trova Manu, cosa cambia e quali abitudini emergono.

**File coinvolti**

- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts

**Tabelle coinvolte**

- user_location_state — reader: 8, writer: 5
- significant_places — reader: 5, writer: 3
- observation_events — reader: 3, writer: 1
- behavior_patterns — reader: 7, writer: 3

**Output**

currentSituation, place events, location patterns.

### Home Assistant → House Snapshot → Situation

**Obiettivo**

Trasformare eventi casa/sensori in situazione leggibile.

**File coinvolti**

- app/api/home-assistant/event/route.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/context/reasoningService.ts

**Tabelle coinvolte**

- house_events — reader: 13, writer: 5
- house_entities — reader: 2, writer: 2
- house_patterns — reader: 3, writer: 1
- house_suggestions — reader: 3, writer: 3
- house_automation_controls — reader: 3, writer: 2
- house_learned_rules — reader: 6, writer: 2

**Output**

House snapshot, room/activity signals, house suggestions.

### Proactive → Daily → Card UI

**Obiettivo**

Decidere cosa mostrare all’utente senza aspettare la chat.

**File coinvolti**

- app/api/ghostme/brain/route.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveCandidateRanker.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/dailyBriefingBuilder.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts
- components/ghost/GhostDrawers.tsx

**Tabelle coinvolte**

- ghost_proactive_messages — reader: 16, writer: 8
- calendar_events — reader: 8, writer: 5
- action_intents — reader: 10, writer: 4
- goals_desires — reader: 10, writer: 3
- observation_events — reader: 3, writer: 1
- behavior_patterns — reader: 7, writer: 3
- user_location_state — reader: 8, writer: 5
- house_events — reader: 13, writer: 5

**Output**

Daily briefing, curiosity, observation, continuity cards.

### Continuity / Open Loops

**Obiettivo**

Riprendere storie aperte quando il momento è giusto.

**File coinvolti**

- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveCandidateRanker.ts
- lib/ghostme/proactive/proactiveMessageService.ts

**Tabelle coinvolte**

- action_intents — reader: 10, writer: 4
- calendar_events — reader: 8, writer: 5
- autobiographical_timeline — reader: 7, writer: 1
- episodic_memories — reader: 8, writer: 1
- conversation_summaries — reader: 8, writer: 1
- observation_events — reader: 3, writer: 1
- user_location_state — reader: 8, writer: 5
- ghost_proactive_messages — reader: 16, writer: 8

**Output**

Card continuity: grigliata, rientro, luogo nuovo, evento aperto.

## 4. Tabelle core e stato utilizzo

| Tabella | Reader | Writer | Colonne lette | Colonne scritte | Missing columns |
|---|---:|---:|---:|---:|---|
| chat_messages | 2 | 3 | 5 | 13 | - |
| memories_active | 11 | 4 | 9 | 7 | - |
| episodic_memories | 8 | 1 | 8 | 5 | - |
| conversation_summaries | 8 | 1 | 9 | 9 | - |
| life_topics | 14 | 4 | 13 | 19 | - |
| topic_links | 5 | 1 | 2 | 6 | - |
| people_graph | 4 | 1 | 19 | 1 | - |
| people_graph_links | 1 | 1 | 5 | 2 | - |
| goals_desires | 10 | 3 | 16 | 12 | - |
| action_intents | 10 | 4 | 13 | 12 | - |
| calendar_events | 8 | 5 | 12 | 3 | - |
| ghost_behavior_rules | 3 | 2 | 4 | 12 | - |
| mental_states | 3 | 1 | 1 | 1 | - |
| dynamic_self_profile | 4 | 2 | 8 | 6 | - |
| user_location_state | 8 | 5 | 9 | 14 | - |
| significant_places | 5 | 3 | 12 | 19 | - |
| observation_events | 3 | 1 | 9 | 6 | category, label |
| behavior_patterns | 7 | 3 | 16 | 5 | - |
| house_events | 13 | 5 | 11 | 17 | - |
| house_entities | 2 | 2 | 7 | 9 | - |
| house_patterns | 3 | 1 | 11 | 2 | - |
| house_suggestions | 3 | 3 | 9 | 6 | entity_id, entity_name, entity_type, event_type, new_state, occurred_at |
| ghost_proactive_messages | 16 | 8 | 13 | 8 | curiosity |

## 5. Warning schema / query obsolete

- **autobiographical_timeline** richiede colonne non presenti nello schema noto: category
- **ghost_proactive_messages** richiede colonne non presenti nello schema noto: curiosity
- **house_suggestions** richiede colonne non presenti nello schema noto: entity_id, entity_name, entity_type, event_type, new_state, occurred_at
- **observation_events** richiede colonne non presenti nello schema noto: category, label

## 6. Tabelle scritte ma mai lette

- rpc:upsert_people_graph_link
- users

## 7. Tabelle lette ma mai scritte

- Nessuna

## 8. Impact Map

Se tocchi una tabella, controlla questi file.

### chat_messages

**Producer / writer**

- app/chat/page.tsx
- lib/ghostme/conversationSummary.ts
- lib/ghostme/maintenance/retentionEngine.ts

**Consumer / reader**

- app/chat/page.tsx
- lib/ghostme/conversationSummary.ts

### memories_active

**Producer / writer**

- app/api/memory/route.ts
- app/memory/page.tsx
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/relationshipResolver.ts

**Consumer / reader**

- app/memory/page.tsx
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/retrieval.ts

### episodic_memories

**Producer / writer**

- lib/ghostme/chat/chatPostProcessing.ts

**Consumer / reader**

- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

### conversation_summaries

**Producer / writer**

- lib/ghostme/conversationSummary.ts

**Consumer / reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

### life_topics

**Producer / writer**

- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/relationshipResolver.ts

**Consumer / reader**

- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/topicLinks.ts

### topic_links

**Producer / writer**

- lib/ghostme/topicLinks.ts

**Consumer / reader**

- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/topicLinks.ts

### people_graph

**Producer / writer**

- lib/ghostme/people/peopleGraphService.ts

**Consumer / reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleSnapshot.ts

### people_graph_links

**Producer / writer**

- lib/ghostme/people/peopleGraphLinkService.ts

**Consumer / reader**

- lib/ghostme/people/peopleGraphLinkService.ts

### goals_desires

**Producer / writer**

- app/api/goals/update-status/route.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/goalsDesires.ts

**Consumer / reader**

- app/api/goals/update-status/route.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/goalsDesires.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/situation/situationEngine.ts

### action_intents

**Producer / writer**

- app/api/actions/update-status/route.ts
- app/api/goals/update-status/route.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts

**Consumer / reader**

- app/api/actions/update-status/route.ts
- app/api/goals/update-status/route.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/situation/situationEngine.ts

### calendar_events

**Producer / writer**

- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

**Consumer / reader**

- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts
- lib/ghostme/situation/situationEngine.ts

### ghost_behavior_rules

**Producer / writer**

- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

**Consumer / reader**

- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

### mental_states

**Producer / writer**

- lib/ghostme/mentalState.ts

**Consumer / reader**

- lib/ghostme/mentalState.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/situation/situationEngine.ts

### dynamic_self_profile

**Producer / writer**

- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

**Consumer / reader**

- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

### user_location_state

**Producer / writer**

- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts

**Consumer / reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationCurrentStateFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts

### significant_places

**Producer / writer**

- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts

**Consumer / reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

### observation_events

**Producer / writer**

- lib/ghostme/observation/observationEngine.ts

**Consumer / reader**

- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/situation/situationEngine.ts

**Problemi schema noti**

- category
- label

### behavior_patterns

**Producer / writer**

- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts

**Consumer / reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/situation/situationEngine.ts

### house_events

**Producer / writer**

- app/api/home-assistant/event/route.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

**Consumer / reader**

- app/api/home-assistant/event/route.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseAutomationContext.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

### house_entities

**Producer / writer**

- app/api/home-assistant/event/route.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

**Consumer / reader**

- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

### house_patterns

**Producer / writer**

- lib/ghostme/homeAssistant/housePatternEngine.ts

**Consumer / reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts

### house_suggestions

**Producer / writer**

- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

**Consumer / reader**

- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

**Problemi schema noti**

- entity_id
- entity_name
- entity_type
- event_type
- new_state
- occurred_at

### ghost_proactive_messages

**Producer / writer**

- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

**Consumer / reader**

- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/proactiveTrigger.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

**Problemi schema noti**

- curiosity

## 9. Percorsi da usare per debug rapido

### Perché GhostMe non crea una card continuity?

Controllare in ordine:

1. observation_events
2. user_location_state
3. episodic_memories / conversation_summaries
4. proactiveCandidateBuilder.ts
5. proactiveUserFlow.ts
6. proactiveMessageService.ts
7. ghost_proactive_messages
8. visibleProactiveMessages.ts

### Perché Daily è inutile o vecchio?

Controllare in ordine:

1. dailyBriefingRepository.ts
2. dailyBriefingBuilder.ts
3. ghost_proactive_messages logical_key daily_briefing_YYYY-MM-DD
4. visibleProactiveMessages.ts

### Perché una regola comportamento non viene rispettata?

Controllare in ordine:

1. ghost_behavior_rules
2. behaviorRulesEngine.ts
3. chatContextBuilder.ts
4. chatPromptBuilder.ts
5. Identity / Profilo comportamentale runtime

### Perché Home Assistant produce dati ma GhostMe non li usa?

Controllare in ordine:

1. house_events
2. house_entities
3. houseStateSnapshot.ts
4. reasoningService.ts
5. dailyBriefingRepository.ts
6. proactiveCandidateBuilder.ts

## 10. Nota finale

Questa Knowledge Base non sostituisce gli audit specifici. Li collega.
È il punto di partenza per ogni nuova modifica architetturale.
