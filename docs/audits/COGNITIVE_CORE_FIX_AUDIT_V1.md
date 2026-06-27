# COGNITIVE CORE FIX AUDIT V1

Generato: 2026-06-27

## Problema corretto

La costruzione di `CognitiveDecision` trattava alcuni comandi rivolti a GhostMe come promemoria utente.

Caso problematico:

`Ricordati di controllare`

Prima:

- `addressee`: `ghostme`
- `messageType`: `command_to_ghost`
- `requestedActions`: `response`, `calendar`, `proactive`

Questo era contraddittorio: un comando rivolto a GhostMe non deve generare automaticamente elementi persistenti per l'utente.

## File modificati

- `lib/ghostme/core/messageClassifier.ts`
- `docs/audits/COGNITIVE_CORE_AUDIT_V1.md`
- `docs/audits/IDENTITY_ENGINE_AUDIT_V1.md`

## Responsabilita preservate

Il Cognitive Core resta l'unico responsabile dell'interpretazione del messaggio.

Non sono stati modificati:

- routing;
- orchestrator;
- prompt identity;
- calendar flow;
- proactive flow;
- persistence writer;
- UI.

## Logica nuova

E stata introdotta una distinzione tra:

- comando rivolto a GhostMe;
- intenzione esplicita di creare un evento/promemoria per l'utente.

Un comando a GhostMe genera normalmente:

- `response`

e, quando opportuno:

- `behavior`;
- `observation`;
- `none`.

Non genera automaticamente:

- `calendar`;
- `proactive`;
- daily briefing;
- reminder utente.

## Intento calendario esplicito

Il calendario viene assegnato solo quando il testo contiene formule esplicite come:

- `ricordamelo`;
- `ricordami di`;
- `aggiungi al calendario`;
- `metti in calendario`;
- `crea un promemoria`;
- `imposta un promemoria`;
- `ho un appuntamento`;
- `appuntamento` o `promemoria` con un ancoraggio temporale.

## Esempi pratici

### "Ricordati di controllare"

Dopo il fix:

- `messageType`: `command_to_ghost`
- `addressee`: `ghostme`
- `requestedActions`: `response`
- `persistence`: `temporary`

### "Ricordamelo domani alle 9"

Dopo il fix:

- `messageType`: `personal_reminder`
- `addressee`: `ghostme`
- `requestedActions`: `response`, `calendar`
- `persistence`: `temporary`

### "GhostMe, non usare quel tono"

Dopo il fix:

- `messageType`: `command_to_ghost`
- `addressee`: `ghostme`
- `requestedActions`: `response`, `behavior`
- `persistence`: `permanent`

### "Ho notato che la cucina resta accesa spesso"

Dopo il fix:

- `messageType`: `observation`
- `requestedActions`: `response`, `observation`, `proactive`

Nota: questa non e un'istruzione generica rivolta a GhostMe, quindi puo ancora alimentare osservazioni/proattivita.

## Duplicazioni evitate

Non e stato creato nessun nuovo engine.

Non e stato aggiunto un nuovo router.

La correzione resta dentro `messageClassifier.ts`, cioe nel punto in cui il Cognitive Core costruisce la decisione base.

## Verifica

- `npx.cmd tsc --noEmit`: passato.
