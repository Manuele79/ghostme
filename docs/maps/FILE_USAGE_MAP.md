# FILE USAGE MAP

Mappa statica generata dal codice locale.

| File | Stato | Chiamanti | Dipendenze | Export | DB read | DB write/update/delete | Righe |
|---|---:|---:|---:|---:|---:|---:|---:|
| app/api/actions/update-status/route.ts | entrypoint | 0 | 3 | 1 | 1 | 1 | 129 |
| app/api/calendar-events/route.ts | entrypoint | 0 | 2 | 3 | 0 | 0 | 104 |
| app/api/chat/route.ts | entrypoint | 0 | 3 | 2 | 0 | 0 | 73 |
| app/api/conversation-summary/route.ts | entrypoint | 0 | 1 | 1 | 0 | 0 | 29 |
| app/api/debug-ha-entities/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 49 |
| app/api/debug-house-logger/route.ts | entrypoint | 0 | 3 | 1 | 0 | 0 | 56 |
| app/api/debug-reasoning/route.ts | entrypoint | 0 | 3 | 1 | 0 | 0 | 36 |
| app/api/ghostme/brain/route.ts | entrypoint | 0 | 7 | 1 | 0 | 0 | 67 |
| app/api/ghostme/proactive/read/route.ts | entrypoint | 0 | 4 | 1 | 2 | 2 | 185 |
| app/api/goals/update-status/route.ts | entrypoint | 0 | 2 | 1 | 2 | 1 | 144 |
| app/api/home-assistant/event/route.ts | entrypoint | 0 | 7 | 1 | 1 | 1 | 464 |
| app/api/house-suggestion-response/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 27 |
| app/api/location/candidate/route.ts | entrypoint | 0 | 3 | 2 | 0 | 0 | 53 |
| app/api/location/current-place/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 36 |
| app/api/location/current-state/route.ts | entrypoint | 0 | 3 | 1 | 0 | 0 | 32 |
| app/api/location/delete-place/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 26 |
| app/api/location/places/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 22 |
| app/api/location/save-place/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 26 |
| app/api/location/update-current/route.ts | entrypoint | 0 | 4 | 1 | 0 | 0 | 32 |
| app/api/memory/route.ts | entrypoint | 0 | 1 | 1 | 1 | 1 | 51 |
| app/api/memory/search/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 30 |
| app/api/proactive/messages/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 29 |
| app/api/test-ha/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 32 |
| app/api/test-home-context/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 16 |
| app/api/test-home-reasoning/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 16 |
| app/api/worker/house/route.ts | entrypoint | 0 | 1 | 1 | 0 | 0 | 14 |
| app/api/worker/proactive/route.ts | entrypoint | 0 | 3 | 1 | 1 | 0 | 49 |
| app/api/worker/reminder/route.ts | entrypoint | 0 | 2 | 1 | 0 | 0 | 33 |
| app/chat/page.tsx | entrypoint | 0 | 13 | 0 | 3 | 1 | 811 |
| app/layout.tsx | entrypoint | 0 | 0 | 2 | 0 | 0 | 44 |
| app/login/page.tsx | entrypoint | 0 | 1 | 0 | 2 | 0 | 127 |
| app/memory/page.tsx | entrypoint | 0 | 1 | 0 | 1 | 3 | 374 |
| app/page.tsx | entrypoint | 0 | 0 | 0 | 0 | 0 | 5 |
| app/setup/page.tsx | entrypoint | 0 | 3 | 0 | 1 | 4 | 628 |
| app/setup/profile/page.tsx | entrypoint | 0 | 1 | 0 | 0 | 1 | 213 |
| components/ghost/GhostBackground.tsx | entrypoint | 1 | 1 | 0 | 0 | 0 | 121 |
| components/ghost/GhostCanvasCore.tsx | entrypoint | 1 | 1 | 0 | 0 | 0 | 320 |
| components/ghost/GhostChat.tsx | entrypoint | 1 | 2 | 0 | 0 | 0 | 338 |
| components/ghost/GhostCore.tsx | entrypoint | 1 | 1 | 0 | 0 | 0 | 172 |
| components/ghost/GhostDrawers.tsx | entrypoint | 1 | 2 | 3 | 0 | 0 | 2214 |
| components/ghost/GhostGlobalStyles.tsx | entrypoint | 1 | 0 | 0 | 0 | 0 | 65 |
| components/ghost/GhostHeader.tsx | entrypoint | 1 | 1 | 0 | 0 | 0 | 69 |
| components/ghost/GhostLayout.tsx | entrypoint | 1 | 1 | 0 | 0 | 0 | 37 |
| components/ghost/GhostVoiceMode.tsx | entrypoint | 1 | 3 | 0 | 0 | 0 | 153 |
| components/ghost/types.ts | entrypoint | 12 | 2 | 8 | 0 | 0 | 81 |
| hooks/useGhostBrain.ts | entrypoint | 1 | 4 | 1 | 0 | 0 | 87 |
| hooks/useGhostChat.ts | entrypoint | 1 | 1 | 1 | 0 | 0 | 19 |
| hooks/useGhostVoice.ts | entrypoint | 1 | 1 | 1 | 0 | 0 | 158 |
| lib/ghostme/actionLayer.ts | active | 2 | 2 | 4 | 1 | 2 | 305 |
| lib/ghostme/agenda/agendaEngine.ts | active | 2 | 1 | 1 | 0 | 0 | 41 |
| lib/ghostme/agenda/appointmentReminderNotification.ts | orphan_candidate | 0 | 0 | 1 | 0 | 0 | 50 |
| lib/ghostme/agenda/reminderEngine.ts | active | 3 | 2 | 2 | 2 | 1 | 145 |
| lib/ghostme/auth/clientAuthHeaders.ts | active | 4 | 1 | 1 | 0 | 0 | 12 |
| lib/ghostme/auth/serverAuth.ts | active | 26 | 1 | 6 | 0 | 0 | 152 |
| lib/ghostme/behavior/behaviorRulesEngine.ts | active | 4 | 1 | 4 | 1 | 2 | 225 |
| lib/ghostme/butler/butlerEngine.ts | active | 1 | 1 | 1 | 0 | 0 | 67 |
| lib/ghostme/calendar/calendarIntent.ts | active | 1 | 0 | 2 | 0 | 0 | 117 |
| lib/ghostme/calendar/calendarService.ts | active | 6 | 4 | 9 | 2 | 3 | 370 |
| lib/ghostme/chat/chatCalendarFlow.ts | active | 1 | 2 | 1 | 0 | 0 | 101 |
| lib/ghostme/chat/chatContextBuilder.ts | active | 1 | 8 | 3 | 0 | 0 | 424 |
| lib/ghostme/chat/chatExternalServices.ts | active | 1 | 3 | 1 | 0 | 0 | 85 |
| lib/ghostme/chat/chatMessageAnalyzer.ts | active | 1 | 5 | 1 | 0 | 0 | 58 |
| lib/ghostme/chat/chatPostProcessing.ts | god_file_candidate | 1 | 14 | 1 | 3 | 5 | 517 |
| lib/ghostme/chat/chatPromptBuilder.ts | active | 2 | 0 | 2 | 0 | 0 | 257 |
| lib/ghostme/chat/chatRecallPolicy.ts | active | 1 | 0 | 2 | 0 | 0 | 58 |
| lib/ghostme/chat/chatResponseSanitizer.ts | active | 1 | 0 | 1 | 0 | 0 | 45 |
| lib/ghostme/chat/chatTypes.ts | active | 4 | 0 | 6 | 0 | 0 | 41 |
| lib/ghostme/chat/ghostChatOrchestrator.ts | active | 1 | 10 | 1 | 0 | 0 | 162 |
| lib/ghostme/context/contextBuilder.ts | active | 4 | 6 | 2 | 1 | 0 | 296 |
| lib/ghostme/context/contextSignals.ts | active | 3 | 1 | 4 | 0 | 0 | 396 |
| lib/ghostme/context/decisionSnapshot.ts | god_file_candidate | 6 | 1 | 2 | 0 | 0 | 701 |
| lib/ghostme/context/reasoningService.ts | god_file_candidate | 9 | 21 | 4 | 0 | 0 | 879 |
| lib/ghostme/context/temporalPriority.ts | active | 12 | 0 | 8 | 0 | 0 | 188 |
| lib/ghostme/context/userContextGraph.ts | active | 1 | 3 | 1 | 16 | 0 | 295 |
| lib/ghostme/contradictions.ts | active | 1 | 1 | 1 | 3 | 1 | 168 |
| lib/ghostme/conversationSummary.ts | active | 2 | 1 | 1 | 2 | 2 | 174 |
| lib/ghostme/core/messageClassifier.ts | active | 1 | 0 | 2 | 0 | 0 | 61 |
| lib/ghostme/curiosity/curiosityEngine.ts | orphan_db_user | 0 | 2 | 1 | 7 | 0 | 230 |
| lib/ghostme/curiosity/curiositySnapshot.ts | god_file_candidate | 2 | 11 | 5 | 0 | 0 | 775 |
| lib/ghostme/dynamicSelfProfile.ts | active | 1 | 1 | 2 | 1 | 2 | 142 |
| lib/ghostme/entityExtractor.ts | active | 1 | 1 | 2 | 0 | 0 | 243 |
| lib/ghostme/goals/goalsActionsLifecycle.ts | active | 3 | 1 | 4 | 2 | 2 | 298 |
| lib/ghostme/goals/goalsSnapshot.ts | active | 5 | 2 | 2 | 2 | 0 | 107 |
| lib/ghostme/goalsDesires.ts | active | 1 | 1 | 2 | 1 | 2 | 283 |
| lib/ghostme/home/homeComfortRiskSnapshot.ts | active | 2 | 3 | 2 | 1 | 0 | 309 |
| lib/ghostme/home/homeLocationConsistency.ts | active | 1 | 1 | 2 | 0 | 0 | 117 |
| lib/ghostme/home/houseRouteSnapshot.ts | active | 3 | 2 | 2 | 2 | 0 | 275 |
| lib/ghostme/home/houseStateSnapshot.ts | active | 6 | 4 | 3 | 3 | 0 | 448 |
| lib/ghostme/home/houseSuggestionResponseFlow.ts | active | 1 | 1 | 1 | 4 | 5 | 229 |
| lib/ghostme/home/houseWorkerFlow.ts | active | 1 | 12 | 1 | 1 | 1 | 236 |
| lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts | active | 1 | 1 | 1 | 0 | 0 | 180 |
| lib/ghostme/homeAssistant/haClient.ts | active | 10 | 0 | 1 | 0 | 0 | 38 |
| lib/ghostme/homeAssistant/homeAssistantAccess.ts | active | 6 | 0 | 4 | 0 | 0 | 42 |
| lib/ghostme/homeAssistant/homeContextBuilder.ts | active | 1 | 1 | 1 | 0 | 0 | 171 |
| lib/ghostme/homeAssistant/homeEntityMapper.ts | active | 6 | 0 | 3 | 0 | 0 | 200 |
| lib/ghostme/homeAssistant/homeEventLogger.ts | active | 1 | 4 | 3 | 1 | 2 | 473 |
| lib/ghostme/homeAssistant/homeEventSignificance.ts | active | 2 | 0 | 4 | 0 | 0 | 271 |
| lib/ghostme/homeAssistant/homeReasoningBuilder.ts | active | 3 | 2 | 1 | 0 | 0 | 15 |
| lib/ghostme/homeAssistant/houseAutomationContext.ts | orphan_db_user | 0 | 1 | 1 | 1 | 0 | 45 |
| lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts | active | 1 | 3 | 1 | 5 | 2 | 329 |
| lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts | active | 2 | 2 | 1 | 2 | 1 | 190 |
| lib/ghostme/homeAssistant/houseEntityRegistry.ts | active | 1 | 3 | 1 | 0 | 1 | 69 |
| lib/ghostme/homeAssistant/houseLearnedRulesContext.ts | orphan_db_user | 0 | 1 | 1 | 1 | 0 | 39 |
| lib/ghostme/homeAssistant/houseLightLearningFlow.ts | active | 1 | 3 | 2 | 1 | 1 | 150 |
| lib/ghostme/homeAssistant/housePatternEngine.ts | active | 3 | 1 | 1 | 2 | 2 | 403 |
| lib/ghostme/homeAssistant/houseRouteLearningEngine.ts | active | 2 | 1 | 1 | 2 | 2 | 153 |
| lib/ghostme/homeAssistant/houseSuggestionEngine.ts | active | 2 | 4 | 1 | 1 | 1 | 194 |
| lib/ghostme/location/haLocationBridgeFlow.ts | active | 1 | 4 | 2 | 1 | 1 | 143 |
| lib/ghostme/location/locationCurrentStateFlow.ts | active | 1 | 2 | 1 | 1 | 0 | 13 |
| lib/ghostme/location/locationDeletePlaceFlow.ts | active | 1 | 1 | 1 | 0 | 1 | 10 |
| lib/ghostme/location/locationEngine.ts | orphan_candidate | 0 | 0 | 3 | 0 | 0 | 53 |
| lib/ghostme/location/locationLearningFlow.ts | active | 2 | 5 | 5 | 3 | 3 | 261 |
| lib/ghostme/location/locationSavePlaceFlow.ts | active | 1 | 1 | 1 | 0 | 0 | 45 |
| lib/ghostme/location/locationStateFreshness.ts | active | 9 | 0 | 9 | 0 | 0 | 79 |
| lib/ghostme/location/locationUpdateFlow.ts | active | 1 | 5 | 1 | 1 | 1 | 212 |
| lib/ghostme/location/placeService.ts | active | 8 | 1 | 11 | 2 | 2 | 246 |
| lib/ghostme/maintenance/retentionEngine.ts | active | 1 | 1 | 1 | 0 | 4 | 53 |
| lib/ghostme/memory/memorySearchFlow.ts | active | 1 | 2 | 1 | 8 | 0 | 113 |
| lib/ghostme/memory/memorySnapshot.ts | active | 4 | 2 | 2 | 6 | 0 | 115 |
| lib/ghostme/memoryDecay.ts | active | 1 | 1 | 1 | 1 | 1 | 93 |
| lib/ghostme/mentalState.ts | active | 1 | 1 | 1 | 1 | 2 | 212 |
| lib/ghostme/observation/observationEngine.ts | god_file_candidate | 2 | 2 | 4 | 4 | 4 | 712 |
| lib/ghostme/observation/observationInsightEngine.ts | active | 1 | 2 | 1 | 1 | 0 | 113 |
| lib/ghostme/observation/observationPolicy.ts | active | 2 | 0 | 5 | 0 | 0 | 110 |
| lib/ghostme/patterns/patternDecay.ts | active | 1 | 1 | 1 | 1 | 1 | 51 |
| lib/ghostme/patterns/patternInsightEngine.ts | active | 1 | 1 | 1 | 2 | 0 | 78 |
| lib/ghostme/people/peopleGraphLinkService.ts | active | 5 | 1 | 10 | 7 | 1 | 487 |
| lib/ghostme/people/peopleGraphService.ts | active | 3 | 3 | 3 | 3 | 2 | 439 |
| lib/ghostme/people/peopleSnapshot.ts | active | 6 | 2 | 7 | 3 | 0 | 474 |
| lib/ghostme/people/relationshipMemorySnapshot.ts | active | 4 | 3 | 2 | 0 | 0 | 349 |
| lib/ghostme/people/socialSuggestionSnapshot.ts | active | 2 | 2 | 4 | 0 | 0 | 228 |
| lib/ghostme/proactive/curiosityCardWriter.ts | active | 2 | 4 | 3 | 1 | 0 | 154 |
| lib/ghostme/proactive/dailyBriefingBuilder.ts | active | 1 | 0 | 1 | 0 | 0 | 130 |
| lib/ghostme/proactive/dailyBriefingRepository.ts | active | 1 | 2 | 1 | 13 | 0 | 173 |
| lib/ghostme/proactive/proactiveCandidateBuilder.ts | active | 1 | 9 | 1 | 0 | 0 | 283 |
| lib/ghostme/proactive/proactiveCandidateRanker.ts | active | 1 | 1 | 2 | 0 | 0 | 17 |
| lib/ghostme/proactive/proactiveCardLifecycle.ts | active | 4 | 0 | 5 | 0 | 0 | 28 |
| lib/ghostme/proactive/proactiveDecisionEngine.ts | active | 2 | 1 | 2 | 0 | 0 | 152 |
| lib/ghostme/proactive/proactiveMaintenanceFlow.ts | active | 1 | 7 | 1 | 0 | 0 | 22 |
| lib/ghostme/proactive/proactiveMessageDedupe.ts | active | 5 | 0 | 4 | 0 | 0 | 45 |
| lib/ghostme/proactive/proactiveMessageService.ts | active | 11 | 3 | 2 | 1 | 2 | 201 |
| lib/ghostme/proactive/proactiveTrigger.ts | active | 1 | 5 | 1 | 1 | 0 | 82 |
| lib/ghostme/proactive/proactiveUserFlow.ts | active | 2 | 12 | 2 | 1 | 0 | 229 |
| lib/ghostme/proactive/trueProactiveCardWriter.ts | active | 1 | 6 | 4 | 1 | 0 | 96 |
| lib/ghostme/proactive/trueProactiveSnapshot.ts | god_file_candidate | 2 | 2 | 4 | 0 | 0 | 595 |
| lib/ghostme/proactive/visibleProactiveMessages.ts | active | 2 | 4 | 1 | 2 | 1 | 174 |
| lib/ghostme/profile/profileBehaviorSeed.ts | active | 1 | 1 | 1 | 4 | 3 | 224 |
| lib/ghostme/projects/goalProjectConsistencySnapshot.ts | active | 3 | 2 | 3 | 0 | 0 | 214 |
| lib/ghostme/projects/projectAdvisorSnapshot.ts | active | 2 | 4 | 4 | 0 | 0 | 336 |
| lib/ghostme/projects/projectMemorySnapshot.ts | active | 4 | 4 | 3 | 0 | 0 | 317 |
| lib/ghostme/relationshipResolver.ts | active | 2 | 1 | 2 | 2 | 6 | 208 |
| lib/ghostme/retrieval.ts | active | 1 | 4 | 1 | 6 | 0 | 415 |
| lib/ghostme/services/serviceRouter.ts | active | 1 | 0 | 3 | 0 | 0 | 80 |
| lib/ghostme/services/timeService.ts | orphan_candidate | 0 | 0 | 1 | 0 | 0 | 13 |
| lib/ghostme/services/weatherService.ts | active | 1 | 1 | 1 | 0 | 0 | 26 |
| lib/ghostme/services/webSearchService.ts | active | 2 | 0 | 2 | 0 | 0 | 33 |
| lib/ghostme/situation/situationEngine.ts | god_file_candidate | 6 | 6 | 2 | 15 | 0 | 570 |
| lib/ghostme/timeline.ts | active | 1 | 1 | 2 | 1 | 1 | 124 |
| lib/ghostme/topicDetector.ts | active | 3 | 0 | 7 | 0 | 0 | 453 |
| lib/ghostme/topicLinks.ts | active | 2 | 1 | 2 | 2 | 2 | 291 |
| lib/ghostme/ui/brainUiAdapter.ts | active | 1 | 3 | 1 | 0 | 0 | 146 |
| lib/personality.ts | active | 3 | 0 | 2 | 0 | 0 | 184 |
| lib/supabase.ts | active | 12 | 0 | 1 | 0 | 0 | 6 |
| lib/supabaseAdmin.ts | active | 62 | 0 | 1 | 0 | 0 | 6 |

## Riepilogo

- File: 164
- File orfani: 6
- God file candidati: 7

## Orfani candidati

- **lib/ghostme/agenda/appointmentReminderNotification.ts** — orphan_candidate; DB read: -; DB write/update/delete: -
- **lib/ghostme/curiosity/curiosityEngine.ts** — orphan_db_user; DB read: autobiographical_timeline, contradictions, conversation_summaries, dynamic_self_profile, ghost_proactive_messages, goals_desires, life_topics; DB write/update/delete: -
- **lib/ghostme/homeAssistant/houseAutomationContext.ts** — orphan_db_user; DB read: house_events; DB write/update/delete: -
- **lib/ghostme/homeAssistant/houseLearnedRulesContext.ts** — orphan_db_user; DB read: house_learned_rules; DB write/update/delete: -
- **lib/ghostme/location/locationEngine.ts** — orphan_candidate; DB read: -; DB write/update/delete: -
- **lib/ghostme/services/timeService.ts** — orphan_candidate; DB read: -; DB write/update/delete: -

## God file candidati

- **lib/ghostme/chat/chatPostProcessing.ts** — 517 righe
- **lib/ghostme/context/decisionSnapshot.ts** — 701 righe
- **lib/ghostme/context/reasoningService.ts** — 879 righe
- **lib/ghostme/curiosity/curiositySnapshot.ts** — 775 righe
- **lib/ghostme/observation/observationEngine.ts** — 712 righe
- **lib/ghostme/proactive/trueProactiveSnapshot.ts** — 595 righe
- **lib/ghostme/situation/situationEngine.ts** — 570 righe

## Dettaglio

### app/api/actions/update-status/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/goals/goalsActionsLifecycle.ts, lib/supabaseAdmin.ts

Export: PATCH

Numero chiamanti: 0

Numero dipendenze: 3

DB read: action_intents

DB write: -

DB update: action_intents

DB delete: -

### app/api/calendar-events/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/calendar/calendarService.ts

Export: DELETE, PATCH, POST

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/chat/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/chat/ghostChatOrchestrator.ts

Export: POST, runtime

Numero chiamanti: 0

Numero dipendenze: 3

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/conversation-summary/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/conversationSummary.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/debug-ha-entities/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/homeAssistant/haClient.ts

Export: GET

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/debug-house-logger/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/homeAssistant/haClient.ts, lib/ghostme/homeAssistant/homeEntityMapper.ts

Export: GET

Numero chiamanti: 0

Numero dipendenze: 3

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/debug-reasoning/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/context/decisionSnapshot.ts, lib/ghostme/context/reasoningService.ts

Export: GET

Numero chiamanti: 0

Numero dipendenze: 3

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/ghostme/brain/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/context/decisionSnapshot.ts, lib/ghostme/context/reasoningService.ts, lib/ghostme/location/locationStateFreshness.ts, lib/ghostme/proactive/proactiveUserFlow.ts, lib/ghostme/proactive/visibleProactiveMessages.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 7

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/ghostme/proactive/read/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/proactive/proactiveCardLifecycle.ts, lib/supabaseAdmin.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 4

DB read: calendar_events, ghost_proactive_messages

DB write: -

DB update: calendar_events, ghost_proactive_messages

DB delete: -

### app/api/goals/update-status/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/supabaseAdmin.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 2

DB read: action_intents, goals_desires

DB write: -

DB update: goals_desires

DB delete: -

### app/api/home-assistant/event/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/homeAssistant/homeAssistantAccess.ts, lib/ghostme/homeAssistant/homeEntityMapper.ts, lib/ghostme/homeAssistant/homeEventLogger.ts, lib/ghostme/homeAssistant/homeEventSignificance.ts, lib/ghostme/homeAssistant/houseLightLearningFlow.ts, lib/supabaseAdmin.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 7

DB read: house_events

DB write: house_entities

DB update: -

DB delete: -

### app/api/house-suggestion-response/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/home/houseSuggestionResponseFlow.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/location/candidate/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/location/placeService.ts

Export: PATCH, POST

Numero chiamanti: 0

Numero dipendenze: 3

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/location/current-place/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/location/placeService.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/location/current-state/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/location/locationCurrentStateFlow.ts, lib/ghostme/location/locationStateFreshness.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 3

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/location/delete-place/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/location/locationDeletePlaceFlow.ts

Export: DELETE

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/location/places/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/location/placeService.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/location/save-place/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/location/locationSavePlaceFlow.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/location/update-current/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/location/locationStateFreshness.ts, lib/ghostme/location/locationUpdateFlow.ts, lib/ghostme/location/placeService.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 4

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/memory/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/supabase.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 1

DB read: memories_active

DB write: memories_active

DB update: -

DB delete: -

### app/api/memory/search/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/memory/memorySearchFlow.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/proactive/messages/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/proactive/visibleProactiveMessages.ts

Export: POST

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/test-ha/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/homeAssistant/haClient.ts

Export: GET

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/test-home-context/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/homeAssistant/homeContextBuilder.ts

Export: GET

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/test-home-reasoning/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/homeAssistant/homeReasoningBuilder.ts

Export: GET

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/worker/house/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/home/houseWorkerFlow.ts

Export: GET

Numero chiamanti: 0

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### app/api/worker/proactive/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/proactive/proactiveUserFlow.ts, lib/supabaseAdmin.ts

Export: GET

Numero chiamanti: 0

Numero dipendenze: 3

DB read: user_profiles

DB write: -

DB update: -

DB delete: -

### app/api/worker/reminder/route.ts

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/agenda/reminderEngine.ts, lib/ghostme/auth/serverAuth.ts

Export: GET

Numero chiamanti: 0

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### app/chat/page.tsx

Stato: **entrypoint**

Chiamato da: -

Importa: components/ghost/GhostBackground.tsx, components/ghost/GhostChat.tsx, components/ghost/GhostDrawers.tsx, components/ghost/GhostHeader.tsx, components/ghost/GhostLayout.tsx, components/ghost/GhostVoiceMode.tsx, components/ghost/types.ts, hooks/useGhostBrain.ts, hooks/useGhostChat.ts, hooks/useGhostVoice.ts, lib/ghostme/auth/clientAuthHeaders.ts, lib/personality.ts, lib/supabase.ts

Export: -

Numero chiamanti: 0

Numero dipendenze: 13

DB read: chat_messages, traits, user_profiles

DB write: chat_messages

DB update: -

DB delete: -

### app/layout.tsx

Stato: **entrypoint**

Chiamato da: -

Importa: -

Export: metadata, viewport

Numero chiamanti: 0

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### app/login/page.tsx

Stato: **entrypoint**

Chiamato da: -

Importa: lib/supabase.ts

Export: -

Numero chiamanti: 0

Numero dipendenze: 1

DB read: traits, user_profiles

DB write: -

DB update: -

DB delete: -

### app/memory/page.tsx

Stato: **entrypoint**

Chiamato da: -

Importa: lib/supabase.ts

Export: -

Numero chiamanti: 0

Numero dipendenze: 1

DB read: memories_active

DB write: memories_active

DB update: memories_active

DB delete: memories_active

### app/page.tsx

Stato: **entrypoint**

Chiamato da: -

Importa: -

Export: -

Numero chiamanti: 0

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### app/setup/page.tsx

Stato: **entrypoint**

Chiamato da: -

Importa: lib/ghostme/profile/profileBehaviorSeed.ts, lib/personality.ts, lib/supabase.ts

Export: -

Numero chiamanti: 0

Numero dipendenze: 3

DB read: answers

DB write: answers, traits

DB update: -

DB delete: answers, traits

### app/setup/profile/page.tsx

Stato: **entrypoint**

Chiamato da: -

Importa: lib/supabase.ts

Export: -

Numero chiamanti: 0

Numero dipendenze: 1

DB read: -

DB write: user_profiles

DB update: -

DB delete: -

### components/ghost/GhostBackground.tsx

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx

Importa: components/ghost/types.ts

Export: -

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### components/ghost/GhostCanvasCore.tsx

Stato: **entrypoint**

Chiamato da: components/ghost/GhostVoiceMode.tsx

Importa: components/ghost/types.ts

Export: -

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### components/ghost/GhostChat.tsx

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx

Importa: components/ghost/types.ts, lib/ghostme/auth/clientAuthHeaders.ts

Export: -

Numero chiamanti: 1

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### components/ghost/GhostCore.tsx

Stato: **entrypoint**

Chiamato da: components/ghost/GhostVoiceMode.tsx

Importa: components/ghost/types.ts

Export: -

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### components/ghost/GhostDrawers.tsx

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx

Importa: components/ghost/types.ts, lib/ghostme/auth/clientAuthHeaders.ts

Export: HistoryDrawer, MemoryDrawer, ServicesDrawer

Numero chiamanti: 1

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### components/ghost/GhostGlobalStyles.tsx

Stato: **entrypoint**

Chiamato da: components/ghost/GhostLayout.tsx

Importa: -

Export: -

Numero chiamanti: 1

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### components/ghost/GhostHeader.tsx

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx

Importa: components/ghost/types.ts

Export: -

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### components/ghost/GhostLayout.tsx

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx

Importa: components/ghost/GhostGlobalStyles.tsx

Export: -

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### components/ghost/GhostVoiceMode.tsx

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx

Importa: components/ghost/GhostCanvasCore.tsx, components/ghost/GhostCore.tsx, components/ghost/types.ts

Export: -

Numero chiamanti: 1

Numero dipendenze: 3

DB read: -

DB write: -

DB update: -

DB delete: -

### components/ghost/types.ts

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx, components/ghost/GhostBackground.tsx, components/ghost/GhostCanvasCore.tsx, components/ghost/GhostChat.tsx, components/ghost/GhostCore.tsx, components/ghost/GhostDrawers.tsx, components/ghost/GhostHeader.tsx, components/ghost/GhostVoiceMode.tsx, hooks/useGhostBrain.ts, hooks/useGhostChat.ts, hooks/useGhostVoice.ts, lib/ghostme/ui/brainUiAdapter.ts

Importa: lib/ghostme/context/decisionSnapshot.ts, lib/ghostme/context/reasoningService.ts

Export: BrainData, CalendarEvent, ChatMessage, GhostMode, HomeUiModel, ProactiveMessage, VoiceState, modeLabels

Numero chiamanti: 12

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### hooks/useGhostBrain.ts

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx

Importa: components/ghost/types.ts, lib/ghostme/auth/clientAuthHeaders.ts, lib/ghostme/ui/brainUiAdapter.ts, lib/personality.ts

Export: useGhostBrain

Numero chiamanti: 1

Numero dipendenze: 4

DB read: -

DB write: -

DB update: -

DB delete: -

### hooks/useGhostChat.ts

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx

Importa: components/ghost/types.ts

Export: useGhostChat

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### hooks/useGhostVoice.ts

Stato: **entrypoint**

Chiamato da: app/chat/page.tsx

Importa: components/ghost/types.ts

Export: useGhostVoice

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/actionLayer.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Importa: lib/ghostme/goals/goalsActionsLifecycle.ts, lib/supabaseAdmin.ts

Export: cleanupOldActionIntents, detectAndCompleteActionIntent, detectAndSaveActionIntent, getActionIntentContext

Numero chiamanti: 2

Numero dipendenze: 2

DB read: action_intents

DB write: action_intents

DB update: action_intents

DB delete: -

### lib/ghostme/agenda/agendaEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/calendar/calendarService.ts, lib/ghostme/proactive/proactiveCandidateBuilder.ts

Importa: lib/ghostme/situation/situationEngine.ts

Export: buildAgendaMessage

Numero chiamanti: 2

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/agenda/appointmentReminderNotification.ts

Stato: **orphan_candidate**

Chiamato da: -

Importa: -

Export: sendAppointmentReminderNotification

Numero chiamanti: 0

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/agenda/reminderEngine.ts

Stato: **active**

Chiamato da: app/api/worker/reminder/route.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Importa: lib/ghostme/proactive/proactiveMessageService.ts, lib/supabaseAdmin.ts

Export: refreshActiveReminderUsers, refreshReminderMessage

Numero chiamanti: 3

Numero dipendenze: 2

DB read: calendar_events, ghost_proactive_messages

DB write: -

DB update: ghost_proactive_messages

DB delete: -

### lib/ghostme/auth/clientAuthHeaders.ts

Stato: **active**

Chiamato da: app/chat/page.tsx, components/ghost/GhostChat.tsx, components/ghost/GhostDrawers.tsx, hooks/useGhostBrain.ts

Importa: lib/supabase.ts

Export: getAuthenticatedJsonHeaders

Numero chiamanti: 4

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/auth/serverAuth.ts

Stato: **active**

Chiamato da: app/api/actions/update-status/route.ts, app/api/calendar-events/route.ts, app/api/chat/route.ts, app/api/debug-ha-entities/route.ts, app/api/debug-house-logger/route.ts, app/api/debug-reasoning/route.ts, app/api/ghostme/brain/route.ts, app/api/ghostme/proactive/read/route.ts, app/api/goals/update-status/route.ts, app/api/home-assistant/event/route.ts, app/api/house-suggestion-response/route.ts, app/api/location/candidate/route.ts, app/api/location/current-place/route.ts, app/api/location/current-state/route.ts, app/api/location/delete-place/route.ts, app/api/location/places/route.ts, app/api/location/save-place/route.ts, app/api/location/update-current/route.ts, app/api/memory/search/route.ts, app/api/proactive/messages/route.ts, app/api/test-ha/route.ts, app/api/test-home-context/route.ts, app/api/test-home-reasoning/route.ts, app/api/worker/proactive/route.ts, app/api/worker/reminder/route.ts, lib/ghostme/home/houseWorkerFlow.ts

Importa: lib/supabaseAdmin.ts

Export: UserContextAuthError, getAuthenticatedUserId, hasValidWorkerOverride, isDevelopmentEnvironment, requireDevelopmentOrWorker, requireWorkerRequest

Numero chiamanti: 26

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/behavior/behaviorRulesEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatContextBuilder.ts, lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/context/contextBuilder.ts, lib/ghostme/proactive/proactiveCandidateBuilder.ts

Importa: lib/supabaseAdmin.ts

Export: buildBehaviorPrompt, detectAndSaveBehaviorRule, getActiveBehaviorRules, saveBehaviorRule

Numero chiamanti: 4

Numero dipendenze: 1

DB read: ghost_behavior_rules

DB write: ghost_behavior_rules

DB update: ghost_behavior_rules

DB delete: -

### lib/ghostme/butler/butlerEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveCandidateBuilder.ts

Importa: lib/ghostme/context/contextBuilder.ts

Export: generateButlerMessage

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/calendar/calendarIntent.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatCalendarFlow.ts

Importa: -

Export: ParsedCalendarIntent, parseCalendarIntent

Numero chiamanti: 1

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/calendar/calendarService.ts

Stato: **active**

Chiamato da: app/api/calendar-events/route.ts, app/api/ghostme/brain/route.ts, app/api/ghostme/proactive/read/route.ts, lib/ghostme/chat/chatCalendarFlow.ts, lib/ghostme/proactive/proactiveMaintenanceFlow.ts, lib/ghostme/proactive/proactiveTrigger.ts

Importa: lib/ghostme/agenda/agendaEngine.ts, lib/ghostme/agenda/reminderEngine.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/supabaseAdmin.ts

Export: CalendarContractError, GhostCalendarEventType, cancelCalendarEvent, cleanupExpiredEvents, createCalendarEvent, getUpcomingCalendarEvents, refreshAgendaMessage, refreshCalendarMessages, updateCalendarEvent

Numero chiamanti: 6

Numero dipendenze: 4

DB read: calendar_events, ghost_proactive_messages

DB write: calendar_events

DB update: calendar_events, ghost_proactive_messages

DB delete: -

### lib/ghostme/chat/chatCalendarFlow.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/ghostChatOrchestrator.ts

Importa: lib/ghostme/calendar/calendarIntent.ts, lib/ghostme/calendar/calendarService.ts

Export: handleChatCalendarFlow

Numero chiamanti: 1

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/chat/chatContextBuilder.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/ghostChatOrchestrator.ts

Importa: lib/ghostme/behavior/behaviorRulesEngine.ts, lib/ghostme/chat/chatPromptBuilder.ts, lib/ghostme/chat/chatRecallPolicy.ts, lib/ghostme/chat/chatTypes.ts, lib/ghostme/context/reasoningService.ts, lib/ghostme/context/temporalPriority.ts, lib/ghostme/location/locationStateFreshness.ts, lib/ghostme/retrieval.ts

Export: ChatContext, buildChatContext, createEmptyChatContext

Numero chiamanti: 1

Numero dipendenze: 8

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/chat/chatExternalServices.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/ghostChatOrchestrator.ts

Importa: lib/ghostme/services/serviceRouter.ts, lib/ghostme/services/weatherService.ts, lib/ghostme/services/webSearchService.ts

Export: resolveChatExternalService

Numero chiamanti: 1

Numero dipendenze: 3

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/chat/chatMessageAnalyzer.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/ghostChatOrchestrator.ts

Importa: lib/ghostme/chat/chatTypes.ts, lib/ghostme/core/messageClassifier.ts, lib/ghostme/entityExtractor.ts, lib/ghostme/relationshipResolver.ts, lib/ghostme/topicDetector.ts

Export: analyzeChatMessage

Numero chiamanti: 1

Numero dipendenze: 5

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/chat/chatPostProcessing.ts

Stato: **god_file_candidate**

Chiamato da: app/api/chat/route.ts

Importa: lib/ghostme/actionLayer.ts, lib/ghostme/behavior/behaviorRulesEngine.ts, lib/ghostme/chat/chatTypes.ts, lib/ghostme/contradictions.ts, lib/ghostme/dynamicSelfProfile.ts, lib/ghostme/goals/goalsActionsLifecycle.ts, lib/ghostme/goalsDesires.ts, lib/ghostme/mentalState.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/people/peopleGraphService.ts, lib/ghostme/timeline.ts, lib/ghostme/topicDetector.ts, lib/ghostme/topicLinks.ts, lib/supabase.ts

Export: runChatPostProcessing

Numero chiamanti: 1

Numero dipendenze: 14

DB read: episodic_memories, life_topics, memories_active

DB write: episodic_memories, life_topics, memories_active

DB update: life_topics, memories_active

DB delete: -

### lib/ghostme/chat/chatPromptBuilder.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatContextBuilder.ts, lib/ghostme/chat/ghostChatOrchestrator.ts

Importa: -

Export: buildSystemPrompt, trimBlock

Numero chiamanti: 2

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/chat/chatRecallPolicy.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatContextBuilder.ts

Importa: -

Export: RecallTopic, isDeepRecallRequest

Numero chiamanti: 1

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/chat/chatResponseSanitizer.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/ghostChatOrchestrator.ts

Importa: -

Export: createGhostReplySanitizer

Numero chiamanti: 1

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/chat/chatTypes.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatContextBuilder.ts, lib/ghostme/chat/chatMessageAnalyzer.ts, lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/chat/ghostChatOrchestrator.ts

Importa: -

Export: AnalyzeChatMessageResult, ChatPostProcessingPayload, DetectedTopicLike, GhostChatFlowResult, ImmediateTextResult, StreamResult

Numero chiamanti: 4

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/chat/ghostChatOrchestrator.ts

Stato: **active**

Chiamato da: app/api/chat/route.ts

Importa: lib/ghostme/chat/chatCalendarFlow.ts, lib/ghostme/chat/chatContextBuilder.ts, lib/ghostme/chat/chatExternalServices.ts, lib/ghostme/chat/chatMessageAnalyzer.ts, lib/ghostme/chat/chatPromptBuilder.ts, lib/ghostme/chat/chatResponseSanitizer.ts, lib/ghostme/chat/chatTypes.ts, lib/ghostme/context/temporalPriority.ts, lib/ghostme/memoryDecay.ts, lib/ghostme/relationshipResolver.ts

Export: runGhostChatFlow

Numero chiamanti: 1

Numero dipendenze: 10

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/context/contextBuilder.ts

Stato: **active**

Chiamato da: lib/ghostme/butler/butlerEngine.ts, lib/ghostme/proactive/proactiveCandidateBuilder.ts, lib/ghostme/proactive/proactiveDecisionEngine.ts, lib/ghostme/proactive/proactiveTrigger.ts

Importa: lib/ghostme/behavior/behaviorRulesEngine.ts, lib/ghostme/context/contextSignals.ts, lib/ghostme/context/temporalPriority.ts, lib/ghostme/homeAssistant/homeReasoningBuilder.ts, lib/ghostme/situation/situationEngine.ts, lib/supabaseAdmin.ts

Export: GhostCurrentContext, buildCurrentContext

Numero chiamanti: 4

Numero dipendenze: 6

DB read: ghost_proactive_messages

DB write: -

DB update: -

DB delete: -

### lib/ghostme/context/contextSignals.ts

Stato: **active**

Chiamato da: lib/ghostme/context/contextBuilder.ts, lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts

Importa: lib/ghostme/situation/situationEngine.ts

Export: ContextSignal, GhostBrainSimpleSignals, buildContextSignals, buildGhostBrainSimpleSignals

Numero chiamanti: 3

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/context/decisionSnapshot.ts

Stato: **god_file_candidate**

Chiamato da: app/api/debug-reasoning/route.ts, app/api/ghostme/brain/route.ts, components/ghost/types.ts, lib/ghostme/context/reasoningService.ts, lib/ghostme/proactive/trueProactiveSnapshot.ts, lib/ghostme/ui/brainUiAdapter.ts

Importa: lib/ghostme/context/reasoningService.ts

Export: DecisionSnapshot, buildDecisionSnapshot

Numero chiamanti: 6

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/context/reasoningService.ts

Stato: **god_file_candidate**

Chiamato da: app/api/debug-reasoning/route.ts, app/api/ghostme/brain/route.ts, components/ghost/types.ts, lib/ghostme/chat/chatContextBuilder.ts, lib/ghostme/context/decisionSnapshot.ts, lib/ghostme/proactive/proactiveCandidateBuilder.ts, lib/ghostme/proactive/proactiveUserFlow.ts, lib/ghostme/proactive/trueProactiveSnapshot.ts, lib/ghostme/ui/brainUiAdapter.ts

Importa: lib/ghostme/context/contextSignals.ts, lib/ghostme/context/decisionSnapshot.ts, lib/ghostme/context/temporalPriority.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/curiosity/curiositySnapshot.ts, lib/ghostme/goals/goalsSnapshot.ts, lib/ghostme/home/homeComfortRiskSnapshot.ts, lib/ghostme/home/homeLocationConsistency.ts, lib/ghostme/home/houseRouteSnapshot.ts, lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/homeAssistant/homeAssistantAccess.ts, lib/ghostme/homeAssistant/homeReasoningBuilder.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/people/peopleSnapshot.ts, lib/ghostme/people/relationshipMemorySnapshot.ts, lib/ghostme/people/socialSuggestionSnapshot.ts, lib/ghostme/proactive/trueProactiveSnapshot.ts, lib/ghostme/projects/goalProjectConsistencySnapshot.ts, lib/ghostme/projects/projectAdvisorSnapshot.ts, lib/ghostme/projects/projectMemorySnapshot.ts, lib/ghostme/situation/situationEngine.ts

Export: GhostBrainSnapshot, GhostBrainSnapshotCore, buildGhostBrainSnapshot, buildReasoningSnapshot

Numero chiamanti: 9

Numero dipendenze: 21

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/context/temporalPriority.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatContextBuilder.ts, lib/ghostme/chat/ghostChatOrchestrator.ts, lib/ghostme/context/contextBuilder.ts, lib/ghostme/context/reasoningService.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/goals/goalsSnapshot.ts, lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/projects/projectMemorySnapshot.ts, lib/ghostme/retrieval.ts, lib/ghostme/situation/situationEngine.ts

Importa: -

Export: annotateHistoricalRows, buildRecentPastEvidence, filterActiveGoals, filterFutureCalendar, filterOpenActions, isLikelyTestData, prepareChatHistory, temporalMemoryLabel

Numero chiamanti: 12

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/context/userContextGraph.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts

Importa: lib/ghostme/context/temporalPriority.ts, lib/ghostme/location/locationStateFreshness.ts, lib/supabaseAdmin.ts

Export: loadUserContextGraph

Numero chiamanti: 1

Numero dipendenze: 3

DB read: action_intents, behavior_patterns, calendar_events, conversation_summaries, episodic_memories, ghost_proactive_messages, goals_desires, house_automation_controls, house_learned_rules, house_patterns, life_topics, memories_active, people_graph, significant_places, user_location_state, user_profiles

DB write: -

DB update: -

DB delete: -

### lib/ghostme/contradictions.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatPostProcessing.ts

Importa: lib/supabaseAdmin.ts

Export: detectAndSaveContradictions

Numero chiamanti: 1

Numero dipendenze: 1

DB read: contradictions, life_topics, memories_active

DB write: contradictions

DB update: -

DB delete: -

### lib/ghostme/conversationSummary.ts

Stato: **active**

Chiamato da: app/api/conversation-summary/route.ts, lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Importa: lib/supabaseAdmin.ts

Export: generateDailyConversationSummary

Numero chiamanti: 2

Numero dipendenze: 1

DB read: chat_messages, conversation_summaries

DB write: conversation_summaries

DB update: conversation_summaries

DB delete: -

### lib/ghostme/core/messageClassifier.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatMessageAnalyzer.ts

Importa: -

Export: GhostMessageClass, classifyGhostMessage

Numero chiamanti: 1

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/curiosity/curiosityEngine.ts

Stato: **orphan_db_user**

Chiamato da: -

Importa: lib/ghostme/situation/situationEngine.ts, lib/supabaseAdmin.ts

Export: generateCuriosityMessage

Numero chiamanti: 0

Numero dipendenze: 2

DB read: autobiographical_timeline, contradictions, conversation_summaries, dynamic_self_profile, ghost_proactive_messages, goals_desires, life_topics

DB write: -

DB update: -

DB delete: -

### lib/ghostme/curiosity/curiositySnapshot.ts

Stato: **god_file_candidate**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/proactive/curiosityCardWriter.ts

Importa: lib/ghostme/context/contextSignals.ts, lib/ghostme/goals/goalsSnapshot.ts, lib/ghostme/home/homeComfortRiskSnapshot.ts, lib/ghostme/home/houseRouteSnapshot.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/people/peopleSnapshot.ts, lib/ghostme/people/relationshipMemorySnapshot.ts, lib/ghostme/people/socialSuggestionSnapshot.ts, lib/ghostme/projects/goalProjectConsistencySnapshot.ts, lib/ghostme/projects/projectAdvisorSnapshot.ts, lib/ghostme/projects/projectMemorySnapshot.ts

Export: CuriosityItem, CuriositySnapshot, CuriosityType, HIGH_VALUE_CURIOSITY_TYPES, buildCuriositySnapshot

Numero chiamanti: 2

Numero dipendenze: 11

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/dynamicSelfProfile.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatPostProcessing.ts

Importa: lib/supabaseAdmin.ts

Export: getDynamicSelfProfileContext, updateDynamicSelfProfile

Numero chiamanti: 1

Numero dipendenze: 1

DB read: dynamic_self_profile

DB write: dynamic_self_profile

DB update: dynamic_self_profile

DB delete: -

### lib/ghostme/entityExtractor.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatMessageAnalyzer.ts

Importa: lib/ghostme/topicDetector.ts

Export: ExtractedEntity, extractEntitiesWithAI

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/goals/goalsActionsLifecycle.ts

Stato: **active**

Chiamato da: app/api/actions/update-status/route.ts, lib/ghostme/actionLayer.ts, lib/ghostme/chat/chatPostProcessing.ts

Importa: lib/supabaseAdmin.ts

Export: clearGoalReviewForOpenAction, completeActionIntentById, findGoalIdForAction, linkOpenOrphanActionsToGoal

Numero chiamanti: 3

Numero dipendenze: 1

DB read: action_intents, goals_desires

DB write: -

DB update: action_intents, goals_desires

DB delete: -

### lib/ghostme/goals/goalsSnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts, lib/ghostme/projects/goalProjectConsistencySnapshot.ts, lib/ghostme/projects/projectAdvisorSnapshot.ts, lib/ghostme/projects/projectMemorySnapshot.ts

Importa: lib/ghostme/context/temporalPriority.ts, lib/supabaseAdmin.ts

Export: GoalsSnapshot, buildGoalsSnapshot

Numero chiamanti: 5

Numero dipendenze: 2

DB read: action_intents, goals_desires

DB write: -

DB update: -

DB delete: -

### lib/ghostme/goalsDesires.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatPostProcessing.ts

Importa: lib/supabaseAdmin.ts

Export: detectAndSaveGoalsDesires, getGoalsDesiresContext

Numero chiamanti: 1

Numero dipendenze: 1

DB read: goals_desires

DB write: goals_desires

DB update: goals_desires

DB delete: -

### lib/ghostme/home/homeComfortRiskSnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts

Importa: lib/ghostme/home/houseRouteSnapshot.ts, lib/ghostme/home/houseStateSnapshot.ts, lib/supabaseAdmin.ts

Export: HomeComfortRiskSnapshot, buildHomeComfortRiskSnapshot

Numero chiamanti: 2

Numero dipendenze: 3

DB read: house_events

DB write: -

DB update: -

DB delete: -

### lib/ghostme/home/homeLocationConsistency.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts

Importa: lib/ghostme/home/houseStateSnapshot.ts

Export: HomeLocationConsistency, buildHomeLocationConsistency

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/home/houseRouteSnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts, lib/ghostme/home/homeComfortRiskSnapshot.ts

Importa: lib/ghostme/home/houseStateSnapshot.ts, lib/supabaseAdmin.ts

Export: HouseRouteSnapshot, buildHouseRouteSnapshot

Numero chiamanti: 3

Numero dipendenze: 2

DB read: house_events, house_learned_rules

DB write: -

DB update: -

DB delete: -

### lib/ghostme/home/houseStateSnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/home/homeComfortRiskSnapshot.ts, lib/ghostme/home/homeLocationConsistency.ts, lib/ghostme/home/houseRouteSnapshot.ts, lib/ghostme/homeAssistant/homeReasoningBuilder.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Importa: lib/ghostme/homeAssistant/haClient.ts, lib/ghostme/homeAssistant/homeAssistantAccess.ts, lib/ghostme/homeAssistant/homeEntityMapper.ts, lib/supabaseAdmin.ts

Export: HouseStateSnapshot, buildHouseStateSnapshot, formatHouseStateContext

Numero chiamanti: 6

Numero dipendenze: 4

DB read: house_entities, house_events, user_location_state

DB write: -

DB update: -

DB delete: -

### lib/ghostme/home/houseSuggestionResponseFlow.ts

Stato: **active**

Chiamato da: app/api/house-suggestion-response/route.ts

Importa: lib/supabaseAdmin.ts

Export: houseSuggestionResponseFlow

Numero chiamanti: 1

Numero dipendenze: 1

DB read: ghost_proactive_messages, house_automation_controls, house_learned_rules, house_suggestions

DB write: house_learned_rules

DB update: ghost_proactive_messages, house_automation_controls, house_learned_rules, house_suggestions

DB delete: -

### lib/ghostme/home/houseWorkerFlow.ts

Stato: **active**

Chiamato da: app/api/worker/house/route.ts

Importa: lib/ghostme/auth/serverAuth.ts, lib/ghostme/homeAssistant/haClient.ts, lib/ghostme/homeAssistant/homeAssistantAccess.ts, lib/ghostme/homeAssistant/homeEntityMapper.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts, lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts, lib/ghostme/homeAssistant/houseEntityRegistry.ts, lib/ghostme/homeAssistant/housePatternEngine.ts, lib/ghostme/homeAssistant/houseRouteLearningEngine.ts, lib/ghostme/homeAssistant/houseSuggestionEngine.ts, lib/ghostme/location/haLocationBridgeFlow.ts, lib/supabaseAdmin.ts

Export: houseWorkerFlow

Numero chiamanti: 1

Numero dipendenze: 12

DB read: house_events

DB write: -

DB update: house_events

DB delete: -

### lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts

Stato: **active**

Chiamato da: lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Importa: lib/ghostme/homeAssistant/haClient.ts

Export: buildCognitiveHouse

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/haClient.ts

Stato: **active**

Chiamato da: app/api/debug-ha-entities/route.ts, app/api/debug-house-logger/route.ts, app/api/test-ha/route.ts, lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts, lib/ghostme/homeAssistant/homeContextBuilder.ts, lib/ghostme/homeAssistant/homeEventLogger.ts, lib/ghostme/homeAssistant/houseEntityRegistry.ts, lib/ghostme/location/haLocationBridgeFlow.ts

Importa: -

Export: getHAStates

Numero chiamanti: 10

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/homeAssistantAccess.ts

Stato: **active**

Chiamato da: app/api/home-assistant/event/route.ts, lib/ghostme/context/reasoningService.ts, lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/homeAssistant/homeReasoningBuilder.ts, lib/ghostme/location/haLocationBridgeFlow.ts

Importa: -

Export: canAccessHomeAssistant, getDefaultHomeAssistantUserId, getHomeAssistantPersonForUser, getHomeAssistantUserIds

Numero chiamanti: 6

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/homeContextBuilder.ts

Stato: **active**

Chiamato da: app/api/test-home-context/route.ts

Importa: lib/ghostme/homeAssistant/haClient.ts

Export: buildHomeContext

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/homeEntityMapper.ts

Stato: **active**

Chiamato da: app/api/debug-house-logger/route.ts, app/api/home-assistant/event/route.ts, lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/homeAssistant/homeEventLogger.ts, lib/ghostme/homeAssistant/houseEntityRegistry.ts

Importa: -

Export: EntityInfo, HouseRoom, getEntityInfo

Numero chiamanti: 6

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/homeEventLogger.ts

Stato: **active**

Chiamato da: app/api/home-assistant/event/route.ts

Importa: lib/ghostme/homeAssistant/haClient.ts, lib/ghostme/homeAssistant/homeEntityMapper.ts, lib/ghostme/homeAssistant/homeEventSignificance.ts, lib/supabaseAdmin.ts

Export: SignificantHomeEventInput, logHomeAssistantSnapshot, logSignificantHomeEvent

Numero chiamanti: 1

Numero dipendenze: 4

DB read: house_events

DB write: house_events

DB update: house_events

DB delete: -

### lib/ghostme/homeAssistant/homeEventSignificance.ts

Stato: **active**

Chiamato da: app/api/home-assistant/event/route.ts, lib/ghostme/homeAssistant/homeEventLogger.ts

Importa: -

Export: HOME_EVENT_THRESHOLDS, HomeEventSignificance, HomeEventSignificanceInput, classifyHomeEventSignificance

Numero chiamanti: 2

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/homeReasoningBuilder.ts

Stato: **active**

Chiamato da: app/api/test-home-reasoning/route.ts, lib/ghostme/context/contextBuilder.ts, lib/ghostme/context/reasoningService.ts

Importa: lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/homeAssistant/homeAssistantAccess.ts

Export: buildHomeReasoning

Numero chiamanti: 3

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/houseAutomationContext.ts

Stato: **orphan_db_user**

Chiamato da: -

Importa: lib/supabaseAdmin.ts

Export: buildHouseAutomationContext

Numero chiamanti: 0

Numero dipendenze: 1

DB read: house_events

DB write: -

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Stato: **active**

Chiamato da: lib/ghostme/home/houseWorkerFlow.ts

Importa: lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/supabaseAdmin.ts

Export: planHouseAutomationControls

Numero chiamanti: 1

Numero dipendenze: 3

DB read: house_automation_controls, house_entities, house_events, house_learned_rules, house_patterns

DB write: house_automation_controls

DB update: house_automation_controls

DB delete: -

### lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/proactive/proactiveUserFlow.ts

Importa: lib/ghostme/proactive/proactiveMessageService.ts, lib/supabaseAdmin.ts

Export: generateHouseAutomationSuggestions

Numero chiamanti: 2

Numero dipendenze: 2

DB read: house_events, house_suggestions

DB write: house_suggestions

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/houseEntityRegistry.ts

Stato: **active**

Chiamato da: lib/ghostme/home/houseWorkerFlow.ts

Importa: lib/ghostme/homeAssistant/haClient.ts, lib/ghostme/homeAssistant/homeEntityMapper.ts, lib/supabaseAdmin.ts

Export: syncHouseEntities

Numero chiamanti: 1

Numero dipendenze: 3

DB read: -

DB write: house_entities

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/houseLearnedRulesContext.ts

Stato: **orphan_db_user**

Chiamato da: -

Importa: lib/supabaseAdmin.ts

Export: buildHouseLearnedRulesContext

Numero chiamanti: 0

Numero dipendenze: 1

DB read: house_learned_rules

DB write: -

DB update: -

DB delete: -

### lib/ghostme/homeAssistant/houseLightLearningFlow.ts

Stato: **active**

Chiamato da: app/api/home-assistant/event/route.ts

Importa: lib/ghostme/homeAssistant/housePatternEngine.ts, lib/ghostme/homeAssistant/houseRouteLearningEngine.ts, lib/supabaseAdmin.ts

Export: runHouseLightLearning, shouldRunHouseLightLearning

Numero chiamanti: 1

Numero dipendenze: 3

DB read: house_events

DB write: -

DB update: house_events

DB delete: -

### lib/ghostme/homeAssistant/housePatternEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/homeAssistant/houseLightLearningFlow.ts, lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Importa: lib/supabaseAdmin.ts

Export: analyzeHousePatterns

Numero chiamanti: 3

Numero dipendenze: 1

DB read: house_events, house_patterns

DB write: house_patterns

DB update: house_patterns

DB delete: -

### lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/homeAssistant/houseLightLearningFlow.ts

Importa: lib/supabaseAdmin.ts

Export: learnHouseRoutes

Numero chiamanti: 2

Numero dipendenze: 1

DB read: house_events, house_learned_rules

DB write: house_learned_rules

DB update: house_learned_rules

DB delete: -

### lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/proactive/proactiveUserFlow.ts

Importa: lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts, lib/ghostme/homeAssistant/housePatternEngine.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/supabaseAdmin.ts

Export: generateHouseSuggestions

Numero chiamanti: 2

Numero dipendenze: 4

DB read: house_suggestions

DB write: house_suggestions

DB update: -

DB delete: -

### lib/ghostme/location/haLocationBridgeFlow.ts

Stato: **active**

Chiamato da: lib/ghostme/home/houseWorkerFlow.ts

Importa: lib/ghostme/homeAssistant/haClient.ts, lib/ghostme/homeAssistant/homeAssistantAccess.ts, lib/ghostme/location/locationStateFreshness.ts, lib/supabaseAdmin.ts

Export: HaLocationBridgeResult, bridgeHomeAssistantLocationFlow

Numero chiamanti: 1

Numero dipendenze: 4

DB read: user_location_state

DB write: user_location_state

DB update: -

DB delete: -

### lib/ghostme/location/locationCurrentStateFlow.ts

Stato: **active**

Chiamato da: app/api/location/current-state/route.ts

Importa: lib/ghostme/location/locationStateFreshness.ts, lib/supabaseAdmin.ts

Export: getLocationCurrentStateFlow

Numero chiamanti: 1

Numero dipendenze: 2

DB read: user_location_state

DB write: -

DB update: -

DB delete: -

### lib/ghostme/location/locationDeletePlaceFlow.ts

Stato: **active**

Chiamato da: app/api/location/delete-place/route.ts

Importa: lib/supabaseAdmin.ts

Export: deleteLocationPlaceFlow

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: significant_places

### lib/ghostme/location/locationEngine.ts

Stato: **orphan_candidate**

Chiamato da: -

Importa: -

Export: RawLocationSignal, SignificantPlace, classifyLocationSignal

Numero chiamanti: 0

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/location/locationLearningFlow.ts

Stato: **active**

Chiamato da: app/api/location/candidate/route.ts, lib/ghostme/location/locationUpdateFlow.ts

Importa: lib/ghostme/location/locationStateFreshness.ts, lib/ghostme/location/placeService.ts, lib/ghostme/observation/observationEngine.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/supabaseAdmin.ts

Export: LOCATION_CARD_PREFIX, completeLocationCandidate, getLocationCandidateDetails, isLocationCandidateLogicalKey, writeLocationCandidateCard

Numero chiamanti: 2

Numero dipendenze: 5

DB read: behavior_patterns, ghost_proactive_messages, user_location_state

DB write: -

DB update: behavior_patterns, ghost_proactive_messages, user_location_state

DB delete: -

### lib/ghostme/location/locationSavePlaceFlow.ts

Stato: **active**

Chiamato da: app/api/location/save-place/route.ts

Importa: lib/ghostme/location/placeService.ts

Export: saveLocationPlaceFlow

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/location/locationStateFreshness.ts

Stato: **active**

Chiamato da: app/api/ghostme/brain/route.ts, app/api/location/current-state/route.ts, app/api/location/update-current/route.ts, lib/ghostme/chat/chatContextBuilder.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/location/haLocationBridgeFlow.ts, lib/ghostme/location/locationCurrentStateFlow.ts, lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/situation/situationEngine.ts

Importa: -

Export: GPS_LOCATION_FRESHNESS_WINDOW_MS, HA_HOME_FRESHNESS_WINDOW_MS, LOCATION_FRESHNESS_WINDOW_MS, LocationStateStatus, classifyLocationState, getLocationFreshnessWindowMs, getLocationStateObservedAt, isFreshLocationState, toPublicLocationState

Numero chiamanti: 9

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/location/locationUpdateFlow.ts

Stato: **active**

Chiamato da: app/api/location/update-current/route.ts

Importa: lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/location/placeService.ts, lib/ghostme/observation/observationEngine.ts, lib/ghostme/proactive/proactiveTrigger.ts, lib/supabaseAdmin.ts

Export: updateCurrentLocationFlow

Numero chiamanti: 1

Numero dipendenze: 5

DB read: user_location_state

DB write: user_location_state

DB update: -

DB delete: -

### lib/ghostme/location/placeService.ts

Stato: **active**

Chiamato da: app/api/location/candidate/route.ts, app/api/location/current-place/route.ts, app/api/location/places/route.ts, app/api/location/update-current/route.ts, lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/location/locationSavePlaceFlow.ts, lib/ghostme/location/locationUpdateFlow.ts, lib/ghostme/situation/situationEngine.ts

Importa: lib/supabaseAdmin.ts

Export: SaveSignificantPlaceInput, detectCurrentPlace, distanceMeters, findSignificantPlaceNear, getCurrentLocationState, getLastKnownPlace, getSignificantPlaces, markSignificantPlaceSeen, saveSignificantPlace, toPublicSignificantPlace, updateSignificantPlace

Numero chiamanti: 8

Numero dipendenze: 1

DB read: significant_places, user_location_state

DB write: significant_places

DB update: significant_places

DB delete: -

### lib/ghostme/maintenance/retentionEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Importa: lib/supabaseAdmin.ts

Export: runRetentionCleanup

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: calendar_events, chat_messages, ghost_proactive_messages

DB delete: chat_messages

### lib/ghostme/memory/memorySearchFlow.ts

Stato: **active**

Chiamato da: app/api/memory/search/route.ts

Importa: lib/ghostme/context/temporalPriority.ts, lib/supabaseAdmin.ts

Export: memorySearchFlow

Numero chiamanti: 1

Numero dipendenze: 2

DB read: action_intents, autobiographical_timeline, conversation_summaries, episodic_memories, goals_desires, life_topics, memories_active, topic_links

DB write: -

DB update: -

DB delete: -

### lib/ghostme/memory/memorySnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts, lib/ghostme/people/relationshipMemorySnapshot.ts, lib/ghostme/projects/projectMemorySnapshot.ts

Importa: lib/ghostme/context/temporalPriority.ts, lib/supabaseAdmin.ts

Export: MemorySnapshot, buildMemorySnapshot

Numero chiamanti: 4

Numero dipendenze: 2

DB read: autobiographical_timeline, conversation_summaries, episodic_memories, life_topics, memories_active, topic_links

DB write: -

DB update: -

DB delete: -

### lib/ghostme/memoryDecay.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/ghostChatOrchestrator.ts

Importa: lib/supabase.ts

Export: applyMemoryDecay

Numero chiamanti: 1

Numero dipendenze: 1

DB read: life_topics

DB write: -

DB update: life_topics

DB delete: -

### lib/ghostme/mentalState.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatPostProcessing.ts

Importa: lib/supabaseAdmin.ts

Export: updateMentalState

Numero chiamanti: 1

Numero dipendenze: 1

DB read: mental_states

DB write: mental_states

DB update: mental_states

DB delete: -

### lib/ghostme/observation/observationEngine.ts

Stato: **god_file_candidate**

Chiamato da: lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/location/locationUpdateFlow.ts

Importa: lib/ghostme/observation/observationPolicy.ts, lib/supabaseAdmin.ts

Export: ObservationEventType, UnknownPlaceCandidate, analyzeLocationPatterns, recordObservation

Numero chiamanti: 2

Numero dipendenze: 2

DB read: behavior_patterns, observation_events, significant_places, user_location_state

DB write: behavior_patterns, observation_events

DB update: behavior_patterns, observation_events

DB delete: -

### lib/ghostme/observation/observationInsightEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveCandidateBuilder.ts

Importa: lib/ghostme/situation/situationEngine.ts, lib/supabaseAdmin.ts

Export: generateObservationInsight

Numero chiamanti: 1

Numero dipendenze: 2

DB read: ghost_proactive_messages

DB write: -

DB update: -

DB delete: -

### lib/ghostme/observation/observationPolicy.ts

Stato: **active**

Chiamato da: lib/ghostme/observation/observationEngine.ts, lib/ghostme/situation/situationEngine.ts

Importa: -

Export: CURRENT_OBSERVATION_WINDOW_MS, MAX_CURRENT_OBSERVATIONS, cleanObservations, isUsableObservation, observationIdentity

Numero chiamanti: 2

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/patterns/patternDecay.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveCandidateBuilder.ts

Importa: lib/supabaseAdmin.ts

Export: applyPatternDecay

Numero chiamanti: 1

Numero dipendenze: 1

DB read: behavior_patterns

DB write: -

DB update: behavior_patterns

DB delete: -

### lib/ghostme/patterns/patternInsightEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveCandidateBuilder.ts

Importa: lib/supabaseAdmin.ts

Export: generatePatternInsight

Numero chiamanti: 1

Numero dipendenze: 1

DB read: behavior_patterns, ghost_proactive_messages

DB write: -

DB update: -

DB delete: -

### lib/ghostme/people/peopleGraphLinkService.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/people/peopleGraphService.ts, lib/ghostme/people/peopleSnapshot.ts, lib/ghostme/people/relationshipMemorySnapshot.ts, lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Importa: lib/supabaseAdmin.ts

Export: PEOPLE_GRAPH_TARGET_TYPES, PeopleGraphEvidence, PeopleGraphEvidencePolarity, PeopleGraphLink, PeopleGraphTargetType, decayPeopleGraphLinks, getPeopleGraphLinksForPeople, getPersonGraphNeighborhood, syncPeopleGraphLinks, upsertPeopleGraphLink

Numero chiamanti: 5

Numero dipendenze: 1

DB read: action_intents, calendar_events, episodic_memories, goals_desires, memories_active, people_graph, people_graph_links

DB write: -

DB update: people_graph_links

DB delete: -

### lib/ghostme/people/peopleGraphService.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/proactive/proactiveMaintenanceFlow.ts, lib/ghostme/situation/situationEngine.ts

Importa: lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/people/peopleSnapshot.ts, lib/supabaseAdmin.ts

Export: getPeopleGraphContext, syncPeopleGraphFromTopics, upsertPersonFromTopic

Numero chiamanti: 3

Numero dipendenze: 3

DB read: life_topics, memories_active, people_graph

DB write: people_graph

DB update: people_graph

DB delete: -

### lib/ghostme/people/peopleSnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts, lib/ghostme/people/peopleGraphService.ts, lib/ghostme/people/relationshipMemorySnapshot.ts, lib/ghostme/people/socialSuggestionSnapshot.ts, lib/ghostme/projects/projectMemorySnapshot.ts

Importa: lib/ghostme/people/peopleGraphLinkService.ts, lib/supabaseAdmin.ts

Export: PeopleSnapshot, buildPeopleSnapshot, extractMemoryPersonNames, isLikelyRealPerson, isPersonMemory, isPersonTopic, normalizePersonName

Numero chiamanti: 6

Numero dipendenze: 2

DB read: life_topics, memories_active, people_graph

DB write: -

DB update: -

DB delete: -

### lib/ghostme/people/relationshipMemorySnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts, lib/ghostme/people/socialSuggestionSnapshot.ts, lib/ghostme/projects/projectAdvisorSnapshot.ts

Importa: lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/people/peopleSnapshot.ts

Export: RelationshipMemorySnapshot, buildRelationshipMemorySnapshot

Numero chiamanti: 4

Numero dipendenze: 3

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/people/socialSuggestionSnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts

Importa: lib/ghostme/people/peopleSnapshot.ts, lib/ghostme/people/relationshipMemorySnapshot.ts

Export: SocialRelationshipAttention, SocialSuggestion, SocialSuggestionSnapshot, buildSocialSuggestionSnapshot

Numero chiamanti: 2

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/curiosityCardWriter.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveUserFlow.ts, lib/ghostme/proactive/trueProactiveCardWriter.ts

Importa: lib/ghostme/curiosity/curiositySnapshot.ts, lib/ghostme/proactive/proactiveMessageDedupe.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/supabaseAdmin.ts

Export: buildCuriosityCardLogicalKey, selectImportantCuriosities, writeCuriositySnapshotCards

Numero chiamanti: 2

Numero dipendenze: 4

DB read: ghost_proactive_messages

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/dailyBriefingBuilder.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveUserFlow.ts

Importa: -

Export: buildDailyBriefingMessage

Numero chiamanti: 1

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/dailyBriefingRepository.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveUserFlow.ts

Importa: lib/ghostme/context/temporalPriority.ts, lib/supabaseAdmin.ts

Export: loadDailyBriefingContext

Numero chiamanti: 1

Numero dipendenze: 2

DB read: action_intents, autobiographical_timeline, behavior_patterns, calendar_events, conversation_summaries, episodic_memories, goals_desires, house_events, house_patterns, house_suggestions, life_topics, mental_states, significant_places

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/proactiveCandidateBuilder.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveUserFlow.ts

Importa: lib/ghostme/agenda/agendaEngine.ts, lib/ghostme/behavior/behaviorRulesEngine.ts, lib/ghostme/butler/butlerEngine.ts, lib/ghostme/context/contextBuilder.ts, lib/ghostme/context/reasoningService.ts, lib/ghostme/observation/observationInsightEngine.ts, lib/ghostme/patterns/patternDecay.ts, lib/ghostme/patterns/patternInsightEngine.ts, lib/ghostme/proactive/proactiveDecisionEngine.ts

Export: buildProactiveCandidatesForUser

Numero chiamanti: 1

Numero dipendenze: 9

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/proactiveCandidateRanker.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveUserFlow.ts

Importa: lib/ghostme/proactive/proactiveMessageDedupe.ts

Export: buildProactiveCandidateLogicalKey, pickBestProactiveCandidate

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/proactiveCardLifecycle.ts

Stato: **active**

Chiamato da: app/api/ghostme/proactive/read/route.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/ghostme/proactive/trueProactiveCardWriter.ts, lib/ghostme/proactive/visibleProactiveMessages.ts

Importa: -

Export: ALL_PROACTIVE_STATUSES, HIDDEN_PROACTIVE_STATUSES, USER_PROACTIVE_TRANSITIONS, VISIBLE_PROACTIVE_CATEGORIES, VISIBLE_PROACTIVE_STATUSES

Numero chiamanti: 4

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/proactiveDecisionEngine.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveCandidateBuilder.ts, lib/ghostme/proactive/proactiveTrigger.ts

Importa: lib/ghostme/context/contextBuilder.ts

Export: ProactiveDecision, decideProactiveMessage

Numero chiamanti: 2

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveUserFlow.ts

Importa: lib/ghostme/actionLayer.ts, lib/ghostme/agenda/reminderEngine.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/conversationSummary.ts, lib/ghostme/maintenance/retentionEngine.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/people/peopleGraphService.ts

Export: runProactiveMaintenanceFlow

Numero chiamanti: 1

Numero dipendenze: 7

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/proactiveMessageDedupe.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/curiosityCardWriter.ts, lib/ghostme/proactive/proactiveCandidateRanker.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/ghostme/proactive/trueProactiveCardWriter.ts, lib/ghostme/proactive/visibleProactiveMessages.ts

Importa: -

Export: ProactiveMessageIdentityInput, dedupeProactiveMessages, normalizeProactiveText, proactiveMessageIdentity

Numero chiamanti: 5

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/proactiveMessageService.ts

Stato: **active**

Chiamato da: lib/ghostme/agenda/reminderEngine.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts, lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts, lib/ghostme/homeAssistant/houseSuggestionEngine.ts, lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/proactive/curiosityCardWriter.ts, lib/ghostme/proactive/proactiveTrigger.ts, lib/ghostme/proactive/proactiveUserFlow.ts, lib/ghostme/proactive/trueProactiveCardWriter.ts, lib/ghostme/proactive/visibleProactiveMessages.ts

Importa: lib/ghostme/proactive/proactiveCardLifecycle.ts, lib/ghostme/proactive/proactiveMessageDedupe.ts, lib/supabaseAdmin.ts

Export: buildDailyProactiveLogicalKey, upsertProactiveMessage

Numero chiamanti: 11

Numero dipendenze: 3

DB read: ghost_proactive_messages

DB write: ghost_proactive_messages

DB update: ghost_proactive_messages

DB delete: -

### lib/ghostme/proactive/proactiveTrigger.ts

Stato: **active**

Chiamato da: lib/ghostme/location/locationUpdateFlow.ts

Importa: lib/ghostme/calendar/calendarService.ts, lib/ghostme/context/contextBuilder.ts, lib/ghostme/proactive/proactiveDecisionEngine.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/supabaseAdmin.ts

Export: runProactiveTrigger

Numero chiamanti: 1

Numero dipendenze: 5

DB read: ghost_proactive_messages

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/proactiveUserFlow.ts

Stato: **active**

Chiamato da: app/api/ghostme/brain/route.ts, app/api/worker/proactive/route.ts

Importa: lib/ghostme/context/reasoningService.ts, lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts, lib/ghostme/homeAssistant/houseSuggestionEngine.ts, lib/ghostme/proactive/curiosityCardWriter.ts, lib/ghostme/proactive/dailyBriefingBuilder.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/proactive/proactiveCandidateBuilder.ts, lib/ghostme/proactive/proactiveCandidateRanker.ts, lib/ghostme/proactive/proactiveMaintenanceFlow.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/ghostme/proactive/trueProactiveCardWriter.ts, lib/supabaseAdmin.ts

Export: runAppOpenProactiveLifecycle, runProactiveFlowForUser

Numero chiamanti: 2

Numero dipendenze: 12

DB read: ghost_proactive_messages

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/trueProactiveCardWriter.ts

Stato: **active**

Chiamato da: lib/ghostme/proactive/proactiveUserFlow.ts

Importa: lib/ghostme/proactive/curiosityCardWriter.ts, lib/ghostme/proactive/proactiveCardLifecycle.ts, lib/ghostme/proactive/proactiveMessageDedupe.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/ghostme/proactive/trueProactiveSnapshot.ts, lib/supabaseAdmin.ts

Export: TrueProactiveCardCategory, buildTrueProactiveLogicalKey, mapTrueProactiveCategory, writeTrueProactiveCards

Numero chiamanti: 1

Numero dipendenze: 6

DB read: ghost_proactive_messages

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/trueProactiveSnapshot.ts

Stato: **god_file_candidate**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/proactive/trueProactiveCardWriter.ts

Importa: lib/ghostme/context/decisionSnapshot.ts, lib/ghostme/context/reasoningService.ts

Export: SuppressedTrueProactiveCandidate, TrueProactiveCandidate, TrueProactiveSnapshot, buildTrueProactiveSnapshot

Numero chiamanti: 2

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/proactive/visibleProactiveMessages.ts

Stato: **active**

Chiamato da: app/api/ghostme/brain/route.ts, app/api/proactive/messages/route.ts

Importa: lib/ghostme/proactive/proactiveCardLifecycle.ts, lib/ghostme/proactive/proactiveMessageDedupe.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/supabaseAdmin.ts

Export: loadVisibleProactiveMessages

Numero chiamanti: 2

Numero dipendenze: 4

DB read: calendar_events, ghost_proactive_messages

DB write: -

DB update: ghost_proactive_messages

DB delete: -

### lib/ghostme/profile/profileBehaviorSeed.ts

Stato: **active**

Chiamato da: app/setup/page.tsx

Importa: lib/supabaseAdmin.ts

Export: seedBehaviorFromProfile

Numero chiamanti: 1

Numero dipendenze: 1

DB read: dynamic_self_profile, ghost_behavior_rules, traits, user_profiles

DB write: dynamic_self_profile, ghost_behavior_rules

DB update: dynamic_self_profile

DB delete: -

### lib/ghostme/projects/goalProjectConsistencySnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts, lib/ghostme/projects/projectAdvisorSnapshot.ts

Importa: lib/ghostme/goals/goalsSnapshot.ts, lib/ghostme/projects/projectMemorySnapshot.ts

Export: GoalProjectConsistencyIssue, GoalProjectConsistencySnapshot, buildGoalProjectConsistencySnapshot

Numero chiamanti: 3

Numero dipendenze: 2

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/projects/projectAdvisorSnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts

Importa: lib/ghostme/goals/goalsSnapshot.ts, lib/ghostme/people/relationshipMemorySnapshot.ts, lib/ghostme/projects/goalProjectConsistencySnapshot.ts, lib/ghostme/projects/projectMemorySnapshot.ts

Export: ProjectAdvisorArea, ProjectAdvisorFocus, ProjectAdvisorSnapshot, buildProjectAdvisorSnapshot

Numero chiamanti: 2

Numero dipendenze: 4

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/projects/projectMemorySnapshot.ts

Stato: **active**

Chiamato da: lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiositySnapshot.ts, lib/ghostme/projects/goalProjectConsistencySnapshot.ts, lib/ghostme/projects/projectAdvisorSnapshot.ts

Importa: lib/ghostme/context/temporalPriority.ts, lib/ghostme/goals/goalsSnapshot.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/people/peopleSnapshot.ts

Export: ProjectMemoryItem, ProjectMemorySnapshot, buildProjectMemorySnapshot

Numero chiamanti: 4

Numero dipendenze: 4

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/relationshipResolver.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatMessageAnalyzer.ts, lib/ghostme/chat/ghostChatOrchestrator.ts

Importa: lib/supabase.ts

Export: removeGenericRelationshipTopics, resolveNamedRelationship

Numero chiamanti: 2

Numero dipendenze: 1

DB read: life_topics, memories_active

DB write: life_topics, memories_active

DB update: life_topics, memories_active

DB delete: life_topics, memories_active

### lib/ghostme/retrieval.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatContextBuilder.ts

Importa: lib/ghostme/context/temporalPriority.ts, lib/ghostme/topicLinks.ts, lib/supabase.ts, lib/supabaseAdmin.ts

Export: buildContextualMemory

Numero chiamanti: 1

Numero dipendenze: 4

DB read: autobiographical_timeline, conversation_summaries, episodic_memories, life_topics, memories_active, topic_links

DB write: -

DB update: -

DB delete: -

### lib/ghostme/services/serviceRouter.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatExternalServices.ts

Importa: -

Export: GhostServiceDecision, GhostServiceType, decideGhostService

Numero chiamanti: 1

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/services/timeService.ts

Stato: **orphan_candidate**

Chiamato da: -

Importa: -

Export: getLocalTimeContext

Numero chiamanti: 0

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/services/weatherService.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatExternalServices.ts

Importa: lib/ghostme/services/webSearchService.ts

Export: runWeatherSearch

Numero chiamanti: 1

Numero dipendenze: 1

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/services/webSearchService.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatExternalServices.ts, lib/ghostme/services/weatherService.ts

Importa: -

Export: WebSearchResult, runWebSearch

Numero chiamanti: 2

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/situation/situationEngine.ts

Stato: **god_file_candidate**

Chiamato da: lib/ghostme/agenda/agendaEngine.ts, lib/ghostme/context/contextBuilder.ts, lib/ghostme/context/contextSignals.ts, lib/ghostme/context/reasoningService.ts, lib/ghostme/curiosity/curiosityEngine.ts, lib/ghostme/observation/observationInsightEngine.ts

Importa: lib/ghostme/context/temporalPriority.ts, lib/ghostme/location/locationStateFreshness.ts, lib/ghostme/location/placeService.ts, lib/ghostme/observation/observationPolicy.ts, lib/ghostme/people/peopleGraphService.ts, lib/supabaseAdmin.ts

Export: GhostSituation, buildGhostSituation

Numero chiamanti: 6

Numero dipendenze: 6

DB read: action_intents, autobiographical_timeline, behavior_patterns, calendar_events, contradictions, conversation_summaries, dynamic_self_profile, episodic_memories, ghost_behavior_rules, goals_desires, life_topics, mental_states, observation_events, topic_links, user_profiles

DB write: -

DB update: -

DB delete: -

### lib/ghostme/timeline.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatPostProcessing.ts

Importa: lib/supabaseAdmin.ts

Export: detectAndSaveTimelineEvent, getTimelineContext

Numero chiamanti: 1

Numero dipendenze: 1

DB read: autobiographical_timeline

DB write: autobiographical_timeline

DB update: -

DB delete: -

### lib/ghostme/topicDetector.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatMessageAnalyzer.ts, lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/entityExtractor.ts

Importa: -

Export: DetectedTopic, detectEmotionalTone, detectImportanceLevel, detectMemoryCategory, detectTopicsFromMessage, isPossibleEpisode, shouldSaveActiveMemory

Numero chiamanti: 3

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/ghostme/topicLinks.ts

Stato: **active**

Chiamato da: lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/retrieval.ts

Importa: lib/supabase.ts

Export: getRelatedTopicContext, saveTopicLinks

Numero chiamanti: 2

Numero dipendenze: 1

DB read: life_topics, topic_links

DB write: topic_links

DB update: topic_links

DB delete: -

### lib/ghostme/ui/brainUiAdapter.ts

Stato: **active**

Chiamato da: hooks/useGhostBrain.ts

Importa: components/ghost/types.ts, lib/ghostme/context/decisionSnapshot.ts, lib/ghostme/context/reasoningService.ts

Export: adaptBrainApiResponse

Numero chiamanti: 1

Numero dipendenze: 3

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/personality.ts

Stato: **active**

Chiamato da: app/chat/page.tsx, app/setup/page.tsx, hooks/useGhostBrain.ts

Importa: -

Export: buildGhostMeMessage, buildPersonalitySummary

Numero chiamanti: 3

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/supabase.ts

Stato: **active**

Chiamato da: app/api/memory/route.ts, app/chat/page.tsx, app/login/page.tsx, app/memory/page.tsx, app/setup/page.tsx, app/setup/profile/page.tsx, lib/ghostme/auth/clientAuthHeaders.ts, lib/ghostme/chat/chatPostProcessing.ts, lib/ghostme/memoryDecay.ts, lib/ghostme/relationshipResolver.ts, lib/ghostme/retrieval.ts, lib/ghostme/topicLinks.ts

Importa: -

Export: supabase

Numero chiamanti: 12

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -

### lib/supabaseAdmin.ts

Stato: **active**

Chiamato da: app/api/actions/update-status/route.ts, app/api/ghostme/proactive/read/route.ts, app/api/goals/update-status/route.ts, app/api/home-assistant/event/route.ts, app/api/worker/proactive/route.ts, lib/ghostme/actionLayer.ts, lib/ghostme/agenda/reminderEngine.ts, lib/ghostme/auth/serverAuth.ts, lib/ghostme/behavior/behaviorRulesEngine.ts, lib/ghostme/calendar/calendarService.ts, lib/ghostme/context/contextBuilder.ts, lib/ghostme/context/userContextGraph.ts, lib/ghostme/contradictions.ts, lib/ghostme/conversationSummary.ts, lib/ghostme/curiosity/curiosityEngine.ts, lib/ghostme/dynamicSelfProfile.ts, lib/ghostme/goals/goalsActionsLifecycle.ts, lib/ghostme/goals/goalsSnapshot.ts, lib/ghostme/goalsDesires.ts, lib/ghostme/home/homeComfortRiskSnapshot.ts, lib/ghostme/home/houseRouteSnapshot.ts, lib/ghostme/home/houseStateSnapshot.ts, lib/ghostme/home/houseSuggestionResponseFlow.ts, lib/ghostme/home/houseWorkerFlow.ts, lib/ghostme/homeAssistant/homeEventLogger.ts, lib/ghostme/homeAssistant/houseAutomationContext.ts, lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts, lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts, lib/ghostme/homeAssistant/houseEntityRegistry.ts, lib/ghostme/homeAssistant/houseLearnedRulesContext.ts, lib/ghostme/homeAssistant/houseLightLearningFlow.ts, lib/ghostme/homeAssistant/housePatternEngine.ts, lib/ghostme/homeAssistant/houseRouteLearningEngine.ts, lib/ghostme/homeAssistant/houseSuggestionEngine.ts, lib/ghostme/location/haLocationBridgeFlow.ts, lib/ghostme/location/locationCurrentStateFlow.ts, lib/ghostme/location/locationDeletePlaceFlow.ts, lib/ghostme/location/locationLearningFlow.ts, lib/ghostme/location/locationUpdateFlow.ts, lib/ghostme/location/placeService.ts, lib/ghostme/maintenance/retentionEngine.ts, lib/ghostme/memory/memorySearchFlow.ts, lib/ghostme/memory/memorySnapshot.ts, lib/ghostme/mentalState.ts, lib/ghostme/observation/observationEngine.ts, lib/ghostme/observation/observationInsightEngine.ts, lib/ghostme/patterns/patternDecay.ts, lib/ghostme/patterns/patternInsightEngine.ts, lib/ghostme/people/peopleGraphLinkService.ts, lib/ghostme/people/peopleGraphService.ts, lib/ghostme/people/peopleSnapshot.ts, lib/ghostme/proactive/curiosityCardWriter.ts, lib/ghostme/proactive/dailyBriefingRepository.ts, lib/ghostme/proactive/proactiveMessageService.ts, lib/ghostme/proactive/proactiveTrigger.ts, lib/ghostme/proactive/proactiveUserFlow.ts, lib/ghostme/proactive/trueProactiveCardWriter.ts, lib/ghostme/proactive/visibleProactiveMessages.ts, lib/ghostme/profile/profileBehaviorSeed.ts, lib/ghostme/retrieval.ts, lib/ghostme/situation/situationEngine.ts, lib/ghostme/timeline.ts

Importa: -

Export: supabaseAdmin

Numero chiamanti: 62

Numero dipendenze: 0

DB read: -

DB write: -

DB update: -

DB delete: -
