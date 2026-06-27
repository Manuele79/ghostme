# IDENTITY ENGINE AUDIT V1

Generato: 2026-06-27

## Premessa

Il Ghost Identity Engine V1 non introduce un nuovo engine runtime.

L'identita di GhostMe e stata integrata nel livello gia esistente di prompt e comportamento:

`CognitiveDecision -> ghostChatOrchestrator -> chatPromptBuilder -> risposta`

Il Cognitive Core resta l'unico responsabile dell'interpretazione del messaggio.
L'identita legge quella decisione e decide solo come GhostMe deve comportarsi.

## File modificati

- `lib/ghostme/chat/chatPromptBuilder.ts`
- `lib/ghostme/chat/ghostChatOrchestrator.ts`
- `scripts/system-docs.mjs`

## Responsabilita aggiunte

### `chatPromptBuilder.ts`

Responsabilita aggiunta: costruire una direttiva identitaria operativa a partire da `CognitiveDecision`.

La direttiva decide:

- stile della risposta;
- profondita;
- quando fare una domanda;
- quando osservare;
- quando essere proattivo;
- quando limitarsi a eseguire;
- quando usare un acknowledgement minimo;
- quando evitare curiosity inutili.

Non decide:

- tipo reale del messaggio;
- destinatario;
- azioni richieste;
- persistenza;
- priorita;
- profondita memoria.

Queste restano responsabilita del Cognitive Core.

### `ghostChatOrchestrator.ts`

Responsabilita aggiunta: passare il `CognitiveDecision` completo al prompt builder.

Prima il prompt riceveva solo `cognitiveDecisionContext` testuale.
Ora riceve anche l'oggetto strutturato, cosi l'identita puo leggere campi affidabili senza reinterpretare il messaggio.

### `system-docs.mjs`

Responsabilita aggiunta: documentare nella `COGNITIVE_ROUTING_MAP` che `chatPromptBuilder` applica l'identita operativa derivata dalla `CognitiveDecision`.

## Responsabilita spostate

Nessuna responsabilita interpretativa e stata spostata fuori dal Cognitive Core.

E stata solo separata meglio la differenza tra:

- interpretare il messaggio: Cognitive Core;
- comportarsi coerentemente nella risposta: Identity layer nel prompt builder.

## Integrazione con il Cognitive Core

L'identita legge esclusivamente:

- `tone`;
- `memoryDepth`;
- `followUpNeed`;
- `requestedActions`;
- `addressee`;
- `shouldRespond`;
- `priority`.

Da questi campi deriva:

- stile;
- profondita;
- politica delle domande;
- livello di proattivita;
- modalita di esecuzione;
- silenzio/acknowledgement;
- curiosity;
- osservazioni.

Il prompt contiene una regola esplicita:

`L'IDENTITA OPERATIVA decide solo il comportamento della risposta; non usarla per cambiare il tipo del messaggio.`

## Esempi pratici

### "Ricordati di controllare"

Cognitive Core:

- addressee: `ghostme`
- messageType: `command_to_ghost`
- requestedActions: `response`

Identity:

- tratta la frase come istruzione rivolta a GhostMe;
- non la trasforma in dovere dell'utente;
- non crea calendar/proactive senza intenzione esplicita di promemoria;
- risponde in modo breve e operativo.

### "Da oggi rispondimi piu sintetico"

Cognitive Core:

- messageType: `behavior_change`
- persistence: `permanent`
- tone: `synthetic`

Identity:

- usa stile molto sintetico;
- non fa spiegazioni lunghe;
- non aggiunge entusiasmo inutile.

### "Ti ricordi cosa avevo detto su Valentina?"

Cognitive Core:

- memoryDepth: `deep_recall`
- requestedActions: `memory`, `people_graph`

Identity:

- usa collegamenti profondi se disponibili;
- non mostra la meccanica interna;
- distingue fatti consolidati da inferenze.

### "Ho notato che la cucina resta accesa spesso"

Cognitive Core:

- messageType: `observation`
- requestedActions: `observation`, `proactive`
- followUpNeed: `observe`

Identity:

- preferisce osservazione utile a domanda gratuita;
- chiede solo se manca un dato davvero necessario.

### Messaggio micro: "ok"

Cognitive Core:

- shouldRespond: `false`
- tone: `synthetic`
- memoryDepth: `recent_only`

Identity:

- se la UI richiede risposta, usa un acknowledgement minimo;
- non apre memoria, spiegazioni o domande.

## Duplicazioni eliminate

Prima lo stile era distribuito fra:

- prompt generale;
- tratti utente;
- regole cognitive;
- comportamento implicito del modello.

Ora la scelta comportamentale runtime ha un punto esplicito nel prompt builder, derivato dalla decisione cognitiva.

Non sono stati duplicati:

- message classification;
- retrieval;
- behavior rules;
- curiosity snapshot;
- proactive candidate builder;
- observation engines.

## Verifica

- `npx.cmd tsc --noEmit`: passato.

## Vincoli rispettati

- Nessun nuovo engine.
- Nessun nuovo orchestratore.
- Nessuna nuova tabella.
- Nessuna logica duplicata rispetto al Cognitive Core.
- Nessuna modifica UI.
- Nessuna modifica intenzionale al comportamento persistente.
