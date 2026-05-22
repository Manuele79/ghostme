export function getLocalTimeContext(location?: string) {
  const now = new Date();

  return `
SERVIZIO ORA ATTIVO:
Località profilo: ${location || "non specificata"}
Data attuale: ${now.toLocaleDateString("it-IT")}
Ora server: ${now.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  })}
`;
}