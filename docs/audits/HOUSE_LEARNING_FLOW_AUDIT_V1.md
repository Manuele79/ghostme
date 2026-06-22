# HOUSE LEARNING FLOW AUDIT V1

## Esito

Gli eventi Home Assistant significativi possono ora attivare un learning casa leggero senza eseguire l'intera pipeline house. Il webhook continua a limitarsi a mapping, dedup/significance, insert e scheduling background.

Il worker `/api/worker/house` resta schedulato ogni ora e conserva la pipeline completa come backup.

## Flow finale

```text
Home Assistant webhook
  -> auth + user mapping
  -> house_entities
  -> homeEventSignificance
  -> house_events insert
  -> risposta HTTP
  -> background after()
     -> eligibility + claim + cooldown
     -> housePatternEngine (massimo 500 eventi)
     -> houseRouteLearningEngine, solo eventi di movimento (massimo 500)
```

Backup completo:

```text
cron orario /api/worker/house
  -> snapshot HA + location bridge + entity sync
  -> pattern + route
  -> house suggestions
  -> automation suggestions
  -> automation controls
```

## Eventi ammessi al learning leggero

Un evento deve:

- essere gia stato classificato significativo;
- avere priority almeno 7;
- essere avvenuto negli ultimi 5 minuti;
- appartenere a un tipo utile al learning.

Tipi ammessi per pattern:

- `motion_on`
- `presence_on`
- `light_on`
- `tv_on`
- `person_location_changed`
- `temperature_changed`
- `humidity_changed`
- `climate_on`

Route learning viene eseguito soltanto per:

- `motion_on`
- `presence_on`
- `person_location_changed`

Eventi off, micro-variazioni, replay vecchi e system event con priorita bassa non avviano il learning leggero.

## Protezioni anti-overload

- Il learning gira tramite `after()`, dopo la risposta del webhook.
- Cooldown persistente di 15 minuti per utente.
- Claim dell'evento tramite source `home_assistant_webhook_light_learning`.
- Eventi concorrenti nel cooldown vengono rilasciati al source webhook normale.
- Pattern e route leggono al massimo gli ultimi 500 eventi nel percorso leggero.
- Suggestion, automation suggestion, control planner, HA live snapshot e location bridge non vengono invocati dal webhook.
- Il worker orario usa gli engine senza limite light e resta il backup completo.

## House patterns

`housePatternEngine` viene ora chiamato dal percorso leggero. `pattern_type` e stato stabilizzato rimuovendo conteggi e valori numerici variabili dal titolo prima di costruire la chiave.

Esempio:

```text
salotto usato spesso (5 rilevamenti negli ultimi 30 giorni)
salotto usato spesso (8 rilevamenti negli ultimi 30 giorni)
```

produce lo stesso `pattern_type`, quindi aggiorna la stessa riga invece di crearne una nuova.

La lookup tollera eventuali duplicati storici scegliendo la riga aggiornata piu di recente; non e stata aggiunta alcuna migration o cancellazione.

## Route learning

Il motore route mantiene regole stabili tramite `rule_key = route_{from}_{to}`. Nel percorso webhook viene invocato solo per eventi di movimento e con limite di 500 eventi. Il worker orario conserva l'analisi completa a 30 giorni.

## Suggestions e controls

Il webhook non genera direttamente:

- `house_suggestions`;
- card `home_question`;
- `house_automation_controls`.

Questi writer restano esclusivi della pipeline completa oraria. I controlli esistenti mantengono upsert per automation key; le suggestion verificano una suggestion aperta o recente prima dell'insert. Il nuovo flow non introduce quindi una seconda sorgente concorrente di suggestion/control.

## File modificati

- `app/api/home-assistant/event/route.ts`
- `lib/ghostme/homeAssistant/houseLightLearningFlow.ts` (nuovo)
- `lib/ghostme/homeAssistant/housePatternEngine.ts`
- `lib/ghostme/homeAssistant/houseRouteLearningEngine.ts`
- `HOUSE_LEARNING_FLOW_AUDIT_V1.md`

Analizzati senza modifiche:

- `lib/ghostme/home/houseWorkerFlow.ts`
- `lib/ghostme/homeAssistant/homeEventSignificance.ts`
- `lib/ghostme/homeAssistant/houseSuggestionEngine.ts`
- `lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts`
- `lib/ghostme/homeAssistant/houseAutomationControlPlanner.ts`
- `app/api/worker/house/route.ts`
- `vercel.json`

UI, Brain, proactive lifecycle, Goals, Calendar e People non sono stati modificati.

## Nessun OpenAI

Il percorso leggero importa esclusivamente Supabase, pattern engine e route learning engine. Non contiene prompt, SDK OpenAI o generatori AI.

## Test manuali

1. Inviare un `motion_on` significativo e recente al webhook HA.
2. Verificare risposta HTTP immediata con `inserted: true`.
3. Verificare che l'evento trigger assuma source `home_assistant_webhook_light_learning`.
4. Con sufficiente storico, verificare insert/update di `house_patterns` e delle route in `house_learned_rules`.
5. Inviare un secondo evento idoneo entro 15 minuti: deve restare source webhook normale e non avviare un'altra analisi.
6. Inviare un evento con priority inferiore a 7 o timestamp vecchio: deve essere registrato, ma non avviare learning.
7. Variare il conteggio dello stesso pattern: deve aggiornarsi la stessa logical row.
8. Verificare che il webhook non crei righe in `house_suggestions` o `house_automation_controls`.
9. Eseguire manualmente il worker house con secret: la pipeline completa deve continuare a funzionare.
10. Attendere il cron orario e verificare che resti il backup completo.

## Verifiche automatiche

- TypeScript: PASS (`tsc --noEmit`)
- Lint del nuovo flow light: PASS
- Build Next.js: PASS (`npm run build`)

## Rischi residui

- Eventuali duplicati storici in `house_patterns` non vengono rimossi automaticamente.
- Il claim usa `house_events.source` come marker persistente per evitare una nuova tabella; il dato mantiene comunque esplicita l'origine webhook e il ruolo di trigger learning.
- Gli engine restituiscono array vuoti anche per alcuni errori DB storici; i loro log restano la fonte per distinguere assenza di pattern da errore query.
- Il worker completo continua a effettuare le query e i writer storici, incluso il secondo pass pattern interno al suggestion engine; questa attivita non ne modifica la logica.
