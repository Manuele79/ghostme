# SUPABASE_SCHEMA_MAP

Generated: 2026-06-27T23:45:26.143Z

> Nota: questa mappa è generata dal codice. Mostra chi legge/scrive tabelle Supabase e quali colonne vengono richieste nei select.

## Riepilogo

| Tabella/RPC | Reader | Writer | Delete | Colonne lette |
|---|---:|---:|---:|---:|
| action_intents | 10 | 4 | 0 | 28 |
| answers | 1 | 1 | 1 | 1 |
| autobiographical_timeline | 7 | 1 | 0 | 16 |
| behavior_patterns | 7 | 3 | 0 | 16 |
| calendar_events | 8 | 3 | 0 | 12 |
| chat_messages | 2 | 2 | 1 | 5 |
| contradictions | 3 | 1 | 0 | 9 |
| conversation_summaries | 8 | 1 | 0 | 9 |
| dynamic_self_profile | 4 | 2 | 0 | 8 |
| episodic_memories | 8 | 1 | 0 | 8 |
| ghost_behavior_rules | 3 | 2 | 0 | 4 |
| ghost_proactive_messages | 16 | 8 | 0 | 21 |
| goals_desires | 10 | 3 | 0 | 16 |
| house_automation_controls | 3 | 2 | 0 | 11 |
| house_entities | 2 | 2 | 0 | 7 |
| house_events | 13 | 4 | 0 | 11 |
| house_learned_rules | 6 | 2 | 0 | 12 |
| house_patterns | 4 | 1 | 0 | 11 |
| house_suggestions | 4 | 3 | 0 | 9 |
| life_topics | 14 | 3 | 1 | 13 |
| memories_active | 12 | 4 | 2 | 9 |
| mental_states | 3 | 1 | 0 | 1 |
| observation_events | 3 | 1 | 0 | 9 |
| people_graph | 4 | 1 | 0 | 19 |
| people_graph_links | 1 | 1 | 0 | 5 |
| rpc:upsert_people_graph_link | 0 | 1 | 0 | 0 |
| significant_places | 5 | 2 | 1 | 12 |
| topic_links | 5 | 1 | 0 | 2 |
| traits | 3 | 1 | 1 | 2 |
| user_location_state | 8 | 4 | 0 | 9 |
| user_profiles | 6 | 1 | 0 | 9 |
| users | 1 | 1 | 1 | 0 |

## Tabelle / RPC con possibile problema

- **rpc:upsert_people_graph_link** — reader: 0, writer: 1

## Dettaglio

### action_intents

**Reader**

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

**Writer**

- app/api/actions/update-status/route.ts
- app/api/goals/update-status/route.ts
- lib/ghostme/actionLayer.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- "Il goal ha ancora action aperte" }
- "exact"
- *
- 409 }
        );
      }
    }

    const { data
- ["detected"
- actionsError.message }
- completed_at
- created_at
- description
- error } = await supabaseAdmin
      .from
- false
- goalError } = await supabaseAdmin
    .from
- goalId)
        .in
- goalId)
    .in
- goal_id
- id
- id"
- intent_type
- priority
- related_topics
- source_message
- status
- title
- true })
        .eq
- true })
    .eq
- updated_at
- userId)
        .eq
- userId)
    .eq

### answers

**Reader**

- app/setup/page.tsx

**Writer**

- app/setup/page.tsx

**Delete**

- app/setup/page.tsx

**Colonne lette nei select**

- *

### autobiographical_timeline

**Reader**

- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/timeline.ts

**Writer**

- lib/ghostme/timeline.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- category
- description
- emotional_tone
- entity_type
- event_date
- event_type
- importance
- last_mentioned_at
- mention_count
- period_label
- related_topics
- summary
- title
- topic
- weight

### behavior_patterns

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts
- lib/ghostme/patterns/patternInsightEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/patterns/patternDecay.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- confidence
- description
- first_seen_at
- id
- last_seen_at
- latitude
- learned_from
- longitude
- occurrences
- pattern_type
- radius_meters
- status
- title
- trigger_conditions
- updated_at

### calendar_events

**Reader**

- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/maintenance/retentionEngine.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- created_at
- description
- end_at
- id
- remind_at
- start_at
- status
- title
- type
- updated_at
- user_id

### chat_messages

**Reader**

- app/chat/page.tsx
- lib/ghostme/conversationSummary.ts

**Writer**

- app/chat/page.tsx
- lib/ghostme/maintenance/retentionEngine.ts

**Delete**

- lib/ghostme/maintenance/retentionEngine.ts

**Colonne lette nei select**

- content
- created_at
- id
- message_order
- role

### contradictions

**Reader**

- lib/ghostme/contradictions.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- lib/ghostme/contradictions.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- confidence
- descrizione
- new_statement
- old_statement
- status
- tema
- topic
- updated_at

### conversation_summaries

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/conversationSummary.ts
- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- lib/ghostme/conversationSummary.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- emotional_tone
- id
- period_end
- period_start
- summary
- title
- topics
- updated_at

### dynamic_self_profile

**Reader**

- lib/ghostme/curiosity/curiosityEngine.ts
- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- lib/ghostme/dynamicSelfProfile.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- confidence
- description
- id
- last_evidence
- source
- trait
- updated_at

### episodic_memories

**Reader**

- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- lib/ghostme/chat/chatPostProcessing.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- created_at
- emotional_tone
- id
- importance
- related_topics
- summary
- updated_at

### ghost_behavior_rules

**Reader**

- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- lib/ghostme/behavior/behaviorRulesEngine.ts
- lib/ghostme/profile/profileBehaviorSeed.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- confidence
- id
- priority

### ghost_proactive_messages

**Reader**

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

**Writer**

- app/api/ghostme/proactive/read/route.ts
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- "curiosity
- "exact"
- "skipped" as const };
  }

  if
- *
- VISIBLE_PROACTIVE_STATUSES)
      .gte
- category
- created_at
- id
- id"
- logical_key
- message
- priority
- priorityLimit.minimum)
      .lte
- scheduled_for
- status
- title
- true })
      .eq
- updated_at
- userId)
      .eq
- userId)
      .in
- user_id

### goals_desires

**Reader**

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

**Writer**

- app/api/goals/update-status/route.ts
- lib/ghostme/goals/goalsActionsLifecycle.ts
- lib/ghostme/goalsDesires.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- category
- completed_at
- created_at
- description
- emotional_tone
- goal_id
- id
- importance
- needs_review
- related_topics
- review_requested_at
- source_message
- status
- title
- updated_at

### house_automation_controls

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

**Writer**

- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- automation_key
- automation_name
- control_type
- expires_at
- id
- last_action
- last_reason
- room_key
- status
- updated_at

### house_entities

**Reader**

- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts

**Writer**

- app/api/home-assistant/event/route.ts
- lib/ghostme/homeAssistant/houseEntityRegistry.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- can_trigger_event
- entity_id
- entity_name
- entity_type
- is_useful
- room_key
- updated_at

### house_events

**Reader**

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

**Writer**

- app/api/home-assistant/event/route.ts
- lib/ghostme/home/houseWorkerFlow.ts
- lib/ghostme/homeAssistant/homeEventLogger.ts
- lib/ghostme/homeAssistant/houseLightLearningFlow.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- entity_id
- entity_name
- entity_type
- event_type
- id
- new_state
- occurred_at
- people_home_count
- room_key
- value

### house_learned_rules

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/home/houseRouteSnapshot.ts
- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/houseLearnedRulesContext.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

**Writer**

- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- confidence
- confirmations_no
- confirmations_yes
- description
- id
- rule_key
- status
- suggested_action
- title
- trigger_conditions
- updated_at

### house_patterns

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

**Writer**

- lib/ghostme/homeAssistant/housePatternEngine.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- confidence
- description
- first_seen_at
- id
- last_seen_at
- occurrences
- pattern_type
- status
- title
- updated_at

### house_suggestions

**Reader**

- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

**Writer**

- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- entity_id
- entity_name
- entity_type
- event_type
- id
- new_state
- occurred_at
- room_key

### life_topics

**Reader**

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

**Writer**

- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/memoryDecay.ts
- lib/ghostme/relationshipResolver.ts

**Delete**

- lib/ghostme/relationshipResolver.ts

**Colonne lette nei select**

- *
- category
- description
- entity_type
- id
- last_mentioned_at
- mention_count
- notes
- relationship_strength
- status
- topic
- updated_at
- weight

### memories_active

**Reader**

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

**Writer**

- app/api/memory/route.ts
- app/memory/page.tsx
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/relationshipResolver.ts

**Delete**

- app/memory/page.tsx
- lib/ghostme/relationshipResolver.ts

**Colonne lette nei select**

- *
- category
- content
- created_at
- id
- importance
- pinned
- title
- updated_at

### mental_states

**Reader**

- lib/ghostme/mentalState.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- lib/ghostme/mentalState.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *

### observation_events

**Reader**

- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- lib/ghostme/observation/observationEngine.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- category
- context
- event_type
- id
- label
- occurred_at
- place_label
- value

### people_graph

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts
- lib/ghostme/people/peopleSnapshot.ts

**Writer**

- lib/ghostme/people/peopleGraphService.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- category
- confidence
- description
- entity_type
- id
- importance
- last_mentioned_at
- mention_count
- name
- normalized_name
- notes
- relationship_strength
- relationship_type
- source
- status
- topic
- updated_at
- weight

### people_graph_links

**Reader**

- lib/ghostme/people/peopleGraphLinkService.ts

**Writer**

- lib/ghostme/people/peopleGraphLinkService.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- confidence
- id
- name
- normalized_name
- weight

### rpc:upsert_people_graph_link

**Reader**

- Nessuno rilevato

**Writer**

- lib/ghostme/people/peopleGraphLinkService.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- Nessuna colonna specifica rilevata

### significant_places

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

**Writer**

- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/placeService.ts

**Delete**

- lib/ghostme/location/locationDeletePlaceFlow.ts

**Colonne lette nei select**

- *
- address
- category
- confidence
- id
- label
- last_seen_at
- latitude
- longitude
- radius_meters
- updated_at
- visit_count

### topic_links

**Reader**

- lib/ghostme/memory/memorySearchFlow.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/retrieval.ts
- lib/ghostme/situation/situationEngine.ts
- lib/ghostme/topicLinks.ts

**Writer**

- lib/ghostme/topicLinks.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- updated_at

### traits

**Reader**

- app/chat/page.tsx
- app/login/page.tsx
- lib/ghostme/profile/profileBehaviorSeed.ts

**Writer**

- app/setup/page.tsx

**Delete**

- app/setup/page.tsx

**Colonne lette nei select**

- *
- id

### user_location_state

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/home/houseStateSnapshot.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationCurrentStateFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts

**Writer**

- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/locationLearningFlow.ts
- lib/ghostme/location/locationUpdateFlow.ts
- lib/ghostme/location/placeService.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- confidence
- current_place_id
- current_place_label
- last_changed_at
- place_category
- source
- updated_at
- user_id

### user_profiles

**Reader**

- app/api/worker/proactive/route.ts
- app/chat/page.tsx
- app/login/page.tsx
- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/profile/profileBehaviorSeed.ts
- lib/ghostme/situation/situationEngine.ts

**Writer**

- app/setup/profile/page.tsx

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- *
- full_name
- hobbies
- id
- job
- location
- relationship_status
- sports
- user_id

### users

**Reader**

- app/setup/page.tsx

**Writer**

- app/setup/page.tsx

**Delete**

- app/setup/page.tsx

**Colonne lette nei select**

- Nessuna colonna specifica rilevata

