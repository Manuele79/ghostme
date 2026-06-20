# CURIOSITY SNAPSHOT CARD WRITER V1

## Esito

Le curiosity importanti di `snapshot.curiosity` possono ora produrre card reali tramite `upsertProactiveMessage()`. Il writer e deterministico, non usa OpenAI e genera al massimo due card `curiosity` per esecuzione.

Il vecchio `curiosityEngine` resta attivo. Quando il nuovo writer ha gia prodotto una curiosity, il suo candidato legacy non viene scelto come best candidate nella stessa esecuzione; resta disponibile come fallback quando lo snapshot non contiene curiosity abbastanza importanti.

## Flow finale

```text
buildGhostBrainSnapshot
  -> snapshot.curiosity.curiosities
  -> selectImportantCuriosities
  -> writeCuriositySnapshotCards (massimo 2)
  -> upsertProactiveMessage
  -> ghost_proactive_messages
  -> proactiveCandidateBuilder legacy (stesso snapshot precompilato)
```

Successivamente continua il flow True Proactive e legacy. Se True Proactive contiene la stessa high-confidence curiosity, usa la stessa logical key e lo stesso contenuto: il secondo upsert e un no-op. Le card snapshot vengono scritte prima di invocare i generatori legacy che usano OpenAI.

## Selezione

Sono considerate importanti le curiosity con:

- `priority >= 8`
- `confidence >= 55`

Le candidate vengono ordinate per priorita e confidence, poi limitate a due. Una curiosity gia scelta da True Proactive viene riservata dentro lo stesso limite, evitando che i due writer producano una terza card distinta.

## Lifecycle e dedup

Categoria:

- `curiosity`

Logical key:

```text
curiosity_snapshot_{curiosity.type}_{titolo_normalizzato}
```

Esempi:

- `curiosity_snapshot_active_project_without_actions_ghostme`
- `curiosity_snapshot_important_person_missing_details_mario`

La descrizione della curiosity e il contenuto della card. Il tipo e il titolo definiscono invece l'identita stabile:

- stesso contenuto: nessun nuovo inserimento;
- dismissed con contenuto identico: resta dismissed;
- descrizione cambiata con stessa chiave: update e stato `unread`;
- esecuzioni ripetute: nessun duplicato logico.

## File modificati

- `lib/ghostme/proactive/curiosityCardWriter.ts` (nuovo)
- `lib/ghostme/proactive/proactiveCandidateBuilder.ts`
- `lib/ghostme/proactive/proactiveUserFlow.ts`
- `lib/ghostme/proactive/trueProactiveSnapshot.ts`
- `lib/ghostme/proactive/trueProactiveCardWriter.ts`
- `CURIOSITY_CARD_WRITER_AUDIT_V1.md`

Riutilizzato senza modifiche specifiche in questa attivita:

- `lib/ghostme/proactive/proactiveMessageService.ts`
- lifecycle/dedup proactive unificato

UI, Calendar/Reminder, Goals/Actions e House non sono stati modificati.

## Compatibilita True Proactive

La candidata `high_confidence_curiosity` ora conserva:

- la descrizione deterministica come `reason`;
- il tipo originale nel source `curiosity:{type}`;
- la stessa logical key usata dal writer CuriositySnapshot.

Questo evita due card diverse per la stessa curiosity senza rimuovere il writer True Proactive.

## Fallback legacy

- `curiosityEngine` continua a essere eseguito dal candidate builder.
- Il candidato legacy resta selezionabile quando il writer snapshot non processa card.
- Lo snapshot precompilato viene passato al candidate builder, evitando una seconda costruzione completa.
- Candidate ranker, observation, pattern, butler, agenda e daily briefing restano invariati.
- Non e stata aggiunta alcuna chiamata OpenAI. Le chiamate dei motori legacy sono preesistenti.

## Test manuali

1. Preparare una curiosity con priority 8 e confidence almeno 55, quindi eseguire il worker proactive.
2. Verificare una card `curiosity`, `unread`, con logical key `curiosity_snapshot_*`.
3. Rieseguire il worker senza modifiche: non deve comparire un duplicato.
4. Dismissare la card e rieseguire con descrizione identica: deve restare dismissed.
5. Cambiare solo la descrizione mantenendo tipo e titolo: la stessa card deve tornare unread.
6. Preparare tre curiosity idonee: devono essere scritte soltanto le due selezionate.
7. Fare selezionare la stessa curiosity anche da True Proactive: deve esistere una sola logical key/card.
8. Rimuovere curiosity idonee dallo snapshot e verificare che il candidato del vecchio curiosityEngine resti utilizzabile come fallback.

## Verifiche automatiche

- TypeScript: PASS (`tsc --noEmit`)
- Lint writer proactive: PASS
- Build Next.js: PASS (`npm run build`)

## Rischi residui

- Le soglie 8/55 sono intenzionalmente conservative; curiosity deboli restano nello snapshot ma non generano card.
- Il vecchio curiosityEngine viene ancora eseguito e conserva costo e failure mode preesistenti, come richiesto.
- Il dedup atomico concorrente dipende dall'indice univoco su `user_id + category + logical_key` gia previsto dal contratto DB esistente; nessuna migration e stata aggiunta.
