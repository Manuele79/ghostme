# DATABASE USAGE MAP

Mappa statica generata dal codice locale.

## Riepilogo

- Tabelle censite: 35
- Tabelle lette: 30
- Tabelle scritte: 30
- Tabelle mai usate: 5

## Tabelle mai usate

- house_paths
- house_rooms
- memories
- questions
- triggers

| Tabella | Stato | Lettori | Scrittori | Update | Delete | Raw |
|---|---:|---:|---:|---:|---:|---:|
| action_intents | alive | 10 | 1 | 3 | 0 | 0 |
| answers | alive | 1 | 1 | 0 | 1 | 0 |
| autobiographical_timeline | alive | 7 | 1 | 0 | 0 | 0 |
| behavior_patterns | alive | 7 | 1 | 3 | 0 | 0 |
| calendar_events | alive | 8 | 1 | 3 | 0 | 0 |
| chat_messages | alive | 2 | 1 | 1 | 1 | 0 |
| contradictions | alive | 3 | 1 | 0 | 0 | 0 |
| conversation_summaries | alive | 8 | 1 | 1 | 0 | 0 |
| dynamic_self_profile | alive | 4 | 2 | 2 | 0 | 0 |
| episodic_memories | alive | 8 | 1 | 0 | 0 | 0 |
| ghost_behavior_rules | alive | 3 | 2 | 1 | 0 | 0 |
| ghost_proactive_messages | alive | 16 | 1 | 8 | 0 | 0 |
| goals_desires | alive | 10 | 1 | 3 | 0 | 0 |
| house_automation_controls | alive | 3 | 1 | 2 | 0 | 0 |
| house_entities | alive | 2 | 2 | 0 | 0 | 0 |
| house_events | alive | 13 | 1 | 3 | 0 | 0 |
| house_learned_rules | alive | 6 | 2 | 2 | 0 | 0 |
| house_paths | unused | 0 | 0 | 0 | 0 | 0 |
| house_patterns | alive | 4 | 1 | 1 | 0 | 0 |
| house_rooms | unused | 0 | 0 | 0 | 0 | 0 |
| house_suggestions | alive | 4 | 2 | 1 | 0 | 0 |
| life_topics | alive | 14 | 2 | 3 | 1 | 0 |
| memories | unused | 0 | 0 | 0 | 0 | 0 |
| memories_active | alive | 12 | 4 | 3 | 2 | 0 |
| mental_states | alive | 3 | 1 | 1 | 0 | 0 |
| observation_events | alive | 3 | 1 | 1 | 0 | 0 |
| people_graph | alive | 4 | 1 | 1 | 0 | 0 |
| people_graph_links | alive | 1 | 0 | 1 | 0 | 0 |
| questions | unused | 0 | 0 | 0 | 0 | 0 |
| significant_places | alive | 5 | 2 | 1 | 1 | 0 |
| topic_links | alive | 5 | 1 | 1 | 0 | 0 |
| traits | alive | 3 | 1 | 0 | 1 | 0 |
| triggers | unused | 0 | 0 | 0 | 0 | 0 |
| user_location_state | alive | 8 | 2 | 1 | 0 | 0 |
| user_profiles | alive | 6 | 1 | 0 | 0 | 0 |

## Dettaglio

### action_intents

Stato: **alive**

Readers: app/api/actions/update-status/route.ts, app/api/goals/update-status/route.ts, lib/ghostme/actionLayer.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/goals/goalsActionsLifecycle.ts, lib/ghostme/goals/goalsSnapshot.ts, lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/actionLayer.ts

Updaters: app/api/actions/update-status/route.ts, lib/ghostme/actionLayer.ts, lib/ghostme/goals/goalsActionsLifecycle.ts

Deleters: -

Raw users: -

### answers

Stato: **alive**

Readers: app/setup/page.tsx

Writers: app/setup/page.tsx

Updaters: -

Deleters: app/setup/page.tsx

Raw users: -

### autobiographical_timeline

Stato: **alive**

Readers: lib/ghostme/curiosity/curiosityEngine.ts, lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/retrieval.ts, lib/ghostme/situation/situationEngine.ts, lib/ghostme/timeline.ts

Writers: lib/ghostme/timeline.ts

Updaters: -

Deleters: -

Raw users: -

### behavior_patterns

Stato: **alive**

Readers: lib/ghostme/context/userContextGraph.ts, lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/observation/observationEngine.ts, lib/ghostme/patterns/patternDecay.ts, lib/ghostme/patterns/patternInsightEngine.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/observation/observationEngine.ts

Updaters: lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/observation/observationEngine.ts, lib/ghostme/patterns/patternDecay.ts

Deleters: -

Raw users: -

### calendar_events

Stato: **alive**

Readers: app/api/ghostme/proactive/read/route.ts, lib/ghostme/agenda/reminderEngine.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/proactive/visibleProactiveMessages.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/calendar/calendarService.ts

Updaters: app/api/ghostme/proactive/read/route.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/maintenance/retentionEngine.ts

Deleters: -

Raw users: -

### chat_messages

Stato: **alive**

Readers: app/chat/page.tsx, lib/ghostme/conversationSummary.ts

Writers: app/chat/page.tsx

Updaters: lib/ghostme/maintenance/retentionEngine.ts

Deleters: lib/ghostme/maintenance/retentionEngine.ts

Raw users: -

### contradictions

Stato: **alive**

Readers: lib/ghostme/contradictions.ts, lib/ghostme/curiosity/curiosityEngine.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/contradictions.ts

Updaters: -

Deleters: -

Raw users: -

### conversation_summaries

Stato: **alive**

Readers: lib/ghostme/context/userContextGraph.ts, lib/ghostme/conversationSummary.ts, lib/ghostme/curiosity/curiosityEngine.ts, lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/retrieval.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/conversationSummary.ts

Updaters: lib/ghostme/conversationSummary.ts

Deleters: -

Raw users: -

### dynamic_self_profile

Stato: **alive**

Readers: lib/ghostme/curiosity/curiosityEngine.ts, lib/ghostme/dynamicSelfProfile.ts, lib/ghostme/profile/profileBehaviorSeed.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/dynamicSelfProfile.ts, lib/ghostme/profile/profileBehaviorSeed.ts

Updaters: lib/ghostme/dynamicSelfProfile.ts, lib/ghostme/profile/profileBehaviorSeed.ts

Deleters: -

Raw users: -

### episodic_memories

Stato: **alive**

Readers: lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/retrieval.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/chat/chatPostProcessing.ts

Updaters: -

Deleters: -

Raw users: -

### ghost_behavior_rules

Stato: **alive**

Readers: lib/ghostme/behavior/behaviorRulesEngine.ts, lib/ghostme/profile/profileBehaviorSeed.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/behavior/behaviorRulesEngine.ts, lib/ghostme/profile/profileBehaviorSeed.ts

Updaters: lib/ghostme/behavior/behaviorRulesEngine.ts

Deleters: -

Raw users: -

### ghost_proactive_messages

Stato: **alive**

Readers: app/api/ghostme/proactive/read/route.ts, lib/ghostme/agenda/reminderEngine.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/context/contextBuilder.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/curiosity/curiosityEngine.ts, lib/ghostme/home/houseSuggestionResponseFlow.ts, lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/observation/observationInsightEngine.ts, lib/ghostme/patterns/patternInsightEngine.ts, lib/ghostme/proactive/curiosityCardWriter.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/ghostme/proactive/proactiveTrigger.ts, lib/ghostme/proactive/proactiveUserFlow.ts, lib/ghostme/proactive/trueProactiveCardWriter.ts, lib/ghostme/proactive/visibleProactiveMessages.ts

Writers: lib/ghostme/proactive/proactiveMessageService.ts

Updaters: app/api/ghostme/proactive/read/route.ts, lib/ghostme/agenda/reminderEngine.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/home/houseSuggestionResponseFlow.ts, lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/maintenance/retentionEngine.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/ghostme/proactive/visibleProactiveMessages.ts

Deleters: -

Raw users: -

### goals_desires

Stato: **alive**

Readers: app/api/goals/update-status/route.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/curiosity/curiosityEngine.ts, lib/ghostme/goals/goalsActionsLifecycle.ts, lib/ghostme/goals/goalsSnapshot.ts, lib/ghostme/goalsDesires.ts, lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/goalsDesires.ts

Updaters: app/api/goals/update-status/route.ts, lib/ghostme/goals/goalsActionsLifecycle.ts, lib/ghostme/goalsDesires.ts

Deleters: -

Raw users: -

### house_automation_controls

Stato: **alive**

Readers: lib/ghostme/context/userContextGraph.ts, lib/ghostme/home/houseSuggestionResponseFlow.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Writers: lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Updaters: lib/ghostme/home/houseSuggestionResponseFlow.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Deleters: -

Raw users: -

### house_entities

Stato: **alive**

Readers: lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Writers: app/api/home-assistant/event/route.ts, lib/ghostme/homeAssistant/houseEntityRegistry.ts

Updaters: -

Deleters: -

Raw users: -

### house_events

Stato: **alive**

Readers: app/api/home-assistant/event/route.ts, lib/ghostme/home/homeComfortRiskSnapshot.ts, lib/ghostme/home/houseRouteSnapshot.ts, lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/homeAssistant/homeEventLogger.ts, lib/ghostme/homeAssistant/houseAutomationContext.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts, lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts, lib/ghostme/homeAssistant/houseLightLearningFlow.ts, lib/ghostme/homeAssistant/housePatternEngine.ts, lib/ghostme/homeAssistant/houseRouteLearningEngine.ts, lib/ghostme/proactive/dailyBriefingRepository.ts

Writers: lib/ghostme/homeAssistant/homeEventLogger.ts

Updaters: lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/homeAssistant/homeEventLogger.ts, lib/ghostme/homeAssistant/houseLightLearningFlow.ts

Deleters: -

Raw users: -

### house_learned_rules

Stato: **alive**

Readers: lib/ghostme/context/userContextGraph.ts, lib/ghostme/home/houseRouteSnapshot.ts, lib/ghostme/home/houseSuggestionResponseFlow.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts, lib/ghostme/homeAssistant/houseLearnedRulesContext.ts, lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

Writers: lib/ghostme/home/houseSuggestionResponseFlow.ts, lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

Updaters: lib/ghostme/home/houseSuggestionResponseFlow.ts, lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

Deleters: -

Raw users: -

### house_paths

Stato: **unused**

Readers: -

Writers: -

Updaters: -

Deleters: -

Raw users: -

### house_patterns

Stato: **alive**

Readers: lib/ghostme/context/userContextGraph.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts, lib/ghostme/homeAssistant/housePatternEngine.ts, lib/ghostme/proactive/dailyBriefingRepository.ts

Writers: lib/ghostme/homeAssistant/housePatternEngine.ts

Updaters: lib/ghostme/homeAssistant/housePatternEngine.ts

Deleters: -

Raw users: -

### house_rooms

Stato: **unused**

Readers: -

Writers: -

Updaters: -

Deleters: -

Raw users: -

### house_suggestions

Stato: **alive**

Readers: lib/ghostme/home/houseSuggestionResponseFlow.ts, lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts, lib/ghostme/homeAssistant/houseSuggestionEngine.ts, lib/ghostme/proactive/dailyBriefingRepository.ts

Writers: lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts, lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Updaters: lib/ghostme/home/houseSuggestionResponseFlow.ts

Deleters: -

Raw users: -

### life_topics

Stato: **alive**

Readers: lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/contradictions.ts, lib/ghostme/curiosity/curiosityEngine.ts, lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/memoryDecay.ts, lib/ghostme/people/peopleGraphService.ts, lib/ghostme/people/peopleSnapshot.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/relationshipResolver.ts, lib/ghostme/retrieval.ts, lib/ghostme/situation/situationEngine.ts, lib/ghostme/topicLinks.ts

Writers: lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/relationshipResolver.ts

Updaters: lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/memoryDecay.ts, lib/ghostme/relationshipResolver.ts

Deleters: lib/ghostme/relationshipResolver.ts

Raw users: -

### memories

Stato: **unused**

Readers: -

Writers: -

Updaters: -

Deleters: -

Raw users: -

### memories_active

Stato: **alive**

Readers: app/api/memory/route.ts, app/memory/page.tsx, lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/contradictions.ts, lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/people/peopleGraphService.ts, lib/ghostme/people/peopleSnapshot.ts, lib/ghostme/relationshipResolver.ts, lib/ghostme/retrieval.ts

Writers: app/api/memory/route.ts, app/memory/page.tsx, lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/relationshipResolver.ts

Updaters: app/memory/page.tsx, lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/relationshipResolver.ts

Deleters: app/memory/page.tsx, lib/ghostme/relationshipResolver.ts

Raw users: -

### mental_states

Stato: **alive**

Readers: lib/ghostme/mentalState.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/mentalState.ts

Updaters: lib/ghostme/mentalState.ts

Deleters: -

Raw users: -

### observation_events

Stato: **alive**

Readers: lib/ghostme/observation/observationEngine.ts, lib/ghostme/proactive/proactiveCandidateBuilder.ts, lib/ghostme/situation/situationEngine.ts

Writers: lib/ghostme/observation/observationEngine.ts

Updaters: lib/ghostme/observation/observationEngine.ts

Deleters: -

Raw users: -

### people_graph

Stato: **alive**

Readers: lib/ghostme/context/userContextGraph.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/people/peopleGraphService.ts, lib/ghostme/people/peopleSnapshot.ts

Writers: lib/ghostme/people/peopleGraphService.ts

Updaters: lib/ghostme/people/peopleGraphService.ts

Deleters: -

Raw users: -

### people_graph_links

Stato: **alive**

Readers: lib/ghostme/people/peopleGraphLinkService.ts

Writers: -

Updaters: lib/ghostme/people/peopleGraphLinkService.ts

Deleters: -

Raw users: -

### questions

Stato: **unused**

Readers: -

Writers: -

Updaters: -

Deleters: -

Raw users: -

### significant_places

Stato: **alive**

Readers: lib/ghostme/context/userContextGraph.ts, lib/ghostme/location/haLocationBridgeFlow.ts, lib/ghostme/location/placeService.ts, lib/ghostme/observation/observationEngine.ts, lib/ghostme/proactive/dailyBriefingRepository.ts

Writers: lib/ghostme/location/haLocationBridgeFlow.ts, lib/ghostme/location/placeService.ts

Updaters: lib/ghostme/location/placeService.ts

Deleters: lib/ghostme/location/locationDeletePlaceFlow.ts

Raw users: -

### topic_links

Stato: **alive**

Readers: lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/retrieval.ts, lib/ghostme/situation/situationEngine.ts, lib/ghostme/topicLinks.ts

Writers: lib/ghostme/topicLinks.ts

Updaters: lib/ghostme/topicLinks.ts

Deleters: -

Raw users: -

### traits

Stato: **alive**

Readers: app/chat/page.tsx, app/login/page.tsx, lib/ghostme/profile/profileBehaviorSeed.ts

Writers: app/setup/page.tsx

Updaters: -

Deleters: app/setup/page.tsx

Raw users: -

### triggers

Stato: **unused**

Readers: -

Writers: -

Updaters: -

Deleters: -

Raw users: -

### user_location_state

Stato: **alive**

Readers: lib/ghostme/context/userContextGraph.ts, lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/location/haLocationBridgeFlow.ts, lib/ghostme/location/locationCurrentStateFlow.ts, lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/location/locationUpdateFlow.ts, lib/ghostme/location/placeService.ts, lib/ghostme/observation/observationEngine.ts

Writers: lib/ghostme/location/haLocationBridgeFlow.ts, lib/ghostme/location/locationUpdateFlow.ts

Updaters: lib/ghostme/location/locationLearningFlow.ts

Deleters: -

Raw users: -

### user_profiles

Stato: **alive**

Readers: app/api/worker/proactive/route.ts, app/chat/page.tsx, app/login/page.tsx, lib/ghostme/context/userContextGraph.ts, lib/ghostme/profile/profileBehaviorSeed.ts, lib/ghostme/situation/situationEngine.ts

Writers: app/setup/profile/page.tsx

Updaters: -

Deleters: -

Raw users: -
