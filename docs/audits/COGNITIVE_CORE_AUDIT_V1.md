# COGNITIVE CORE AUDIT V1

Generato: 2026-06-27

## Responsabilita finali

Il Ghost Cognitive Core non e un nuovo engine. E il contratto decisionale unico prodotto dal flusso gia esistente:

`messageClassifier -> chatMessageAnalyzer -> ghostChatOrchestrator -> contextBuilder -> chatPromptBuilder -> post-processing`

Il risultato e un `CognitiveDecision` che descrive:

- tipo reale del messaggio;
- destinatario;
- azioni richieste;
- persistenza temporanea/permanente;
- priorita;
- necessita di approfondimento;
- profondita memoria;
- tono operativo;
- motivi della decisione.

## File modificati

- `lib/ghostme/chat/chatTypes.ts`
- `lib/ghostme/core/messageClassifier.ts`
- `lib/ghostme/chat/chatMessageAnalyzer.ts`
- `lib/ghostme/chat/ghostChatOrchestrator.ts`
- `lib/ghostme/chat/chatContextBuilder.ts`
- `lib/ghostme/chat/chatPromptBuilder.ts`
- `lib/ghostme/chat/chatCalendarFlow.ts`
- `lib/ghostme/chat/chatPostProcessing.ts`

## Responsabilita spostate

Prima il sistema reinterpretava il messaggio in piu punti:

- `messageClassifier` decideva solo micro/normal/important;
- `chatMessageAnalyzer` ricostruiva topic e importanza;
- `chatContextBuilder` decideva autonomamente il recall profondo;
- `chatPromptBuilder` non riceveva una decisione esplicita;
- `chatPostProcessing` rilanciava detection locali per memoria, timeline, behavior, goal/action.

Ora:

- `messageClassifier` costruisce una decisione cognitiva base;
- `chatMessageAnalyzer` raffina la decisione usando topic/entity e importanza gia calcolati;
- `ghostChatOrchestrator` propaga la decisione;
- `chatContextBuilder` usa la decisione per la profondita memoria;
- `chatPromptBuilder` espone la decisione come routing interno;
- `chatPostProcessing` riceve la decisione e continua a usare i writer esistenti come conferma retrocompatibile.

## Duplicazioni eliminate

Non sono stati rimossi engine, ma e stata eliminata la mancanza di un contratto unico.

Le interpretazioni locali ora hanno un oggetto comune da leggere:

- calendario: riceve `CognitiveDecision`;
- prompt: riceve `cognitiveDecisionContext`;
- post-processing: riceve `cognitiveDecision`;
- retrieval depth: legge `memoryDepth`.

Le funzioni esistenti restano operative per evitare regressioni.

## Flusso decisionale completo

1. L'utente invia un messaggio da `app/chat/page.tsx`.
2. `/api/chat` chiama `runGhostChatFlow`.
3. `runGhostChatFlow` chiama `analyzeChatMessage`.
4. `classifyGhostMessage` produce la classe leggera.
5. `buildBaseCognitiveDecision` crea la decisione base.
6. Topic/entity/importance vengono calcolati come prima.
7. `refineCognitiveDecision` integra topic, entity e importanza.
8. `ghostChatOrchestrator` passa la decisione a context, calendario, prompt e post-processing.
9. `buildChatContext` usa `memoryDepth` per il recall.
10. `buildSystemPrompt` riceve il routing e lo usa come istruzione interna.
11. `runChatPostProcessing` usa la decisione come coordinatore e mantiene i writer esistenti.

## Esempi pratici

### "Ricordati di controllare"

- Tipo: `command_to_ghost`
- Destinatario: `ghostme`
- Azioni: `response`, `calendar`, `proactive`
- Persistenza: `temporary`
- Nota: non viene interpretato come promemoria rivolto all'utente stesso.

### "Da oggi rispondimi piu sintetico"

- Tipo: `behavior_change`
- Destinatario: `ghostme`
- Azioni: `response`, `behavior`
- Persistenza: `permanent`
- Tono: `synthetic`

### "Mi piace lavorare di sera"

- Tipo: `new_preference`
- Destinatario: `self`
- Azioni: `response`, `memory`, `behavior`
- Persistenza: `permanent`

### "Ieri sono stato al mare con Giulio"

- Tipo: `event`
- Destinatario: `self`
- Azioni: `response`, `memory`, `timeline`
- Persistenza: `temporary`
- People Graph: puo essere aggiornato dai topic/person detected.

### "Ti ricordi cosa avevo detto su Valentina?"

- Tipo: `question`
- Destinatario: `ghostme`
- Azioni: `response`, `people_graph`, `memory`
- Profondita memoria: `deep_recall`

## Verifica

- `npx.cmd tsc --noEmit`: passato.

## Note di sicurezza architetturale

- Nessuna nuova tabella.
- Nessun nuovo engine.
- Nessuna modifica UI.
- Nessun cambio intenzionale al comportamento utente visibile.
- La logica persistente resta affidata ai moduli gia esistenti.
