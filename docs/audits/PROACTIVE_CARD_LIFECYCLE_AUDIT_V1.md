# PROACTIVE CARD LIFECYCLE AUDIT V1

## Esito

Il lifecycle delle card proactive usa ora un contratto unico per visibilita, categorie, transizioni utente e deduplica. Brain API e Proactive API continuano a leggere dallo stesso loader condiviso; Brain non e stato modificato.

## Flow finale

```text
writer proactive
  -> upsertProactiveMessage
  -> identita: logical_key oppure category + title + message normalizzato
  -> ghost_proactive_messages
  -> loadVisibleProactiveMessages
  -> filtro status/categorie + dedup condiviso
  -> Brain API e Proactive API
  -> front card / drawer
  -> API proactive/read
  -> read | dismissed | answered
```

Le transizioni terminali sono idempotenti: una card gia `dismissed`, `answered`, `expired` o `archived` non viene riportata a uno stato visibile da una successiva azione client.

## Bug trovati e fix applicati

- Le categorie `suggestion`, `project` e `social` erano escluse dal loader visibile. Sono state aggiunte al contratto condiviso.
- Il dedup applicava regole speciali diverse per observation e curiosity. Ora usa un'unica identita: `logical_key`, quando presente; altrimenti categoria, titolo e messaggio normalizzati.
- Un upsert con contenuto identico poteva aggiornare nuovamente una card gia gestita. Ora e un no-op e conserva lo stato terminale.
- Un contenuto realmente cambiato con lo stesso `logical_key` riapre la card come `unread`; il contenuto identico non la riapre.
- La route delle azioni accettava anche `expired` dal client. Ora il client puo richiedere solo `read`, `dismissed` o `answered`; `expired` resta una transizione interna.
- Le azioni concorrenti potevano sovrascrivere uno stato terminale. L'update e ora condizionato agli stati visibili e gestisce in modo idempotente le race.
- La chat nascondeva ottimisticamente una card prima della conferma server: in caso di errore la card ricompariva al refresh. Ora viene rimossa localmente solo dopo una risposta API valida.

## Status supportati

Visibili:

- `unread`
- `read`

Non visibili e terminali:

- `dismissed`
- `answered`
- `expired`
- `archived`

Azioni utente:

- Spunta / Archivia -> `dismissed`
- Rispondi -> apertura chat; dopo invio riuscito -> `answered`
- Fatto -> resta delegato al contesto compatibile gia esistente, quindi card terminale e non visibile
- Expired -> solo quando la card non e piu valida, non impostabile dal client

## Categorie supportate

- `agenda`
- `reminder`
- `daily_briefing`
- `observation`
- `curiosity`
- `home_question`
- `suggestion`
- `project`
- `social`

## Dedup finale

Il punto principale e `proactiveMessageDedupe.ts`, usato sia dal writer sia dal loader condiviso:

1. Se esiste `logical_key`, l'identita e il suo valore normalizzato.
2. Altrimenti l'identita e `category + title + normalized message`.
3. Brain API e Proactive API ricevono quindi lo stesso insieme gia filtrato e deduplicato.

## File modificati

- `lib/ghostme/proactive/proactiveCardLifecycle.ts` (nuovo contratto lifecycle)
- `lib/ghostme/proactive/proactiveMessageDedupe.ts`
- `lib/ghostme/proactive/proactiveMessageService.ts`
- `lib/ghostme/proactive/visibleProactiveMessages.ts`
- `app/api/ghostme/proactive/read/route.ts`
- `app/chat/page.tsx`
- `PROACTIVE_CARD_LIFECYCLE_AUDIT_V1.md`

Analizzati senza modifiche:

- `app/api/proactive/messages/route.ts`
- `app/api/ghostme/brain/route.ts`
- `components/ghost/GhostDrawers.tsx`

## Test manuali

1. Aprire una card `unread`, archiviarla e ricaricare: non deve riapparire.
2. Premere Rispondi, inviare il messaggio e ricaricare: la card deve risultare `answered` e non riapparire.
3. Verificare una riga `expired`: non deve essere restituita da nessuna delle due API.
4. Confrontare Brain API e Proactive API per lo stesso utente: devono mostrare lo stesso insieme visibile.
5. Inserire due card identiche senza `logical_key`: deve apparirne una sola.
6. Verificare una card `curiosity` in stato `unread` o `read`: deve apparire.
7. Verificare card `project`, `social` e `suggestion` in stato visibile: non devono essere scartate.
8. Archiviare una card e riproporre lo stesso contenuto tramite writer: deve restare terminale.
9. Cambiare il contenuto di una card con lo stesso `logical_key`: deve tornare `unread` una sola volta.

## Verifiche automatiche

- TypeScript: PASS (`tsc --noEmit`)
- Build Next.js: PASS (`npm run build`)

## Rischi residui

- Eventuali duplicati storici restano nel DB, ma vengono nascosti dal dedup in lettura; non e stata aggiunta alcuna migration.
- Un writer esterno che inserisce direttamente nel DB, senza usare il service, puo ancora creare duplicati fisici.
- Senza `logical_key`, un contenuto modificato e intenzionalmente considerato una nuova identita.
- L'aggiornamento contestuale di un reminder e della relativa card conserva la transazione applicativa preesistente e non e stato rifattorizzato in questa attivita.
