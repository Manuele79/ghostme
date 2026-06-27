# PROJECT AUDIT FULL

Generato: 2026-06-27T23:45:07.755Z

# 1. RIASSUNTO

- File analizzati: 175
- Cartelle: 64
- API routes: 28
- Tabelle Supabase usate: 31
- File potenzialmente scollegati: 9
- Export potenzialmente non usati: 19
- Rotte debug/test: 6

---

# 2. CARTELLE

## .

- .dependency-cruiser.js
- eslint.config.mjs
- next-env.d.ts
- next.config.ts
- postcss.config.mjs

## app

- app/layout.tsx
- app/page.tsx

## app/api/actions/update-status

- app/api/actions/update-status/route.ts

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

## app/api/debug-reasoning

- app/api/debug-reasoning/route.ts

## app/api/ghostme/brain

- app/api/ghostme/brain/route.ts

## app/api/ghostme/proactive/read

- app/api/ghostme/proactive/read/route.ts

## app/api/goals/update-status

- app/api/goals/update-status/route.ts

## app/api/home-assistant/event

- app/api/home-assistant/event/route.ts

## app/api/house-suggestion-response

- app/api/house-suggestion-response/route.ts

## app/api/location/candidate

- app/api/location/candidate/route.ts

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

## app/api/worker/reminder

- app/api/worker/reminder/route.ts

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
- lib/ghostme/agenda/appointmentReminderNotification.ts
- lib/ghostme/agenda/reminderEngine.ts

## lib/ghostme/auth

- lib/ghostme/auth/clientAuthHeaders.ts
- lib/ghostme/auth/serverAuth.ts

## lib/ghostme/behavior

- lib/ghostme/behavior/behaviorRulesEngine.ts

## lib/ghostme/butler

- lib/ghostme/butler/butlerEngine.ts

## lib/ghostme/calendar

- lib/ghostme/calendar/calendarIntent.ts
- lib/ghostme/calendar/calendarService.ts

## lib/ghostme/chat

- lib/ghostme/chat/chatCalendarFlow.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/chatExternalServices.ts
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/chat/chatPromptBuilder.ts
- lib/ghostme/chat/chatRecallPolicy.ts
- lib/ghostme/chat/chatResponseSanitizer.ts
- lib/ghostme/chat/chatTypes.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts

## lib/ghostme/context

- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/contextSignals.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/context/userContextGraph.ts

## lib/ghostme/core

- lib/ghostme/core/messageClassifier.ts

## lib/ghostme/curiosity

- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/curiosity/curiositySnapshot.ts

## lib/ghostme/goals

- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/goals/goalsSnapshot.ts

## lib/ghostme/home

- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/homeLocationConsistency.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/home/houseWorkerFlow.ts

## lib/ghostme/homeAssistant

- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts
- lib/ghostme/homeAssistant/homeContextBuilder.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/homeEventSignificance.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/homeAssistant/houseAutomationContext.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts
- lib/ghostme/homeAssistant/houseLearnedRulesContext.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

## lib/ghostme/location

- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationCurrentStateFlow.ts
- lib/ghostme/location/locationDeletePlaceFlow.ts
- lib/ghostme/location/locationEngine.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationSavePlaceFlow.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/placeService.ts

## lib/ghostme/maintenance

- lib/ghostme/maintenance/retentionEngine.ts

## lib/ghostme/memory

- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts

## lib/ghostme/observation

- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/observation/observationPolicy.ts

## lib/ghostme/patterns

- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/patterns/patternInsightEngine.ts

## lib/ghostme/people

- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts

## lib/ghostme/proactive

- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/ghostme/proactive/dailyBriefingBuilder.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveCandidateRanker.ts
- lib/ghostme/proactive/proactiveCardLifecycle.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts
- lib/ghostme/proactive/proactiveMessageDedupe.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/proactiveTrigger.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

## lib/ghostme/profile

- lib/ghostme/profile/profileBehaviorSeed.ts

## lib/ghostme/projects

- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

## lib/ghostme/services

- lib/ghostme/services/serviceRouter.ts
- lib/ghostme/services/timeService.ts
- lib/ghostme/services/weatherService.ts
- lib/ghostme/services/webSearchService.ts

## lib/ghostme/situation

- lib/ghostme/situation/situationEngine.ts

## lib/ghostme/ui

- lib/ghostme/ui/brainUiAdapter.ts

## scripts

- scripts/db-usage-map.mjs
- scripts/file-usage-map.mjs
- scripts/generate-graphs.mjs
- scripts/project-audit.mjs
- scripts/supabase-schema-map.mjs
- scripts/system-docs.mjs

---

# 3. API ROUTES

- app/api/actions/update-status/route.ts
- app/api/calendar-events/route.ts
- app/api/chat/route.ts
- app/api/conversation-summary/route.ts
- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/debug-reasoning/route.ts
- app/api/ghostme/brain/route.ts
- app/api/ghostme/proactive/read/route.ts
- app/api/goals/update-status/route.ts
- app/api/home-assistant/event/route.ts
- app/api/house-suggestion-response/route.ts
- app/api/location/candidate/route.ts
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
- app/api/worker/reminder/route.ts

---

# 4. API CHIAMATE DAL FRONT / CODICE

## /api/actions/update-status

Chiamata da:
- components/ghost/GhostDrawers.tsx

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
- components/ghost/GhostDrawers.tsx

## /api/goals/update-status

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/house-suggestion-response

Chiamata da:
- components/ghost/GhostChat.tsx
- components/ghost/GhostDrawers.tsx

## /api/location/candidate

Chiamata da:
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
- components/ghost/GhostDrawers.tsx

## /api/memory/search

Chiamata da:
- components/ghost/GhostDrawers.tsx

## /api/proactive/messages

Chiamata da:
- components/ghost/GhostDrawers.tsx

---

# 5. TABELLE SUPABASE

## action_intents

### Read
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

### Insert
- lib/ghostme/actionLayer.ts

### Update
- app/api/actions/update-status/route.ts
- app/api/goals/update-status/route.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts

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
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/retrieval.ts
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
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/observation/observationEngine.ts

### Update
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts

### Upsert
- nessuno

### Delete
- nessuno

## calendar_events

### Read
- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/calendar/calendarService.ts

### Update
- app/api/ghostme/proactive/read/route.ts
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
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
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
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/chat/chatPostProcessing.ts

### Update
- lib/ghostme/chat/chatPostProcessing.ts

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

### Insert
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Update
- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

### Upsert
- nessuno

### Delete
- nessuno

## goals_desires

### Read
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

### Insert
- lib/ghostme/goalsDesires.ts

### Update
- app/api/goals/update-status/route.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/goalsDesires.ts

### Upsert
- nessuno

### Delete
- nessuno

## house_automation_controls

### Read
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

### Insert
- nessuno

### Update
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

### Upsert
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

### Delete
- nessuno

## house_entities

### Read
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

### Insert
- nessuno

### Update
- nessuno

### Upsert
- app/api/home-assistant/event/route.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

### Delete
- nessuno

## house_events

### Read
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

### Insert
- lib/ghostme/homeAssistant/homeEventLogger.ts

### Update
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts

### Upsert
- nessuno

### Delete
- nessuno

## house_learned_rules

### Read
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseLearnedRulesContext.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

### Insert
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

### Update
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

### Upsert
- nessuno

### Delete
- nessuno

## house_patterns

### Read
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

### Insert
- lib/ghostme/homeAssistant/housePatternEngine.ts

### Update
- lib/ghostme/homeAssistant/housePatternEngine.ts

### Upsert
- nessuno

### Delete
- nessuno

## house_suggestions

### Read
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

### Insert
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

### Update
- lib/ghostme/home/houseSuggestionResponseFlow.ts

### Upsert
- nessuno

### Delete
- nessuno

## life_topics

### Read
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

### Insert
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/relationshipResolver.ts

### Update
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/relationshipResolver.ts

### Upsert
- nessuno

### Delete
- lib/ghostme/relationshipResolver.ts

## memories_active

### Read
- app/api/memory/route.ts
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

### Insert
- app/api/memory/route.ts
- app/memory/page.tsx
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/relationshipResolver.ts

### Update
- app/memory/page.tsx
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/relationshipResolver.ts

### Upsert
- nessuno

### Delete
- app/memory/page.tsx
- lib/ghostme/relationshipResolver.ts

## mental_states

### Read
- lib/ghostme/mentalState.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
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
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/situation/situationEngine.ts

### Insert
- lib/ghostme/observation/observationEngine.ts

### Update
- lib/ghostme/observation/observationEngine.ts

### Upsert
- nessuno

### Delete
- nessuno

## people_graph

### Read
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleSnapshot.ts

### Insert
- lib/ghostme/people/peopleGraphService.ts

### Update
- lib/ghostme/people/peopleGraphService.ts

### Upsert
- nessuno

### Delete
- nessuno

## people_graph_links

### Read
- lib/ghostme/people/peopleGraphLinkService.ts

### Insert
- nessuno

### Update
- lib/ghostme/people/peopleGraphLinkService.ts

### Upsert
- nessuno

### Delete
- nessuno

## significant_places

### Read
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

### Insert
- lib/ghostme/location/placeService.ts

### Update
- lib/ghostme/location/placeService.ts

### Upsert
- lib/ghostme/location/haLocationBridgeFlow.ts

### Delete
- lib/ghostme/location/locationDeletePlaceFlow.ts

## topic_links

### Read
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
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
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationCurrentStateFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts

### Insert
- nessuno

### Update
- lib/ghostme/location/locationLearningFlow.ts

### Upsert
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts

### Delete
- nessuno

## user_profiles

### Read
- app/api/worker/proactive/route.ts
- app/chat/page.tsx
- app/login/page.tsx
- lib/ghostme/context/userContextGraph.ts
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

- .dependency-cruiser.js
- eslint.config.mjs
- lib/ghostme/agenda/appointmentReminderNotification.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/homeAssistant/houseAutomationContext.ts
- lib/ghostme/homeAssistant/houseLearnedRulesContext.ts
- lib/ghostme/location/locationEngine.ts
- lib/ghostme/services/timeService.ts
- postcss.config.mjs

---

# 7. EXPORT POTENZIALMENTE NON USATI

- runtime esportata da app/api/chat/route.ts
- metadata esportata da app/layout.tsx
- viewport esportata da app/layout.tsx
- modeLabels esportata da components/ghost/types.ts
- HIGH_VALUE_CURIOSITY_TYPES esportata da lib/ghostme/curiosity/curiositySnapshot.ts
- HOME_EVENT_THRESHOLDS esportata da lib/ghostme/homeAssistant/homeEventSignificance.ts
- LOCATION_CARD_PREFIX esportata da lib/ghostme/location/locationLearningFlow.ts
- GPS_LOCATION_FRESHNESS_WINDOW_MS esportata da lib/ghostme/location/locationStateFreshness.ts
- HA_HOME_FRESHNESS_WINDOW_MS esportata da lib/ghostme/location/locationStateFreshness.ts
- LOCATION_FRESHNESS_WINDOW_MS esportata da lib/ghostme/location/locationStateFreshness.ts
- CURRENT_OBSERVATION_WINDOW_MS esportata da lib/ghostme/observation/observationPolicy.ts
- MAX_CURRENT_OBSERVATIONS esportata da lib/ghostme/observation/observationPolicy.ts
- PEOPLE_GRAPH_TARGET_TYPES esportata da lib/ghostme/people/peopleGraphLinkService.ts
- VISIBLE_PROACTIVE_STATUSES esportata da lib/ghostme/proactive/proactiveCardLifecycle.ts
- HIDDEN_PROACTIVE_STATUSES esportata da lib/ghostme/proactive/proactiveCardLifecycle.ts
- ALL_PROACTIVE_STATUSES esportata da lib/ghostme/proactive/proactiveCardLifecycle.ts
- USER_PROACTIVE_TRANSITIONS esportata da lib/ghostme/proactive/proactiveCardLifecycle.ts
- VISIBLE_PROACTIVE_CATEGORIES esportata da lib/ghostme/proactive/proactiveCardLifecycle.ts
- supabaseAdmin esportata da lib/supabaseAdmin.ts


---

# 8. ROTTE DEBUG / TEST DA CONTROLLARE

- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/debug-reasoning/route.ts
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
- app/api/actions/update-status/route.ts
- app/api/calendar-events/route.ts
- app/api/chat/route.ts
- app/api/conversation-summary/route.ts
- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/debug-reasoning/route.ts
- app/api/ghostme/brain/route.ts
- app/api/ghostme/proactive/read/route.ts
- app/api/goals/update-status/route.ts
- app/api/home-assistant/event/route.ts
- app/api/house-suggestion-response/route.ts
- app/api/location/candidate/route.ts
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
- app/api/worker/reminder/route.ts

---

# 10. MAPPA FILE PRINCIPALI

## app/api/actions/update-status/route.ts

Righe: 129

### Importa
- next/server
- lib/ghostme/auth/serverAuth.ts
- lib/supabaseAdmin.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- PATCH

### Tabelle
- action_intents: select, update

## app/api/calendar-events/route.ts

Righe: 104

### Importa
- next/server
- lib/ghostme/auth/serverAuth.ts
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
- nessuna

## app/api/chat/route.ts

Righe: 73

### Importa
- next/server
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST
- runtime

### Tabelle
- nessuna

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

Righe: 49

### Importa
- next/server
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/debug-house-logger/route.ts

Righe: 56

### Importa
- next/server
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/debug-reasoning/route.ts

Righe: 36

### Importa
- next/server
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/ghostme/brain/route.ts

Righe: 67

### Importa
- next/server
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/calendar/calendarService.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/ghostme/proactive/read/route.ts

Righe: 185

### Importa
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/proactive/proactiveCardLifecycle.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- ghost_proactive_messages: select, update
- calendar_events: select, update

## app/api/goals/update-status/route.ts

Righe: 144

### Importa
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- goals_desires: select, update
- action_intents: select, update

## app/api/home-assistant/event/route.ts

Righe: 464

### Importa
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/ghostme/homeAssistant/homeEventSignificance.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- house_events: select
- house_entities: upsert

## app/api/house-suggestion-response/route.ts

Righe: 27

### Importa
- next/server
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/location/candidate/route.ts

Righe: 53

### Importa
- next/server
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST
- PATCH

### Tabelle
- nessuna

## app/api/location/current-place/route.ts

Righe: 36

### Importa
- next/server
- lib/ghostme/location/placeService.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/location/current-state/route.ts

Righe: 32

### Importa
- next/server
- lib/ghostme/location/locationCurrentStateFlow.ts
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/location/locationStateFreshness.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/location/delete-place/route.ts

Righe: 26

### Importa
- next/server
- lib/ghostme/location/locationDeletePlaceFlow.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- DELETE

### Tabelle
- nessuna

## app/api/location/places/route.ts

Righe: 22

### Importa
- next/server
- lib/ghostme/location/placeService.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/location/save-place/route.ts

Righe: 26

### Importa
- next/server
- lib/ghostme/location/locationSavePlaceFlow.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/location/update-current/route.ts

Righe: 32

### Importa
- next/server
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/location/placeService.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

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

Righe: 30

### Importa
- next/server
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/proactive/messages/route.ts

Righe: 29

### Importa
- next/server
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- POST

### Tabelle
- nessuna

## app/api/test-ha/route.ts

Righe: 32

### Importa
- next/server
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/test-home-context/route.ts

Righe: 16

### Importa
- next/server
- lib/ghostme/homeAssistant/homeContextBuilder.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/test-home-reasoning/route.ts

Righe: 16

### Importa
- next/server
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/worker/house/route.ts

Righe: 14

### Importa
- next/server
- lib/ghostme/home/houseWorkerFlow.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

## app/api/worker/proactive/route.ts

Righe: 49

### Importa
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- user_profiles: select

## app/api/worker/reminder/route.ts

Righe: 33

### Importa
- next/server
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/auth/serverAuth.ts

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- GET

### Tabelle
- nessuna

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

Righe: 389

### Importa
- react
- lib/ghostme/auth/clientAuthHeaders.ts
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

Righe: 2243

### Importa
- components/ghost/types.ts
- react
- lib/ghostme/auth/clientAuthHeaders.ts

### Importato da
- app/chat/page.tsx

### API chiamate
- /api/house-suggestion-response
- /api/ghostme/proactive/read
- /api/location/places
- /api/location/current-state
- /api/location/candidate
- /api/proactive/messages
- /api/actions/update-status
- /api/calendar-events
- /api/location/save-place
- /api/location/update-current
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

Righe: 89

### Importa
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/context/decisionSnapshot.ts

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
- lib/ghostme/ui/brainUiAdapter.ts

### API chiamate
- nessuno

### Export
- modeLabels

### Tabelle
- nessuna

## hooks/useGhostBrain.ts

Righe: 87

### Importa
- react
- components/ghost/types.ts
- lib/personality.ts
- lib/ghostme/auth/clientAuthHeaders.ts
- lib/ghostme/ui/brainUiAdapter.ts

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

Righe: 305

### Importa
- openai
- lib/supabaseAdmin.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts

### Importato da
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

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

Righe: 41

### Importa
- lib/ghostme/situation/situationEngine.ts

### Importato da
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

### API chiamate
- nessuno

### Export
- buildAgendaMessage

### Tabelle
- nessuna

## lib/ghostme/agenda/appointmentReminderNotification.ts

Righe: 50

### Importa
- nessuno

### Importato da
- nessuno

### API chiamate
- nessuno

### Export
- sendAppointmentReminderNotification

### Tabelle
- nessuna

## lib/ghostme/agenda/reminderEngine.ts

Righe: 145

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Importato da
- app/api/worker/reminder/route.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

### API chiamate
- nessuno

### Export
- refreshReminderMessage
- refreshActiveReminderUsers

### Tabelle
- calendar_events: select
- ghost_proactive_messages: select, update

## lib/ghostme/auth/clientAuthHeaders.ts

Righe: 12

### Importa
- lib/supabase.ts

### Importato da
- app/chat/page.tsx
- components/ghost/GhostChat.tsx
- components/ghost/GhostDrawers.tsx
- hooks/useGhostBrain.ts

### API chiamate
- nessuno

### Export
- getAuthenticatedJsonHeaders

### Tabelle
- nessuna

## lib/ghostme/auth/serverAuth.ts

Righe: 152

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/actions/update-status/route.ts
- app/api/calendar-events/route.ts
- app/api/chat/route.ts
- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/debug-reasoning/route.ts
- app/api/ghostme/brain/route.ts
- app/api/ghostme/proactive/read/route.ts
- app/api/goals/update-status/route.ts
- app/api/home-assistant/event/route.ts
- app/api/house-suggestion-response/route.ts
- app/api/location/candidate/route.ts
- app/api/location/current-place/route.ts
- app/api/location/current-state/route.ts
- app/api/location/delete-place/route.ts
- app/api/location/places/route.ts
- app/api/location/save-place/route.ts
- app/api/location/update-current/route.ts
- app/api/memory/search/route.ts
- app/api/proactive/messages/route.ts
- app/api/test-ha/route.ts
- app/api/test-home-context/route.ts
- app/api/test-home-reasoning/route.ts
- app/api/worker/proactive/route.ts
- app/api/worker/reminder/route.ts
- lib/ghostme/home/houseWorkerFlow.ts

### API chiamate
- nessuno

### Export
- isDevelopmentEnvironment
- hasValidWorkerOverride
- requireWorkerRequest
- requireDevelopmentOrWorker
- getAuthenticatedUserId

### Tabelle
- nessuna

## lib/ghostme/behavior/behaviorRulesEngine.ts

Righe: 381

### Importa
- lib/supabaseAdmin.ts
- openai

### Importato da
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

### API chiamate
- nessuno

### Export
- isNoAutomaticClosingRule
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
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

### API chiamate
- nessuno

### Export
- generateButlerMessage

### Tabelle
- nessuna

## lib/ghostme/calendar/calendarIntent.ts

Righe: 117

### Importa
- openai

### Importato da
- lib/ghostme/chat/chatCalendarFlow.ts

### API chiamate
- nessuno

### Export
- parseCalendarIntent

### Tabelle
- nessuna

## lib/ghostme/calendar/calendarService.ts

Righe: 370

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Importato da
- app/api/calendar-events/route.ts
- app/api/ghostme/brain/route.ts
- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/chat/chatCalendarFlow.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### API chiamate
- nessuno

### Export
- refreshAgendaMessage
- refreshCalendarMessages
- createCalendarEvent
- updateCalendarEvent
- cancelCalendarEvent
- getUpcomingCalendarEvents
- cleanupExpiredEvents

### Tabelle
- calendar_events: select, insert, update
- ghost_proactive_messages: select, insert, update

## lib/ghostme/chat/chatCalendarFlow.ts

Righe: 105

### Importa
- lib/ghostme/calendar/calendarIntent.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/chat/chatTypes.ts

### Importato da
- lib/ghostme/chat/ghostChatOrchestrator.ts

### API chiamate
- nessuno

### Export
- handleChatCalendarFlow

### Tabelle
- nessuna

## lib/ghostme/chat/chatContextBuilder.ts

Righe: 451

### Importa
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/chat/chatPromptBuilder.ts
- lib/ghostme/chat/chatTypes.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/chat/chatRecallPolicy.ts

### Importato da
- lib/ghostme/chat/ghostChatOrchestrator.ts

### API chiamate
- nessuno

### Export
- createEmptyChatContext
- buildChatContext

### Tabelle
- nessuna

## lib/ghostme/chat/chatExternalServices.ts

Righe: 85

### Importa
- lib/ghostme/services/serviceRouter.ts
- lib/ghostme/services/webSearchService.ts
- lib/ghostme/services/weatherService.ts

### Importato da
- lib/ghostme/chat/ghostChatOrchestrator.ts

### API chiamate
- nessuno

### Export
- resolveChatExternalService

### Tabelle
- nessuna

## lib/ghostme/chat/chatMessageAnalyzer.ts

Righe: 69

### Importa
- lib/ghostme/core/messageClassifier.ts
- lib/ghostme/topicDetector.ts
- lib/ghostme/entityExtractor.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/chat/chatTypes.ts

### Importato da
- lib/ghostme/chat/ghostChatOrchestrator.ts

### API chiamate
- nessuno

### Export
- analyzeChatMessage

### Tabelle
- nessuna

## lib/ghostme/chat/chatPostProcessing.ts

Righe: 531

### Importa
- openai
- lib/supabase.ts
- lib/ghostme/topicDetector.ts
- lib/ghostme/topicLinks.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/mentalState.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/goalsDesires.ts
- lib/ghostme/timeline.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/chat/chatTypes.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- runChatPostProcessing

### Tabelle
- memories_active: select, insert, update
- life_topics: select, insert, update
- episodic_memories: select, insert, update

## lib/ghostme/chat/chatPromptBuilder.ts

Righe: 541

### Importa
- lib/ghostme/chat/chatTypes.ts

### Importato da
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts

### API chiamate
- nessuno

### Export
- trimBlock
- buildSystemPrompt

### Tabelle
- nessuna

## lib/ghostme/chat/chatRecallPolicy.ts

Righe: 58

### Importa
- nessuno

### Importato da
- lib/ghostme/chat/chatContextBuilder.ts

### API chiamate
- nessuno

### Export
- isDeepRecallRequest

### Tabelle
- nessuna

## lib/ghostme/chat/chatResponseSanitizer.ts

Righe: 45

### Importa
- nessuno

### Importato da
- lib/ghostme/chat/ghostChatOrchestrator.ts

### API chiamate
- nessuno

### Export
- createGhostReplySanitizer

### Tabelle
- nessuna

## lib/ghostme/chat/chatTypes.ts

Righe: 98

### Importa
- nessuno

### Importato da
- lib/ghostme/chat/chatCalendarFlow.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/chat/chatPromptBuilder.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts
- lib/ghostme/core/messageClassifier.ts

### API chiamate
- nessuno

### Export
- nessuno

### Tabelle
- nessuna

## lib/ghostme/chat/ghostChatOrchestrator.ts

Righe: 172

### Importa
- openai
- lib/ghostme/memoryDecay.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/chat/chatPromptBuilder.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/chatExternalServices.ts
- lib/ghostme/chat/chatCalendarFlow.ts
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/chatTypes.ts
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/chat/chatResponseSanitizer.ts

### Importato da
- app/api/chat/route.ts

### API chiamate
- nessuno

### Export
- runGhostChatFlow

### Tabelle
- nessuna

## lib/ghostme/context/contextBuilder.ts

Righe: 308

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/context/contextSignals.ts
- lib/ghostme/context/temporalPriority.ts

### Importato da
- lib/ghostme/butler/butlerEngine.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### API chiamate
- nessuno

### Export
- buildCurrentContext

### Tabelle
- ghost_proactive_messages: select

## lib/ghostme/context/contextSignals.ts

Righe: 396

### Importa
- lib/ghostme/situation/situationEngine.ts

### Importato da
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts

### API chiamate
- nessuno

### Export
- buildGhostBrainSimpleSignals
- buildContextSignals

### Tabelle
- nessuna

## lib/ghostme/context/decisionSnapshot.ts

Righe: 701

### Importa
- lib/ghostme/context/reasoningService.ts

### Importato da
- app/api/debug-reasoning/route.ts
- app/api/ghostme/brain/route.ts
- components/ghost/types.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/ghostme/ui/brainUiAdapter.ts

### API chiamate
- nessuno

### Export
- buildDecisionSnapshot

### Tabelle
- nessuna

## lib/ghostme/context/reasoningService.ts

Righe: 975

### Importa
- lib/ghostme/context/contextSignals.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/homeLocationConsistency.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts
- lib/ghostme/context/temporalPriority.ts

### Importato da
- app/api/debug-reasoning/route.ts
- app/api/ghostme/brain/route.ts
- components/ghost/types.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/ghostme/ui/brainUiAdapter.ts

### API chiamate
- nessuno

### Export
- buildReasoningSnapshot
- buildGhostBrainSnapshot

### Tabelle
- nessuna

## lib/ghostme/context/temporalPriority.ts

Righe: 188

### Importa
- nessuno

### Importato da
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/projects/projectMemorySnapshot.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

### API chiamate
- nessuno

### Export
- isLikelyTestData
- temporalMemoryLabel
- annotateHistoricalRows
- prepareChatHistory
- buildRecentPastEvidence
- filterFutureCalendar
- filterOpenActions
- filterActiveGoals

### Tabelle
- nessuna

## lib/ghostme/context/userContextGraph.ts

Righe: 295

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/context/temporalPriority.ts

### Importato da
- lib/ghostme/context/reasoningService.ts

### API chiamate
- nessuno

### Export
- loadUserContextGraph

### Tabelle
- user_profiles: select
- user_location_state: select
- significant_places: select
- calendar_events: select
- goals_desires: select
- action_intents: select
- people_graph: select
- ghost_proactive_messages: select
- house_learned_rules: select
- house_automation_controls: select
- house_patterns: select
- behavior_patterns: select
- life_topics: select
- memories_active: select
- episodic_memories: select
- conversation_summaries: select

## lib/ghostme/contradictions.ts

Righe: 168

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/chat/chatPostProcessing.ts

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
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

### API chiamate
- nessuno

### Export
- generateDailyConversationSummary

### Tabelle
- chat_messages: select
- conversation_summaries: select, insert, update

## lib/ghostme/core/messageClassifier.ts

Righe: 353

### Importa
- lib/ghostme/chat/chatTypes.ts

### Importato da
- lib/ghostme/chat/chatMessageAnalyzer.ts

### API chiamate
- nessuno

### Export
- classifyGhostMessage
- buildBaseCognitiveDecision
- refineCognitiveDecision

### Tabelle
- nessuna

## lib/ghostme/curiosity/curiosityEngine.ts

Righe: 230

### Importa
- openai
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts

### Importato da
- nessuno

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

## lib/ghostme/curiosity/curiositySnapshot.ts

Righe: 775

### Importa
- lib/ghostme/context/contextSignals.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/proactive/curiosityCardWriter.ts

### API chiamate
- nessuno

### Export
- buildCuriositySnapshot
- HIGH_VALUE_CURIOSITY_TYPES

### Tabelle
- nessuna

## lib/ghostme/dynamicSelfProfile.ts

Righe: 142

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/chat/chatPostProcessing.ts

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
- lib/ghostme/chat/chatMessageAnalyzer.ts

### API chiamate
- nessuno

### Export
- extractEntitiesWithAI

### Tabelle
- nessuna

## lib/ghostme/goals/goalsActionsLifecycle.ts

Righe: 298

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/actions/update-status/route.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/chat/chatPostProcessing.ts

### API chiamate
- nessuno

### Export
- findGoalIdForAction
- clearGoalReviewForOpenAction
- linkOpenOrphanActionsToGoal
- completeActionIntentById

### Tabelle
- goals_desires: select, update
- action_intents: select, update

## lib/ghostme/goals/goalsSnapshot.ts

Righe: 107

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/context/temporalPriority.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### API chiamate
- nessuno

### Export
- buildGoalsSnapshot

### Tabelle
- goals_desires: select
- action_intents: select

## lib/ghostme/goalsDesires.ts

Righe: 283

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/chat/chatPostProcessing.ts

### API chiamate
- nessuno

### Export
- getGoalsDesiresContext
- detectAndSaveGoalsDesires

### Tabelle
- goals_desires: select, insert, update

## lib/ghostme/home/homeComfortRiskSnapshot.ts

Righe: 309

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/houseRouteSnapshot.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts

### API chiamate
- nessuno

### Export
- buildHomeComfortRiskSnapshot

### Tabelle
- house_events: select

## lib/ghostme/home/homeLocationConsistency.ts

Righe: 117

### Importa
- lib/ghostme/home/houseStateSnapshot.ts

### Importato da
- lib/ghostme/context/reasoningService.ts

### API chiamate
- nessuno

### Export
- buildHomeLocationConsistency

### Tabelle
- nessuna

## lib/ghostme/home/houseRouteSnapshot.ts

Righe: 275

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/home/houseStateSnapshot.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts

### API chiamate
- nessuno

### Export
- buildHouseRouteSnapshot

### Tabelle
- house_learned_rules: select
- house_events: select

## lib/ghostme/home/houseStateSnapshot.ts

Righe: 448

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/homeLocationConsistency.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

### API chiamate
- nessuno

### Export
- formatHouseStateContext
- buildHouseStateSnapshot

### Tabelle
- house_entities: select
- house_events: select
- user_location_state: select

## lib/ghostme/home/houseSuggestionResponseFlow.ts

Righe: 229

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/house-suggestion-response/route.ts

### API chiamate
- nessuno

### Export
- houseSuggestionResponseFlow

### Tabelle
- ghost_proactive_messages: select, update
- house_automation_controls: select, update
- house_suggestions: select, update
- house_learned_rules: select, insert, update

## lib/ghostme/home/houseWorkerFlow.ts

Righe: 236

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts

### Importato da
- app/api/worker/house/route.ts

### API chiamate
- nessuno

### Export
- houseWorkerFlow

### Tabelle
- house_events: select, update

## lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts

Righe: 180

### Importa
- lib/ghostme/homeAssistant/haClient.ts

### Importato da
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

### API chiamate
- nessuno

### Export
- buildCognitiveHouse

### Tabelle
- nessuna

## lib/ghostme/homeAssistant/haClient.ts

Righe: 38

### Importa
- nessuno

### Importato da
- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/test-ha/route.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/homeContextBuilder.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts
- lib/ghostme/location/haLocationBridgeFlow.ts

### API chiamate
- nessuno

### Export
- getHAStates

### Tabelle
- nessuna

## lib/ghostme/homeAssistant/homeAssistantAccess.ts

Righe: 42

### Importa
- nessuno

### Importato da
- app/api/home-assistant/event/route.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/location/haLocationBridgeFlow.ts

### API chiamate
- nessuno

### Export
- getHomeAssistantUserIds
- canAccessHomeAssistant
- getDefaultHomeAssistantUserId
- getHomeAssistantPersonForUser

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

Righe: 200

### Importa
- nessuno

### Importato da
- app/api/debug-house-logger/route.ts
- app/api/home-assistant/event/route.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

### API chiamate
- nessuno

### Export
- getEntityInfo

### Tabelle
- nessuna

## lib/ghostme/homeAssistant/homeEventLogger.ts

Righe: 473

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/ghostme/homeAssistant/homeEventSignificance.ts

### Importato da
- app/api/home-assistant/event/route.ts

### API chiamate
- nessuno

### Export
- logSignificantHomeEvent
- logHomeAssistantSnapshot

### Tabelle
- house_events: select, insert, update

## lib/ghostme/homeAssistant/homeEventSignificance.ts

Righe: 271

### Importa
- nessuno

### Importato da
- app/api/home-assistant/event/route.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts

### API chiamate
- nessuno

### Export
- classifyHomeEventSignificance
- HOME_EVENT_THRESHOLDS

### Tabelle
- nessuna

## lib/ghostme/homeAssistant/homeReasoningBuilder.ts

Righe: 15

### Importa
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts

### Importato da
- app/api/test-home-reasoning/route.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/reasoningService.ts

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
- nessuno

### API chiamate
- nessuno

### Export
- buildHouseAutomationContext

### Tabelle
- house_events: select

## lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Righe: 329

### Importa
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/home/houseWorkerFlow.ts

### API chiamate
- nessuno

### Export
- planHouseAutomationControls

### Tabelle
- house_automation_controls: select, update, upsert
- house_learned_rules: select
- house_patterns: select
- house_events: select
- house_entities: select

## lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts

Righe: 190

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Importato da
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/proactive/proactiveUserFlow.ts

### API chiamate
- nessuno

### Export
- generateHouseAutomationSuggestions

### Tabelle
- house_suggestions: select, insert
- house_events: select

## lib/ghostme/homeAssistant/houseEntityRegistry.ts

Righe: 69

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts

### Importato da
- lib/ghostme/home/houseWorkerFlow.ts

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
- nessuno

### API chiamate
- nessuno

### Export
- buildHouseLearnedRulesContext

### Tabelle
- house_learned_rules: select

## lib/ghostme/homeAssistant/houseLightLearningFlow.ts

Righe: 150

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

### Importato da
- app/api/home-assistant/event/route.ts

### API chiamate
- nessuno

### Export
- shouldRunHouseLightLearning
- runHouseLightLearning

### Tabelle
- house_events: select, update

## lib/ghostme/homeAssistant/housePatternEngine.ts

Righe: 403

### Importa
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

### API chiamate
- nessuno

### Export
- analyzeHousePatterns

### Tabelle
- house_patterns: select, insert, update
- house_events: select

## lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

Righe: 153

### Importa
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts

### API chiamate
- nessuno

### Export
- learnHouseRoutes

### Tabelle
- house_events: select
- house_learned_rules: select, insert, update

## lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Righe: 194

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Importato da
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/proactive/proactiveUserFlow.ts

### API chiamate
- nessuno

### Export
- generateHouseSuggestions

### Tabelle
- house_suggestions: select, insert

## lib/ghostme/location/haLocationBridgeFlow.ts

Righe: 186

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/observation/observationEngine.ts

### Importato da
- lib/ghostme/home/houseWorkerFlow.ts

### API chiamate
- nessuno

### Export
- bridgeHomeAssistantLocationFlow

### Tabelle
- user_location_state: select, upsert
- significant_places: select, upsert

## lib/ghostme/location/locationCurrentStateFlow.ts

Righe: 13

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/location/locationStateFreshness.ts

### Importato da
- app/api/location/current-state/route.ts

### API chiamate
- nessuno

### Export
- getLocationCurrentStateFlow

### Tabelle
- user_location_state: select

## lib/ghostme/location/locationDeletePlaceFlow.ts

Righe: 10

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/location/delete-place/route.ts

### API chiamate
- nessuno

### Export
- deleteLocationPlaceFlow

### Tabelle
- significant_places: delete

## lib/ghostme/location/locationEngine.ts

Righe: 53

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

## lib/ghostme/location/locationLearningFlow.ts

Righe: 261

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

### Importato da
- app/api/location/candidate/route.ts
- lib/ghostme/location/locationUpdateFlow.ts

### API chiamate
- nessuno

### Export
- isLocationCandidateLogicalKey
- writeLocationCandidateCard
- getLocationCandidateDetails
- completeLocationCandidate
- LOCATION_CARD_PREFIX

### Tabelle
- ghost_proactive_messages: select, update
- behavior_patterns: select, update
- user_location_state: select, update

## lib/ghostme/location/locationSavePlaceFlow.ts

Righe: 45

### Importa
- lib/ghostme/location/placeService.ts

### Importato da
- app/api/location/save-place/route.ts

### API chiamate
- nessuno

### Export
- saveLocationPlaceFlow

### Tabelle
- nessuna

## lib/ghostme/location/locationStateFreshness.ts

Righe: 79

### Importa
- nessuno

### Importato da
- app/api/ghostme/brain/route.ts
- app/api/location/current-state/route.ts
- app/api/location/update-current/route.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationCurrentStateFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/situation/situationEngine.ts

### API chiamate
- nessuno

### Export
- getLocationStateObservedAt
- getLocationFreshnessWindowMs
- toPublicLocationState
- classifyLocationState
- isFreshLocationState
- GPS_LOCATION_FRESHNESS_WINDOW_MS
- HA_HOME_FRESHNESS_WINDOW_MS
- LOCATION_FRESHNESS_WINDOW_MS

### Tabelle
- nessuna

## lib/ghostme/location/locationUpdateFlow.ts

Righe: 212

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/placeService.ts

### Importato da
- app/api/location/update-current/route.ts

### API chiamate
- nessuno

### Export
- updateCurrentLocationFlow

### Tabelle
- user_location_state: select, upsert

## lib/ghostme/location/placeService.ts

Righe: 246

### Importa
- lib/supabaseAdmin.ts

### Importato da
- app/api/location/candidate/route.ts
- app/api/location/current-place/route.ts
- app/api/location/places/route.ts
- app/api/location/update-current/route.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationSavePlaceFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/situation/situationEngine.ts

### API chiamate
- nessuno

### Export
- toPublicSignificantPlace
- distanceMeters
- saveSignificantPlace
- getSignificantPlaces
- markSignificantPlaceSeen
- detectCurrentPlace
- getLastKnownPlace
- getCurrentLocationState
- findSignificantPlaceNear
- updateSignificantPlace

### Tabelle
- significant_places: select, insert, update
- user_location_state: select

## lib/ghostme/maintenance/retentionEngine.ts

Righe: 53

### Importa
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

### API chiamate
- nessuno

### Export
- runRetentionCleanup

### Tabelle
- chat_messages: update, delete
- ghost_proactive_messages: update
- calendar_events: update

## lib/ghostme/memory/memorySearchFlow.ts

Righe: 113

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/context/temporalPriority.ts

### Importato da
- app/api/memory/search/route.ts

### API chiamate
- nessuno

### Export
- memorySearchFlow

### Tabelle
- life_topics: select
- memories_active: select
- autobiographical_timeline: select
- goals_desires: select
- action_intents: select
- topic_links: select
- conversation_summaries: select
- episodic_memories: select

## lib/ghostme/memory/memorySnapshot.ts

Righe: 115

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/context/temporalPriority.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### API chiamate
- nessuno

### Export
- buildMemorySnapshot

### Tabelle
- memories_active: select
- episodic_memories: select
- conversation_summaries: select
- autobiographical_timeline: select
- life_topics: select
- topic_links: select

## lib/ghostme/memoryDecay.ts

Righe: 93

### Importa
- lib/supabase.ts

### Importato da
- lib/ghostme/chat/ghostChatOrchestrator.ts

### API chiamate
- nessuno

### Export
- applyMemoryDecay

### Tabelle
- life_topics: select, update

## lib/ghostme/mentalState.ts

Righe: 330

### Importa
- openai
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/chat/chatPostProcessing.ts

### API chiamate
- nessuno

### Export
- updateMentalState

### Tabelle
- mental_states: select, insert, update

## lib/ghostme/observation/observationEngine.ts

Righe: 712

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/observation/observationPolicy.ts

### Importato da
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts

### API chiamate
- nessuno

### Export
- recordObservation
- analyzeLocationPatterns

### Tabelle
- observation_events: select, insert, update
- significant_places: select
- user_location_state: select
- behavior_patterns: select, insert, update

## lib/ghostme/observation/observationInsightEngine.ts

Righe: 113

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts
- openai

### Importato da
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

### API chiamate
- nessuno

### Export
- generateObservationInsight

### Tabelle
- ghost_proactive_messages: select

## lib/ghostme/observation/observationPolicy.ts

Righe: 110

### Importa
- nessuno

### Importato da
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/situation/situationEngine.ts

### API chiamate
- nessuno

### Export
- observationIdentity
- isUsableObservation
- cleanObservations
- CURRENT_OBSERVATION_WINDOW_MS
- MAX_CURRENT_OBSERVATIONS

### Tabelle
- nessuna

## lib/ghostme/patterns/patternDecay.ts

Righe: 51

### Importa
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

### API chiamate
- nessuno

### Export
- applyPatternDecay

### Tabelle
- behavior_patterns: select, update

## lib/ghostme/patterns/patternInsightEngine.ts

Righe: 78

### Importa
- lib/supabaseAdmin.ts
- openai

### Importato da
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

### API chiamate
- nessuno

### Export
- generatePatternInsight

### Tabelle
- ghost_proactive_messages: select
- behavior_patterns: select

## lib/ghostme/people/peopleGraphLinkService.ts

Righe: 632

### Importa
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

### API chiamate
- nessuno

### Export
- upsertPeopleGraphLink
- getPeopleGraphLinksForPeople
- getPersonGraphNeighborhood
- syncPeopleGraphLinks
- decayPeopleGraphLinks
- PEOPLE_GRAPH_TARGET_TYPES

### Tabelle
- people_graph_links: select, update
- people_graph: select
- calendar_events: select
- episodic_memories: select
- memories_active: select
- action_intents: select
- goals_desires: select

## lib/ghostme/people/peopleGraphService.ts

Righe: 439

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/peopleGraphLinkService.ts

### Importato da
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts
- lib/ghostme/situation/situationEngine.ts

### API chiamate
- nessuno

### Export
- upsertPersonFromTopic
- syncPeopleGraphFromTopics
- getPeopleGraphContext

### Tabelle
- people_graph: select, insert, update
- life_topics: select
- memories_active: select

## lib/ghostme/people/peopleSnapshot.ts

Righe: 474

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/people/peopleGraphLinkService.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### API chiamate
- nessuno

### Export
- normalizePersonName
- isLikelyRealPerson
- isPersonTopic
- isPersonMemory
- extractMemoryPersonNames
- buildPeopleSnapshot

### Tabelle
- people_graph: select
- life_topics: select
- memories_active: select

## lib/ghostme/people/relationshipMemorySnapshot.ts

Righe: 349

### Importa
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleGraphLinkService.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts

### API chiamate
- nessuno

### Export
- buildRelationshipMemorySnapshot

### Tabelle
- nessuna

## lib/ghostme/people/socialSuggestionSnapshot.ts

Righe: 228

### Importa
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts

### API chiamate
- nessuno

### Export
- buildSocialSuggestionSnapshot

### Tabelle
- nessuna

## lib/ghostme/proactive/curiosityCardWriter.ts

Righe: 154

### Importa
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/proactive/proactiveMessageDedupe.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts

### API chiamate
- nessuno

### Export
- buildCuriosityCardLogicalKey
- selectImportantCuriosities
- writeCuriositySnapshotCards

### Tabelle
- ghost_proactive_messages: select

## lib/ghostme/proactive/dailyBriefingBuilder.ts

Righe: 163

### Importa
- openai

### Importato da
- lib/ghostme/proactive/proactiveUserFlow.ts

### API chiamate
- nessuno

### Export
- buildDailyBriefingMessage

### Tabelle
- nessuna

## lib/ghostme/proactive/dailyBriefingRepository.ts

Righe: 181

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/context/temporalPriority.ts

### Importato da
- lib/ghostme/proactive/proactiveUserFlow.ts

### API chiamate
- nessuno

### Export
- loadDailyBriefingContext

### Tabelle
- calendar_events: select
- goals_desires: select
- action_intents: select
- mental_states: select
- autobiographical_timeline: select
- life_topics: select
- episodic_memories: select
- conversation_summaries: select
- significant_places: select
- behavior_patterns: select
- house_events: select
- house_patterns: select
- house_suggestions: select

## lib/ghostme/proactive/proactiveCandidateBuilder.ts

Righe: 558

### Importa
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/butler/butlerEngine.ts
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/proactive/proactiveUserFlow.ts

### API chiamate
- nessuno

### Export
- buildContinuityCandidate
- buildProactiveCandidatesForUser

### Tabelle
- observation_events: select

## lib/ghostme/proactive/proactiveCandidateRanker.ts

Righe: 19

### Importa
- lib/ghostme/proactive/proactiveMessageDedupe.ts

### Importato da
- lib/ghostme/proactive/proactiveUserFlow.ts

### API chiamate
- nessuno

### Export
- pickBestProactiveCandidate
- buildProactiveCandidateLogicalKey

### Tabelle
- nessuna

## lib/ghostme/proactive/proactiveCardLifecycle.ts

Righe: 28

### Importa
- nessuno

### Importato da
- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

### API chiamate
- nessuno

### Export
- VISIBLE_PROACTIVE_STATUSES
- HIDDEN_PROACTIVE_STATUSES
- ALL_PROACTIVE_STATUSES
- USER_PROACTIVE_TRANSITIONS
- VISIBLE_PROACTIVE_CATEGORIES

### Tabelle
- nessuna

## lib/ghostme/proactive/proactiveDecisionEngine.ts

Righe: 152

### Importa
- openai
- lib/ghostme/context/contextBuilder.ts

### Importato da
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### API chiamate
- nessuno

### Export
- decideProactiveMessage

### Tabelle
- nessuna

## lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Righe: 22

### Importa
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleGraphLinkService.ts

### Importato da
- lib/ghostme/proactive/proactiveUserFlow.ts

### API chiamate
- nessuno

### Export
- runProactiveMaintenanceFlow

### Tabelle
- nessuna

## lib/ghostme/proactive/proactiveMessageDedupe.ts

Righe: 45

### Importa
- nessuno

### Importato da
- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/ghostme/proactive/proactiveCandidateRanker.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

### API chiamate
- nessuno

### Export
- normalizeProactiveText
- proactiveMessageIdentity
- dedupeProactiveMessages

### Tabelle
- nessuna

## lib/ghostme/proactive/proactiveMessageService.ts

Righe: 231

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/proactive/proactiveMessageDedupe.ts
- lib/ghostme/proactive/proactiveCardLifecycle.ts

### Importato da
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/ghostme/proactive/proactiveTrigger.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

### API chiamate
- nessuno

### Export
- buildDailyProactiveLogicalKey
- upsertProactiveMessage

### Tabelle
- ghost_proactive_messages: select, insert, update

## lib/ghostme/proactive/proactiveTrigger.ts

Righe: 82

### Importa
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

### Importato da
- lib/ghostme/location/locationUpdateFlow.ts

### API chiamate
- nessuno

### Export
- runProactiveTrigger

### Tabelle
- ghost_proactive_messages: select

## lib/ghostme/proactive/proactiveUserFlow.ts

Righe: 312

### Importa
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts
- lib/ghostme/proactive/proactiveCandidateRanker.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/dailyBriefingBuilder.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts

### Importato da
- app/api/ghostme/brain/route.ts
- app/api/worker/proactive/route.ts

### API chiamate
- nessuno

### Export
- runProactiveFlowForUser
- runAppOpenProactiveLifecycle
- runAppOpenContinuityLifecycle

### Tabelle
- ghost_proactive_messages: select

## lib/ghostme/proactive/trueProactiveCardWriter.ts

Righe: 96

### Importa
- lib/ghostme/proactive/proactiveMessageDedupe.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/supabaseAdmin.ts
- lib/ghostme/proactive/proactiveCardLifecycle.ts

### Importato da
- lib/ghostme/proactive/proactiveUserFlow.ts

### API chiamate
- nessuno

### Export
- buildTrueProactiveLogicalKey
- mapTrueProactiveCategory
- writeTrueProactiveCards

### Tabelle
- ghost_proactive_messages: select

## lib/ghostme/proactive/trueProactiveSnapshot.ts

Righe: 595

### Importa
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/context/reasoningService.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts

### API chiamate
- nessuno

### Export
- buildTrueProactiveSnapshot

### Tabelle
- nessuna

## lib/ghostme/proactive/visibleProactiveMessages.ts

Righe: 174

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/proactive/proactiveMessageDedupe.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/proactiveCardLifecycle.ts

### Importato da
- app/api/ghostme/brain/route.ts
- app/api/proactive/messages/route.ts

### API chiamate
- nessuno

### Export
- loadVisibleProactiveMessages

### Tabelle
- ghost_proactive_messages: select, update
- calendar_events: select

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

## lib/ghostme/projects/goalProjectConsistencySnapshot.ts

Righe: 214

### Importa
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts

### API chiamate
- nessuno

### Export
- buildGoalProjectConsistencySnapshot

### Tabelle
- nessuna

## lib/ghostme/projects/projectAdvisorSnapshot.ts

Righe: 336

### Importa
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts

### API chiamate
- nessuno

### Export
- buildProjectAdvisorSnapshot

### Tabelle
- nessuna

## lib/ghostme/projects/projectMemorySnapshot.ts

Righe: 317

### Importa
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/context/temporalPriority.ts

### Importato da
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts

### API chiamate
- nessuno

### Export
- buildProjectMemorySnapshot

### Tabelle
- nessuna

## lib/ghostme/relationshipResolver.ts

Righe: 208

### Importa
- lib/supabase.ts

### Importato da
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts

### API chiamate
- nessuno

### Export
- removeGenericRelationshipTopics
- resolveNamedRelationship

### Tabelle
- life_topics: select, insert, update, delete
- memories_active: select, insert, update, delete

## lib/ghostme/retrieval.ts

Righe: 415

### Importa
- lib/supabaseAdmin.ts
- lib/supabase.ts
- lib/ghostme/topicLinks.ts
- lib/ghostme/context/temporalPriority.ts

### Importato da
- lib/ghostme/chat/chatContextBuilder.ts

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
- autobiographical_timeline: select

## lib/ghostme/services/serviceRouter.ts

Righe: 80

### Importa
- nessuno

### Importato da
- lib/ghostme/chat/chatExternalServices.ts

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
- lib/ghostme/chat/chatExternalServices.ts

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
- lib/ghostme/chat/chatExternalServices.ts
- lib/ghostme/services/weatherService.ts

### API chiamate
- nessuno

### Export
- runWebSearch

### Tabelle
- nessuna

## lib/ghostme/situation/situationEngine.ts

Righe: 570

### Importa
- lib/supabaseAdmin.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/observation/observationPolicy.ts

### Importato da
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/contextSignals.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts

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
- lib/ghostme/chat/chatPostProcessing.ts

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
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/chatPostProcessing.ts
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

Righe: 291

### Importa
- lib/supabase.ts

### Importato da
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/retrieval.ts

### API chiamate
- nessuno

### Export
- saveTopicLinks
- getRelatedTopicContext

### Tabelle
- topic_links: select, insert, update
- life_topics: select

## lib/ghostme/ui/brainUiAdapter.ts

Righe: 146

### Importa
- components/ghost/types.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/context/decisionSnapshot.ts

### Importato da
- hooks/useGhostBrain.ts

### API chiamate
- nessuno

### Export
- adaptBrainApiResponse

### Tabelle
- nessuna

