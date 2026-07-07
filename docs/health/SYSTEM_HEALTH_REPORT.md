# SYSTEM HEALTH REPORT

Generated: 2026-07-07T21:01:21.303Z

Health Score: **67/100** - 🟠 Da migliorare

## Stato Generale

| Area | Score | Health |
| --- | ---: | --- |
| Architecture | 70 | 🟡 Buono |
| Database | 0 | 🔴 Critico |
| Memory | 76 | 🟡 Buono |
| People | 78 | 🟡 Buono |
| Location | 78 | 🟡 Buono |
| Home Assistant | 78 | 🟡 Buono |
| Calendar | 66 | 🟠 Da migliorare |
| Performance | 74 | 🟡 Buono |
| Proactive | 76 | 🟡 Buono |
| UX | 72 | 🟡 Buono |
| Overall | 67 | 🟠 Da migliorare |

## 1. Architettura

Status: **ERROR**

- Moduli attivi: 166
- Moduli senza consumer: 6
- Moduli senza producer: 24
- Dipendenze circolari: 3
- Import potenzialmente inutilizzati: 23
- Snapshot/context duplicati o concorrenti: 16

## 2. Database

| Tabella | Stato | Letta | Scritta | Colonne inesistenti | Colonne non viste |
| --- | --- | --- | --- | ---: | --- |
| action_intents | ERROR | yes | yes | 1 | - |
| answers | OK | yes | yes | 0 | question_id, selected_answers, intensita |
| autobiographical_timeline | OK | yes | yes | 0 | - |
| behavior_patterns | ERROR | yes | yes | 2 | - |
| calendar_events | ERROR | yes | yes | 16 | source |
| chat_messages | OK | yes | yes | 0 | - |
| contradictions | OK | yes | yes | 0 | resolution |
| conversation_summaries | OK | yes | yes | 0 | - |
| dynamic_self_profile | OK | yes | yes | 0 | - |
| episodic_memories | ERROR | yes | yes | 14 | - |
| ghost_behavior_rules | OK | yes | yes | 0 | positive_examples, negative_examples, times_applied |
| ghost_proactive_messages | OK | yes | yes | 0 | source |
| goals_desires | OK | yes | yes | 0 | - |
| house_automation_controls | OK | yes | yes | 0 | - |
| house_entities | ERROR | yes | yes | 10 | - |
| house_events | ERROR | yes | yes | 10 | - |
| house_learned_rules | ERROR | yes | yes | 25 | - |
| house_paths | ERROR | no | no | 0 | from_room, to_room, path_type, confidence |
| house_patterns | ERROR | yes | yes | 17 | place_label, place_id, trigger_conditions, learned_from |
| house_rooms | ERROR | no | no | 0 | room_key, room_name, floor, room_type, is_transition, has_presence_sensor, has_motion_sensor, has_lux_sensor |
| house_suggestions | OK | yes | yes | 0 | target_user, confidence |
| life_topics | ERROR | yes | yes | 4 | first_detected_at, related_topics |
| memories | ERROR | no | no | 0 | titolo, tipo, emozione, impatto, descrizione |
| memories_active | ERROR | yes | yes | 10 | - |
| mental_states | OK | yes | yes | 0 | stress, entusiasmo, stanchezza, controllo, nostalgia, frustrazione, focus, socialita |
| observation_events | OK | yes | yes | 0 | source |
| people_graph | ERROR | yes | yes | 16 | first_mentioned_at |
| people_graph_links | OK | yes | yes | 0 | target_label, link_type, evidence, target_key, evidences |
| questions | ERROR | no | no | 0 | categoria, tipo, domanda, max_select |
| significant_places | OK | yes | yes | 0 | source |
| topic_links | OK | yes | yes | 0 | - |
| traits | OK | yes | yes | 0 | - |
| triggers | ERROR | no | no | 0 | trigger, emozione, intensita, reazione |
| user_location_state | OK | yes | yes | 0 | latitude, longitude |
| user_profiles | OK | yes | yes | 0 | gender, interests |
| users | ERROR | no | no | 0 | - |

RPC inutilizzate: nessuna

## 3. Home Assistant

Status: **OK**

| Tabella | Dati ricevuti | Dati utilizzati | Dati ignorati | Stato |
| --- | --- | --- | --- | --- |
| house_events | yes | yes | no | ERROR |
| house_entities | yes | yes | no | ERROR |
| house_patterns | yes | yes | no | ERROR |
| house_suggestions | yes | yes | no | OK |
| house_learned_rules | yes | yes | no | ERROR |
| house_automation_controls | yes | yes | no | OK |

Catena HA -> Snapshot -> Current Situation -> Situation Policy -> Decision -> Proactive -> UI:
- ingest: OK (15 file)
- snapshot: OK (4 file)
- currentSituation: OK (6 file)
- situationPolicy: OK (8 file)
- decision: OK (4 file)
- proactive: OK (11 file)
- ui: OK (9 file)

## 4. Location

Catena GPS -> user_location_state -> significant_places -> observation_events -> Situation Policy -> Continuity -> Ghost Cards -> Chat:
- gps: OK (12 file)
- state: OK (8 file)
- places: OK (8 file)
- observations: OK (8 file)
- policy: OK (8 file)
- continuity: OK (2 file)
- cards: OK (4 file)
- chat: OK (3 file)

- Coordinate senza POI: monitorate
- POI con salvataggio: presente
- Rischio duplicati: dedupe_by_local_radius_and_bucket
- Luoghi mai piu utilizzati: monitored

## 5. People

- People graph riutilizzato: yes
- Consumer continuity/chat/curiosity: 12 / 4 / 39

## 6. Memory

| Fonte | Raccolto | Riutilizzato | Inutilizzato | Stato |
| --- | --- | --- | --- | --- |
| memories_active | yes | yes | no | ERROR |
| episodic_memories | yes | yes | no | ERROR |
| life_topics | yes | yes | no | ERROR |
| autobiographical_timeline | yes | yes | no | OK |
| dynamic_self_profile | yes | yes | no | OK |
| conversation_summaries | yes | yes | no | OK |
| goals_desires | yes | yes | no | OK |
| action_intents | yes | yes | no | ERROR |

## 7. Proactive

| Categoria | Generata | Mostrata | Letta | Completata | Ignorata |
| --- | --- | --- | --- | --- | --- |
| daily | yes | yes | yes | yes | no |
| observation | yes | yes | yes | yes | no |
| curiosity | yes | yes | yes | yes | no |
| agenda | yes | yes | yes | yes | no |
| reminder | yes | yes | yes | yes | no |
| continuity | yes | yes | yes | yes | no |
| situationPolicy | yes | yes | yes | yes | no |

## 8. Performance

- Brain Snapshot query references: 4
- Brain Snapshot LLM references: 0
- Chat query references workspace: 345
- Chat LLM references workspace: 20
- App open blockers/static signals: 8
- Snapshot/context duplicati: 16

## 9. UX

- Dati raccolti ma senza consumer: nessuno
- Domande/card deboli da controllare: 38
- Reminder da controllare: 25
- Proactive cambia comportamento via policy: yes

## 10. Top Priority

| # | Area | Stato | Problema | Impatto |
| ---: | --- | --- | --- | --- |
| 1 | Database | ERROR | Query verso colonne inesistenti in action_intents | Le query possono fallire a runtime. |
| 2 | Database | ERROR | Query verso colonne inesistenti in behavior_patterns | Le query possono fallire a runtime. |
| 3 | Database | ERROR | Query verso colonne inesistenti in calendar_events | Le query possono fallire a runtime. |
| 4 | Database | ERROR | Query verso colonne inesistenti in episodic_memories | Le query possono fallire a runtime. |
| 5 | Database | ERROR | Query verso colonne inesistenti in house_entities | Le query possono fallire a runtime. |
| 6 | Database | ERROR | Query verso colonne inesistenti in house_events | Le query possono fallire a runtime. |
| 7 | Database | ERROR | Query verso colonne inesistenti in house_learned_rules | Le query possono fallire a runtime. |
| 8 | Database | ERROR | Query verso colonne inesistenti in house_patterns | Le query possono fallire a runtime. |
| 9 | Database | ERROR | Query verso colonne inesistenti in life_topics | Le query possono fallire a runtime. |
| 10 | Database | ERROR | Query verso colonne inesistenti in memories_active | Le query possono fallire a runtime. |
| 11 | Database | ERROR | Query verso colonne inesistenti in people_graph | Le query possono fallire a runtime. |
| 12 | Database | ERROR | house_paths non usata | Tabella presente nello schema ma non agganciata al codice. |
| 13 | Database | ERROR | house_rooms non usata | Tabella presente nello schema ma non agganciata al codice. |
| 14 | Database | ERROR | memories non usata | Tabella presente nello schema ma non agganciata al codice. |
| 15 | Database | ERROR | questions non usata | Tabella presente nello schema ma non agganciata al codice. |
| 16 | Database | ERROR | triggers non usata | Tabella presente nello schema ma non agganciata al codice. |
| 17 | Database | ERROR | users non usata | Tabella presente nello schema ma non agganciata al codice. |
| 18 | Architecture | WARNING | Dipendenze circolari rilevate | Le dipendenze circolari rendono fragili refactor e build incrementali. |
| 19 | Architecture | WARNING | Import potenzialmente inutilizzati | Import inutilizzati indicano moduli morti o refactor incompleti. |
| 20 | Architecture | WARNING | Moduli senza consumer | Codice non raggiunto o solo invocato dinamicamente richiede verifica. |

## 11. Change Impact

| File modificato | Flussi migliorati | Possibili rotture | Mappe da rigenerare |
| --- | --- | --- | --- |
| PROJECT_AUDIT_FULL.json | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| PROJECT_AUDIT_FULL.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/audits/PROJECT_AUDIT.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/audits/PROJECT_AUDIT_FULL.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/maps/COGNITIVE_ROUTING_MAP.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/maps/DEPENDENCY_TEXT_MAP.txt | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/maps/FILE_USAGE_MAP.json | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/maps/FILE_USAGE_MAP.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/maps/GHOSTME_PRIORITY_FIX_LIST.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/maps/GHOSTME_SYSTEM_MAP_V6.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/maps/PROJECT_KNOWLEDGE_BASE.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/maps/SUPABASE_SCHEMA_MAP.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE, SUPABASE_SCHEMA_MAP |
| docs/state/PROJECT_AUDIT.json | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/state/PROJECT_AUDIT_FULL.json | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/state/PROJECT_KNOWLEDGE_BASE.json | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| docs/state/SUPABASE_SCHEMA_MAP.json | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE, SUPABASE_SCHEMA_MAP |
| knowledge/00_PROJECT.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| knowledge/01_ARCHITECTURE.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| knowledge/02_COGNITIVE_ROUTING.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| knowledge/04_SUPABASE_SCHEMA.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE, SUPABASE_SCHEMA_MAP |
| knowledge/05_FILE_USAGE.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| knowledge/06_DEPENDENCIES.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| knowledge/07_PRIORITY_FIX.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| knowledge/README.md | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
| knowledge/json/knowledge-index.json | - | unknown | DATABASE_USAGE_MAP, FILE_USAGE_MAP, PROJECT_KNOWLEDGE_BASE |
