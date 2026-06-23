# PEOPLE GRAPH SYSTEM V1

## Esito dell'audit

Prima di questa implementazione `people_graph` era popolata dal maintenance flow
usando `life_topics` e `memories_active`. `people_graph_links` aveva gia il
contratto polimorfico di base (`person_id`, `target_type`, `target_id`,
`target_label`, `link_type`, `weight`, `confidence`, `evidence`) ma era vuota e
non aveva reader o writer.

`relationshipMemorySnapshot` e `socialSuggestionSnapshot` erano attivi, ma
ricostruivano le associazioni cercando i nomi delle persone dentro snapshot gia
caricati. Questo rendeva utile il risultato, senza pero materializzare un grafo
navigabile.

## Architettura scelta

- `people_graph` resta la tabella dei nodi persona.
- `people_graph_links` e la sola tabella degli archi.
- Un arco e identificato da `user_id + person_id + target_type + target_key +
  link_type`.
- `target_key` usa l'UUID della destinazione quando esiste e supporta anche
  destinazioni future indirizzate da una chiave stabile.
- Gli archi persona-persona sono canonici: la coppia di UUID viene ordinata, per
  cui `A -> B` e `B -> A` sono lo stesso collegamento bidirezionale.
- L'upsert e atomico tramite `upsert_people_graph_link`; riesecuzioni della
  stessa evidenza non aumentano artificialmente il peso.
- `evidences` conserva piu osservazioni JSON, deduplicate per `key`. Ogni
  evidenza puo avere polarita `supporting`, `contradictory` o `neutral`; nessuna
  contraddizione viene risolta dal link service.
- `weight`, `confidence`, `status`, `last_reinforced_at` e `last_decayed_at`
  descrivono il ciclo di vita dell'arco.
- Gli indici permettono navigazione sia dal nodo persona sia dalla destinazione,
  senza scandire le tabelle sorgente durante il reasoning.

## Collegamenti attivati

Il sync deterministico materializza:

- person <-> person, quando due persone co-occorrono nella stessa evidenza;
- person <-> calendar_event;
- person <-> episodic_memory;
- person <-> memory (`memories_active`);
- person <-> action_intent;
- person <-> goal (`goals_desires`).

Le persone vengono riconosciute solo tra nodi gia validati in `people_graph`.
Il matching usa `related_topics` esistenti o il nome completo come token nel
testo persistito. Il link layer non invoca modelli AI.

## Predisposizioni gia disponibili

Il contratto, il vincolo SQL e l'API generica supportano senza modifiche di
schema:

- person <-> place;
- person <-> topic;
- person <-> project;
- person <-> observation.

Per attivarli basta passare una sorgente deterministica a
`upsertPeopleGraphLink`; non servono nuove tabelle o nuovi tipi di arco.

## Integrazioni

- `chatPostProcessing`: dopo il completamento dei writer sincronizza prima i
  nodi e poi gli archi usando soltanto dati effettivamente persistiti.
- `proactiveMaintenanceFlow`: sincronizza gli archi e applica il decay dopo il
  sync dei nodi.
- `peopleSnapshot`: carica gli archi adiacenti ai nodi selezionati.
- `relationshipMemorySnapshot`: usa gli archi per memorie, episodi, eventi,
  action/goal e luoghi; mantiene il calcolo precedente come fallback durante il
  rollout della migration.
- `socialSuggestionSnapshot`: riceve automaticamente i dati materializzati
  attraverso `relationshipMemorySnapshot`.
- `peopleGraphService` / `situationEngine`: il contesto persone espone ora il
  cluster adiacente sintetico.

## Ciclo di vita

Una nuova evidenza rafforza il peso. Una evidenza con la stessa chiave aggiorna
il collegamento senza duplicarla e senza incremento cumulativo. Il confidence
score conserva il valore piu forte osservato. Il maintenance riduce peso e
confidence degli archi non rinforzati oltre la finestra configurata, portandoli
da `active` a `weak` e infine a `decayed`.

Le evidenze contraddittorie restano affiancate. La loro interpretazione resta di
competenza di `relationshipResolver`, `contradictions` e `curiosity`.

## Rollout

Applicare `supabase/migrations/people_graph_system_v1.sql` prima di distribuire
il codice applicativo. La migration non crea tabelle: evolve
`people_graph_links`, conserva il campo legacy `evidence`, migra il suo contenuto
in `evidences` e installa indici, vincoli e upsert atomico.
