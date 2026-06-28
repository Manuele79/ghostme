# Home Assistant Snapshot

Questa cartella contiene snapshot read-only del sistema Home Assistant collegato a GhostMe.

NON contiene token.
NON contiene secret.
NON contiene password.
NON è usata dal runtime.
Serve solo come contesto per VS Code, Codex e audit.

## Obiettivo

Permettere a Codex di capire:

- stanze;
- entità;
- sensori;
- luci;
- media player;
- helper;
- automazioni;
- flussi Casa Pensante;
- eventi che Home Assistant manda a GhostMe.

## File futuri consigliati

- entities_snapshot.json
- devices_snapshot.json
- areas_snapshot.json
- automations_snapshot.json
- helpers_snapshot.json
- services_snapshot.json
- casa_pensante_summary.md

## Regola

Non modificare questi file per cambiare Home Assistant.
Sono solo copie di lettura.
Le modifiche vere vanno fatte su Home Assistant.