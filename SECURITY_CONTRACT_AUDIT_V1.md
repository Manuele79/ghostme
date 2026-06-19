# GHOSTME SECURITY & CONTRACT STABILIZATION V1

Data audit: 2026-06-20

## Esito

Audit mirato completato sulle route e sui contratti richiesti. I fix sono limitati a autenticazione, autorizzazione e integrità dei payload runtime. Non sono state aggiunte feature o migration e non sono stati modificati Brain, Curiosity o Project Advisor.

## Bug trovati e fix applicati

### Auth server-side

- `Calendar` (`POST`, `PATCH`, `DELETE`) fidava `body.userId`. Ora deriva sempre l'utente dal token/sessione e usa quel valore anche nei filtri `user_id` e nel refresh agenda.
- `Goals update` fidava `body.userId`. Ora usa l'utente autenticato e mantiene il filtro ownership sul goal.
- `Actions update` era già protetta con sessione e filtro `user_id`; verificata senza modifiche funzionali.
- `Memory search` passava direttamente tutto il body al flow admin. Ora sostituisce il contesto utente con quello autenticato prima della ricerca.
- Tutte le route `Location` fidavano `userId`; `delete-place` eliminava inoltre per solo `id`. Ora tutte usano la sessione e la delete è filtrata anche per `user_id`.
- `House suggestion response` cercava il messaggio proattivo per solo `id`. Ora richiede sessione, filtra il messaggio per `user_id` e limita allo stesso utente anche l'update finale.
- L'override manuale dell'helper auth era consentito in ogni ambiente diverso da production. Ora è consentito solo con `NODE_ENV=development` oppure con un `WORKER_SECRET` valido.
- I caller client delle route appena protette inviano ora il bearer token Supabase tramite l'helper auth già esistente. Non sono state cambiate interfaccia o logica UI.

### Worker

- `/api/worker/proactive` era pubblico e poteva processare tutti gli utenti. Ora richiede sempre un `WORKER_SECRET` configurato e valido.
- `/api/worker/house` permetteva l'accesso pubblico quando `WORKER_SECRET` non era configurato. Ora fallisce chiuso se il secret manca o non coincide.
- Il secret può essere passato con `x-worker-secret`, `x-ghostme-worker-secret` o query `token`, mantenendo compatibilità con i caller esistenti.

### Debug e test

- `/api/debug-ha-entities`, `/api/debug-house-logger`, `/api/test-ha`, `/api/test-home-context` e `/api/test-home-reasoning` erano pubbliche.
- `/api/debug-reasoning` richiedeva auth utente ma restava una route debug disponibile in produzione.
- Ora tutte le route debug/test sono accessibili solo in development oppure con `WORKER_SECRET` valido. Reasoning continua anche a risolvere il contesto utente tramite l'helper auth.

### Home Assistant webhook

- `/api/home-assistant/event` accettava richieste senza secret se il secret non era configurato.
- Accettava `userId` arbitrario dal body e usava `GHOSTME_TEST_USER_ID` anche fuori development.
- Accettava entity non presenti nella allowlist e poteva propagare `event_type` arbitrari.
- Ora, fuori development, il webhook richiede `HOME_ASSISTANT_WEBHOOK_SECRET` (o il fallback `WORKER_SECRET`).
- L'utente viene esclusivamente dal mapping server `GHOSTME_HOME_ASSISTANT_USER_ID` o `HOME_ASSISTANT_USER_ID`. Un `userId` nel payload è solo una verifica e viene rifiutato se diverso dal mapping.
- `GHOSTME_TEST_USER_ID` è fallback solo in development.
- Entity non presenti in `homeEntityMapper` vengono rifiutate; gli event type sono derivati dal mapping/stato, salvo il caso HA noto `automation_triggered`.

## Route protette

- `/api/calendar-events` — sessione; override solo development/worker secret.
- `/api/goals/update-status` — sessione; ownership sul goal.
- `/api/actions/update-status` — sessione; ownership già presente e verificata.
- `/api/memory/search` — sessione; tutte le query filtrate sul relativo utente.
- `/api/location/current-place`
- `/api/location/current-state`
- `/api/location/delete-place`
- `/api/location/places`
- `/api/location/save-place`
- `/api/location/update-current`
- `/api/house-suggestion-response` — sessione e ownership sul messaggio.
- `/api/worker/proactive` — worker secret obbligatorio.
- `/api/worker/house` — worker secret obbligatorio.
- `/api/debug-ha-entities`
- `/api/debug-house-logger`
- `/api/debug-reasoning`
- `/api/test-ha`
- `/api/test-home-context`
- `/api/test-home-reasoning`
- `/api/home-assistant/event` — webhook secret, mapping utente ed entity allowlist.

## DB contract check

Lo schema reale è stato verificato in sola lettura tramite metadata OpenAPI del Supabase configurato in `.env.local`; non sono stati letti dati utente.

### `house_patterns`

- Tabella presente nel DB reale.
- Le colonne usate dal writer `housePatternEngine` e dal reader `userContextGraph` sono presenti.
- I campi obbligatori scritti dal runtime (`user_id`, `pattern_type`, `title`) sono coerenti; `confidence`, `occurrences`, `status` e timestamp hanno default compatibili.
- La migration esistente `ghostme_db_contract_fix_v1.sql` coincide con il contratto esposto dal DB reale. Nessuna nuova migration aggiunta.

### `ghost_proactive_messages.logical_key` e `answered_at`

- Entrambe le colonne sono presenti nel DB reale e nullable, come richiesto dal runtime.
- `logical_key` è compatibile con lookup/upsert e con il fallback legacy già presente nel service.
- `answered_at` è compatibile con il lifecycle. La risposta ai suggerimenti casa ora salva `status=answered`, `read_at`, `answered_at` e `updated_at`.

### `chat_messages.message_order`

- Nel DB reale `message_order` è `bigint`, obbligatorio (`NOT NULL`) e senza default.
- Il metadata PostgREST non espone i trigger, quindi la loro presenza non è verificabile da quel canale.
- Il precedente insert client non inviava `message_order` e poteva fallire in assenza di trigger.
- L'insert ora assegna esplicitamente due valori bigint-safe, monotoni nel batch, basati sul timestamp. La riuscita non dipende più da default o trigger DB.

## Route ancora da sistemare

Fuori dal perimetro di fix richiesto, ma rilevate durante la verifica completa delle API:

- `/api/memory` accetta `user_id` dal client e inserisce memoria senza risolvere la sessione server-side.
- `/api/conversation-summary` accetta `userId` dal client e avvia letture/scritture admin indirette senza verifica sessione.

Non sono state modificate per rispettare il perimetro esplicito “Memory search” e il divieto di refactor generale.

## Rischi residui e requisiti operativi

- In produzione devono essere configurati `WORKER_SECRET` e, per HA, `HOME_ASSISTANT_WEBHOOK_SECRET` (oppure il fallback worker) e `GHOSTME_HOME_ASSISTANT_USER_ID`/`HOME_ASSISTANT_USER_ID`. In assenza, gli endpoint falliscono chiusi.
- I secret in query string restano supportati per compatibilità, ma possono finire nei log HTTP. Preferire gli header dedicati.
- L'allowlist HA è statica: nuove entity devono essere aggiunte esplicitamente a `homeEntityMapper` prima di essere accettate.
- Non è stato eseguito un insert sintetico sul DB reale per evitare scritture di audit. Il contratto `message_order` è stato stabilizzato applicativamente e verificato staticamente.
- Il lint mirato segnala errori preesistenti (`no-explicit-any`, regole React e `prefer-const`) nei file storici; non sono stati corretti perché fuori scope. Il typecheck TypeScript passa.

## Verifiche eseguite

- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS (build di produzione Next.js e generazione di tutte le route).
- `git diff --check`: nessun errore whitespace (solo warning di normalizzazione LF/CRLF del repository).
- Metadata DB reale: PASS per presenza e shape di `house_patterns`, `logical_key`, `answered_at` e `message_order`.
- Nessuna nuova migration.
