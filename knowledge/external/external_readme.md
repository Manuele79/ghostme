# External Context

Questa cartella contiene snapshot read-only di sistemi esterni usati da GhostMe.

NON modificare questi file come sorgente runtime.
NON inserire password, token, secret, URL privati sensibili o chiavi API.

Scopo:
- far vedere a Codex il contesto reale di Supabase;
- far vedere a Codex il contesto reale di Home Assistant;
- permettere audit completi tra codice GhostMe, DB e automazioni casa.

Cartelle:
- home-assistant: automazioni, entità, aree, helper, sensori e snapshot casa.
- supabase-schema: schema reale DB, policies, indexes, functions.
- runtime-snapshots: esportazioni JSON/CSV utili per debug.