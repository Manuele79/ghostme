# PEOPLE GRAPH POPULATION AUDIT V1

## Esito

Il sync di `people_graph` usa ora evidenze stabili provenienti da `life_topics` e `memories_active`. Non incrementa piu `mention_count` a ogni esecuzione del worker e non aggiorna la riga quando i dati sorgente sono invariati.

Il flow resta collegato a `runProactiveMaintenanceFlow` tramite `syncPeopleGraphFromTopics`. Non sono state introdotte chiamate OpenAI.

## Bug trovati

- Il sync leggeva esclusivamente topic con `entity_type = person`, ignorando topic relazionali classificati tramite category o descrizione.
- `memories_active` era usata come fallback read-only da PeopleSnapshot, ma non popolava `people_graph`.
- Ogni worker incrementava `mention_count` e `importance`, anche senza nuove evidenze.
- Gli errori di lookup non erano distinti dagli errori di insert/update.
- Il filtro anti-falso-positivo esisteva in PeopleSnapshot, ma non era riutilizzato dal writer persistente.
- La stessa persona poteva essere visibile nello snapshot tramite fallback senza essere presente nella tabella principale.

## Flow finale

```text
proactive maintenance
  -> syncPeopleGraphFromTopics(userId)
  -> life_topics non archiviati
  -> memories_active relazionali
  -> filtro persona condiviso con PeopleSnapshot
  -> merge evidenze per normalized_name
  -> upsert people_graph con user_id
  -> PeopleSnapshot
  -> RelationshipMemorySnapshot
  -> SocialSuggestionSnapshot
```

`RelationshipMemorySnapshot` e `SocialSuggestionSnapshot` sono consumer derivati: non possono scoprire autonomamente una persona assente, ma beneficiano immediatamente delle righe sincronizzate.

## Evidenze accettate

Da `life_topics`:

- `entity_type = person`;
- category relazionali come `family`, `friend`, `relationship`, `colleague`;
- descrizioni contenenti una relazione umana riconoscibile.

Da `memories_active`:

- titolo `Info su {nome}`;
- memoria con category relazionale e titolo costituito da un nome;
- pattern espliciti come `{nome} e mia moglie`, `mio amico si chiama {nome}` o `con {nome}` dentro una memoria gia classificata come relazionale.

Valentina, Giulio, Mamma e Marco diventano quindi candidati quando compaiono con una di queste evidenze nei dati. Il sync non usa una whitelist di nomi personali.

## Filtri anti-falso-positivo

Il writer riutilizza lo stesso classificatore di PeopleSnapshot. Sono esclusi nomi o testi riconducibili a:

- GhostMe;
- Home Assistant;
- Vespa/Piaggio e altri mezzi;
- sistemi, automazioni, progetti, luoghi, calendari e servizi;
- label relazionali generiche come `mia moglie` o `mio amico` prive di un nome.

Il controllo viene applicato sia durante la raccolta delle candidate sia immediatamente prima dell'upsert.

## Mention count e idempotenza

`mention_count` e calcolato come massimo fra:

- il `mention_count` persistito nel topic sorgente;
- il numero di memorie relazionali uniche che citano la persona;
- 1 per una candidata valida appena scoperta.

Non viene mai sommato al valore esistente nel worker. Lo stesso dataset produce quindi lo stesso conteggio.

Anche `importance` e `confidence` derivano dalle evidenze correnti. Se tutti i valori calcolati coincidono con la riga esistente, l'update viene saltato e `updated_at` non cambia.

## Upsert e isolamento utente

Ogni lookup usa:

```text
user_id + normalized_name
```

Ogni insert include esplicitamente `user_id`. Gli update sono vincolati sia all'id della riga sia a `user_id`.

I log riportano stage, userId, nome, codice e messaggio per distinguere errori di:

- lettura topic;
- lettura memorie;
- lookup persona;
- insert;
- update.

## Topic links e people graph links

`topic_links` e stato analizzato ma non usato come sorgente primaria: rappresenta co-occorrenze fra topic e non prova che uno dei due sia una persona.

`people_graph_links` non viene popolato. Il codice attuale non contiene reader, writer o un contratto applicativo verificabile per questa tabella; scriverla ora introdurrebbe dati senza consumer e assunzioni sullo schema.

## File modificati

- `lib/ghostme/people/peopleGraphService.ts`
- `lib/ghostme/people/peopleSnapshot.ts`
- `PEOPLE_GRAPH_POPULATION_AUDIT_V1.md`

Analizzati senza modifiche:

- `lib/ghostme/relationshipResolver.ts`
- `lib/ghostme/people/relationshipMemorySnapshot.ts`
- `lib/ghostme/people/socialSuggestionSnapshot.ts`
- `lib/ghostme/proactive/proactiveMaintenanceFlow.ts`
- `lib/ghostme/topicLinks.ts`

UI, proactive/card lifecycle, Calendar, Goals, Actions e House non sono stati modificati.

## Test manuali

1. Creare o verificare topic persona per Valentina, Giulio, Mamma e Marco, quindi eseguire il worker proactive.
2. Verificare una riga per ogni persona valida con il corretto `user_id` e `normalized_name`.
3. Rieseguire il worker senza cambiare i dati: `mention_count` e `updated_at` devono restare invariati.
4. Aggiungere una memoria relazionale unica che cita una persona e rieseguire: il conteggio deve riflettere l'evidenza senza incrementi ripetuti.
5. Verificare una memoria `Info su Giulio`: Giulio deve essere inserito anche senza un topic gia classificato person.
6. Inserire topic GhostMe, Home Assistant e Vespa con classificazione debole o errata: non devono entrare nel grafo.
7. Verificare due utenti con lo stesso nome persona: devono produrre righe isolate per `user_id`.
8. Simulare un errore DB e verificare che il log indichi lo stage esatto.

## Verifiche automatiche

- TypeScript: PASS (`tsc --noEmit`)
- Lint del nuovo sync: PASS
- Build Next.js: PASS (`npm run build`)

## Rischi residui

- Una persona citata soltanto come nome isolato, senza category, entity type o memoria relazionale, resta volutamente esclusa per ridurre i falsi positivi.
- La prevenzione atomica di due insert concorrenti dipende dall'eventuale vincolo DB su `user_id + normalized_name`; non e stata aggiunta alcuna migration.
- Righe false positive storiche gia presenti in `people_graph` non vengono cancellate automaticamente da questo sync.
- `people_graph_links` resta scollegata finche non viene definito un contratto runtime verificabile.
