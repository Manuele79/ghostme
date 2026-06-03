import { refreshAgendaMessage } from "@/lib/ghostme/calendar/calendarService";

export async function runProactiveTrigger({
  userId,
  trigger,
}: {
  userId: string;
  trigger:
    | "calendar_changed"
    | "daily"
    | "location_changed"
    | "memory_gap"
    | "conversation_insight";
}) {
  switch (trigger) {
    case "calendar_changed":
      await refreshAgendaMessage(userId);
      break;

    case "daily":
      console.log("DAILY TRIGGER");
      break;

    case "location_changed":
      console.log("LOCATION TRIGGER");
      break;

    case "memory_gap":
      console.log("MEMORY GAP TRIGGER");
      break;

    case "conversation_insight":
      console.log("CONVERSATION INSIGHT TRIGGER");
      break;
  }
}