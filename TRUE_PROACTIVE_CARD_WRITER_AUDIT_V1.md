# TRUE PROACTIVE CARD WRITER AUDIT V1

## Esito

`snapshot.trueProactive.selected` non resta piu solo nello snapshot di debug. Il runtime proactive inoltra fino a tre candidati selezionati a un writer deterministico, che crea o aggiorna le card tramite `upsertProactiveMessage()`.

Il numero di candidati processati viene incluso nel contatore `created` gia restituito dal worker proactive, con la stessa semantica operativa usata dal writer legacy.

Il nuovo writer non usa OpenAI. Il motore proactive legacy non e stato rimosso o alterato e continua a essere eseguito dal flow esistente.

## Flow finale

```text
buildGhostBrainSnapshot
  -> trueProactiveSnapshot.selected
  -> proactiveCandidateBuilder
  -> runProactiveFlowForUser
  -> writeTrueProactiveCards (massimo 3)
  -> upsertProactiveMessage
  -> ghost_proactive_messages
```

Dopo questo passaggio il flow prosegue normalmente con candidate ranker legacy, agenda e daily briefing.

## File modificati

- `lib/ghostme/proactive/trueProactiveCardWriter.ts` (nuovo)
- `lib/ghostme/proactive/proactiveCandidateBuilder.ts`
- `lib/ghostme/proactive/proactiveUserFlow.ts`
- `TRUE_PROACTIVE_CARD_WRITER_AUDIT_V1.md`

Riutilizzato senza modifiche specifiche in questa integrazione:

- `lib/ghostme/proactive/proactiveMessageService.ts`
- `lib/ghostme/proactive/trueProactiveSnapshot.ts`

Brain, UI, Calendar/Reminder e Goals/Actions non sono stati modificati.

## Categorie generate

| Tipo true proactive | Categoria card |
| --- | --- |
| `home_safety` | `observation` |
| `imminent_calendar` | `suggestion` |
| `important_open_loop` | `suggestion` |
| `project_focus` | `project` |
| `high_confidence_curiosity` | `curiosity` |
| `relationship_attention` | `social` |

Il writer supporta quindi esclusivamente le categorie richieste: `observation`, `curiosity`, `project`, `social` e `suggestion`.

## Logical key

Formato:

```text
true_proactive_{candidate.type}_{titolo_normalizzato}
```

Esempi:

- `true_proactive_project_focus_ghostme`
- `true_proactive_high_confidence_curiosity_abitudini_di_lettura`
- `true_proactive_relationship_attention_mario`

La chiave dipende dal tipo e dal soggetto stabile della card, non dal motivo variabile. Di conseguenza:

- stesso contenuto e stessa chiave: nessuna nuova card;
- card dismissed con contenuto identico: resta dismissed;
- stesso soggetto ma contenuto cambiato: la card viene aggiornata e torna `unread`;
- esecuzioni ripetute: dedup tramite `logical_key`.

## Limite

Il writer applica autonomamente `slice(0, 3)`, anche se lo snapshot applica gia il limite di selezione. Non vengono quindi scritte piu di tre card true proactive per esecuzione.

## Fallback legacy rimasti

- Candidate builder storico e relativi generatori.
- Selezione del best candidate tramite `pickBestProactiveCandidate`.
- Writer legacy del best candidate.
- Agenda giornaliera.
- Daily briefing.
- Fallback di `upsertProactiveMessage` basato sul contenuto quando il DB non espone `logical_key`.

Nessuna nuova chiamata OpenAI e stata introdotta. Le chiamate eventualmente presenti nei motori legacy restano preesistenti e separate dal nuovo writer.

## Test manuali

1. Preparare uno snapshot con un elemento `project_focus` in `trueProactive.selected` ed eseguire il worker proactive.
2. Verificare una riga `ghost_proactive_messages` con categoria `project`, stato `unread` e logical key `true_proactive_project_focus_*`.
3. Rieseguire il worker senza cambiare il candidato: non deve comparire un duplicato.
4. Impostare la card a `dismissed` e rieseguire con contenuto identico: deve restare dismissed.
5. Cambiare il `reason` dello stesso candidato mantenendo tipo e titolo: la stessa riga deve aggiornarsi e tornare `unread`.
6. Fornire piu di tre candidati al writer: devono essere processati solo i primi tre.
7. Ripetere il test per curiosity e relationship attention, verificando le categorie `curiosity` e `social`.
8. Verificare che il best candidate legacy, agenda e daily briefing continuino a essere eseguiti.

## Verifiche automatiche

- TypeScript: PASS (`tsc --noEmit`)
- Lint del nuovo writer: PASS
- Build Next.js: PASS (`npm run build`)

## Rischi residui

- Il testo della card deriva direttamente dal `reason` deterministico dello snapshot; non viene riscritto o arricchito tramite AI.
- La disponibilita del dedup atomico concorrente dipende dall'indice univoco `user_id + category + logical_key` gia previsto dalla migration Calendar/Agenda/Reminder. Non e stata aggiunta alcuna migration.
- Il flow legacy conserva costi e failure mode preesistenti; questa integrazione non li modifica.
