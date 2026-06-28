# CODEX CONTEXT — GhostMe

Prima di modificare codice, leggere sempre:

1. `docs/maps/PROJECT_KNOWLEDGE_BASE.md`
2. `docs/maps/SUPABASE_SCHEMA_MAP.md`
3. `docs/maps/DATABASE_USAGE_MAP.md`
4. `docs/maps/FILE_USAGE_MAP.md`
5. `docs/maps/DEPENDENCY_TEXT_MAP.txt`
6. `docs/maps/COGNITIVE_ROUTING_MAP.md`
7. `docs/maps/GHOSTME_SYSTEM_MAP_V6.md`
8. `external/supabase-schema/`
9. `external/home-assistant/`

## Regole operative

- Non creare nuove tabelle se il dato esiste già.
- Non creare nuovi engine se esiste un modulo adatto.
- Non fare micro-fix se il problema è architetturale.
- Prima verificare chi scrive, chi legge e dove il dato si ferma.
- Non modificare file dentro `external/`: sono snapshot read-only.
- Non inserire secret, token, password o URL sensibili.
- Se una query chiede colonne non esistenti, verificare prima `external/supabase-schema/tables_columns.csv`.
- Se un evento Home Assistant non viene usato da GhostMe, verificare prima `external/home-assistant/`.
- Ogni modifica deve spiegare:
  - causa;
  - file modificati;
  - flusso impattato;
  - tabelle impattate;
  - test manuale;
  - TypeScript/build.

## Obiettivo del progetto

GhostMe non deve essere una semplice chat con memoria.

Deve diventare un assistente personale attivo che usa:

- memoria;
- luoghi;
- Home Assistant;
- calendario;
- persone;
- pattern;
- behavior rules;
- currentSituation;
- proactive cards;

per capire il momento e proporre interventi utili senza aspettare sempre input manuale.

## Prima di lavorare su proactive / continuity

Controllare sempre:

1. `observation_events`
2. `user_location_state`
3. `episodic_memories`
4. `conversation_summaries`
5. `proactiveCandidateBuilder.ts`
6. `proactiveUserFlow.ts`
7. `proactiveMessageService.ts`
8. `ghost_proactive_messages`
9. `visibleProactiveMessages.ts`