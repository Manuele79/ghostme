# PROJECT AUDIT FULL

Generato: 2026-06-13T20:02:26.017Z

# 1. RIASSUNTO

- File analizzati: 103
- Cartelle: 51
- API routes: 23
- Tabelle Supabase usate: 28
- File potenzialmente scollegati: 4
- Export potenzialmente non usati: 6
- Rotte debug/test: 5

---

# 2. CARTELLE

## .

- eslint.config.mjs
- next-env.d.ts
- next.config.ts
- postcss.config.mjs

## app

- app/layout.tsx
- app/page.tsx

## app/api/calendar-events

- app/api/calendar-events/route.ts

## app/api/chat

- app/api/chat/route.ts

## app/api/conversation-summary

- app/api/conversation-summary/route.ts

## app/api/debug-ha-entities

- app/api/debug-ha-entities/route.ts

## app/api/debug-house-logger

- app/api/debug-house-logger/route.ts

## app/api/ghostme/brain

- app/api/ghostme/brain/route.ts

## app/api/ghostme/proactive/read

- app/api/ghostme/proactive/read/route.ts

## app/api/goals/update-status

- app/api/goals/update-status/route.ts

## app/api/house-suggestion-response

- app/api/house-suggestion-response/route.ts

## app/api/location/current-place

- app/api/location/current-place/route.ts

## app/api/location/current-state

- app/api/location/current-state/route.ts

## app/api/location/delete-place

- app/api/location/delete-place/route.ts

## app/api/location/places

- app/api/location/places/route.ts

## app/api/location/save-place

- app/api/location/save-place/route.ts

## app/api/location/update-current

- app/api/location/update-current/route.ts

## app/api/memory

- app/api/memory/route.ts

## app/api/memory/search

- app/api/memory/search/route.ts

## app/api/proactive/messages

- app/api/proactive/messages/route.ts

## app/api/test-ha

- app/api/test-ha/route.ts

## app/api/test-home-context

- app/api/test-home-context/route.ts

## app/api/test-home-reasoning

- app/api/test-home-reasoning/route.ts

## app/api/worker/house

- app/api/worker/house/route.ts

## app/api/worker/proactive

- app/api/worker/proactive/route.ts

## app/chat

- app/chat/page.tsx

## app/login

- app/login/page.tsx

## app/memory

- app/memory/page.tsx

## app/setup

- app/setup/page.tsx

## app/setup/profile

- app/setup/profile/page.tsx

## components/ghost

- components/ghost/GhostBackground.tsx
- components/ghost/GhostCanvasCore.tsx
- components/ghost/GhostChat.tsx
- components/ghost/GhostCore.tsx
- components/ghost/GhostDrawers.tsx
- components/ghost/GhostGlobalStyles.tsx
- components/ghost/GhostHeader.tsx
- components/ghost/GhostLayout.tsx
- components/ghost/GhostVoiceMode.tsx
- components/ghost/types.ts

## hooks

- hooks/useGhostBrain.ts
- hooks/useGhostChat.ts
- hooks/useGhostVoice.ts

## lib

- lib/personality.ts
- lib/supabase.ts
- lib/supabaseAdmin.ts

## lib/ghostme

- lib/ghostme/actionLayer.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/entityExtractor.ts
- lib/ghostme/goalsDesires.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/mentalState.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/timeline.ts
- lib/ghostme/topicDetector.ts
- lib/ghostme/topicLinks.ts

## lib/ghostme/agenda

- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/agenda/reminderEngine.ts

## lib/ghostme/behavior

- lib/ghostme/behavior/behaviorRulesEngine.ts

## lib/ghostme/butler

- lib/ghostme/butler/butlerEngine.ts

## lib/ghostme/calendar

- lib/ghostme/calendar/calendarIntent.ts
- lib/ghostme/calendar/calendarService.ts

## lib/ghostme/context

- lib/ghostme/context/contextBuilder.ts

## lib/ghostme/core

- lib/ghostme/core/messageClassifier.ts

## lib/ghostme/curiosity

- lib/ghostme/curiosity/curiosityEngine.ts

## lib/ghostme/homeAssistant

- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeContextBuilder.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/homeAssistant/houseAutomationContext.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts
- lib/ghostme/homeAssistant/houseLearnedRulesContext.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

## lib/ghostme/location

- lib/ghostme/location/locationEngine.ts
- lib/ghostme/location/placeService.ts

## lib/ghostme/maintenance

- lib/ghostme/maintenance/retentionEngine.ts

## lib/ghostme/observation

- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts

## lib/ghostme/patterns

- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/patterns/patternInsightEngine.ts

## lib/ghostme/proactive

- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/proactiveTrigger.ts

## lib/ghostme/profile

- lib/ghostme/profile/profileBehaviorSeed.ts

## lib/ghostme/services

- lib/ghostme/services/serviceRouter.ts
- lib/ghostme/services/timeService.ts
- lib/ghostme/services/weatherService.ts
- lib/ghostme/services/webSearchService.ts

## lib/ghostme/situation

- lib/ghostme/situation/situationEngine.ts

## scripts

- scripts/project-audit.mjs

---

# 3. API ROUTES

- app/api/calendar-events/route.ts
- app/api/chat/route.ts
- app/api/conversation-summary/route.ts
- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/ghostme/brain/route.ts
- app/api/ghostme/proactive/read/route.ts
- app/api/goals/update-status/route.ts
- app/api/house-suggestion-response/route.ts
- app/api/location/current-place/route.ts
- app/api/location/current-state/route.ts
- app/api/location/delete-place/route.ts
- app/api/location/places/route.ts
- app/api/location/save-place/route.ts
- app/api/location/update-current/route.ts
- app/api/memory/route.ts
- app/api/memory/search/route.ts
- app/api/proactive/messages/route.ts
- app/api/test-ha/route.ts
- app/api/test-home-context/route.ts
- app/api/test-home-reasoning/route.ts
- app/api/worker/house/route.ts
- app/api/worker/proactive/route.ts

---

# 4. API CHIAMATE DAL FRONT / CODICE

## /api/calendar-events

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/chat

Chiamata da:
- app/chat/page.tsx

## /api/conversation-summary

Chiamata da:
- app/chat/page.tsx

## /api/ghostme/brain

Chiamata da:
- hooks/useGhostBrain.ts

## /api/ghostme/proactive/read

Chiamata da:
- app/chat/page.tsx

## /api/goals/update-status

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/house-suggestion-response

Chiamata da:
- components/ghost/GhostChat.tsx

## /api/location/current-place

Chiamata da:
- app/chat/page.tsx
- components/ghost/GhostDrawers.tsx

## /api/location/current-state

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/location/delete-place

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/location/places

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/location/save-place

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/location/update-current

Chiamata da:
- app/chat/page.tsx

## /api/memory/search

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/proactive/messages

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/worker/proactive

Chiamata da:
- app/chat/page.tsx

---

# 5. TABELLE SUPABASE

## action_intents

### Read
- app/api/ghostme/brain/route.ts
- app/api/memory/search/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/actionLayer.ts

### Update
- lib/ghostme/actionLayer.ts

### Upsert
- nessuno

### Delete
- nessuno

## answers

### Read
- app/setup/page.tsx

### Insert
- app/setup/page.tsx

### Update
- nessuno

### Upsert
- nessuno

### Delete
- app/setup/page.tsx

## autobiographical_timeline

### Read
- app/api/ghostme/brain/route.ts
- app/api/memory/search/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/timeline.ts

### Insert
- lib/ghostme/timeline.ts

### Update
- nessuno

### Upsert
- nessuno

### Delete
- nessuno

## behavior_patterns

### Read
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/observation/observationEngine.ts

### Update
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts

### Upsert
- nessuno

### Delete
- nessuno

## calendar_events

### Read
- app/api/calendar-events/route.ts
- app/api/chat/route.ts
- app/api/ghostme/brain/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/calendar/calendarService.ts

### Update
- app/api/calendar-events/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/maintenance/retentionEngine.ts

### Upsert
- nessuno

### Delete
- nessuno

## chat_messages

### Read
- app/chat/page.tsx
- lib/ghostme/conversationSummary.ts

### Insert
- app/chat/page.tsx

### Update
- lib/ghostme/maintenance/retentionEngine.ts

### Upsert
- nessuno

### Delete
- lib/ghostme/maintenance/retentionEngine.ts

## contradictions

### Read
- lib/ghostme/contradictions.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/contradictions.ts

### Update
- nessuno

### Upsert
- nessuno

### Delete
- nessuno

## conversation_summaries

### Read
- app/api/memory/search/route.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/conversationSummary.ts

### Update
- lib/ghostme/conversationSummary.ts

### Upsert
- nessuno

### Delete
- nessuno

## dynamic_self_profile

### Read
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

### Update
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

### Upsert
- nessuno

### Delete
- nessuno

## episodic_memories

### Read
- app/api/chat/route.ts
- app/api/memory/search/route.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- app/api/chat/route.ts

### Update
- app/api/chat/route.ts

### Upsert
- nessuno

### Delete
- nessuno

## ghost_behavior_rules

### Read
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

### Update
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

### Upsert
- nessuno

### Delete
- nessuno

## ghost_proactive_messages

### Read
- app/api/ghostme/brain/route.ts
- app/api/house-suggestion-response/route.ts
- app/api/proactive/messages/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Insert
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Update
- app/api/ghostme/proactive/read/route.ts
- app/api/house-suggestion-response/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Upsert
- nessuno

### Delete
- nessuno

## goals_desires

### Read
- app/api/ghostme/brain/route.ts
- app/api/memory/search/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/goalsDesires.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/goalsDesires.ts

### Update
- app/api/goals/update-status/route.ts
- lib/ghostme/goalsDesires.ts

### Upsert
- nessuno

### Delete
- nessuno

## house_automation_controls

### Read
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

### Insert
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

### Update
- nessuno

### Upsert
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

### Delete
- nessuno

## house_entities

### Read
- nessuno

### Insert
- nessuno

### Update
- nessuno

### Upsert
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

### Delete
- nessuno

## house_events

### Read
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseAutomationContext.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

### Insert
- lib/ghostme/homeAssistant/homeEventLogger.ts

### Update
- nessuno

### Upsert
- nessuno

### Delete
- nessuno

## house_learned_rules

### Read
- app/api/house-suggestion-response/route.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseLearnedRulesContext.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

### Insert
- app/api/house-suggestion-response/route.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

### Update
- app/api/house-suggestion-response/route.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

### Upsert
- nessuno

### Delete
- nessuno

## house_suggestions

### Read
- app/api/house-suggestion-response/route.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

### Insert
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

### Update
- app/api/house-suggestion-response/route.ts

### Upsert
- nessuno

### Delete
- nessuno

## life_topics

### Read
- app/api/chat/route.ts
- app/api/memory/search/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/topicLinks.ts

### Insert
- app/api/chat/route.ts
- lib/ghostme/relationshipResolver.ts

### Update
- app/api/chat/route.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/relationshipResolver.ts

### Upsert
- nessuno

### Delete
- lib/ghostme/relationshipResolver.ts

## memories_active

### Read
- app/api/chat/route.ts
- app/api/ghostme/brain/route.ts
- app/api/memory/route.ts
- app/api/memory/search/route.ts
- app/memory/page.tsx
- lib/ghostme/contradictions.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/retrieval.ts

### Insert
- app/api/chat/route.ts
- app/api/memory/route.ts
- app/memory/page.tsx
- lib/ghostme/relationshipResolver.ts

### Update
- app/api/chat/route.ts
- app/memory/page.tsx
- lib/ghostme/relationshipResolver.ts

### Upsert
- nessuno

### Delete
- app/memory/page.tsx
- lib/ghostme/relationshipResolver.ts

## mental_states

### Read
- app/api/chat/route.ts
- app/api/ghostme/brain/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/mentalState.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/mentalState.ts

### Update
- lib/ghostme/mentalState.ts

### Upsert
- nessuno

### Delete
- nessuno

## observation_events

### Read
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/observation/observationEngine.ts

### Update
- nessuno

### Upsert
- nessuno

### Delete
- nessuno

## significant_places

### Read
- lib/ghostme/location/placeService.ts

### Insert
- lib/ghostme/location/placeService.ts

### Update
- nessuno

### Upsert
- nessuno

### Delete
- app/api/location/delete-place/route.ts

## topic_links

### Read
- app/api/memory/search/route.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/topicLinks.ts

### Insert
- lib/ghostme/topicLinks.ts

### Update
- lib/ghostme/topicLinks.ts

### Upsert
- nessuno

### Delete
- nessuno

## traits

### Read
- app/api/ghostme/brain/route.ts
- app/chat/page.tsx
- app/login/page.tsx
- lib/ghostme/profile/profileBehaviorSeed.ts

### Insert
- app/setup/page.tsx

### Update
- nessuno

### Upsert
- nessuno

### Delete
- app/setup/page.tsx

## user_location_state

### Read
- app/api/chat/route.ts
- app/api/location/current-state/route.ts
- app/api/location/update-current/route.ts
- lib/ghostme/location/placeService.ts

### Insert
- nessuno

### Update
- nessuno

### Upsert
- app/api/location/update-current/route.ts

### Delete
- nessuno

## user_profiles

### Read
- app/api/chat/route.ts
- app/api/ghostme/brain/route.ts
- app/api/worker/proactive/route.ts
- app/chat/page.tsx
- app/login/page.tsx
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- app/setup/profile/page.tsx

### Update
- nessuno

### Upsert
- nessuno

### Delete
- nessuno

## users

### Read
- app/setup/page.tsx

### Insert
- app/setup/page.tsx

### Update
- nessuno

### Upsert
- app/setup/page.tsx

### Delete
- app/setup/page.tsx

---

# 6. FILE POTENZIALMENTE SCOLLEGATI

- eslint.config.mjs
- lib/ghostme/location/locationEngine.ts
- lib/ghostme/services/timeService.ts
- postcss.config.mjs

---

# 7. EXPORT POTENZIALMENTE NON USATI

- runtime esportata da app/api/chat/route.ts
- metadata esportata da app/layout.tsx
- viewport esportata da app/layout.tsx
- modeLabels esportata da components/ghost/types.ts
- supabase esportata da lib/supabase.ts
- supabaseAdmin esportata da lib/supabaseAdmin.ts


---

# 8. ROTTE DEBUG / TEST DA CONTROLLARE

- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/test-ha/route.ts
- app/api/test-home-context/route.ts
- app/api/test-home-reasoning/route.ts

---

# 9. NOMI FILE DUPLICATI

## page.tsx
- app/chat/page.tsx
- app/login/page.tsx
- app/memory/page.tsx
- app/page.tsx
- app/setup/page.tsx
- app/setup/profile/page.tsx

## route.ts
- app/api/calendar-events/route.ts
- app/api/chat/route.ts
- app/api/conversation-summary/route.ts
- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/ghostme/brain/route.ts
- app/api/ghostme/proactive/read/route.ts
- app/api/goals/update-status/route.ts
- app/api/house-suggestion-response/route.ts
- app/api/location/current-place/route.ts
- app/api/location/current-state/route.ts
- app/api/location/delete-place/route.ts
- app/api/location/places/route.ts
- app/api/location/save-place/route.ts
- app/api/location/update-current/route.ts
- app/api/memory/route.ts
- app/api/memory/search/route.ts
- app/api/proactive/messages/route.ts
- app/api/test-ha/route.ts
- app/api/test-home-context/route.ts
- app/api/test-home-reasoning/route.ts
- app/api/worker/house/route.ts
- app/api/worker/proactive/route.ts

---

# 10. MAPPA FILE PRINCIPALI

## app/api/calendar-events/route.ts

Righe: 101

### Importa
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/calendar/calendarService.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST
- PATCH
- DELETE

### Tabelle
- calendar_events: select, update

## app/api/chat/route.ts

Righe: 1180

### Importa
- openai
- next/server
- lib/supabase.ts
- lib/supabaseAdmin.ts
- lib/ghostme/core/messageClassifier.ts
- lib/ghostme/topicDetector.ts
- lib/ghostme/services/serviceRouter.ts
- lib/ghostme/services/webSearchService.ts
- lib/ghostme/services/weatherService.ts
- lib/ghostme/calendar/calendarIntent.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/topicLinks.ts
- lib/ghostme/entityExtractor.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/mentalState.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/goalsDesires.ts
- lib/ghostme/timeline.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/houseLearnedRulesContext.ts
- lib/ghostme/homeAssistant/houseAutomationContext.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST
- runtime

### Tabelle
- mental_states: select
- memories_active: select, insert, update
- life_topics: select, insert, update
- episodic_memories: select, insert, update
- user_profiles: select
- calendar_events: select
- user_location_state: select

## app/api/conversation-summary/route.ts

Righe: 29

### Importa
- next/server
- lib/ghostme/conversationSummary.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/debug-ha-entities/route.ts

Righe: 44

### Importa
- next/server
- lib/ghostme/homeAssistant/haClient.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/debug-house-logger/route.ts

Righe: 52

### Importa
- next/server
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/ghostme/brain/route.ts

Righe: 128

### Importa
- next/server
- lib/supabaseAdmin.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- user_profiles: select
- traits: select
- memories_active: select
- autobiographical_timeline: select
- goals_desires: select
- mental_states: select
- action_intents: select
- calendar_events: select
- ghost_proactive_messages: select

## app/api/ghostme/proactive/read/route.ts

Righe: 48

### Importa
- next/server
- lib/supabaseAdmin.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- ghost_proactive_messages: update

## app/api/goals/update-status/route.ts

Righe: 43

### Importa
- next/server
- lib/supabaseAdmin.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- goals_desires: update

## app/api/house-suggestion-response/route.ts

Righe: 166

### Importa
- next/server
- lib/supabaseAdmin.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- ghost_proactive_messages: select, update
- house_suggestions: select, update
- house_learned_rules: select, insert, update

## app/api/location/current-place/route.ts

Righe: 32

### Importa
- next/server
- lib/ghostme/location/placeService.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/location/current-state/route.ts

Righe: 31

### Importa
- next/server
- lib/supabaseAdmin.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- user_location_state: select

## app/api/location/delete-place/route.ts

Righe: 24

### Importa
- next/server
- lib/supabaseAdmin.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- DELETE

### Tabelle
- significant_places: delete

## app/api/location/places/route.ts

Righe: 22

### Importa
- next/server
- lib/ghostme/location/placeService.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/location/save-place/route.ts

Righe: 36

### Importa
- next/server
- lib/ghostme/location/placeService.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/location/update-current/route.ts

Righe: 131

### Importa
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- user_location_state: select, upsert

## app/api/memory/route.ts

Righe: 51

### Importa
- next/server
- lib/supabase.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- memories_active: select, insert

## app/api/memory/search/route.ts

Righe: 105

### Importa
- next/server
- lib/supabaseAdmin.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- life_topics: select
- memories_active: select
- autobiographical_timeline: select
- goals_desires: select
- action_intents: select
- topic_links: select
- conversation_summaries: select
- episodic_memories: select

## app/api/proactive/messages/route.ts

Righe: 34

### Importa
- next/server
- lib/supabaseAdmin.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- ghost_proactive_messages: select

## app/api/test-ha/route.ts

Righe: 28

### Importa
- next/server
- lib/ghostme/homeAssistant/haClient.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/test-home-context/route.ts

Righe: 11

### Importa
- next/server
- lib/ghostme/homeAssistant/homeContextBuilder.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/test-home-reasoning/route.ts

Righe: 11

### Importa
- next/server
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/worker/house/route.ts

Righe: 68

### Importa
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/worker/proactive/route.ts

Righe: 327

### Importa
- next/server
- openai
- lib/supabaseAdmin.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/butler/butlerEngine.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/patterns/patternDecay.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- user_profiles: select
- calendar_events: select
- goals_desires: select
- action_intents: select
- mental_states: select
- autobiographical_timeline: select
- life_topics: select
- ghost_proactive_messages: select

## components/ghost/GhostBackground.tsx

Righe: 121

### Importa
- components/ghost/types.ts

### Importato da
- app/chat/page.tsx

### API chiamate
- nessuno

### Export
- nessuno

### Tabelle
- nessuna

## components/ghost/GhostCanvasCore.tsx

Righe: 320

### Importa
- react
- components/ghost/types.ts

### Importato da
- components/ghost/GhostVoiceMode.tsx

### API chiamate
- nessuno

### Export
- nessuno

### Tabelle
- nessuna

## components/ghost/GhostChat.tsx

Righe: 318

### Importa
- react
- components/ghost/types.ts

### Importato da
- app/chat/page.tsx

### API chiamate
- /api/house-suggestion-response

### Export
- nessuno

### Tabelle
- nessuna

## components/ghost/GhostCore.tsx

Righe: 172

### Importa
- next/image
- components/ghost/types.ts

### Importato da
- components/ghost/GhostVoiceMode.tsx

### API chiamate
- nessuno

### Export
- nessuno

### Tabelle
- nessuna

## components/ghost/GhostDrawers.tsx

Righe: 1613

### Importa
- components/ghost/types.ts
- react

### Importato da
- app/chat/page.tsx

### API chiamate
- /api/location/places
- /api/location/current-state
- /api/proactive/messages
- /api/calendar-events
- /api/location/save-place
- /api/location/current-place
- /api/location/delete-place
- /api/memory/search
- /api/goals/update-status

### Export
- MemoryDrawer
- ServicesDrawer
- HistoryDrawer

### Tabelle
- nessuna

## components/ghost/GhostGlobalStyles.tsx

Righe: 65

### Importa
- nessuno

### Importato da
- components/ghost/GhostLayout.tsx

### API chiamate
- nessuno

### Export
- nessuno

### Tabelle
- nessuna

## components/ghost/GhostHeader.tsx

Righe: 69

### Importa
- components/ghost/types.ts

### Importato da
- app/chat/page.tsx

### API chiamate
- nessuno

### Export
- nessuno

### Tabelle
- nessuna

## components/ghost/GhostLayout.tsx

Righe: 37

### Importa
- react
- components/ghost/GhostGlobalStyles.tsx

### Importato da
- app/chat/page.tsx

### API chiamate
- nessuno

### Export
- nessuno

### Tabelle
- nessuna

## components/ghost/GhostVoiceMode.tsx

Righe: 153

### Importa
- components/ghost/GhostCore.tsx
- components/ghost/types.ts
- components/ghost/GhostCanvasCore.tsx

### Importato da
- app/chat/page.tsx

### API chiamate
- nessuno

### Export
- nessuno

### Tabelle
- nessuna

## components/ghost/types.ts

Righe: 54

### Importa
- nessuno

### Importato da
- app/chat/page.tsx
- components/ghost/GhostBackground.tsx
- components/ghost/GhostCanvasCore.tsx
- components/ghost/GhostChat.tsx
- components/ghost/GhostCore.tsx
- components/ghost/GhostDrawers.tsx
- components/ghost/GhostHeader.tsx
- components/ghost/GhostVoiceMode.tsx
- hooks/useGhostBrain.ts
- hooks/useGhostChat.ts
- hooks/useGhostVoice.ts

### API chiamate
- nessuno

### Export
- modeLabels

### Tabelle
- nessuna

## hooks/useGhostBrain.ts

Righe: 82

### Importa
- react
- components/ghost/types.ts
- lib/personality.ts

### Importato da
- app/chat/page.tsx

### API chiamate
- /api/ghostme/brain

### Export
- useGhostBrain

### Tabelle
- nessuna

## hooks/useGhostChat.ts

Righe: 19

### Importa
- react
- components/ghost/types.ts

### Importato da
- app/chat/page.tsx

### API chiamate
- nessuno

### Export
- useGhostChat

### Tabelle
- nessuna

## hooks/useGhostVoice.ts

Righe: 158

### Importa
- react
- components/ghost/types.ts

### Importato da
- app/chat/page.tsx

### API chiamate
- nessuno

### Export
- useGhostVoice

### Tabelle
- nessuna

## lib/ghostme/actionLayer.ts

Righe: 258

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- app/api/chat/route.ts
- app/api/worker/proactive/route.ts

### API chiamate
- nessuno

### Export
- getActionIntentContext
- detectAndSaveActionIntent
- cleanupOldActionIntents
- detectAndCompleteActionIntent

### Tabelle
- action_intents: select, insert, update

## lib/ghostme/agenda/agendaEngine.ts

Righe: 60

### Importa
- lib/ghostme/situation/situationEngine.ts

### Importato da
- app/api/worker/proactive/route.ts
- lib/ghostme/calendar/calendarService.ts

### API chiamate
- nessuno

### Export
- buildAgendaMessage

### Tabelle
- nessuna

## lib/ghostme/agenda/reminderEngine.ts

Righe: 81

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/worker/proactive/route.ts
- lib/ghostme/calendar/calendarService.ts

### API chiamate
- nessuno

### Export
- refreshReminderMessage

### Tabelle
- calendar_events: select, update
- ghost_proactive_messages: select, insert, update

## lib/ghostme/behavior/behaviorRulesEngine.ts

Righe: 225

### Importa
- lib/supabaseAdmin.ts
- openai

### Importato da
- app/api/chat/route.ts
- lib/ghostme/context/contextBuilder.ts

### API chiamate
- nessuno

### Export
- getActiveBehaviorRules
- saveBehaviorRule
- buildBehaviorPrompt
- detectAndSaveBehaviorRule

### Tabelle
- ghost_behavior_rules: select, insert, update

## lib/ghostme/butler/butlerEngine.ts

Righe: 67

### Importa
- openai
- lib/ghostme/context/contextBuilder.ts

### Importato da
- app/api/worker/proactive/route.ts

### API chiamate
- nessuno

### Export
- generateButlerMessage

### Tabelle
- nessuna

## lib/ghostme/calendar/calendarIntent.ts

Righe: 114

### Importa
- openai

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- parseCalendarIntent

### Tabelle
- nessuna

## lib/ghostme/calendar/calendarService.ts

Righe: 211

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### Importato da
- app/api/calendar-events/route.ts
- app/api/chat/route.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### API chiamate
- nessuno

### Export
- createCalendarEvent
- getUpcomingCalendarEvents
- refreshAgendaMessage
- cleanupExpiredEvents

### Tabelle
- calendar_events: select, insert, update
- ghost_proactive_messages: select, insert, update

## lib/ghostme/context/contextBuilder.ts

Righe: 213

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts

### Importato da
- app/api/worker/proactive/route.ts
- lib/ghostme/butler/butlerEngine.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### API chiamate
- nessuno

### Export
- buildCurrentContext

### Tabelle
- ghost_proactive_messages: select

## lib/ghostme/contradictions.ts

Righe: 168

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- detectAndSaveContradictions

### Tabelle
- memories_active: select
- life_topics: select
- contradictions: select, insert

## lib/ghostme/conversationSummary.ts

Righe: 174

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- app/api/conversation-summary/route.ts
- app/api/worker/proactive/route.ts

### API chiamate
- nessuno

### Export
- generateDailyConversationSummary

### Tabelle
- chat_messages: select
- conversation_summaries: select, insert, update

## lib/ghostme/core/messageClassifier.ts

Righe: 61

### Importa
- nessuno

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- classifyGhostMessage

### Tabelle
- nessuna

## lib/ghostme/curiosity/curiosityEngine.ts

Righe: 230

### Importa
- openai
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts

### Importato da
- app/api/worker/proactive/route.ts

### API chiamate
- nessuno

### Export
- generateCuriosityMessage

### Tabelle
- ghost_proactive_messages: select
- life_topics: select
- goals_desires: select
- dynamic_self_profile: select
- contradictions: select
- autobiographical_timeline: select
- conversation_summaries: select

## lib/ghostme/dynamicSelfProfile.ts

Righe: 142

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- getDynamicSelfProfileContext
- updateDynamicSelfProfile

### Tabelle
- dynamic_self_profile: select, insert, update

## lib/ghostme/entityExtractor.ts

Righe: 243

### Importa
- openai
- lib/ghostme/topicDetector.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- extractEntitiesWithAI

### Tabelle
- nessuna

## lib/ghostme/goalsDesires.ts

Righe: 282

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- getGoalsDesiresContext
- detectAndSaveGoalsDesires

### Tabelle
- goals_desires: select, insert, update

## lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts

Righe: 180

### Importa
- lib/ghostme/homeAssistant/haClient.ts

### Importato da
- app/api/chat/route.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

### API chiamate
- nessuno

### Export
- buildCognitiveHouse

### Tabelle
- nessuna

## lib/ghostme/homeAssistant/haClient.ts

Righe: 32

### Importa
- nessuno

### Importato da
- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/test-ha/route.ts
- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/homeContextBuilder.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

### API chiamate
- nessuno

### Export
- getHAStates

### Tabelle
- nessuna

## lib/ghostme/homeAssistant/homeContextBuilder.ts

Righe: 171

### Importa
- lib/ghostme/homeAssistant/haClient.ts

### Importato da
- app/api/test-home-context/route.ts

### API chiamate
- nessuno

### Export
- buildHomeContext

### Tabelle
- nessuna

## lib/ghostme/homeAssistant/homeEntityMapper.ts

Righe: 188

### Importa
- nessuno

### Importato da
- app/api/debug-house-logger/route.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

### API chiamate
- nessuno

### Export
- getEntityInfo

### Tabelle
- nessuna

## lib/ghostme/homeAssistant/homeEventLogger.ts

Righe: 307

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts

### Importato da
- app/api/worker/house/route.ts

### API chiamate
- nessuno

### Export
- logHomeAssistantSnapshot

### Tabelle
- house_events: select, insert

## lib/ghostme/homeAssistant/homeReasoningBuilder.ts

Righe: 88

### Importa
- lib/ghostme/homeAssistant/haClient.ts

### Importato da
- app/api/test-home-reasoning/route.ts
- lib/ghostme/context/contextBuilder.ts

### API chiamate
- nessuno

### Export
- buildHomeReasoning

### Tabelle
- nessuna

## lib/ghostme/homeAssistant/houseAutomationContext.ts

Righe: 45

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- buildHouseAutomationContext

### Tabelle
- house_events: select

## lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Righe: 162

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/worker/house/route.ts

### API chiamate
- nessuno

### Export
- planHouseAutomationControls

### Tabelle
- house_automation_controls: select, insert, upsert
- ghost_proactive_messages: select, insert
- house_learned_rules: select
- house_events: select

## lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts

Righe: 161

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/worker/house/route.ts

### API chiamate
- nessuno

### Export
- generateHouseAutomationSuggestions

### Tabelle
- house_suggestions: select, insert
- ghost_proactive_messages: select, insert
- house_events: select

## lib/ghostme/homeAssistant/houseEntityRegistry.ts

Righe: 68

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts

### Importato da
- app/api/worker/house/route.ts

### API chiamate
- nessuno

### Export
- syncHouseEntities

### Tabelle
- house_entities: upsert

## lib/ghostme/homeAssistant/houseLearnedRulesContext.ts

Righe: 39

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- buildHouseLearnedRulesContext

### Tabelle
- house_learned_rules: select

## lib/ghostme/homeAssistant/housePatternEngine.ts

Righe: 291

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/worker/house/route.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

### API chiamate
- nessuno

### Export
- analyzeHousePatterns

### Tabelle
- house_events: select

## lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

Righe: 139

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/worker/house/route.ts

### API chiamate
- nessuno

### Export
- learnHouseRoutes

### Tabelle
- house_events: select
- house_learned_rules: select, insert, update

## lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Righe: 165

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts

### Importato da
- app/api/worker/house/route.ts

### API chiamate
- nessuno

### Export
- generateHouseSuggestions

### Tabelle
- house_suggestions: select, insert
- ghost_proactive_messages: insert

## lib/ghostme/location/locationEngine.ts

Righe: 23

### Importa
- nessuno

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- classifyLocationSignal

### Tabelle
- nessuna

## lib/ghostme/location/placeService.ts

Righe: 124

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/location/current-place/route.ts
- app/api/location/places/route.ts
- app/api/location/save-place/route.ts
- lib/ghostme/situation/situationEngine.ts

### API chiamate
- nessuno

### Export
- saveSignificantPlace
- getSignificantPlaces
- detectCurrentPlace
- getLastKnownPlace
- getCurrentLocationState

### Tabelle
- significant_places: select, insert
- user_location_state: select

## lib/ghostme/maintenance/retentionEngine.ts

Righe: 53

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/worker/proactive/route.ts

### API chiamate
- nessuno

### Export
- runRetentionCleanup

### Tabelle
- chat_messages: update, delete
- ghost_proactive_messages: update
- calendar_events: update

## lib/ghostme/memoryDecay.ts

Righe: 93

### Importa
- lib/supabase.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- applyMemoryDecay

### Tabelle
- life_topics: select, update

## lib/ghostme/mentalState.ts

Righe: 212

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- updateMentalState

### Tabelle
- mental_states: select, insert, update

## lib/ghostme/observation/observationEngine.ts

Righe: 354

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/location/update-current/route.ts

### API chiamate
- nessuno

### Export
- recordObservation
- analyzeLocationPatterns

### Tabelle
- observation_events: select, insert
- behavior_patterns: select, insert, update

## lib/ghostme/observation/observationInsightEngine.ts

Righe: 113

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- openai

### Importato da
- app/api/worker/proactive/route.ts

### API chiamate
- nessuno

### Export
- generateObservationInsight

### Tabelle
- ghost_proactive_messages: select

## lib/ghostme/patterns/patternDecay.ts

Righe: 51

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/worker/proactive/route.ts

### API chiamate
- nessuno

### Export
- applyPatternDecay

### Tabelle
- behavior_patterns: select, update

## lib/ghostme/patterns/patternInsightEngine.ts

Righe: 80

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- openai

### Importato da
- app/api/worker/proactive/route.ts

### API chiamate
- nessuno

### Export
- generatePatternInsight

### Tabelle
- ghost_proactive_messages: select
- behavior_patterns: select

## lib/ghostme/proactive/proactiveDecisionEngine.ts

Righe: 133

### Importa
- openai
- lib/ghostme/context/contextBuilder.ts

### Importato da
- app/api/worker/proactive/route.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### API chiamate
- nessuno

### Export
- decideProactiveMessage

### Tabelle
- nessuna

## lib/ghostme/proactive/proactiveMessageService.ts

Righe: 78

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/worker/proactive/route.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### API chiamate
- nessuno

### Export
- upsertProactiveMessage

### Tabelle
- ghost_proactive_messages: select, insert, update

## lib/ghostme/proactive/proactiveTrigger.ts

Righe: 58

### Importa
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Importato da
- app/api/location/update-current/route.ts
- lib/ghostme/calendar/calendarService.ts

### API chiamate
- nessuno

### Export
- runProactiveTrigger

### Tabelle
- nessuna

## lib/ghostme/profile/profileBehaviorSeed.ts

Righe: 224

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/setup/page.tsx

### API chiamate
- nessuno

### Export
- seedBehaviorFromProfile

### Tabelle
- ghost_behavior_rules: select, insert, update
- dynamic_self_profile: select, insert, update
- user_profiles: select
- traits: select

## lib/ghostme/relationshipResolver.ts

Righe: 208

### Importa
- lib/supabase.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- removeGenericRelationshipTopics
- resolveNamedRelationship

### Tabelle
- life_topics: select, insert, update, delete
- memories_active: select, insert, update, delete

## lib/ghostme/retrieval.ts

Righe: 320

### Importa
- lib/supabase.ts
- lib/ghostme/topicLinks.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- buildContextualMemory

### Tabelle
- topic_links: select
- life_topics: select
- memories_active: select
- episodic_memories: select
- conversation_summaries: select

## lib/ghostme/services/serviceRouter.ts

Righe: 80

### Importa
- nessuno

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- decideGhostService

### Tabelle
- nessuna

## lib/ghostme/services/timeService.ts

Righe: 13

### Importa
- nessuno

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- getLocalTimeContext

### Tabelle
- nessuna

## lib/ghostme/services/weatherService.ts

Righe: 26

### Importa
- lib/ghostme/services/webSearchService.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- runWeatherSearch

### Tabelle
- nessuna

## lib/ghostme/services/webSearchService.ts

Righe: 33

### Importa
- openai

### Importato da
- app/api/chat/route.ts
- lib/ghostme/services/weatherService.ts

### API chiamate
- nessuno

### Export
- runWebSearch

### Tabelle
- nessuna

## lib/ghostme/situation/situationEngine.ts

Righe: 452

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/location/placeService.ts

### Importato da
- app/api/worker/proactive/route.ts
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### API chiamate
- nessuno

### Export
- buildGhostSituation

### Tabelle
- user_profiles: select
- calendar_events: select
- goals_desires: select
- action_intents: select
- life_topics: select
- mental_states: select
- episodic_memories: select
- autobiographical_timeline: select
- conversation_summaries: select
- dynamic_self_profile: select
- contradictions: select
- topic_links: select
- ghost_behavior_rules: select
- behavior_patterns: select
- observation_events: select

## lib/ghostme/timeline.ts

Righe: 124

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- getTimelineContext
- detectAndSaveTimelineEvent

### Tabelle
- autobiographical_timeline: select, insert

## lib/ghostme/topicDetector.ts

Righe: 453

### Importa
- nessuno

### Importato da
- app/api/chat/route.ts
- lib/ghostme/entityExtractor.ts

### API chiamate
- nessuno

### Export
- detectTopicsFromMessage
- isPossibleEpisode
- detectEmotionalTone
- shouldSaveActiveMemory
- detectImportanceLevel
- detectMemoryCategory

### Tabelle
- nessuna

## lib/ghostme/topicLinks.ts

Righe: 290

### Importa
- lib/supabase.ts

### Importato da
- app/api/chat/route.ts
- lib/ghostme/retrieval.ts

### API chiamate
- nessuno

### Export
- saveTopicLinks
- getRelatedTopicContext

### Tabelle
- topic_links: select, insert, update
- life_topics: select

