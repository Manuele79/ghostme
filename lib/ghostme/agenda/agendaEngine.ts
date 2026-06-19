import { GhostSituation } from "@/lib/ghostme/situation/situationEngine";

function formatTime(value?: string | null) {
  if (!value) return "orario non specificato";

  return new Date(value).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });
}

type AgendaEvent = {
  title: string;
  start_at?: string | null;
  remind_at?: string | null;
};

function eventDateValue(event: AgendaEvent) {
  return event.start_at || event.remind_at || null;
}

export function buildAgendaMessage(input: GhostSituation | AgendaEvent[]) {
  const today = (Array.isArray(input) ? input : input.calendarToday || []) as AgendaEvent[];
  if (!today.length) return null;

  return today
    .slice()
    .sort((left, right) => {
      const leftTime = new Date(eventDateValue(left) || 0).getTime();
      const rightTime = new Date(eventDateValue(right) || 0).getTime();
      return leftTime - rightTime;
    })
    .slice(0, 5)
    .map((event) => {
      const value = eventDateValue(event);
      return `• ${formatTime(value)} — ${event.title}`;
    })
    .join("\n");
}
