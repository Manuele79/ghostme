# GHOSTME PRIORITY FIX LIST

Documento di classificazione derivato da `GHOSTME_SYSTEM_MAP_V6.md`. Non contiene patch o proposte implementative.

## Bug Certi

### Contratti DB/runtime

- Il codice usa `house_patterns`, `ghost_proactive_messages.logical_key` e `answered_at`, assenti nello schema Supabase fornito. La migration locale non prova che il DB remoto sia stato aggiornato.
- `action_intents` non contiene una relazione strutturale verso `goals_desires`.
- `house_paths`, `house_rooms` e `people_graph_links` sono scollegate dal codice.

### Flussi

- Creazione e completamento action vengono avviati in parallelo nello stesso post-processing.
- True Proactive seleziona candidati ma nessun writer li usa.
- Project Advisor e Curiosity Snapshot non guidano le card runtime.
- Il webhook HA non avvia learning; il worker house non e schedulato.
- Il proactive worker processa tutti gli utenti ed e invocabile senza auth/secret applicativo.
- Goals e calendar update usano `supabaseAdmin` con `userId` client non autenticato server-side.
- L'adapter Brain/UI scarta quasi tutto il GhostBrainSnapshot strutturato.
- Le categorie proactive visibili sono hardcoded e non includono project/social/suggestion.

### Metriche e lifecycle

- `created` del proactive worker non rappresenta agenda e briefing.
- Il completamento reminder dipende da `logical_key`.
- People graph links non vengono mai popolati o letti.

## Bug Probabili

- Insert `chat_messages` incompatibile con `message_order NOT NULL`, salvo trigger DB non incluso nei dati forniti.
- Goals/actions appena estratti possono non apparire al primo refresh per la gara fra `after()` e timer UI.
- Reminder apparentemente intermittenti per finestra temporale ed expire globale delle card attive.
- Lifecycle proactive instabile finche la migration DB non e applicata.
- `people_graph` vuota per topic non classificati person, maintenance incompleta o errori di upsert.
- Worker proactive troppo pesante per frequenza e numero di chiamate OpenAI per utente.
- House controls quasi vuoti per assenza scheduler e condizioni ristrette.
- Possibile corruzione testuale/route dovuta a mojibake nei sorgenti.
- Webhook HA aperto e user-selectable quando i secret non sono configurati.
- Isolamento utente disomogeneo nelle API che usano `supabaseAdmin`.

## File Morti

- `lib/ghostme/agenda/appointmentReminderNotification.ts`
- `lib/ghostme/homeAssistant/houseAutomationContext.ts`
- `lib/ghostme/homeAssistant/houseLearnedRulesContext.ts`
- `lib/ghostme/location/locationEngine.ts`
- `lib/ghostme/services/timeService.ts`
- `buildReasoningSnapshot`
- `getActionIntentContext`
- `getGoalsDesiresContext`
- `getTimelineContext`
- `getDynamicSelfProfileContext`
- `getUpcomingCalendarEvents`
- `getLastKnownPlace`

## Doppioni

- SituationEngine / UserContextGraph / snapshot loader separati.
- ContextBuilder legacy / adapter snapshot proactive.
- Curiosity Engine AI / Curiosity Snapshot deterministico.
- Proactive Decision Engine / DecisionSnapshot / TrueProactiveSnapshot.
- HomeContextBuilder / HomeReasoningBuilder / HouseStateSnapshot.
- Dedup proactive in service, calendar e API reader.
- Normalizzazione calendar title in tre punti.

## Priorita 1

**Integrita dei contratti e isolamento dei dati.**

Perimetro osservato:

- Contratto DB proactive/house.
- API admin che accettano `userId` client.
- Worker e webhook esposti.
- Contratto `chat_messages.message_order`.

Motivo della priorita: errori in quest'area producono fallimenti certi del lifecycle o accesso/modifica cross-user; rendono inaffidabili tutti gli audit funzionali successivi.

## Priorita 2

**Coerenza dei flow operativi che producono dati visibili.**

Perimetro osservato:

- Goals/action lifecycle e assenza di relazione.
- Calendar/reminder/proactive lifecycle.
- Sincronizzazione post-processing -> Brain refresh -> drawer.
- People graph population.
- House webhook -> learning worker.

Motivo della priorita: sono i punti in cui dati validi vengono creati ma non collegati, non aggiornati o non mostrati.

## Priorita 3

**Convergenza tra GhostBrain Snapshot e runtime storico.**

Perimetro osservato:

- DecisionSnapshot contro ProactiveDecisionEngine.
- CuriositySnapshot contro CuriosityEngine.
- TrueProactive selezionato ma non consumato.
- Project/relationship/home reasoning calcolato ma solo parzialmente operativo.
- Loader duplicati e query ripetute.

Motivo della priorita: oggi il sistema paga il costo di entrambi i layer, ma solo quello storico crea normalmente le card. Questa e soprattutto una fonte di complessita e consumo, dopo i problemi di contratto e lifecycle.
