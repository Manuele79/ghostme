# PROJECT AUDIT

Generato automaticamente.

## API routes

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

## Tabelle Supabase usate

### action_intents

**Lettura**
- app/api/ghostme/brain/route.ts
- app/api/memory/search/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/actionLayer.ts

**Update**
- lib/ghostme/actionLayer.ts

**Delete**
- nessuno

### answers

**Lettura**
- app/setup/page.tsx

**Insert**
- app/setup/page.tsx

**Update**
- nessuno

**Delete**
- app/setup/page.tsx

### autobiographical_timeline

**Lettura**
- app/api/ghostme/brain/route.ts
- app/api/memory/search/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/timeline.ts

**Insert**
- lib/ghostme/timeline.ts

**Update**
- nessuno

**Delete**
- nessuno

### behavior_patterns

**Lettura**
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/observation/observationEngine.ts

**Update**
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts

**Delete**
- nessuno

### calendar_events

**Lettura**
- app/api/calendar-events/route.ts
- app/api/chat/route.ts
- app/api/ghostme/brain/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/calendar/calendarService.ts

**Update**
- app/api/calendar-events/route.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/maintenance/retentionEngine.ts

**Delete**
- nessuno

### chat_messages

**Lettura**
- app/chat/page.tsx
- lib/ghostme/conversationSummary.ts
- lib/ghostme/maintenance/retentionEngine.ts

**Insert**
- app/chat/page.tsx

**Update**
- lib/ghostme/maintenance/retentionEngine.ts

**Delete**
- lib/ghostme/maintenance/retentionEngine.ts

### contradictions

**Lettura**
- lib/ghostme/contradictions.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/contradictions.ts

**Update**
- nessuno

**Delete**
- nessuno

### conversation_summaries

**Lettura**
- app/api/memory/search/route.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/conversationSummary.ts

**Update**
- lib/ghostme/conversationSummary.ts

**Delete**
- nessuno

### dynamic_self_profile

**Lettura**
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

**Update**
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

**Delete**
- nessuno

### episodic_memories

**Lettura**
- app/api/chat/route.ts
- app/api/memory/search/route.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- app/api/chat/route.ts

**Update**
- nessuno

**Delete**
- nessuno

### ghost_behavior_rules

**Lettura**
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

**Update**
- lib/ghostme/behavior/behaviorRulesEngine.ts

**Delete**
- nessuno

### ghost_proactive_messages

**Lettura**
- app/api/ghostme/brain/route.ts
- app/api/ghostme/proactive/read/route.ts
- app/api/house-suggestion-response/route.ts
- app/api/proactive/messages/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

**Insert**
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

**Update**
- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

**Delete**
- nessuno

### goals_desires

**Lettura**
- app/api/ghostme/brain/route.ts
- app/api/goals/update-status/route.ts
- app/api/memory/search/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/goalsDesires.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/goalsDesires.ts

**Update**
- app/api/goals/update-status/route.ts
- lib/ghostme/goalsDesires.ts

**Delete**
- nessuno

### house_automation_controls

**Lettura**
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

**Insert**
- nessuno

**Update**
- nessuno

**Delete**
- nessuno

### house_entities

**Lettura**
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

**Insert**
- nessuno

**Update**
- nessuno

**Delete**
- nessuno

### house_events

**Lettura**
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseAutomationContext.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

**Insert**
- lib/ghostme/homeAssistant/homeEventLogger.ts

**Update**
- nessuno

**Delete**
- nessuno

### house_learned_rules

**Lettura**
- app/api/house-suggestion-response/route.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseLearnedRulesContext.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

**Insert**
- app/api/house-suggestion-response/route.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

**Update**
- app/api/house-suggestion-response/route.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

**Delete**
- nessuno

### house_suggestions

**Lettura**
- app/api/house-suggestion-response/route.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

**Insert**
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

**Update**
- app/api/house-suggestion-response/route.ts

**Delete**
- nessuno

### life_topics

**Lettura**
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

**Insert**
- app/api/chat/route.ts
- lib/ghostme/relationshipResolver.ts

**Update**
- app/api/chat/route.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/relationshipResolver.ts

**Delete**
- lib/ghostme/relationshipResolver.ts

### memories_active

**Lettura**
- app/api/chat/route.ts
- app/api/ghostme/brain/route.ts
- app/api/memory/route.ts
- app/api/memory/search/route.ts
- app/memory/page.tsx
- lib/ghostme/contradictions.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/retrieval.ts

**Insert**
- app/api/chat/route.ts
- app/api/memory/route.ts
- app/memory/page.tsx
- lib/ghostme/relationshipResolver.ts

**Update**
- app/api/chat/route.ts
- app/memory/page.tsx
- lib/ghostme/relationshipResolver.ts

**Delete**
- app/memory/page.tsx

### mental_states

**Lettura**
- app/api/chat/route.ts
- app/api/ghostme/brain/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/mentalState.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/mentalState.ts

**Update**
- lib/ghostme/mentalState.ts

**Delete**
- nessuno

### observation_events

**Lettura**
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- lib/ghostme/observation/observationEngine.ts

**Update**
- nessuno

**Delete**
- nessuno

### significant_places

**Lettura**
- app/api/location/delete-place/route.ts
- lib/ghostme/location/placeService.ts

**Insert**
- lib/ghostme/location/placeService.ts

**Update**
- nessuno

**Delete**
- app/api/location/delete-place/route.ts

### topic_links

**Lettura**
- app/api/memory/search/route.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/topicLinks.ts

**Insert**
- lib/ghostme/topicLinks.ts

**Update**
- lib/ghostme/topicLinks.ts

**Delete**
- nessuno

### traits

**Lettura**
- app/api/ghostme/brain/route.ts
- app/chat/page.tsx
- app/login/page.tsx
- app/setup/page.tsx
- lib/ghostme/profile/profileBehaviorSeed.ts

**Insert**
- nessuno

**Update**
- nessuno

**Delete**
- nessuno

### user_location_state

**Lettura**
- app/api/chat/route.ts
- app/api/location/current-state/route.ts
- app/api/location/update-current/route.ts
- lib/ghostme/location/placeService.ts

**Insert**
- nessuno

**Update**
- nessuno

**Delete**
- nessuno

### user_profiles

**Lettura**
- app/api/chat/route.ts
- app/api/ghostme/brain/route.ts
- app/api/worker/proactive/route.ts
- app/chat/page.tsx
- app/login/page.tsx
- app/setup/profile/page.tsx
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

**Insert**
- app/setup/profile/page.tsx

**Update**
- nessuno

**Delete**
- nessuno

### users

**Lettura**
- app/setup/page.tsx

**Insert**
- nessuno

**Update**
- nessuno

**Delete**
- nessuno

## File potenzialmente scollegati

- lib/ghostme/location/locationEngine.ts
- lib/ghostme/services/timeService.ts
- next-env.d.ts
- next.config.ts

## Mappa import principali

### app/api/calendar-events/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/calendar/calendarService.ts

Importato da:
- nessuno

### app/api/chat/route.ts

Importa:
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

Importato da:
- nessuno

### app/api/conversation-summary/route.ts

Importa:
- next/server
- lib/ghostme/conversationSummary.ts

Importato da:
- nessuno

### app/api/debug-ha-entities/route.ts

Importa:
- next/server
- lib/ghostme/homeAssistant/haClient.ts

Importato da:
- nessuno

### app/api/debug-house-logger/route.ts

Importa:
- next/server
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts

Importato da:
- nessuno

### app/api/ghostme/brain/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts

Importato da:
- nessuno

### app/api/ghostme/proactive/read/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts

Importato da:
- nessuno

### app/api/goals/update-status/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts

Importato da:
- nessuno

### app/api/house-suggestion-response/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts

Importato da:
- nessuno

### app/api/location/current-place/route.ts

Importa:
- next/server
- lib/ghostme/location/placeService.ts

Importato da:
- nessuno

### app/api/location/current-state/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts

Importato da:
- nessuno

### app/api/location/delete-place/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts

Importato da:
- nessuno

### app/api/location/places/route.ts

Importa:
- next/server
- lib/ghostme/location/placeService.ts

Importato da:
- nessuno

### app/api/location/save-place/route.ts

Importa:
- next/server
- lib/ghostme/location/placeService.ts

Importato da:
- nessuno

### app/api/location/update-current/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

Importato da:
- nessuno

### app/api/memory/route.ts

Importa:
- next/server
- lib/supabase.ts

Importato da:
- nessuno

### app/api/memory/search/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts

Importato da:
- nessuno

### app/api/proactive/messages/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts

Importato da:
- nessuno

### app/api/test-ha/route.ts

Importa:
- next/server
- lib/ghostme/homeAssistant/haClient.ts

Importato da:
- nessuno

### app/api/test-home-context/route.ts

Importa:
- next/server
- lib/ghostme/homeAssistant/homeContextBuilder.ts

Importato da:
- nessuno

### app/api/test-home-reasoning/route.ts

Importa:
- next/server
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts

Importato da:
- nessuno

### app/api/worker/house/route.ts

Importa:
- next/server
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

Importato da:
- nessuno

### app/api/worker/proactive/route.ts

Importa:
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

Importato da:
- nessuno

### lib/ghostme/actionLayer.ts

Importa:
- openai
- lib/supabaseAdmin.ts

Importato da:
- app/api/chat/route.ts
- app/api/worker/proactive/route.ts

### lib/ghostme/agenda/agendaEngine.ts

Importa:
- lib/ghostme/situation/situationEngine.ts

Importato da:
- app/api/worker/proactive/route.ts
- lib/ghostme/calendar/calendarService.ts

### lib/ghostme/agenda/reminderEngine.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/worker/proactive/route.ts
- lib/ghostme/calendar/calendarService.ts

### lib/ghostme/behavior/behaviorRulesEngine.ts

Importa:
- lib/supabaseAdmin.ts
- openai

Importato da:
- app/api/chat/route.ts
- lib/ghostme/context/contextBuilder.ts

### lib/ghostme/butler/butlerEngine.ts

Importa:
- openai
- lib/ghostme/context/contextBuilder.ts

Importato da:
- app/api/worker/proactive/route.ts

### lib/ghostme/calendar/calendarIntent.ts

Importa:
- openai

Importato da:
- app/api/chat/route.ts

### lib/ghostme/calendar/calendarService.ts

Importa:
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

Importato da:
- app/api/calendar-events/route.ts
- app/api/chat/route.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### lib/ghostme/context/contextBuilder.ts

Importa:
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts

Importato da:
- app/api/worker/proactive/route.ts
- lib/ghostme/butler/butlerEngine.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### lib/ghostme/contradictions.ts

Importa:
- openai
- lib/supabaseAdmin.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/conversationSummary.ts

Importa:
- openai
- lib/supabaseAdmin.ts

Importato da:
- app/api/conversation-summary/route.ts
- app/api/worker/proactive/route.ts

### lib/ghostme/core/messageClassifier.ts

Importa:
- nessuno

Importato da:
- app/api/chat/route.ts

### lib/ghostme/curiosity/curiosityEngine.ts

Importa:
- openai
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts

Importato da:
- app/api/worker/proactive/route.ts

### lib/ghostme/dynamicSelfProfile.ts

Importa:
- openai
- lib/supabaseAdmin.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/entityExtractor.ts

Importa:
- openai
- lib/ghostme/topicDetector.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/goalsDesires.ts

Importa:
- openai
- lib/supabaseAdmin.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts

Importa:
- lib/ghostme/homeAssistant/haClient.ts

Importato da:
- app/api/chat/route.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

### lib/ghostme/homeAssistant/haClient.ts

Importa:
- nessuno

Importato da:
- app/api/debug-ha-entities/route.ts
- app/api/debug-house-logger/route.ts
- app/api/test-ha/route.ts
- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/homeContextBuilder.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

### lib/ghostme/homeAssistant/homeContextBuilder.ts

Importa:
- lib/ghostme/homeAssistant/haClient.ts

Importato da:
- app/api/test-home-context/route.ts

### lib/ghostme/homeAssistant/homeEntityMapper.ts

Importa:
- nessuno

Importato da:
- app/api/debug-house-logger/route.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

### lib/ghostme/homeAssistant/homeEventLogger.ts

Importa:
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts

Importato da:
- app/api/worker/house/route.ts

### lib/ghostme/homeAssistant/homeReasoningBuilder.ts

Importa:
- lib/ghostme/homeAssistant/haClient.ts

Importato da:
- app/api/test-home-reasoning/route.ts
- lib/ghostme/context/contextBuilder.ts

### lib/ghostme/homeAssistant/houseAutomationContext.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/worker/house/route.ts

### lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/worker/house/route.ts

### lib/ghostme/homeAssistant/houseEntityRegistry.ts

Importa:
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts

Importato da:
- app/api/worker/house/route.ts

### lib/ghostme/homeAssistant/houseLearnedRulesContext.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/homeAssistant/housePatternEngine.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/worker/house/route.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

### lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/worker/house/route.ts

### lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Importa:
- lib/supabaseAdmin.ts
- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts

Importato da:
- app/api/worker/house/route.ts

### lib/ghostme/location/locationEngine.ts

Importa:
- nessuno

Importato da:
- nessuno

### lib/ghostme/location/placeService.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/location/current-place/route.ts
- app/api/location/places/route.ts
- app/api/location/save-place/route.ts
- lib/ghostme/situation/situationEngine.ts

### lib/ghostme/maintenance/retentionEngine.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/worker/proactive/route.ts

### lib/ghostme/memoryDecay.ts

Importa:
- lib/supabase.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/mentalState.ts

Importa:
- openai
- lib/supabaseAdmin.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/observation/observationEngine.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/location/update-current/route.ts

### lib/ghostme/observation/observationInsightEngine.ts

Importa:
- lib/supabaseAdmin.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- openai

Importato da:
- app/api/worker/proactive/route.ts

### lib/ghostme/patterns/patternDecay.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/worker/proactive/route.ts

### lib/ghostme/patterns/patternInsightEngine.ts

Importa:
- lib/supabaseAdmin.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- openai

Importato da:
- app/api/worker/proactive/route.ts

### lib/ghostme/proactive/proactiveDecisionEngine.ts

Importa:
- openai
- lib/ghostme/context/contextBuilder.ts

Importato da:
- app/api/worker/proactive/route.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### lib/ghostme/proactive/proactiveMessageService.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/api/worker/proactive/route.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### lib/ghostme/proactive/proactiveTrigger.ts

Importa:
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts

Importato da:
- app/api/location/update-current/route.ts
- lib/ghostme/calendar/calendarService.ts

### lib/ghostme/profile/profileBehaviorSeed.ts

Importa:
- lib/supabaseAdmin.ts

Importato da:
- app/setup/page.tsx

### lib/ghostme/relationshipResolver.ts

Importa:
- lib/supabase.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/retrieval.ts

Importa:
- lib/supabase.ts
- lib/ghostme/topicLinks.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/services/serviceRouter.ts

Importa:
- nessuno

Importato da:
- app/api/chat/route.ts

### lib/ghostme/services/timeService.ts

Importa:
- nessuno

Importato da:
- nessuno

### lib/ghostme/services/weatherService.ts

Importa:
- lib/ghostme/services/webSearchService.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/services/webSearchService.ts

Importa:
- openai

Importato da:
- app/api/chat/route.ts
- lib/ghostme/services/weatherService.ts

### lib/ghostme/situation/situationEngine.ts

Importa:
- lib/supabaseAdmin.ts
- lib/ghostme/location/placeService.ts

Importato da:
- app/api/worker/proactive/route.ts
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

### lib/ghostme/timeline.ts

Importa:
- openai
- lib/supabaseAdmin.ts

Importato da:
- app/api/chat/route.ts

### lib/ghostme/topicDetector.ts

Importa:
- nessuno

Importato da:
- app/api/chat/route.ts
- lib/ghostme/entityExtractor.ts

### lib/ghostme/topicLinks.ts

Importa:
- lib/supabase.ts

Importato da:
- app/api/chat/route.ts
- lib/ghostme/retrieval.ts

