# PROJECT KNOWLEDGE BASE

Generated: 2026-06-28T00:20:00.886Z

Questa è la mappa centrale automatica del progetto GhostMe.

## Documenti collegati

- **systemMap**: OK — `docs/maps/GHOSTME_SYSTEM_MAP_V6.md` (3243 righe)
- **cognitiveRouting**: OK — `docs/maps/COGNITIVE_ROUTING_MAP.md` (147 righe)
- **databaseUsage**: OK — `docs/maps/DATABASE_USAGE_MAP.md` (296 righe)
- **fileUsage**: OK — `docs/maps/FILE_USAGE_MAP.md` (1995 righe)
- **supabaseSchema**: OK — `docs/maps/SUPABASE_SCHEMA_MAP.md` (1811 righe)
- **priorityFix**: OK — `docs/maps/GHOSTME_PRIORITY_FIX_LIST.md` (31 righe)
- **dependencyText**: OK — `docs/maps/DEPENDENCY_TEXT_MAP.txt` (501 righe)

## Come usarla

Quando devi capire GhostMe, parti da qui:

1. **COGNITIVE_ROUTING_MAP** — come passa un messaggio nel cervello.
2. **GHOSTME_SYSTEM_MAP_V6** — quali moduli esistono e cosa fanno.
3. **SUPABASE_SCHEMA_MAP** — quali tabelle vengono lette/scritte.
4. **DATABASE_USAGE_MAP** — uso DB per tabella.
5. **FILE_USAGE_MAP** — file orfani, import/export.
6. **DEPENDENCY_TEXT_MAP** — chi chiama chi.
7. **GHOSTME_PRIORITY_FIX_LIST** — cosa sistemare prima.

## Flussi principali da controllare

### Chat → Memoria → People → Proactive

Messaggio utente → CognitiveDecision → Context → Prompt → Post-processing → Memorie/Topic/People → Proactive Cards.

### Luoghi → Observation → Pattern → Moment Awareness

user_location_state → observation_events → behavior_patterns → currentSituation → proactiveCandidateBuilder → ghost_proactive_messages.

### Home Assistant → House Snapshot → Daily/Proactive

house_events → house_entities → house_patterns/house_suggestions → currentSituation → Daily/Observation.

## Regola operativa

Da ora in poi, prima di aggiungere funzioni nuove, controllare se il dato esiste già, chi lo scrive e chi lo legge.
