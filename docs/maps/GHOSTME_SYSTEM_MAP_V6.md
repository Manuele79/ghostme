# GHOSTME SYSTEM MAP V6

Generato automaticamente: 2026-06-28T00:35:59.275Z

## Inventario

- engine: 16
- snapshot: 14
- service: 10
- flow: 13
- adapter: 1
- ui: 17
- api: 25
- worker: 3
- orchestrator: 1
- hook: 3
- module: 61

## Punti di ingresso

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
- app/chat/page.tsx
- app/layout.tsx
- app/login/page.tsx
- app/memory/page.tsx
- app/page.tsx
- app/setup/page.tsx
- app/setup/profile/page.tsx
- hooks/useGhostBrain.ts
- hooks/useGhostChat.ts
- hooks/useGhostVoice.ts

## Punti di uscita

- app/api/actions/update-status/route.ts
- app/api/ghostme/proactive/read/route.ts
- app/api/goals/update-status/route.ts
- app/api/home-assistant/event/route.ts
- app/api/memory/route.ts
- app/chat/page.tsx
- app/memory/page.tsx
- app/setup/page.tsx
- app/setup/profile/page.tsx
- lib/ghostme/actionLayer.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/goalsDesires.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationDeletePlaceFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/mentalState.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/services/weatherService.ts
- lib/ghostme/services/webSearchService.ts
- lib/ghostme/timeline.ts
- lib/ghostme/topicLinks.ts

## Moduli

### app/api/actions/update-status/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/actions/update-status. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- action_intents (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/calendar-events/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/calendar-events. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/calendar/calendarService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/chat/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/chat. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/conversation-summary/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/conversation-summary. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/conversationSummary.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/debug-ha-entities/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/debug-ha-entities. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/homeAssistant/haClient.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/debug-house-logger/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/debug-house-logger. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/debug-reasoning/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/debug-reasoning. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/context/reasoningService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/context/decisionSnapshot.ts

### app/api/ghostme/brain/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/ghostme/brain. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/context/decisionSnapshot.ts

### app/api/ghostme/proactive/read/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/ghostme/proactive/read. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/proactive/proactiveCardLifecycle.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- calendar_events (read)
- calendar_events (update)
- ghost_proactive_messages (read)
- ghost_proactive_messages (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/goals/update-status/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/goals/update-status. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- goals_desires (read)
- goals_desires (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/home-assistant/event/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/home-assistant/event. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/homeEventSignificance.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_entities (write)
- house_events (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/house-suggestion-response/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/house-suggestion-response. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/location/candidate/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/location/candidate. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/placeService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/location/current-place/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/location/current-place. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/location/placeService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/location/current-state/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/location/current-state. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/location/locationCurrentStateFlow.ts
- lib/ghostme/location/locationStateFreshness.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/location/delete-place/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/location/delete-place. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/location/locationDeletePlaceFlow.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/location/places/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/location/places. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/location/placeService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/location/save-place/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/location/save-place. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/location/locationSavePlaceFlow.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/location/update-current/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/location/update-current. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/placeService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/memory/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/memory. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/supabase.ts

Tabelle usate:
- memories_active (read)
- memories_active (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/memory/search/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/memory/search. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/memory/memorySearchFlow.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/proactive/messages/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/proactive/messages. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/test-ha/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/test-ha. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/homeAssistant/haClient.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/test-home-context/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/test-home-context. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/homeAssistant/homeContextBuilder.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/test-home-reasoning/route.ts

Tipo: **api**

Stato: **ATTIVO**

Responsabilita: Espone un punto di ingresso HTTP. Area: app/api/test-home-reasoning. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/worker/house/route.ts

Tipo: **worker**

Stato: **ATTIVO**

Responsabilita: Esegue un ciclo worker o cron. Area: app/api/worker/house. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/home/houseWorkerFlow.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/worker/proactive/route.ts

Tipo: **worker**

Stato: **ATTIVO**

Responsabilita: Esegue un ciclo worker o cron. Area: app/api/worker/proactive. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- user_profiles (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/api/worker/reminder/route.ts

Tipo: **worker**

Stato: **ATTIVO**

Responsabilita: Esegue un ciclo worker o cron. Area: app/api/worker/reminder. Modulo: route.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/auth/serverAuth.ts

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/agenda/reminderEngine.ts

Snapshot collegati:
- nessuno

### app/chat/page.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: app/chat. Modulo: page.

Chi lo chiama:
- nessuno

Chi chiama:
- components/ghost/GhostBackground.tsx
- components/ghost/GhostChat.tsx
- components/ghost/GhostDrawers.tsx
- components/ghost/GhostHeader.tsx
- components/ghost/GhostLayout.tsx
- components/ghost/GhostVoiceMode.tsx
- components/ghost/types.ts
- hooks/useGhostBrain.ts
- hooks/useGhostChat.ts
- hooks/useGhostVoice.ts
- lib/ghostme/auth/clientAuthHeaders.ts
- lib/personality.ts
- lib/supabase.ts

Tabelle usate:
- chat_messages (read)
- chat_messages (write)
- traits (read)
- user_profiles (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/layout.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: app. Modulo: layout.

Chi lo chiama:
- nessuno

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/login/page.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: app/login. Modulo: page.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/supabase.ts

Tabelle usate:
- traits (read)
- user_profiles (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/memory/page.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: app/memory. Modulo: page.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/supabase.ts

Tabelle usate:
- memories_active (delete)
- memories_active (read)
- memories_active (update)
- memories_active (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/page.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: app. Modulo: page.

Chi lo chiama:
- nessuno

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/setup/page.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: app/setup. Modulo: page.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/personality.ts
- lib/supabase.ts

Tabelle usate:
- answers (delete)
- answers (read)
- answers (write)
- traits (delete)
- traits (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### app/setup/profile/page.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: app/setup/profile. Modulo: page.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/supabase.ts

Tabelle usate:
- user_profiles (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/GhostBackground.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: GhostBackground.

Chi lo chiama:
- app/chat/page.tsx

Chi chiama:
- components/ghost/types.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/GhostCanvasCore.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: GhostCanvasCore.

Chi lo chiama:
- components/ghost/GhostVoiceMode.tsx

Chi chiama:
- components/ghost/types.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/GhostChat.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: GhostChat.

Chi lo chiama:
- app/chat/page.tsx

Chi chiama:
- components/ghost/types.ts
- lib/ghostme/auth/clientAuthHeaders.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/GhostCore.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: GhostCore.

Chi lo chiama:
- components/ghost/GhostVoiceMode.tsx

Chi chiama:
- components/ghost/types.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/GhostDrawers.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: GhostDrawers.

Chi lo chiama:
- app/chat/page.tsx

Chi chiama:
- components/ghost/types.ts
- lib/ghostme/auth/clientAuthHeaders.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/GhostGlobalStyles.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: GhostGlobalStyles.

Chi lo chiama:
- components/ghost/GhostLayout.tsx

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/GhostHeader.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: GhostHeader.

Chi lo chiama:
- app/chat/page.tsx

Chi chiama:
- components/ghost/types.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/GhostLayout.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: GhostLayout.

Chi lo chiama:
- app/chat/page.tsx

Chi chiama:
- components/ghost/GhostGlobalStyles.tsx

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/GhostVoiceMode.tsx

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: GhostVoiceMode.

Chi lo chiama:
- app/chat/page.tsx

Chi chiama:
- components/ghost/GhostCanvasCore.tsx
- components/ghost/GhostCore.tsx
- components/ghost/types.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### components/ghost/types.ts

Tipo: **ui**

Stato: **ATTIVO**

Responsabilita: Renderizza o coordina esperienza utente. Area: components/ghost. Modulo: types.

Chi lo chiama:
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

Chi chiama:
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/context/reasoningService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/context/decisionSnapshot.ts

### hooks/useGhostBrain.ts

Tipo: **hook**

Stato: **ATTIVO**

Responsabilita: Gestisce stato client e chiamate UI. Area: hooks. Modulo: useGhostBrain.

Chi lo chiama:
- app/chat/page.tsx

Chi chiama:
- components/ghost/types.ts
- lib/ghostme/auth/clientAuthHeaders.ts
- lib/ghostme/ui/brainUiAdapter.ts
- lib/personality.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### hooks/useGhostChat.ts

Tipo: **hook**

Stato: **ATTIVO**

Responsabilita: Gestisce stato client e chiamate UI. Area: hooks. Modulo: useGhostChat.

Chi lo chiama:
- app/chat/page.tsx

Chi chiama:
- components/ghost/types.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### hooks/useGhostVoice.ts

Tipo: **hook**

Stato: **ATTIVO**

Responsabilita: Gestisce stato client e chiamate UI. Area: hooks. Modulo: useGhostVoice.

Chi lo chiama:
- app/chat/page.tsx

Chi chiama:
- components/ghost/types.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/actionLayer.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: actionLayer.

Chi lo chiama:
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Chi chiama:
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- action_intents (update)
- action_intents (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/agenda/agendaEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/agenda. Modulo: agendaEngine.

Chi lo chiama:
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

Chi chiama:
- lib/ghostme/situation/situationEngine.ts

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/agenda/appointmentReminderNotification.ts

Tipo: **module**

Stato: **ORFANO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/agenda. Modulo: appointmentReminderNotification.

Chi lo chiama:
- nessuno

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/agenda/reminderEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/agenda. Modulo: reminderEngine.

Chi lo chiama:
- app/api/worker/reminder/route.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Chi chiama:
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- calendar_events (read)
- ghost_proactive_messages (read)
- ghost_proactive_messages (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/auth/clientAuthHeaders.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/auth. Modulo: clientAuthHeaders.

Chi lo chiama:
- app/chat/page.tsx
- components/ghost/GhostChat.tsx
- components/ghost/GhostDrawers.tsx
- hooks/useGhostBrain.ts

Chi chiama:
- lib/supabase.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/auth/serverAuth.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/auth. Modulo: serverAuth.

Chi lo chiama:
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

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/behavior/behaviorRulesEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/behavior. Modulo: behaviorRulesEngine.

Chi lo chiama:
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- ghost_behavior_rules (read)
- ghost_behavior_rules (update)
- ghost_behavior_rules (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/butler/butlerEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/butler. Modulo: butlerEngine.

Chi lo chiama:
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

Chi chiama:
- lib/ghostme/context/contextBuilder.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/calendar/calendarIntent.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/calendar. Modulo: calendarIntent.

Chi lo chiama:
- lib/ghostme/chat/chatCalendarFlow.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/calendar/calendarService.ts

Tipo: **service**

Stato: **ATTIVO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/calendar. Modulo: calendarService.

Chi lo chiama:
- app/api/calendar-events/route.ts
- app/api/ghostme/brain/route.ts
- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/chat/chatCalendarFlow.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts
- lib/ghostme/proactive/proactiveTrigger.ts

Chi chiama:
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- calendar_events (read)
- calendar_events (update)
- calendar_events (write)
- ghost_proactive_messages (read)
- ghost_proactive_messages (update)

Engine collegati:
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/agenda/reminderEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/chat/chatCalendarFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/chat. Modulo: chatCalendarFlow.

Chi lo chiama:
- lib/ghostme/chat/ghostChatOrchestrator.ts

Chi chiama:
- lib/ghostme/calendar/calendarIntent.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/chat/chatTypes.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/chat/chatContextBuilder.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/chat. Modulo: chatContextBuilder.

Chi lo chiama:
- lib/ghostme/chat/ghostChatOrchestrator.ts

Chi chiama:
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/chat/chatPromptBuilder.ts
- lib/ghostme/chat/chatRecallPolicy.ts
- lib/ghostme/chat/chatTypes.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/retrieval.ts

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/behavior/behaviorRulesEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/chat/chatExternalServices.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/chat. Modulo: chatExternalServices.

Chi lo chiama:
- lib/ghostme/chat/ghostChatOrchestrator.ts

Chi chiama:
- lib/ghostme/services/serviceRouter.ts
- lib/ghostme/services/weatherService.ts
- lib/ghostme/services/webSearchService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/chat/chatMessageAnalyzer.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/chat. Modulo: chatMessageAnalyzer.

Chi lo chiama:
- lib/ghostme/chat/ghostChatOrchestrator.ts

Chi chiama:
- lib/ghostme/chat/chatTypes.ts
- lib/ghostme/core/messageClassifier.ts
- lib/ghostme/entityExtractor.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/topicDetector.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/chat/chatPostProcessing.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/chat. Modulo: chatPostProcessing.

Chi lo chiama:
- app/api/chat/route.ts

Chi chiama:
- lib/ghostme/actionLayer.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/chat/chatTypes.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/goalsDesires.ts
- lib/ghostme/mentalState.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/timeline.ts
- lib/ghostme/topicDetector.ts
- lib/ghostme/topicLinks.ts
- lib/supabase.ts

Tabelle usate:
- episodic_memories (read)
- episodic_memories (write)
- life_topics (read)
- life_topics (update)
- life_topics (write)
- memories_active (read)
- memories_active (update)
- memories_active (write)

Engine collegati:
- lib/ghostme/behavior/behaviorRulesEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/chat/chatPromptBuilder.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/chat. Modulo: chatPromptBuilder.

Chi lo chiama:
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts

Chi chiama:
- lib/ghostme/chat/chatTypes.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/chat/chatRecallPolicy.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/chat. Modulo: chatRecallPolicy.

Chi lo chiama:
- lib/ghostme/chat/chatContextBuilder.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/chat/chatResponseSanitizer.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/chat. Modulo: chatResponseSanitizer.

Chi lo chiama:
- lib/ghostme/chat/ghostChatOrchestrator.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/chat/chatTypes.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/chat. Modulo: chatTypes.

Chi lo chiama:
- lib/ghostme/chat/chatCalendarFlow.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/chat/chatPromptBuilder.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts
- lib/ghostme/core/messageClassifier.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/chat/ghostChatOrchestrator.ts

Tipo: **orchestrator**

Stato: **ATTIVO**

Responsabilita: Coordina un flusso applicativo multi-modulo. Area: lib/ghostme/chat. Modulo: ghostChatOrchestrator.

Chi lo chiama:
- app/api/chat/route.ts

Chi chiama:
- lib/ghostme/chat/chatCalendarFlow.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/chat/chatExternalServices.ts
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/chatPromptBuilder.ts
- lib/ghostme/chat/chatResponseSanitizer.ts
- lib/ghostme/chat/chatTypes.ts
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/relationshipResolver.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/context/contextBuilder.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/context. Modulo: contextBuilder.

Chi lo chiama:
- lib/ghostme/butler/butlerEngine.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts

Chi chiama:
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/context/contextSignals.ts
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/situation/situationEngine.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- ghost_proactive_messages (read)

Engine collegati:
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/butler/butlerEngine.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/context/contextSignals.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/context. Modulo: contextSignals.

Chi lo chiama:
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts

Chi chiama:
- lib/ghostme/situation/situationEngine.ts

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts

### lib/ghostme/context/decisionSnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/context. Modulo: decisionSnapshot.

Chi lo chiama:
- app/api/debug-reasoning/route.ts
- app/api/ghostme/brain/route.ts
- components/ghost/types.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/ghostme/ui/brainUiAdapter.ts

Chi chiama:
- lib/ghostme/context/reasoningService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/proactive/trueProactiveSnapshot.ts

### lib/ghostme/context/reasoningService.ts

Tipo: **service**

Stato: **ATTIVO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/context. Modulo: reasoningService.

Chi lo chiama:
- app/api/debug-reasoning/route.ts
- app/api/ghostme/brain/route.ts
- components/ghost/types.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/ghostme/ui/brainUiAdapter.ts

Chi chiama:
- lib/ghostme/context/contextSignals.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/homeLocationConsistency.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts
- lib/ghostme/situation/situationEngine.ts

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### lib/ghostme/context/temporalPriority.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/context. Modulo: temporalPriority.

Chi lo chiama:
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

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### lib/ghostme/context/userContextGraph.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/context. Modulo: userContextGraph.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts

Chi chiama:
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- behavior_patterns (read)
- calendar_events (read)
- conversation_summaries (read)
- episodic_memories (read)
- ghost_proactive_messages (read)
- goals_desires (read)
- house_automation_controls (read)
- house_learned_rules (read)
- house_patterns (read)
- life_topics (read)
- memories_active (read)
- people_graph (read)
- significant_places (read)
- user_location_state (read)
- user_profiles (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/contradictions.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: contradictions.

Chi lo chiama:
- lib/ghostme/chat/chatPostProcessing.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- contradictions (read)
- contradictions (write)
- life_topics (read)
- memories_active (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/conversationSummary.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: conversationSummary.

Chi lo chiama:
- app/api/conversation-summary/route.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- chat_messages (read)
- conversation_summaries (read)
- conversation_summaries (update)
- conversation_summaries (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/core/messageClassifier.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/core. Modulo: messageClassifier.

Chi lo chiama:
- lib/ghostme/chat/chatMessageAnalyzer.ts

Chi chiama:
- lib/ghostme/chat/chatTypes.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/curiosity/curiosityEngine.ts

Tipo: **engine**

Stato: **ORFANO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/curiosity. Modulo: curiosityEngine.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/ghostme/situation/situationEngine.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- autobiographical_timeline (read)
- contradictions (read)
- conversation_summaries (read)
- dynamic_self_profile (read)
- ghost_proactive_messages (read)
- goals_desires (read)
- life_topics (read)

Engine collegati:
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/curiosity/curiositySnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/curiosity. Modulo: curiositySnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/proactive/curiosityCardWriter.ts

Chi chiama:
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

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
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

### lib/ghostme/dynamicSelfProfile.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: dynamicSelfProfile.

Chi lo chiama:
- lib/ghostme/chat/chatPostProcessing.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- dynamic_self_profile (read)
- dynamic_self_profile (update)
- dynamic_self_profile (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/entityExtractor.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: entityExtractor.

Chi lo chiama:
- lib/ghostme/chat/chatMessageAnalyzer.ts

Chi chiama:
- lib/ghostme/topicDetector.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/goals/goalsActionsLifecycle.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/goals. Modulo: goalsActionsLifecycle.

Chi lo chiama:
- app/api/actions/update-status/route.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/chat/chatPostProcessing.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- action_intents (update)
- goals_desires (read)
- goals_desires (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/goals/goalsSnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/goals. Modulo: goalsSnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

Chi chiama:
- lib/ghostme/context/temporalPriority.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- goals_desires (read)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### lib/ghostme/goalsDesires.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: goalsDesires.

Chi lo chiama:
- lib/ghostme/chat/chatPostProcessing.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- goals_desires (read)
- goals_desires (update)
- goals_desires (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/home/homeComfortRiskSnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/home. Modulo: homeComfortRiskSnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts

Chi chiama:
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_events (read)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseStateSnapshot.ts

### lib/ghostme/home/homeLocationConsistency.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/home. Modulo: homeLocationConsistency.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts

Chi chiama:
- lib/ghostme/home/houseStateSnapshot.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/home/houseStateSnapshot.ts

### lib/ghostme/home/houseRouteSnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/home. Modulo: houseRouteSnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts

Chi chiama:
- lib/ghostme/home/houseStateSnapshot.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_events (read)
- house_learned_rules (read)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/houseStateSnapshot.ts

### lib/ghostme/home/houseStateSnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/home. Modulo: houseStateSnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/homeLocationConsistency.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Chi chiama:
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_entities (read)
- house_events (read)
- user_location_state (read)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/houseRouteSnapshot.ts

### lib/ghostme/home/houseSuggestionResponseFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/home. Modulo: houseSuggestionResponseFlow.

Chi lo chiama:
- app/api/house-suggestion-response/route.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- ghost_proactive_messages (read)
- ghost_proactive_messages (update)
- house_automation_controls (read)
- house_automation_controls (update)
- house_learned_rules (read)
- house_learned_rules (update)
- house_learned_rules (write)
- house_suggestions (read)
- house_suggestions (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/home/houseWorkerFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/home. Modulo: houseWorkerFlow.

Chi lo chiama:
- app/api/worker/house/route.ts

Chi chiama:
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_events (read)
- house_events (update)

Engine collegati:
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: cognitiveHouseBuilder.

Chi lo chiama:
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Chi chiama:
- lib/ghostme/homeAssistant/haClient.ts

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/haClient.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: haClient.

Chi lo chiama:
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

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/home/houseStateSnapshot.ts

### lib/ghostme/homeAssistant/homeAssistantAccess.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: homeAssistantAccess.

Chi lo chiama:
- app/api/home-assistant/event/route.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/homeReasoningBuilder.ts
- lib/ghostme/location/haLocationBridgeFlow.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/home/houseStateSnapshot.ts

### lib/ghostme/homeAssistant/homeContextBuilder.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: homeContextBuilder.

Chi lo chiama:
- app/api/test-home-context/route.ts

Chi chiama:
- lib/ghostme/homeAssistant/haClient.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/homeEntityMapper.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: homeEntityMapper.

Chi lo chiama:
- app/api/debug-house-logger/route.ts
- app/api/home-assistant/event/route.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/home/houseStateSnapshot.ts

### lib/ghostme/homeAssistant/homeEventLogger.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: homeEventLogger.

Chi lo chiama:
- app/api/home-assistant/event/route.ts

Chi chiama:
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/ghostme/homeAssistant/homeEventSignificance.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_events (read)
- house_events (update)
- house_events (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/homeEventSignificance.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: homeEventSignificance.

Chi lo chiama:
- app/api/home-assistant/event/route.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/homeReasoningBuilder.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: homeReasoningBuilder.

Chi lo chiama:
- app/api/test-home-reasoning/route.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/reasoningService.ts

Chi chiama:
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/home/houseStateSnapshot.ts

### lib/ghostme/homeAssistant/houseAutomationContext.ts

Tipo: **module**

Stato: **ORFANO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: houseAutomationContext.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- house_events (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: houseAutomationControlPlanner.

Chi lo chiama:
- lib/ghostme/home/houseWorkerFlow.ts

Chi chiama:
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_automation_controls (read)
- house_automation_controls (update)
- house_automation_controls (write)
- house_entities (read)
- house_events (read)
- house_learned_rules (read)
- house_patterns (read)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/home/houseStateSnapshot.ts

### lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/homeAssistant. Modulo: houseAutomationSuggestionEngine.

Chi lo chiama:
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/proactive/proactiveUserFlow.ts

Chi chiama:
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_events (read)
- house_suggestions (read)
- house_suggestions (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/houseEntityRegistry.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: houseEntityRegistry.

Chi lo chiama:
- lib/ghostme/home/houseWorkerFlow.ts

Chi chiama:
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeEntityMapper.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_entities (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/houseLearnedRulesContext.ts

Tipo: **module**

Stato: **ORFANO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/homeAssistant. Modulo: houseLearnedRulesContext.

Chi lo chiama:
- nessuno

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- house_learned_rules (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/houseLightLearningFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/homeAssistant. Modulo: houseLightLearningFlow.

Chi lo chiama:
- app/api/home-assistant/event/route.ts

Chi chiama:
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_events (read)
- house_events (update)

Engine collegati:
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/housePatternEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/homeAssistant. Modulo: housePatternEngine.

Chi lo chiama:
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- house_events (read)
- house_patterns (read)
- house_patterns (update)
- house_patterns (write)

Engine collegati:
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/homeAssistant. Modulo: houseRouteLearningEngine.

Chi lo chiama:
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- house_events (read)
- house_learned_rules (read)
- house_learned_rules (update)
- house_learned_rules (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/homeAssistant. Modulo: houseSuggestionEngine.

Chi lo chiama:
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/proactive/proactiveUserFlow.ts

Chi chiama:
- lib/ghostme/homeAssistant/cognitiveHouseBuilder.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- house_suggestions (read)
- house_suggestions (write)

Engine collegati:
- lib/ghostme/homeAssistant/housePatternEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/location/haLocationBridgeFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/location. Modulo: haLocationBridgeFlow.

Chi lo chiama:
- lib/ghostme/home/houseWorkerFlow.ts

Chi chiama:
- lib/ghostme/homeAssistant/haClient.ts
- lib/ghostme/homeAssistant/homeAssistantAccess.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/observation/observationEngine.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- significant_places (read)
- significant_places (write)
- user_location_state (read)
- user_location_state (write)

Engine collegati:
- lib/ghostme/observation/observationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/location/locationCurrentStateFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/location. Modulo: locationCurrentStateFlow.

Chi lo chiama:
- app/api/location/current-state/route.ts

Chi chiama:
- lib/ghostme/location/locationStateFreshness.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- user_location_state (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/location/locationDeletePlaceFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/location. Modulo: locationDeletePlaceFlow.

Chi lo chiama:
- app/api/location/delete-place/route.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- significant_places (delete)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/location/locationEngine.ts

Tipo: **engine**

Stato: **ORFANO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/location. Modulo: locationEngine.

Chi lo chiama:
- nessuno

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/location/locationLearningFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/location. Modulo: locationLearningFlow.

Chi lo chiama:
- app/api/location/candidate/route.ts
- lib/ghostme/location/locationUpdateFlow.ts

Chi chiama:
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- behavior_patterns (read)
- behavior_patterns (update)
- ghost_proactive_messages (read)
- ghost_proactive_messages (update)
- user_location_state (read)
- user_location_state (update)

Engine collegati:
- lib/ghostme/observation/observationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/location/locationSavePlaceFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/location. Modulo: locationSavePlaceFlow.

Chi lo chiama:
- app/api/location/save-place/route.ts

Chi chiama:
- lib/ghostme/location/placeService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/location/locationStateFreshness.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/location. Modulo: locationStateFreshness.

Chi lo chiama:
- app/api/ghostme/brain/route.ts
- app/api/location/current-state/route.ts
- app/api/location/update-current/route.ts
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationCurrentStateFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/situation/situationEngine.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/location/locationUpdateFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/location. Modulo: locationUpdateFlow.

Chi lo chiama:
- app/api/location/update-current/route.ts

Chi chiama:
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/proactiveTrigger.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- user_location_state (read)
- user_location_state (write)

Engine collegati:
- lib/ghostme/observation/observationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/location/placeService.ts

Tipo: **service**

Stato: **ATTIVO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/location. Modulo: placeService.

Chi lo chiama:
- app/api/location/candidate/route.ts
- app/api/location/current-place/route.ts
- app/api/location/places/route.ts
- app/api/location/update-current/route.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationSavePlaceFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/situation/situationEngine.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- significant_places (read)
- significant_places (update)
- significant_places (write)
- user_location_state (read)

Engine collegati:
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/maintenance/retentionEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/maintenance. Modulo: retentionEngine.

Chi lo chiama:
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- calendar_events (update)
- chat_messages (delete)
- chat_messages (update)
- ghost_proactive_messages (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/memory/memorySearchFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/memory. Modulo: memorySearchFlow.

Chi lo chiama:
- app/api/memory/search/route.ts

Chi chiama:
- lib/ghostme/context/temporalPriority.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- autobiographical_timeline (read)
- conversation_summaries (read)
- episodic_memories (read)
- goals_desires (read)
- life_topics (read)
- memories_active (read)
- topic_links (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/memory/memorySnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/memory. Modulo: memorySnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

Chi chiama:
- lib/ghostme/context/temporalPriority.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- autobiographical_timeline (read)
- conversation_summaries (read)
- episodic_memories (read)
- life_topics (read)
- memories_active (read)
- topic_links (read)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### lib/ghostme/memoryDecay.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: memoryDecay.

Chi lo chiama:
- lib/ghostme/chat/ghostChatOrchestrator.ts

Chi chiama:
- lib/supabase.ts

Tabelle usate:
- life_topics (read)
- life_topics (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/mentalState.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: mentalState.

Chi lo chiama:
- lib/ghostme/chat/chatPostProcessing.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- mental_states (read)
- mental_states (update)
- mental_states (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/observation/observationEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/observation. Modulo: observationEngine.

Chi lo chiama:
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts

Chi chiama:
- lib/ghostme/observation/observationPolicy.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- behavior_patterns (read)
- behavior_patterns (update)
- behavior_patterns (write)
- observation_events (read)
- observation_events (update)
- observation_events (write)
- significant_places (read)
- user_location_state (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/observation/observationInsightEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/observation. Modulo: observationInsightEngine.

Chi lo chiama:
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

Chi chiama:
- lib/ghostme/situation/situationEngine.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- ghost_proactive_messages (read)

Engine collegati:
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/observation/observationPolicy.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/observation. Modulo: observationPolicy.

Chi lo chiama:
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/situation/situationEngine.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/patterns/patternDecay.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/patterns. Modulo: patternDecay.

Chi lo chiama:
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- behavior_patterns (read)
- behavior_patterns (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/patterns/patternInsightEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/patterns. Modulo: patternInsightEngine.

Chi lo chiama:
- lib/ghostme/proactive/proactiveCandidateBuilder.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- behavior_patterns (read)
- ghost_proactive_messages (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/people/peopleGraphLinkService.ts

Tipo: **service**

Stato: **ATTIVO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/people. Modulo: peopleGraphLinkService.

Chi lo chiama:
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- calendar_events (read)
- episodic_memories (read)
- goals_desires (read)
- memories_active (read)
- people_graph (read)
- people_graph_links (read)
- people_graph_links (update)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts

### lib/ghostme/people/peopleGraphService.ts

Tipo: **service**

Stato: **ATTIVO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/people. Modulo: peopleGraphService.

Chi lo chiama:
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts
- lib/ghostme/situation/situationEngine.ts

Chi chiama:
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- life_topics (read)
- memories_active (read)
- people_graph (read)
- people_graph (update)
- people_graph (write)

Engine collegati:
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- lib/ghostme/people/peopleSnapshot.ts

### lib/ghostme/people/peopleSnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/people. Modulo: peopleSnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

Chi chiama:
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- life_topics (read)
- memories_active (read)
- people_graph (read)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### lib/ghostme/people/relationshipMemorySnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/people. Modulo: relationshipMemorySnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts

Chi chiama:
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleSnapshot.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/socialSuggestionSnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts

### lib/ghostme/people/socialSuggestionSnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/people. Modulo: socialSuggestionSnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts

Chi chiama:
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts

### lib/ghostme/proactive/curiosityCardWriter.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: curiosityCardWriter.

Chi lo chiama:
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts

Chi chiama:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/proactive/proactiveMessageDedupe.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- ghost_proactive_messages (read)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts

### lib/ghostme/proactive/dailyBriefingBuilder.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: dailyBriefingBuilder.

Chi lo chiama:
- lib/ghostme/proactive/proactiveUserFlow.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/dailyBriefingRepository.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: dailyBriefingRepository.

Chi lo chiama:
- lib/ghostme/proactive/proactiveUserFlow.ts

Chi chiama:
- lib/ghostme/context/temporalPriority.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- autobiographical_timeline (read)
- behavior_patterns (read)
- calendar_events (read)
- conversation_summaries (read)
- episodic_memories (read)
- goals_desires (read)
- house_events (read)
- house_patterns (read)
- house_suggestions (read)
- life_topics (read)
- mental_states (read)
- significant_places (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/proactiveCandidateBuilder.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: proactiveCandidateBuilder.

Chi lo chiama:
- lib/ghostme/proactive/proactiveUserFlow.ts

Chi chiama:
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/butler/butlerEngine.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- observation_events (read)

Engine collegati:
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/butler/butlerEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/proactiveCandidateRanker.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: proactiveCandidateRanker.

Chi lo chiama:
- lib/ghostme/proactive/proactiveUserFlow.ts

Chi chiama:
- lib/ghostme/proactive/proactiveMessageDedupe.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/proactiveCardLifecycle.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: proactiveCardLifecycle.

Chi lo chiama:
- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/proactiveDecisionEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/proactive. Modulo: proactiveDecisionEngine.

Chi lo chiama:
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveTrigger.ts

Chi chiama:
- lib/ghostme/context/contextBuilder.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/proactiveMaintenanceFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/proactive. Modulo: proactiveMaintenanceFlow.

Chi lo chiama:
- lib/ghostme/proactive/proactiveUserFlow.ts

Chi chiama:
- lib/ghostme/actionLayer.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/maintenance/retentionEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/proactiveMessageDedupe.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: proactiveMessageDedupe.

Chi lo chiama:
- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/ghostme/proactive/proactiveCandidateRanker.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/proactiveMessageService.ts

Tipo: **service**

Stato: **ATTIVO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/proactive. Modulo: proactiveMessageService.

Chi lo chiama:
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

Chi chiama:
- lib/ghostme/proactive/proactiveCardLifecycle.ts
- lib/ghostme/proactive/proactiveMessageDedupe.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- ghost_proactive_messages (read)
- ghost_proactive_messages (update)
- ghost_proactive_messages (write)

Engine collegati:
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/proactiveTrigger.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: proactiveTrigger.

Chi lo chiama:
- lib/ghostme/location/locationUpdateFlow.ts

Chi chiama:
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/proactive/proactiveDecisionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- ghost_proactive_messages (read)

Engine collegati:
- lib/ghostme/proactive/proactiveDecisionEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/proactiveUserFlow.ts

Tipo: **flow**

Stato: **ATTIVO**

Responsabilita: Implementa un workflow applicativo specifico. Area: lib/ghostme/proactive. Modulo: proactiveUserFlow.

Chi lo chiama:
- app/api/ghostme/brain/route.ts
- app/api/worker/proactive/route.ts

Chi chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/ghostme/proactive/dailyBriefingBuilder.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveCandidateRanker.ts
- lib/ghostme/proactive/proactiveMaintenanceFlow.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- ghost_proactive_messages (read)

Engine collegati:
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/proactive/trueProactiveCardWriter.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: trueProactiveCardWriter.

Chi lo chiama:
- lib/ghostme/proactive/proactiveUserFlow.ts

Chi chiama:
- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/ghostme/proactive/proactiveCardLifecycle.ts
- lib/ghostme/proactive/proactiveMessageDedupe.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/trueProactiveSnapshot.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- ghost_proactive_messages (read)

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/proactive/trueProactiveSnapshot.ts

### lib/ghostme/proactive/trueProactiveSnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/proactive. Modulo: trueProactiveSnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts

Chi chiama:
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/context/reasoningService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/context/decisionSnapshot.ts

### lib/ghostme/proactive/visibleProactiveMessages.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/proactive. Modulo: visibleProactiveMessages.

Chi lo chiama:
- app/api/ghostme/brain/route.ts
- app/api/proactive/messages/route.ts

Chi chiama:
- lib/ghostme/proactive/proactiveCardLifecycle.ts
- lib/ghostme/proactive/proactiveMessageDedupe.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- calendar_events (read)
- ghost_proactive_messages (read)
- ghost_proactive_messages (update)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/profile/profileBehaviorSeed.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme/profile. Modulo: profileBehaviorSeed.

Chi lo chiama:
- app/setup/page.tsx

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- dynamic_self_profile (read)
- dynamic_self_profile (update)
- dynamic_self_profile (write)
- ghost_behavior_rules (read)
- ghost_behavior_rules (write)
- traits (read)
- user_profiles (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/projects/goalProjectConsistencySnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/projects. Modulo: goalProjectConsistencySnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts

Chi chiama:
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### lib/ghostme/projects/projectAdvisorSnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/projects. Modulo: projectAdvisorSnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts

Chi chiama:
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/people/relationshipMemorySnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectMemorySnapshot.ts

### lib/ghostme/projects/projectMemorySnapshot.ts

Tipo: **snapshot**

Stato: **ATTIVO**

Responsabilita: Costruisce una vista strutturata dello stato utente/sistema. Area: lib/ghostme/projects. Modulo: projectMemorySnapshot.

Chi lo chiama:
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts

Chi chiama:
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/projects/goalProjectConsistencySnapshot.ts
- lib/ghostme/projects/projectAdvisorSnapshot.ts

### lib/ghostme/relationshipResolver.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: relationshipResolver.

Chi lo chiama:
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts

Chi chiama:
- lib/supabase.ts

Tabelle usate:
- life_topics (delete)
- life_topics (read)
- life_topics (update)
- life_topics (write)
- memories_active (delete)
- memories_active (read)
- memories_active (update)
- memories_active (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/retrieval.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: retrieval.

Chi lo chiama:
- lib/ghostme/chat/chatContextBuilder.ts

Chi chiama:
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/topicLinks.ts
- lib/supabase.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- autobiographical_timeline (read)
- conversation_summaries (read)
- episodic_memories (read)
- life_topics (read)
- memories_active (read)
- topic_links (read)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/services/serviceRouter.ts

Tipo: **service**

Stato: **ATTIVO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/services. Modulo: serviceRouter.

Chi lo chiama:
- lib/ghostme/chat/chatExternalServices.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/services/timeService.ts

Tipo: **service**

Stato: **ORFANO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/services. Modulo: timeService.

Chi lo chiama:
- nessuno

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/services/weatherService.ts

Tipo: **service**

Stato: **ATTIVO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/services. Modulo: weatherService.

Chi lo chiama:
- lib/ghostme/chat/chatExternalServices.ts

Chi chiama:
- lib/ghostme/services/webSearchService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/services/webSearchService.ts

Tipo: **service**

Stato: **ATTIVO**

Responsabilita: Integra servizi o accesso dati specializzato. Area: lib/ghostme/services. Modulo: webSearchService.

Chi lo chiama:
- lib/ghostme/chat/chatExternalServices.ts
- lib/ghostme/services/weatherService.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/situation/situationEngine.ts

Tipo: **engine**

Stato: **ATTIVO**

Responsabilita: Calcola decisioni, insight o trasformazioni cognitive. Area: lib/ghostme/situation. Modulo: situationEngine.

Chi lo chiama:
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/contextSignals.ts
- lib/ghostme/context/reasoningService.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts

Chi chiama:
- lib/ghostme/context/temporalPriority.ts
- lib/ghostme/location/locationStateFreshness.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationPolicy.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/supabaseAdmin.ts

Tabelle usate:
- action_intents (read)
- autobiographical_timeline (read)
- behavior_patterns (read)
- calendar_events (read)
- contradictions (read)
- conversation_summaries (read)
- dynamic_self_profile (read)
- episodic_memories (read)
- ghost_behavior_rules (read)
- goals_desires (read)
- life_topics (read)
- mental_states (read)
- observation_events (read)
- topic_links (read)
- user_profiles (read)

Engine collegati:
- lib/ghostme/agenda/agendaEngine.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts

Snapshot collegati:
- nessuno

### lib/ghostme/timeline.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: timeline.

Chi lo chiama:
- lib/ghostme/chat/chatPostProcessing.ts

Chi chiama:
- lib/supabaseAdmin.ts

Tabelle usate:
- autobiographical_timeline (read)
- autobiographical_timeline (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/topicDetector.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: topicDetector.

Chi lo chiama:
- lib/ghostme/chat/chatMessageAnalyzer.ts
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/entityExtractor.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/topicLinks.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib/ghostme. Modulo: topicLinks.

Chi lo chiama:
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/retrieval.ts

Chi chiama:
- lib/supabase.ts

Tabelle usate:
- life_topics (read)
- topic_links (read)
- topic_links (update)
- topic_links (write)

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/ghostme/ui/brainUiAdapter.ts

Tipo: **adapter**

Stato: **ATTIVO**

Responsabilita: Adatta dati tra domini o verso la UI. Area: lib/ghostme/ui. Modulo: brainUiAdapter.

Chi lo chiama:
- hooks/useGhostBrain.ts

Chi chiama:
- components/ghost/types.ts
- lib/ghostme/context/decisionSnapshot.ts
- lib/ghostme/context/reasoningService.ts

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- lib/ghostme/context/decisionSnapshot.ts

### lib/personality.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib. Modulo: personality.

Chi lo chiama:
- app/chat/page.tsx
- app/setup/page.tsx
- hooks/useGhostBrain.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/supabase.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib. Modulo: supabase.

Chi lo chiama:
- app/api/memory/route.ts
- app/chat/page.tsx
- app/login/page.tsx
- app/memory/page.tsx
- app/setup/page.tsx
- app/setup/profile/page.tsx
- lib/ghostme/auth/clientAuthHeaders.ts
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/relationshipResolver.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/topicLinks.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- nessuno

Snapshot collegati:
- nessuno

### lib/supabaseAdmin.ts

Tipo: **module**

Stato: **ATTIVO**

Responsabilita: Modulo di supporto applicativo. Area: lib. Modulo: supabaseAdmin.

Chi lo chiama:
- app/api/actions/update-status/route.ts
- app/api/ghostme/proactive/read/route.ts
- app/api/goals/update-status/route.ts
- app/api/home-assistant/event/route.ts
- app/api/worker/proactive/route.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/auth/serverAuth.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/contradictions.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/goalsDesires.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseAutomationContext.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts
- lib/ghostme/homeAssistant/houseLearnedRulesContext.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationCurrentStateFlow.ts
- lib/ghostme/location/locationDeletePlaceFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/mentalState.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleSnapshot.ts
- lib/ghostme/proactive/curiosityCardWriter.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/proactiveTrigger.ts
- lib/ghostme/proactive/proactiveUserFlow.ts
- lib/ghostme/proactive/trueProactiveCardWriter.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/timeline.ts

Chi chiama:
- nessuno

Tabelle usate:
- nessuno

Engine collegati:
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/situation/situationEngine.ts

Snapshot collegati:
- lib/ghostme/goals/goalsSnapshot.ts
- lib/ghostme/home/homeComfortRiskSnapshot.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleSnapshot.ts
