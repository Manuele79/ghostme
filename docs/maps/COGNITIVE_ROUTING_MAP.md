# COGNITIVE ROUTING MAP

Generato automaticamente: 2026-06-27T23:45:25.858Z

## Tipi di informazione ricevuta

- Messaggio libero
- Richiesta calendario/reminder
- Preferenza comportamentale
- Memoria/fatto personale
- Persona o relazione
- Luogo o Home Assistant
- Goal/progetto/azione
- Risposta a card proattiva

## Flusso decisionale completo

Messaggio

v

messageClassifier

v

chatMessageAnalyzer

v

contextBuilder

v

chatPromptBuilder

v

calendar

v

behavior

v

memory

v

people graph

v

topic

v

timeline

v

proactive

v

daily briefing

v

osservazioni

v

risposta

## Dettaglio passaggi

### Messaggio

File coinvolti:
- app/api/chat/route.ts
- app/chat/page.tsx
- hooks/useGhostChat.ts

Responsabilita: Raccoglie input utente, invia richiesta autenticata e apre il flusso chat.

Input: Testo, userId, cronologia locale, eventuale risposta a card proattiva.

Output: Request verso /api/chat e stream/risposta assistant.

### messageClassifier

File coinvolti:
- lib/ghostme/core/messageClassifier.ts

Responsabilita: Classifica intenzione generale e costruisce la CognitiveDecision base.

Input: Messaggio utente.

Output: Classe di messaggio e decisione cognitiva iniziale.

### chatMessageAnalyzer

File coinvolti:
- lib/ghostme/chat/chatMessageAnalyzer.ts

Responsabilita: Combina classificazione, topic, entity e relazioni, poi raffina la CognitiveDecision.

Input: Messaggio utente e contesto base.

Output: Analisi strutturata e CognitiveDecision per orchestrator e post-processing.

### contextBuilder

File coinvolti:
- lib/ghostme/chat/chatContextBuilder.ts
- lib/ghostme/context/contextBuilder.ts
- lib/ghostme/context/reasoningService.ts

Responsabilita: Costruisce contesto runtime, snapshot e segnali rilevanti.

Input: userId, analisi messaggio, CognitiveDecision, memoria, calendario, casa, luoghi.

Output: Chat context, GhostBrainSnapshot e cognitiveDecisionContext.

### chatPromptBuilder

File coinvolti:
- lib/ghostme/chat/chatPromptBuilder.ts

Responsabilita: Trasforma il contesto in prompt di sistema e applica l'identita operativa derivata dalla CognitiveDecision.

Input: Chat context, CognitiveDecision, profilo, memoria, regole e servizi.

Output: Prompt finale per OpenAI con direttive di stile, profondita, domande, osservazioni, proattivita e silenzio.

### calendar

File coinvolti:
- lib/ghostme/calendar/calendarService.ts
- lib/ghostme/chat/chatCalendarFlow.ts

Responsabilita: Interpreta e persiste eventi/reminder quando il messaggio e calendar-related.

Input: Intent calendario, data/ora, descrizione evento.

Output: calendar_events e card reminder/agenda.

### behavior

File coinvolti:
- lib/ghostme/behavior/behaviorRulesEngine.ts

Responsabilita: Legge/applica regole comportamentali e salva preferenze durevoli.

Input: Messaggio e profilo utente.

Output: ghost_behavior_rules e prompt comportamentale.

### memory

File coinvolti:
- lib/ghostme/chat/chatPostProcessing.ts
- lib/ghostme/memory/memorySnapshot.ts
- lib/ghostme/retrieval.ts

Responsabilita: Recupera e aggiorna memorie attive, episodi, summary e topic.

Input: Conversazione, analisi topic, userId e CognitiveDecision.

Output: memories_active, episodic_memories, conversation_summaries.

### people graph

File coinvolti:
- lib/ghostme/people/peopleGraphLinkService.ts
- lib/ghostme/people/peopleGraphService.ts

Responsabilita: Deriva persone e link relazionali dai topic e dalle memorie.

Input: life_topics, memories, relationship signals.

Output: people_graph e people_graph_links.

### topic

File coinvolti:
- lib/ghostme/topicDetector.ts
- lib/ghostme/topicLinks.ts

Responsabilita: Estrae topic e collega argomenti correlati.

Input: Messaggio e memoria contestuale.

Output: life_topics e topic_links.

### timeline

File coinvolti:
- lib/ghostme/timeline.ts

Responsabilita: Registra eventi autobiografici rilevanti.

Input: Messaggio classificato come episodio/evento.

Output: autobiographical_timeline.

### proactive

File coinvolti:
- lib/ghostme/proactive/proactiveCandidateBuilder.ts
- lib/ghostme/proactive/proactiveMessageService.ts
- lib/ghostme/proactive/proactiveUserFlow.ts

Responsabilita: Costruisce, ranka e deduplica card proattive.

Input: Snapshot, calendario, pattern, osservazioni, casa, curiosity.

Output: ghost_proactive_messages.

### daily briefing

File coinvolti:
- lib/ghostme/proactive/dailyBriefingBuilder.ts
- lib/ghostme/proactive/dailyBriefingRepository.ts

Responsabilita: Crea briefing quotidiano se manca quello della giornata.

Input: Calendario, azioni, mental state, casa, luoghi, pattern, summary.

Output: Card daily_briefing deduplicata.

### osservazioni

File coinvolti:
- lib/ghostme/curiosity/curiositySnapshot.ts
- lib/ghostme/observation/observationInsightEngine.ts
- lib/ghostme/patterns/patternInsightEngine.ts

Responsabilita: Trasforma pattern, osservazioni e gap utili in insight o domande ad alto valore futuro.

Input: behavior_patterns, observation_events, snapshot curiosity.

Output: Candidate/card observation o curiosity.

### risposta

File coinvolti:
- app/api/chat/route.ts
- lib/ghostme/chat/ghostChatOrchestrator.ts

Responsabilita: Produce risposta finale e avvia post-processing non bloccante.

Input: Prompt, servizi esterni, risultato calendar flow.

Output: Risposta assistant e aggiornamenti post-response.
