const INTERNAL_REPLY_MARKER = /^(?:\.{3}|PINNED|CHAT (?:RECENTE|ATTUALE|STORICA)|MEMORIA|MEMORIA STORICA|CONTESTO|CONTESTO COGNITIVO|SNAPSHOT|PEOPLE GRAPH|ATTUALE|FUTURO VERIFICATO|STORICO|RECENTE|COMPLETATO|ARCHIVIATO|CANCELLATO)(?:\s|—|-|\/|$)/i;

export function createGhostReplySanitizer() {
  let pending = "";

  return (chunk = "", final = false) => {
    pending += chunk;
    let output = "";

    while (pending) {
      const open = pending.indexOf("[");
      if (open < 0) {
        output += pending;
        pending = "";
        break;
      }
      output += pending.slice(0, open);
      pending = pending.slice(open);
      const close = pending.indexOf("]");
      if (close < 0) {
        if (final || pending.length > 160) {
          output += pending[0];
          pending = pending.slice(1);
          continue;
        }
        break;
      }
      const token = pending.slice(0, close + 1);
      const label = token.slice(1, -1).trim();
      pending = pending.slice(close + 1);
      if (INTERNAL_REPLY_MARKER.test(label)) {
        pending = pending.replace(/^\s+/, "");
      } else {
        output += token;
      }
    }

    if (final && pending) {
      output += pending;
      pending = "";
    }
    return output;
  };
}
