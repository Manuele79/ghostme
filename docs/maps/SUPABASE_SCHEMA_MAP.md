# SUPABASE_SCHEMA_MAP V3

Generated: 2026-06-28T01:30:56.617Z

> Mappa generata dal codice + schema reale noto parziale. Serve per capire chi legge/scrive ogni tabella e trovare query verso colonne inesistenti.

## Riepilogo

| Tabella/RPC | Reader | Writer | Delete | Colonne reali note | Colonne lette | Colonne scritte | Warning |
|---|---:|---:|---:|---:|---:|---:|---|
| action_intents | 10 | 4 | 0 | 0 | 13 | 12 | - |
| answers | 1 | 1 | 1 | 0 | 1 | 21 | - |
| autobiographical_timeline | 7 | 1 | 0 | 16 | 16 | 10 | missing: category |
| behavior_patterns | 7 | 3 | 0 | 0 | 16 | 5 | - |
| calendar_events | 8 | 5 | 0 | 0 | 12 | 3 | - |
| chat_messages | 2 | 3 | 1 | 0 | 5 | 13 | - |
| contradictions | 2 | 1 | 0 | 0 | 9 | 9 | - |
| conversation_summaries | 8 | 1 | 0 | 0 | 9 | 9 | - |
| dynamic_self_profile | 4 | 2 | 0 | 0 | 8 | 6 | - |
| episodic_memories | 8 | 1 | 0 | 0 | 8 | 5 | - |
| ghost_behavior_rules | 3 | 2 | 0 | 0 | 4 | 12 | - |
| ghost_proactive_messages | 16 | 8 | 0 | 12 | 13 | 8 | missing: curiosity |
| goals_desires | 10 | 3 | 0 | 0 | 16 | 12 | - |
| house_automation_controls | 3 | 2 | 0 | 0 | 11 | 7 | - |
| house_entities | 2 | 2 | 0 | 0 | 7 | 9 | - |
| house_events | 13 | 5 | 0 | 0 | 11 | 17 | - |
| house_learned_rules | 6 | 2 | 0 | 0 | 12 | 11 | - |
| house_patterns | 3 | 1 | 0 | 11 | 11 | 2 | - |
| house_suggestions | 3 | 3 | 0 | 9 | 9 | 6 | missing: entity_id, entity_name, entity_type, event_type, new_state, occurred_at |
| life_topics | 14 | 4 | 1 | 0 | 13 | 19 | - |
| memories_active | 11 | 4 | 2 | 0 | 9 | 7 | - |
| mental_states | 3 | 1 | 0 | 0 | 1 | 1 | - |
| observation_events | 3 | 1 | 0 | 10 | 9 | 6 | missing: category, label |
| people_graph | 4 | 1 | 0 | 0 | 19 | 1 | - |
| people_graph_links | 1 | 1 | 0 | 0 | 5 | 2 | - |
| rpc:upsert_people_graph_link | 0 | 1 | 0 | 0 | 0 | 0 | write-only |
| significant_places | 5 | 3 | 1 | 0 | 12 | 19 | - |
| topic_links | 5 | 1 | 0 | 0 | 2 | 6 | - |
| traits | 3 | 1 | 1 | 0 | 2 | 17 | - |
| user_location_state | 8 | 5 | 0 | 12 | 9 | 14 | - |
| user_profiles | 6 | 1 | 0 | 0 | 9 | 7 | - |
| users | 0 | 1 | 1 | 0 | 0 | 4 | write-only |

## Warning principali

### Query verso colonne probabilmente inesistenti

- **autobiographical_timeline**: category
- **ghost_proactive_messages**: curiosity
- **house_suggestions**: entity_id, entity_name, entity_type, event_type, new_state, occurred_at
- **observation_events**: category, label

### Tabelle lette ma mai scritte

- Nessuna

### Tabelle scritte ma mai lette

- rpc:upsert_people_graph_link
- users

## Dettaglio Tabelle/RPC

### action_intents

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

- *
- completed_at
- created_at
- description
- goal_id
- id
- intent_type
- priority
- related_topics
- source_message
- status
- title
- updated_at

**Colonne scritte rilevate**

- completed_at
- description
- goal_id
- intent_type
- needs_review
- priority
- related_topics
- review_requested_at
- source_message
- status
- updated_at
- user_id

**Operazioni rilevate**

- select — app/api/actions/update-status/route.ts — colonne: completed_at, goal_id, id, status, updated_at
- write — app/api/actions/update-status/route.ts — colonne: updated_at
- select — app/api/actions/update-status/route.ts — colonne: completed_at, goal_id, id, status, updated_at
- write — app/api/actions/update-status/route.ts — colonne: updated_at
- select — app/api/goals/update-status/route.ts — colonne: id
- write — app/api/goals/update-status/route.ts — colonne: completed_at
- select — lib/ghostme/actionLayer.ts — colonne: description, intent_type, priority, related_topics, status, title, updated_at
- write — lib/ghostme/actionLayer.ts
- select — lib/ghostme/actionLayer.ts — colonne: *
- write — lib/ghostme/actionLayer.ts — colonne: goal_id, updated_at
- select — lib/ghostme/actionLayer.ts — colonne: description, goal_id, id, intent_type, priority, source_message, title, updated_at
- write — lib/ghostme/actionLayer.ts — colonne: goal_id, updated_at
- select — lib/ghostme/actionLayer.ts — colonne: description, goal_id, id, intent_type, priority, source_message, title, updated_at
- write — lib/ghostme/actionLayer.ts — colonne: description, goal_id, intent_type, priority, related_topics, source_message, status, user_id
- select — lib/ghostme/actionLayer.ts — colonne: description, goal_id, id, intent_type, priority, source_message, title, updated_at
- write — lib/ghostme/actionLayer.ts — colonne: status, updated_at
- select — lib/ghostme/actionLayer.ts — colonne: description, goal_id, id, intent_type, priority, source_message, title, updated_at
- select — lib/ghostme/context/userContextGraph.ts — colonne: description, id, intent_type, priority, status, title, updated_at
- select — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: description, id, related_topics, source_message, title
- write — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: goal_id, updated_at
- select — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: id
- write — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: goal_id, updated_at
- select — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: id
- write — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: needs_review, review_requested_at, updated_at
- select — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: completed_at, goal_id, id, status, updated_at
- write — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: completed_at, status, updated_at
- select — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: completed_at, goal_id, id, status, updated_at
- write — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: completed_at, status, updated_at
- select — lib/ghostme/goals/goalsSnapshot.ts — colonne: *
- select — lib/ghostme/memory/memorySearchFlow.ts — colonne: *
- select — lib/ghostme/people/peopleGraphLinkService.ts — colonne: created_at, description, goal_id, id, priority, related_topics, source_message, status, title, updated_at
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: description, id, intent_type, priority, status, title, updated_at
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: completed_at, description, id, intent_type, status, title, updated_at
- select — lib/ghostme/situation/situationEngine.ts — colonne: *
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### answers

**Colonne reali note**

- Schema reale non ancora registrato nello script

**Reader**

- app/setup/page.tsx

**Writer**

- app/setup/page.tsx

**Delete**

- app/setup/page.tsx

**Colonne lette nei select**

- *

**Colonne scritte rilevate**

- ansia
- bisogno_affetto
- controllo
- email
- empatia
- evitamento
- fiducia
- gelosia
- id
- impulsivita
- name
- onConflict
- orgoglio
- paura_abbandono
- rabbia
- sarcasmo
- sensibilita_critiche
- sincerita
- socialita
- user_id
- vulnerabilita

**Operazioni rilevate**

- select — app/setup/page.tsx — colonne: *
- write — app/setup/page.tsx — colonne: email, id, name, onConflict
- delete — app/setup/page.tsx
- write — app/setup/page.tsx — colonne: ansia, bisogno_affetto, controllo, empatia, evitamento, fiducia, gelosia, impulsivita, orgoglio, paura_abbandono, rabbia, sarcasmo, sensibilita_critiche, sincerita, socialita, user_id, vulnerabilita
- delete — app/setup/page.tsx
- write — app/setup/page.tsx

### autobiographical_timeline

**Colonne reali note**

- id
- user_id
- title
- summary
- description
- event_type
- event_date
- period_label
- topic
- entity_type
- emotional_tone
- importance
- weight
- mention_count
- last_mentioned_at
- related_topics

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

**Colonne scritte rilevate**

- emotional_tone
- event_date
- event_type
- importance
- period_label
- related_topics
- source_message
- summary
- title
- user_id

**ERRORE: colonne richieste ma non presenti nello schema noto**

- category

**Colonne reali note non scritte direttamente**

- id
- description
- topic
- entity_type
- weight
- mention_count
- last_mentioned_at

**Operazioni rilevate**

- select — lib/ghostme/curiosity/curiosityEngine.ts — colonne: emotional_tone, event_date, importance, related_topics, summary, title
- select — lib/ghostme/memory/memorySearchFlow.ts — colonne: *
- select — lib/ghostme/memory/memorySnapshot.ts — colonne: *
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: category, description, entity_type, last_mentioned_at, mention_count, topic, weight
- select — lib/ghostme/retrieval.ts — colonne: emotional_tone, event_date, event_type, importance, period_label, related_topics, summary, title
- select — lib/ghostme/situation/situationEngine.ts — colonne: *
- select — lib/ghostme/timeline.ts — colonne: emotional_tone, event_date, event_type, importance, period_label, related_topics, summary, title
- write — lib/ghostme/timeline.ts — colonne: emotional_tone, event_date, event_type, importance, period_label, related_topics, source_message, summary, title, user_id
- write — lib/ghostme/timeline.ts — colonne: emotional_tone, event_date, event_type, importance, period_label, related_topics, source_message, summary, title, user_id

### behavior_patterns

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- place_id
- place_label
- status
- updated_at
- user_id

**Operazioni rilevate**

- select — lib/ghostme/context/userContextGraph.ts — colonne: confidence, description, id, last_seen_at, occurrences, pattern_type, status, title
- select — lib/ghostme/location/locationLearningFlow.ts — colonne: confidence, first_seen_at, id, last_seen_at, learned_from, occurrences, status, trigger_conditions
- write — lib/ghostme/location/locationLearningFlow.ts — colonne: place_id, place_label, status, updated_at
- select — lib/ghostme/location/locationLearningFlow.ts — colonne: *
- write — lib/ghostme/location/locationLearningFlow.ts — colonne: place_id, place_label, status, updated_at
- select — lib/ghostme/observation/observationEngine.ts — colonne: id
- write — lib/ghostme/observation/observationEngine.ts
- select — lib/ghostme/observation/observationEngine.ts — colonne: latitude, longitude, radius_meters
- write — lib/ghostme/observation/observationEngine.ts
- select — lib/ghostme/observation/observationEngine.ts — colonne: latitude, longitude, radius_meters
- write — lib/ghostme/observation/observationEngine.ts — colonne: user_id
- select — lib/ghostme/observation/observationEngine.ts — colonne: id, trigger_conditions
- write — lib/ghostme/observation/observationEngine.ts
- select — lib/ghostme/observation/observationEngine.ts — colonne: id
- write — lib/ghostme/observation/observationEngine.ts
- select — lib/ghostme/observation/observationEngine.ts — colonne: id
- write — lib/ghostme/observation/observationEngine.ts — colonne: user_id
- write — lib/ghostme/observation/observationEngine.ts — colonne: status, updated_at
- select — lib/ghostme/patterns/patternDecay.ts — colonne: *
- write — lib/ghostme/patterns/patternDecay.ts — colonne: updated_at
- write — lib/ghostme/patterns/patternDecay.ts — colonne: updated_at
- select — lib/ghostme/patterns/patternInsightEngine.ts — colonne: *
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: confidence, description, last_seen_at, pattern_type, status, title, updated_at
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### calendar_events

**Colonne reali note**

- Schema reale non ancora registrato nello script

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
- lib/ghostme/agenda/reminderEngine.ts
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/maintenance/retentionEngine.ts
- lib/ghostme/proactive/visibleProactiveMessages.ts

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

**Colonne scritte rilevate**

- status
- updated_at
- user_id

**Operazioni rilevate**

- select — app/api/ghostme/proactive/read/route.ts — colonne: id, status
- write — app/api/ghostme/proactive/read/route.ts — colonne: status, updated_at
- select — app/api/ghostme/proactive/read/route.ts — colonne: id, status
- write — app/api/ghostme/proactive/read/route.ts — colonne: status, updated_at
- select — lib/ghostme/agenda/reminderEngine.ts — colonne: id, remind_at, title
- write — lib/ghostme/agenda/reminderEngine.ts — colonne: status, updated_at
- select — lib/ghostme/agenda/reminderEngine.ts — colonne: user_id
- select — lib/ghostme/calendar/calendarService.ts — colonne: description, end_at, id, remind_at, start_at, status, title, type
- write — lib/ghostme/calendar/calendarService.ts — colonne: status, updated_at
- select — lib/ghostme/calendar/calendarService.ts — colonne: *
- write — lib/ghostme/calendar/calendarService.ts — colonne: status, user_id
- select — lib/ghostme/calendar/calendarService.ts — colonne: *
- write — lib/ghostme/calendar/calendarService.ts — colonne: updated_at
- select — lib/ghostme/calendar/calendarService.ts — colonne: id
- write — lib/ghostme/calendar/calendarService.ts — colonne: updated_at
- select — lib/ghostme/calendar/calendarService.ts — colonne: id
- write — lib/ghostme/calendar/calendarService.ts — colonne: status, updated_at
- select — lib/ghostme/calendar/calendarService.ts — colonne: *
- write — lib/ghostme/calendar/calendarService.ts — colonne: status, updated_at
- select — lib/ghostme/calendar/calendarService.ts — colonne: id
- write — lib/ghostme/calendar/calendarService.ts — colonne: status, updated_at
- select — lib/ghostme/context/userContextGraph.ts — colonne: description, id, remind_at, start_at, status, title, type
- write — lib/ghostme/maintenance/retentionEngine.ts — colonne: status, updated_at
- select — lib/ghostme/people/peopleGraphLinkService.ts — colonne: created_at, description, id, start_at, status, title, updated_at
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: description, id, remind_at, start_at, status, title, type, updated_at
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: description, id, remind_at, start_at, status, title, type, updated_at
- select — lib/ghostme/proactive/visibleProactiveMessages.ts — colonne: id, remind_at
- write — lib/ghostme/proactive/visibleProactiveMessages.ts — colonne: status, updated_at
- select — lib/ghostme/situation/situationEngine.ts — colonne: *
- select — lib/ghostme/situation/situationEngine.ts — colonne: *
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### chat_messages

**Colonne reali note**

- Schema reale non ancora registrato nello script

**Reader**

- app/chat/page.tsx
- lib/ghostme/conversationSummary.ts

**Writer**

- app/chat/page.tsx
- lib/ghostme/conversationSummary.ts
- lib/ghostme/maintenance/retentionEngine.ts

**Delete**

- lib/ghostme/maintenance/retentionEngine.ts

**Colonne lette nei select**

- content
- created_at
- id
- message_order
- role

**Colonne scritte rilevate**

- content
- emotional_tone
- message_order
- messages_count
- period_end
- period_start
- role
- status
- summary
- title
- topics
- updated_at
- user_id

**Operazioni rilevate**

- write — app/chat/page.tsx — colonne: content, message_order, role, user_id
- select — app/chat/page.tsx — colonne: content, created_at, id, message_order, role
- select — lib/ghostme/conversationSummary.ts — colonne: content, created_at, role
- write — lib/ghostme/conversationSummary.ts — colonne: emotional_tone, messages_count, period_end, period_start, summary, title, topics, updated_at
- write — lib/ghostme/maintenance/retentionEngine.ts — colonne: status, updated_at
- delete — lib/ghostme/maintenance/retentionEngine.ts

### contradictions

**Colonne reali note**

- Schema reale non ancora registrato nello script

**Reader**

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

**Colonne scritte rilevate**

- descrizione
- new_statement
- old_statement
- source_message
- status
- tema
- topic
- updated_at
- user_id

**Operazioni rilevate**

- write — lib/ghostme/contradictions.ts — colonne: descrizione, new_statement, old_statement, source_message, status, tema, topic, updated_at, user_id
- select — lib/ghostme/curiosity/curiosityEngine.ts — colonne: confidence, descrizione, new_statement, old_statement, status, tema, topic, updated_at
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### conversation_summaries

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- emotional_tone
- messages_count
- period_end
- period_start
- summary
- title
- topics
- updated_at
- user_id

**Operazioni rilevate**

- select — lib/ghostme/context/userContextGraph.ts — colonne: emotional_tone, summary, title, topics, updated_at
- select — lib/ghostme/conversationSummary.ts — colonne: id
- write — lib/ghostme/conversationSummary.ts — colonne: emotional_tone, messages_count, period_end, period_start, summary, title, topics, updated_at
- write — lib/ghostme/conversationSummary.ts — colonne: emotional_tone, messages_count, period_end, period_start, summary, title, topics, updated_at
- write — lib/ghostme/conversationSummary.ts — colonne: emotional_tone, messages_count, period_end, period_start, summary, title, topics, user_id
- select — lib/ghostme/curiosity/curiosityEngine.ts — colonne: emotional_tone, period_end, period_start, summary, title, topics, updated_at
- select — lib/ghostme/memory/memorySearchFlow.ts — colonne: *
- select — lib/ghostme/memory/memorySnapshot.ts — colonne: emotional_tone, summary, title, topics, updated_at
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: summary, title, topics, updated_at
- select — lib/ghostme/retrieval.ts — colonne: emotional_tone, period_end, period_start, summary, title, topics, updated_at
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### dynamic_self_profile

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- confidence
- description
- last_evidence
- source
- updated_at
- user_id

**Operazioni rilevate**

- select — lib/ghostme/curiosity/curiosityEngine.ts — colonne: confidence, description, last_evidence, trait, updated_at
- select — lib/ghostme/dynamicSelfProfile.ts — colonne: confidence, description, last_evidence, source, trait, updated_at
- write — lib/ghostme/dynamicSelfProfile.ts — colonne: confidence, description, last_evidence, updated_at
- select — lib/ghostme/dynamicSelfProfile.ts — colonne: confidence, id
- write — lib/ghostme/dynamicSelfProfile.ts — colonne: confidence, description, last_evidence, updated_at
- write — lib/ghostme/dynamicSelfProfile.ts — colonne: confidence, description, last_evidence, updated_at
- write — lib/ghostme/dynamicSelfProfile.ts — colonne: confidence, description, last_evidence, source, user_id
- select — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: confidence, id
- write — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: confidence, source, updated_at
- select — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: *
- write — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: confidence, source, updated_at
- select — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: *
- write — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: last_evidence, source, user_id
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### episodic_memories

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- emotional_tone
- importance
- related_topics
- summary
- user_id

**Operazioni rilevate**

- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: *
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: emotional_tone, importance, related_topics, summary, user_id
- select — lib/ghostme/context/userContextGraph.ts — colonne: created_at, emotional_tone, importance, related_topics, summary
- select — lib/ghostme/memory/memorySearchFlow.ts — colonne: *
- select — lib/ghostme/memory/memorySnapshot.ts — colonne: created_at, emotional_tone, importance, related_topics, summary
- select — lib/ghostme/people/peopleGraphLinkService.ts — colonne: created_at, emotional_tone, id, importance, related_topics, summary, updated_at
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: created_at, related_topics, summary
- select — lib/ghostme/retrieval.ts — colonne: created_at, emotional_tone, importance, related_topics, summary
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### ghost_behavior_rules

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- confidence
- context
- last_applied_at
- priority
- rule_text
- rule_type
- source_message
- status
- target_area
- trigger_hint
- updated_at
- user_id

**Operazioni rilevate**

- select — lib/ghostme/behavior/behaviorRulesEngine.ts — colonne: *
- write — lib/ghostme/behavior/behaviorRulesEngine.ts — colonne: confidence, priority, rule_type, target_area, trigger_hint, updated_at
- select — lib/ghostme/behavior/behaviorRulesEngine.ts — colonne: confidence, id, priority
- write — lib/ghostme/behavior/behaviorRulesEngine.ts — colonne: confidence, priority, rule_type, target_area, trigger_hint, updated_at
- write — lib/ghostme/behavior/behaviorRulesEngine.ts — colonne: confidence, priority, rule_type, target_area, trigger_hint, updated_at
- write — lib/ghostme/behavior/behaviorRulesEngine.ts — colonne: confidence, context, priority, rule_text, rule_type, source_message, status, target_area, trigger_hint, user_id
- write — lib/ghostme/behavior/behaviorRulesEngine.ts — colonne: last_applied_at
- select — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: id
- write — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: confidence, rule_text, rule_type, source_message, status, target_area, user_id
- select — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: confidence, id
- write — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: confidence, rule_text, rule_type, source_message, status, target_area, user_id
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### ghost_proactive_messages

**Colonne reali note**

- id
- user_id
- category
- source
- logical_key
- priority
- status
- title
- message
- scheduled_for
- created_at
- updated_at

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

- *
- category
- created_at
- curiosity
- id
- logical_key
- message
- priority
- scheduled_for
- status
- title
- updated_at
- user_id

**Colonne scritte rilevate**

- answered_at
- expires_at
- last_action
- last_reason
- read_at
- status
- updated_at
- utente

**ERRORE: colonne richieste ma non presenti nello schema noto**

- curiosity

**Colonne reali note non scritte direttamente**

- id
- user_id
- category
- source
- logical_key
- priority
- title
- message
- scheduled_for
- created_at

**Operazioni rilevate**

- select — app/api/ghostme/proactive/read/route.ts — colonne: category, id, logical_key, status
- write — app/api/ghostme/proactive/read/route.ts — colonne: status, updated_at
- select — app/api/ghostme/proactive/read/route.ts — colonne: id, status
- write — app/api/ghostme/proactive/read/route.ts
- select — app/api/ghostme/proactive/read/route.ts — colonne: status
- select — lib/ghostme/agenda/reminderEngine.ts — colonne: created_at, id, logical_key, status
- write — lib/ghostme/agenda/reminderEngine.ts — colonne: status, updated_at
- select — lib/ghostme/agenda/reminderEngine.ts — colonne: user_id
- write — lib/ghostme/agenda/reminderEngine.ts — colonne: status, updated_at
- select — lib/ghostme/agenda/reminderEngine.ts — colonne: user_id
- select — lib/ghostme/calendar/calendarService.ts — colonne: created_at, id, logical_key
- write — lib/ghostme/calendar/calendarService.ts — colonne: status, updated_at
- select — lib/ghostme/calendar/calendarService.ts — colonne: *
- write — lib/ghostme/calendar/calendarService.ts — colonne: status, updated_at
- select — lib/ghostme/context/contextBuilder.ts — colonne: category, created_at, message, title
- select — lib/ghostme/context/userContextGraph.ts — colonne: category, created_at, id, message, priority, status, title
- select — lib/ghostme/context/userContextGraph.ts — colonne: category, created_at, id, message, priority, status, title
- select — lib/ghostme/curiosity/curiosityEngine.ts — colonne: id
- select — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: *
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: expires_at, last_action, last_reason, status, updated_at, utente
- select — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: *
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: answered_at, read_at, status, updated_at
- select — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: *
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: read_at, status
- select — lib/ghostme/location/locationLearningFlow.ts — colonne: id, logical_key, message, status
- select — lib/ghostme/location/locationLearningFlow.ts — colonne: *
- write — lib/ghostme/location/locationLearningFlow.ts — colonne: answered_at, read_at, status, updated_at
- write — lib/ghostme/maintenance/retentionEngine.ts — colonne: status, updated_at
- write — lib/ghostme/maintenance/retentionEngine.ts — colonne: status, updated_at
- select — lib/ghostme/observation/observationInsightEngine.ts — colonne: id
- select — lib/ghostme/observation/observationInsightEngine.ts — colonne: category, created_at, message, title
- select — lib/ghostme/patterns/patternInsightEngine.ts — colonne: id
- select — lib/ghostme/proactive/curiosityCardWriter.ts — colonne: created_at, id, logical_key
- select — lib/ghostme/proactive/proactiveMessageService.ts — colonne: category, id, logical_key, message, status, title
- write — lib/ghostme/proactive/proactiveMessageService.ts
- select — lib/ghostme/proactive/proactiveMessageService.ts — colonne: category, id, message, status, title
- write — lib/ghostme/proactive/proactiveMessageService.ts
- select — lib/ghostme/proactive/proactiveMessageService.ts — colonne: id
- write — lib/ghostme/proactive/proactiveMessageService.ts
- select — lib/ghostme/proactive/proactiveMessageService.ts — colonne: id
- write — lib/ghostme/proactive/proactiveMessageService.ts
- select — lib/ghostme/proactive/proactiveMessageService.ts — colonne: id
- write — lib/ghostme/proactive/proactiveMessageService.ts
- select — lib/ghostme/proactive/proactiveMessageService.ts — colonne: id
- write — lib/ghostme/proactive/proactiveMessageService.ts
- select — lib/ghostme/proactive/proactiveMessageService.ts — colonne: curiosity, id
- write — lib/ghostme/proactive/proactiveMessageService.ts
- write — lib/ghostme/proactive/proactiveMessageService.ts
- write — lib/ghostme/proactive/proactiveMessageService.ts
- write — lib/ghostme/proactive/proactiveMessageService.ts
- select — lib/ghostme/proactive/proactiveTrigger.ts — colonne: id
- select — lib/ghostme/proactive/proactiveUserFlow.ts — colonne: id
- select — lib/ghostme/proactive/proactiveUserFlow.ts — colonne: id
- select — lib/ghostme/proactive/trueProactiveCardWriter.ts — colonne: priority
- select — lib/ghostme/proactive/visibleProactiveMessages.ts — colonne: category, created_at, id, logical_key, scheduled_for, updated_at
- select — lib/ghostme/proactive/visibleProactiveMessages.ts — colonne: *
- write — lib/ghostme/proactive/visibleProactiveMessages.ts — colonne: status, updated_at
- select — lib/ghostme/proactive/visibleProactiveMessages.ts — colonne: *
- write — lib/ghostme/proactive/visibleProactiveMessages.ts — colonne: status, updated_at
- write — lib/ghostme/proactive/visibleProactiveMessages.ts — colonne: status, updated_at

### goals_desires

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- category
- completed_at
- description
- emotional_tone
- importance
- needs_review
- related_topics
- review_requested_at
- source_message
- status
- updated_at
- user_id

**Operazioni rilevate**

- select — app/api/goals/update-status/route.ts — colonne: completed_at, id, needs_review, review_requested_at, status
- write — app/api/goals/update-status/route.ts — colonne: needs_review, review_requested_at, updated_at
- select — app/api/goals/update-status/route.ts — colonne: id
- write — app/api/goals/update-status/route.ts — colonne: needs_review, review_requested_at, updated_at
- select — app/api/goals/update-status/route.ts — colonne: completed_at, id, needs_review, review_requested_at, status
- write — app/api/goals/update-status/route.ts — colonne: completed_at
- select — lib/ghostme/context/userContextGraph.ts — colonne: category, description, id, importance, status, title, updated_at
- select — lib/ghostme/curiosity/curiosityEngine.ts — colonne: category, description, emotional_tone, importance, related_topics, status, title, updated_at
- select — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: id
- write — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: needs_review, review_requested_at, updated_at
- select — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: description, id, related_topics, source_message, title
- write — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: needs_review, review_requested_at, updated_at
- select — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: description, id, related_topics, source_message, title
- write — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: needs_review, review_requested_at, updated_at
- select — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: completed_at, goal_id, id, status, updated_at
- write — lib/ghostme/goals/goalsActionsLifecycle.ts — colonne: needs_review, review_requested_at, updated_at
- select — lib/ghostme/goals/goalsSnapshot.ts — colonne: *
- select — lib/ghostme/goals/goalsSnapshot.ts — colonne: *
- select — lib/ghostme/goalsDesires.ts — colonne: category, description, emotional_tone, importance, related_topics, status, title, updated_at
- select — lib/ghostme/goalsDesires.ts — colonne: id, importance, status
- write — lib/ghostme/goalsDesires.ts — colonne: category, description, emotional_tone, importance, related_topics, source_message, status, updated_at
- write — lib/ghostme/goalsDesires.ts — colonne: category, description, emotional_tone, importance, related_topics, source_message, status, updated_at
- write — lib/ghostme/goalsDesires.ts — colonne: category, description, emotional_tone, importance, related_topics, source_message, status, user_id
- select — lib/ghostme/memory/memorySearchFlow.ts — colonne: *
- select — lib/ghostme/people/peopleGraphLinkService.ts — colonne: created_at, description, id, importance, related_topics, source_message, status, title, updated_at
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: category, description, importance, status, title, updated_at
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### house_automation_controls

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- expires_at
- last_action
- last_reason
- onConflict
- status
- updated_at
- utente

**Operazioni rilevate**

- select — lib/ghostme/context/userContextGraph.ts — colonne: automation_key, automation_name, control_type, expires_at, id, last_action, last_reason, room_key, status, updated_at
- select — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: automation_key, control_type, id, last_reason, status
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: expires_at, last_action, last_reason, status, updated_at, utente
- select — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: *
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: expires_at, last_action, last_reason, status, updated_at, utente
- select — lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts — colonne: id, status
- write — lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts — colonne: onConflict
- write — lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts — colonne: onConflict
- write — lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts — colonne: expires_at, status, updated_at
- write — lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts — colonne: expires_at, status, updated_at

### house_entities

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- can_trigger_event
- entity_id
- entity_name
- entity_type
- is_useful
- onConflict
- room_key
- updated_at
- user_id

**Operazioni rilevate**

- write — app/api/home-assistant/event/route.ts — colonne: can_trigger_event, entity_id, entity_name, entity_type, is_useful, room_key, updated_at, user_id
- select — lib/ghostme/home/houseStateSnapshot.ts — colonne: entity_id, entity_name, entity_type, room_key, updated_at
- select — lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts — colonne: can_trigger_event, entity_id, entity_name, entity_type, is_useful, room_key, updated_at
- write — lib/ghostme/homeAssistant/houseEntityRegistry.ts — colonne: onConflict

### house_events

**Colonne reali note**

- Schema reale non ancora registrato nello script

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
- lib/ghostme/homeAssistant/houseRouteLearningEngine.ts

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

**Colonne scritte rilevate**

- can_trigger_event
- entity_id
- entity_name
- entity_type
- event_type
- is_useful
- new_state
- observed_results
- occurred_at
- old_state
- people_home_count
- room_key
- source
- target_user
- updated_at
- user_id
- value

**Operazioni rilevate**

- select — app/api/home-assistant/event/route.ts — colonne: event_type, id, new_state, occurred_at
- write — app/api/home-assistant/event/route.ts — colonne: can_trigger_event, entity_id, entity_name, entity_type, is_useful, room_key, updated_at, user_id
- select — app/api/home-assistant/event/route.ts — colonne: entity_id, occurred_at, room_key
- write — app/api/home-assistant/event/route.ts — colonne: can_trigger_event, entity_id, entity_name, entity_type, is_useful, room_key, updated_at, user_id
- select — app/api/home-assistant/event/route.ts — colonne: occurred_at
- write — app/api/home-assistant/event/route.ts — colonne: can_trigger_event, entity_id, entity_name, entity_type, is_useful, room_key, updated_at, user_id
- select — lib/ghostme/home/homeComfortRiskSnapshot.ts — colonne: entity_id, entity_name, entity_type, event_type, new_state, occurred_at, room_key, value
- select — lib/ghostme/home/houseRouteSnapshot.ts — colonne: event_type, occurred_at, room_key
- select — lib/ghostme/home/houseStateSnapshot.ts — colonne: entity_id, entity_name, entity_type, event_type, new_state, occurred_at, room_key, value
- select — lib/ghostme/home/houseWorkerFlow.ts — colonne: entity_id, event_type, id, occurred_at, value
- write — lib/ghostme/home/houseWorkerFlow.ts
- select — lib/ghostme/home/houseWorkerFlow.ts — colonne: id
- write — lib/ghostme/home/houseWorkerFlow.ts
- write — lib/ghostme/home/houseWorkerFlow.ts — colonne: people_home_count
- select — lib/ghostme/homeAssistant/homeEventLogger.ts — colonne: entity_name, id, value
- write — lib/ghostme/homeAssistant/homeEventLogger.ts — colonne: observed_results, value
- select — lib/ghostme/homeAssistant/homeEventLogger.ts — colonne: id
- write — lib/ghostme/homeAssistant/homeEventLogger.ts — colonne: observed_results, value
- select — lib/ghostme/homeAssistant/homeEventLogger.ts — colonne: id
- write — lib/ghostme/homeAssistant/homeEventLogger.ts — colonne: entity_id, entity_name, entity_type, event_type, new_state, occurred_at, old_state, people_home_count, room_key, source, target_user, user_id
- select — lib/ghostme/homeAssistant/homeEventLogger.ts — colonne: event_type, id, new_state, occurred_at
- write — lib/ghostme/homeAssistant/homeEventLogger.ts
- select — lib/ghostme/homeAssistant/houseAutomationContext.ts — colonne: entity_id, entity_name, room_key
- select — lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts — colonne: entity_id, entity_name, entity_type, event_type, new_state, occurred_at, people_home_count, room_key
- select — lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts — colonne: entity_id, entity_name, entity_type, event_type, new_state, occurred_at, room_key
- select — lib/ghostme/homeAssistant/houseLightLearningFlow.ts — colonne: id
- write — lib/ghostme/homeAssistant/houseLightLearningFlow.ts — colonne: source
- select — lib/ghostme/homeAssistant/houseLightLearningFlow.ts — colonne: id
- write — lib/ghostme/homeAssistant/houseLightLearningFlow.ts — colonne: source
- select — lib/ghostme/homeAssistant/houseLightLearningFlow.ts — colonne: id
- select — lib/ghostme/homeAssistant/housePatternEngine.ts — colonne: *
- select — lib/ghostme/homeAssistant/houseRouteLearningEngine.ts — colonne: event_type, occurred_at, people_home_count, room_key
- write — lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: entity_name, entity_type, event_type, new_state, occurred_at, room_key

### house_learned_rules

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- confidence
- confirmations_no
- confirmations_yes
- description
- rule_key
- status
- suggested_action
- title
- trigger_conditions
- updated_at
- user_id

**Operazioni rilevate**

- select — lib/ghostme/context/userContextGraph.ts — colonne: confidence, description, id, rule_key, status, title, updated_at
- select — lib/ghostme/home/houseRouteSnapshot.ts — colonne: confidence, rule_key, status, title, trigger_conditions, updated_at
- select — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: *
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: confidence, confirmations_no, confirmations_yes, description, status, suggested_action, title, trigger_conditions, updated_at
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: confidence, confirmations_no, confirmations_yes, description, status, suggested_action, title, trigger_conditions, updated_at
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: confidence, confirmations_no, confirmations_yes, description, rule_key, status, suggested_action, title, trigger_conditions, user_id
- select — lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts — colonne: confidence, rule_key, status, title, trigger_conditions, updated_at
- select — lib/ghostme/homeAssistant/houseLearnedRulesContext.ts — colonne: confidence, confirmations_no, confirmations_yes, description, rule_key, status, suggested_action, title, trigger_conditions, updated_at
- select — lib/ghostme/homeAssistant/houseRouteLearningEngine.ts — colonne: confirmations_no, confirmations_yes, id
- write — lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- write — lib/ghostme/homeAssistant/houseRouteLearningEngine.ts
- write — lib/ghostme/homeAssistant/houseRouteLearningEngine.ts — colonne: confirmations_no, confirmations_yes

### house_patterns

**Colonne reali note**

- id
- user_id
- pattern_type
- title
- description
- confidence
- status
- occurrences
- first_seen_at
- last_seen_at
- updated_at

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts
- lib/ghostme/homeAssistant/housePatternEngine.ts

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

**Colonne scritte rilevate**

- first_seen_at
- user_id

**Colonne reali note non scritte direttamente**

- id
- pattern_type
- title
- description
- confidence
- status
- occurrences
- last_seen_at
- updated_at

**Operazioni rilevate**

- select — lib/ghostme/context/userContextGraph.ts — colonne: confidence, description, id, last_seen_at, occurrences, pattern_type, status, title, updated_at
- select — lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts — colonne: confidence, description, last_seen_at, occurrences, pattern_type, status, title
- select — lib/ghostme/homeAssistant/housePatternEngine.ts — colonne: first_seen_at, id
- write — lib/ghostme/homeAssistant/housePatternEngine.ts
- select — lib/ghostme/homeAssistant/housePatternEngine.ts — colonne: *
- write — lib/ghostme/homeAssistant/housePatternEngine.ts
- select — lib/ghostme/homeAssistant/housePatternEngine.ts — colonne: *
- write — lib/ghostme/homeAssistant/housePatternEngine.ts — colonne: first_seen_at, user_id

### house_suggestions

**Colonne reali note**

- id
- user_id
- title
- message
- suggestion_type
- room_key
- confidence
- status
- created_at

**Reader**

- lib/ghostme/home/houseSuggestionResponseFlow.ts
- lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts
- lib/ghostme/homeAssistant/houseSuggestionEngine.ts

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

**Colonne scritte rilevate**

- response_at
- room_key
- status
- suggestion_type
- user_id
- user_response

**ERRORE: colonne richieste ma non presenti nello schema noto**

- entity_id
- entity_name
- entity_type
- event_type
- new_state
- occurred_at

**Colonne reali note non scritte direttamente**

- id
- title
- message
- confidence
- created_at

**Operazioni rilevate**

- select — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: *
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: response_at, status, user_response
- select — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: *
- write — lib/ghostme/home/houseSuggestionResponseFlow.ts — colonne: response_at, status, user_response
- select — lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts — colonne: id
- write — lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts — colonne: room_key, status, suggestion_type, user_id
- select — lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts — colonne: id
- write — lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts — colonne: room_key, status, suggestion_type, user_id
- select — lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts — colonne: entity_id, entity_name, entity_type, event_type, new_state, occurred_at, room_key
- write — lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts — colonne: room_key, status, suggestion_type, user_id
- select — lib/ghostme/homeAssistant/houseSuggestionEngine.ts — colonne: id
- write — lib/ghostme/homeAssistant/houseSuggestionEngine.ts — colonne: room_key, status, suggestion_type, user_id
- select — lib/ghostme/homeAssistant/houseSuggestionEngine.ts — colonne: id
- write — lib/ghostme/homeAssistant/houseSuggestionEngine.ts — colonne: room_key, status, suggestion_type, user_id
- write — lib/ghostme/homeAssistant/houseSuggestionEngine.ts — colonne: room_key, status, suggestion_type, user_id

### life_topics

**Colonne reali note**

- Schema reale non ancora registrato nello script

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
- lib/ghostme/contradictions.ts
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

**Colonne scritte rilevate**

- category
- clarification_asked
- description
- entity_type
- last_emotional_tone
- last_mentioned_at
- mention_count
- needs_clarification
- negative_count
- neutral_count
- notes
- positive_count
- relationship_strength
- status
- topic
- true
- updated_at
- user_id
- weight

**Operazioni rilevate**

- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: *
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: category, clarification_asked, description, entity_type, last_mentioned_at, mention_count, needs_clarification, relationship_strength, status, true, weight
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: *
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: category, clarification_asked, description, entity_type, last_mentioned_at, mention_count, needs_clarification, relationship_strength, status, true, weight
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: *
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: category, clarification_asked, description, entity_type, last_mentioned_at, mention_count, needs_clarification, notes, relationship_strength, status, topic, user_id, weight
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: *
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: last_emotional_tone, negative_count, neutral_count, positive_count, relationship_strength, updated_at
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: *
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: last_emotional_tone, negative_count, neutral_count, positive_count, relationship_strength, updated_at
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: *
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: category, clarification_asked, description, entity_type, needs_clarification, status, updated_at
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: id
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: category, clarification_asked, description, entity_type, needs_clarification, status, updated_at
- select — lib/ghostme/context/userContextGraph.ts — colonne: category, description, entity_type, mention_count, relationship_strength, topic, weight
- select — lib/ghostme/contradictions.ts — colonne: category, description, entity_type, topic
- write — lib/ghostme/contradictions.ts
- select — lib/ghostme/curiosity/curiosityEngine.ts — colonne: category, description, entity_type, last_mentioned_at, mention_count, relationship_strength, status, topic, weight
- select — lib/ghostme/memory/memorySearchFlow.ts — colonne: *
- select — lib/ghostme/memory/memorySnapshot.ts — colonne: category, description, entity_type, last_mentioned_at, mention_count, relationship_strength, status, topic, updated_at, weight
- select — lib/ghostme/memoryDecay.ts — colonne: *
- write — lib/ghostme/memoryDecay.ts — colonne: relationship_strength, status, updated_at, weight
- write — lib/ghostme/memoryDecay.ts — colonne: relationship_strength, status, updated_at, weight
- select — lib/ghostme/people/peopleGraphService.ts — colonne: category, description, entity_type, id, last_mentioned_at, mention_count, notes, relationship_strength, topic, updated_at, weight
- select — lib/ghostme/people/peopleSnapshot.ts — colonne: category, description, entity_type, last_mentioned_at, mention_count, notes, relationship_strength, topic, updated_at, weight
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: category, description, entity_type, last_mentioned_at, mention_count, topic, weight
- select — lib/ghostme/relationshipResolver.ts — colonne: id
- write — lib/ghostme/relationshipResolver.ts — colonne: category, clarification_asked, entity_type, needs_clarification, status, updated_at
- delete — lib/ghostme/relationshipResolver.ts
- select — lib/ghostme/relationshipResolver.ts — colonne: id
- write — lib/ghostme/relationshipResolver.ts — colonne: category, clarification_asked, entity_type, needs_clarification, status, updated_at
- delete — lib/ghostme/relationshipResolver.ts
- select — lib/ghostme/relationshipResolver.ts — colonne: id
- write — lib/ghostme/relationshipResolver.ts — colonne: category, clarification_asked, entity_type, last_mentioned_at, mention_count, needs_clarification, relationship_strength, status, topic, user_id, weight
- delete — lib/ghostme/relationshipResolver.ts
- delete — lib/ghostme/relationshipResolver.ts
- select — lib/ghostme/retrieval.ts — colonne: category, description, entity_type, last_mentioned_at, mention_count, relationship_strength, status, topic, updated_at, weight
- select — lib/ghostme/situation/situationEngine.ts — colonne: category, description, entity_type, last_mentioned_at, mention_count, relationship_strength, status, topic, weight
- select — lib/ghostme/topicLinks.ts — colonne: category, description, entity_type, mention_count, relationship_strength, topic, weight

### memories_active

**Colonne reali note**

- Schema reale non ancora registrato nello script

**Reader**

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

**Colonne scritte rilevate**

- category
- content
- importance
- pinned
- title
- updated_at
- user_id

**Operazioni rilevate**

- write — app/api/memory/route.ts
- select — app/memory/page.tsx — colonne: *
- write — app/memory/page.tsx — colonne: pinned, updated_at
- delete — app/memory/page.tsx
- write — app/memory/page.tsx — colonne: pinned, updated_at
- delete — app/memory/page.tsx
- write — app/memory/page.tsx — colonne: pinned, updated_at
- write — app/memory/page.tsx — colonne: importance, updated_at
- write — app/memory/page.tsx — colonne: category, content, importance, title, user_id
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: content, id
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: importance, updated_at
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: *
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: importance, updated_at
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: *
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: category, content, importance, title, user_id
- select — lib/ghostme/chat/chatPostProcessing.ts — colonne: id
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: category, content, importance, pinned, updated_at
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: category, content, importance, pinned, updated_at
- write — lib/ghostme/chat/chatPostProcessing.ts — colonne: category, content, importance, pinned, title, user_id
- select — lib/ghostme/context/userContextGraph.ts — colonne: category, content, importance, pinned, title, updated_at
- select — lib/ghostme/contradictions.ts — colonne: category, content, title
- select — lib/ghostme/memory/memorySearchFlow.ts — colonne: *
- select — lib/ghostme/memory/memorySnapshot.ts — colonne: category, content, importance, pinned, title, updated_at
- select — lib/ghostme/people/peopleGraphLinkService.ts — colonne: category, content, created_at, id, importance, pinned, title, updated_at
- select — lib/ghostme/people/peopleGraphService.ts — colonne: category, content, id, importance, pinned, title, updated_at
- select — lib/ghostme/people/peopleSnapshot.ts — colonne: category, content, importance, pinned, title, updated_at
- select — lib/ghostme/relationshipResolver.ts — colonne: id
- write — lib/ghostme/relationshipResolver.ts — colonne: category, content, importance, pinned, updated_at
- delete — lib/ghostme/relationshipResolver.ts
- write — lib/ghostme/relationshipResolver.ts — colonne: category, content, importance, pinned, updated_at
- delete — lib/ghostme/relationshipResolver.ts
- write — lib/ghostme/relationshipResolver.ts — colonne: category, content, importance, pinned, title, user_id
- delete — lib/ghostme/relationshipResolver.ts
- select — lib/ghostme/retrieval.ts — colonne: category, content, importance, pinned, title, updated_at

### mental_states

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- user_id

**Operazioni rilevate**

- select — lib/ghostme/mentalState.ts — colonne: *
- write — lib/ghostme/mentalState.ts
- write — lib/ghostme/mentalState.ts — colonne: user_id
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: *
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### observation_events

**Colonne reali note**

- id
- user_id
- event_type
- source
- place_label
- place_id
- value
- context
- occurred_at
- created_at

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

**Colonne scritte rilevate**

- candidate_place_id
- context
- observation_text
- occurred_at
- place_id
- place_label

**ERRORE: colonne richieste ma non presenti nello schema noto**

- category
- label

**Colonne reali note non scritte direttamente**

- id
- user_id
- event_type
- source
- value
- created_at

**Operazioni rilevate**

- select — lib/ghostme/observation/observationEngine.ts — colonne: *
- write — lib/ghostme/observation/observationEngine.ts — colonne: context, occurred_at, place_id, place_label
- select — lib/ghostme/observation/observationEngine.ts — colonne: category, id, label
- write — lib/ghostme/observation/observationEngine.ts — colonne: context, occurred_at, place_id, place_label
- select — lib/ghostme/observation/observationEngine.ts — colonne: category, id, label
- write — lib/ghostme/observation/observationEngine.ts
- select — lib/ghostme/observation/observationEngine.ts — colonne: *
- write — lib/ghostme/observation/observationEngine.ts — colonne: candidate_place_id, context, observation_text
- select — lib/ghostme/observation/observationEngine.ts — colonne: *
- select — lib/ghostme/proactive/proactiveCandidateBuilder.ts — colonne: context, event_type, occurred_at, place_label, value
- select — lib/ghostme/situation/situationEngine.ts — colonne: *

### people_graph

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- updated_at

**Operazioni rilevate**

- select — lib/ghostme/context/userContextGraph.ts — colonne: description, id, importance, mention_count, name, relationship_type
- select — lib/ghostme/people/peopleGraphLinkService.ts — colonne: id, name, normalized_name
- select — lib/ghostme/people/peopleGraphService.ts — colonne: category, confidence, description, id, importance, last_mentioned_at, mention_count, name, normalized_name, relationship_type, source, status, updated_at
- write — lib/ghostme/people/peopleGraphService.ts — colonne: updated_at
- select — lib/ghostme/people/peopleGraphService.ts — colonne: category, description, entity_type, id, last_mentioned_at, mention_count, notes, relationship_strength, topic, updated_at, weight
- write — lib/ghostme/people/peopleGraphService.ts — colonne: updated_at
- select — lib/ghostme/people/peopleGraphService.ts — colonne: category, description, entity_type, id, last_mentioned_at, mention_count, notes, relationship_strength, topic, updated_at, weight
- write — lib/ghostme/people/peopleGraphService.ts — colonne: updated_at
- select — lib/ghostme/people/peopleGraphService.ts — colonne: *
- select — lib/ghostme/people/peopleSnapshot.ts — colonne: *

### people_graph_links

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- last_decayed_at
- updated_at

**Operazioni rilevate**

- select — lib/ghostme/people/peopleGraphLinkService.ts — colonne: id, name, normalized_name
- select — lib/ghostme/people/peopleGraphLinkService.ts — colonne: id, name, normalized_name
- select — lib/ghostme/people/peopleGraphLinkService.ts — colonne: confidence, id, weight
- write — lib/ghostme/people/peopleGraphLinkService.ts — colonne: last_decayed_at, updated_at
- write — lib/ghostme/people/peopleGraphLinkService.ts — colonne: last_decayed_at, updated_at

### rpc:upsert_people_graph_link

**Colonne reali note**

- Schema reale non ancora registrato nello script

**Reader**

- Nessuno rilevato

**Writer**

- lib/ghostme/people/peopleGraphLinkService.ts

**Delete**

- Nessuno rilevato

**Colonne lette nei select**

- Nessuna colonna specifica rilevata

**Colonne scritte rilevate**

- Nessuna colonna scritta rilevata automaticamente

**Operazioni rilevate**

- rpc — lib/ghostme/people/peopleGraphLinkService.ts

### significant_places

**Colonne reali note**

- Schema reale non ancora registrato nello script

**Reader**

- lib/ghostme/context/userContextGraph.ts
- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

**Writer**

- lib/ghostme/location/haLocationBridgeFlow.ts
- lib/ghostme/location/placeService.ts
- lib/ghostme/observation/observationEngine.ts

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

**Colonne scritte rilevate**

- address
- category
- confidence
- current_place_id
- current_place_label
- external_category
- external_name
- label
- last_changed_at
- last_seen_at
- now
- onConflict
- place_category
- radius_meters
- source
- status
- updated_at
- user_id
- visit_count

**Operazioni rilevate**

- select — lib/ghostme/context/userContextGraph.ts — colonne: address, category, id, label, last_seen_at, visit_count
- select — lib/ghostme/location/haLocationBridgeFlow.ts — colonne: address, category, id, label
- write — lib/ghostme/location/haLocationBridgeFlow.ts — colonne: address, confidence, current_place_id, current_place_label, last_changed_at, now, onConflict, place_category, source, updated_at, user_id
- delete — lib/ghostme/location/locationDeletePlaceFlow.ts
- select — lib/ghostme/location/placeService.ts — colonne: *
- write — lib/ghostme/location/placeService.ts — colonne: category, confidence, external_category, external_name, label, last_seen_at, radius_meters, status, user_id
- select — lib/ghostme/location/placeService.ts — colonne: *
- write — lib/ghostme/location/placeService.ts — colonne: last_seen_at, visit_count
- select — lib/ghostme/location/placeService.ts — colonne: *
- write — lib/ghostme/location/placeService.ts — colonne: last_seen_at, visit_count
- write — lib/ghostme/location/placeService.ts — colonne: external_name, label, updated_at
- select — lib/ghostme/observation/observationEngine.ts — colonne: category, id, label
- write — lib/ghostme/observation/observationEngine.ts
- select — lib/ghostme/observation/observationEngine.ts — colonne: category, id, label
- write — lib/ghostme/observation/observationEngine.ts
- select — lib/ghostme/observation/observationEngine.ts — colonne: latitude, longitude, radius_meters
- write — lib/ghostme/observation/observationEngine.ts
- select — lib/ghostme/proactive/dailyBriefingRepository.ts — colonne: address, category, confidence, label, last_seen_at, updated_at, visit_count

### topic_links

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- link_type
- source_topic
- target_topic
- updated_at
- user_id
- weight

**Operazioni rilevate**

- select — lib/ghostme/memory/memorySearchFlow.ts — colonne: *
- select — lib/ghostme/memory/memorySnapshot.ts — colonne: updated_at
- select — lib/ghostme/retrieval.ts — colonne: *
- select — lib/ghostme/situation/situationEngine.ts — colonne: *
- select — lib/ghostme/topicLinks.ts — colonne: *
- write — lib/ghostme/topicLinks.ts — colonne: updated_at, weight
- select — lib/ghostme/topicLinks.ts — colonne: *
- write — lib/ghostme/topicLinks.ts — colonne: updated_at, weight
- select — lib/ghostme/topicLinks.ts — colonne: *
- write — lib/ghostme/topicLinks.ts — colonne: link_type, source_topic, target_topic, user_id, weight
- select — lib/ghostme/topicLinks.ts — colonne: *

### traits

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- ansia
- bisogno_affetto
- controllo
- empatia
- evitamento
- fiducia
- gelosia
- impulsivita
- orgoglio
- paura_abbandono
- rabbia
- sarcasmo
- sensibilita_critiche
- sincerita
- socialita
- user_id
- vulnerabilita

**Operazioni rilevate**

- select — app/chat/page.tsx — colonne: *
- select — app/login/page.tsx — colonne: id
- write — app/setup/page.tsx — colonne: ansia, bisogno_affetto, controllo, empatia, evitamento, fiducia, gelosia, impulsivita, orgoglio, paura_abbandono, rabbia, sarcasmo, sensibilita_critiche, sincerita, socialita, user_id, vulnerabilita
- delete — app/setup/page.tsx
- write — app/setup/page.tsx — colonne: ansia, bisogno_affetto, controllo, empatia, evitamento, fiducia, gelosia, impulsivita, orgoglio, paura_abbandono, rabbia, sarcasmo, sensibilita_critiche, sincerita, socialita, user_id, vulnerabilita
- select — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: *

### user_location_state

**Colonne reali note**

- user_id
- current_place_id
- current_place_label
- latitude
- longitude
- source
- updated_at
- place_category
- address
- accuracy
- last_changed_at
- confidence

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
- lib/ghostme/observation/observationEngine.ts

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

**Colonne scritte rilevate**

- accuracy
- address
- confidence
- current_place_id
- current_place_label
- external_name
- label
- last_changed_at
- now
- onConflict
- place_category
- source
- updated_at
- user_id

**Colonne reali note non scritte direttamente**

- latitude
- longitude

**Operazioni rilevate**

- select — lib/ghostme/context/userContextGraph.ts — colonne: *
- select — lib/ghostme/home/houseStateSnapshot.ts — colonne: confidence, current_place_label, last_changed_at, place_category, source, updated_at, user_id
- select — lib/ghostme/location/haLocationBridgeFlow.ts — colonne: current_place_id, current_place_label, last_changed_at, place_category, source, updated_at
- write — lib/ghostme/location/haLocationBridgeFlow.ts — colonne: address, confidence, current_place_id, current_place_label, last_changed_at, now, onConflict, place_category, source, updated_at, user_id
- write — lib/ghostme/location/haLocationBridgeFlow.ts — colonne: address, confidence, current_place_id, current_place_label, last_changed_at, now, onConflict, place_category, source, updated_at, user_id
- select — lib/ghostme/location/locationCurrentStateFlow.ts — colonne: *
- select — lib/ghostme/location/locationLearningFlow.ts — colonne: *
- write — lib/ghostme/location/locationLearningFlow.ts — colonne: current_place_id, current_place_label, place_category, updated_at
- write — lib/ghostme/location/locationLearningFlow.ts — colonne: current_place_id, current_place_label, place_category, updated_at
- select — lib/ghostme/location/locationUpdateFlow.ts — colonne: *
- write — lib/ghostme/location/locationUpdateFlow.ts — colonne: accuracy, address, confidence, current_place_id, current_place_label, last_changed_at, now, onConflict, place_category, updated_at, user_id
- write — lib/ghostme/location/locationUpdateFlow.ts — colonne: accuracy, address, confidence, current_place_id, current_place_label, last_changed_at, now, onConflict, place_category, updated_at, user_id
- select — lib/ghostme/location/placeService.ts — colonne: *
- write — lib/ghostme/location/placeService.ts — colonne: external_name, label, updated_at
- select — lib/ghostme/observation/observationEngine.ts — colonne: current_place_id, current_place_label, place_category
- write — lib/ghostme/observation/observationEngine.ts

### user_profiles

**Colonne reali note**

- Schema reale non ancora registrato nello script

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

**Colonne scritte rilevate**

- age
- children_info
- communication_style
- full_name
- relationship_status
- short_bio
- user_id

**Operazioni rilevate**

- select — app/api/worker/proactive/route.ts — colonne: full_name, hobbies, job, location, sports, user_id
- select — app/chat/page.tsx — colonne: *
- select — app/login/page.tsx — colonne: id
- write — app/setup/profile/page.tsx — colonne: age, children_info, communication_style, full_name, relationship_status, short_bio, user_id
- select — lib/ghostme/context/userContextGraph.ts — colonne: *
- select — lib/ghostme/profile/profileBehaviorSeed.ts — colonne: *
- select — lib/ghostme/situation/situationEngine.ts — colonne: full_name, hobbies, job, location, relationship_status, sports

### users

**Colonne reali note**

- Schema reale non ancora registrato nello script

**Reader**

- Nessuno rilevato

**Writer**

- app/setup/page.tsx

**Delete**

- app/setup/page.tsx

**Colonne lette nei select**

- Nessuna colonna specifica rilevata

**Colonne scritte rilevate**

- email
- id
- name
- onConflict

**Operazioni rilevate**

- write — app/setup/page.tsx — colonne: email, id, name, onConflict
- delete — app/setup/page.tsx

## Note V3

Questa V3 usa uno schema reale noto parziale scritto nello script. Per renderla definitiva, aggiungere tutte le colonne reali Supabase in KNOWN_SCHEMA oppure creare una query di esportazione schema dal DB.
