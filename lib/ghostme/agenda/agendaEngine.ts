import { GhostSituation } from "@/lib/ghostme/situation/situationEngine";

export function buildAgendaMessage(situation: GhostSituation) {
  const today = situation.calendarToday || [];

  if (!today.length) return null;

  const rows = today
    .slice(0, 5)
    .map((event) => {
      const rawDate = event.start_at || event.remind_at || "";
      const time = rawDate
        ? new Date(rawDate).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "orario non specificato";

      return `• ${time} — ${event.title}`;
    })
    .join("\n");

  return `Oggi hai:\n${rows}`;
}