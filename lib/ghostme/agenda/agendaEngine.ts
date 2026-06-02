import { GhostSituation } from "@/lib/ghostme/situation/situationEngine";

function formatTime(value?: string | null) {
  if (!value) return "orario non specificato";

  return new Date(value).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
  });
}

function eventDateValue(event: any) {
  return event.start_at || event.remind_at || null;
}

export function buildAgendaMessage(situation: GhostSituation) {
  const today = situation.calendarToday || [];
  const upcoming = (situation.upcomingEvents || []).filter((event) => {
    const value = eventDateValue(event);
    if (!value) return false;

    return !today.some((t) => t.id === event.id);
  });

  if (!today.length && !upcoming.length) return null;

  const todayRows = today
    .slice(0, 5)
    .map((event) => {
      const value = eventDateValue(event);
      return `• ${formatTime(value)} — ${event.title}`;
    })
    .join("\n");

  const upcomingRows = upcoming
    .slice(0, 5)
    .map((event) => {
      const value = eventDateValue(event);
      return `• ${formatDate(value)} ${formatTime(value)} — ${event.title}`;
    })
    .join("\n");

  return [
    todayRows ? `Oggi:\n${todayRows}` : "",
    upcomingRows ? `Prossimi eventi:\n${upcomingRows}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}