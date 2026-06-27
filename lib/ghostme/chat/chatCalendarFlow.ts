import { parseCalendarIntent } from "@/lib/ghostme/calendar/calendarIntent";
import { createCalendarEvent } from "@/lib/ghostme/calendar/calendarService";
import type { CognitiveDecision } from "@/lib/ghostme/chat/chatTypes";

const GENERIC_CALENDAR_TITLES = new Set(["appuntamento", "promemoria", "nota"]);

function cleanText(value: any) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function deriveCalendarTitle({
  parsedTitle,
  description,
  message,
  type,
}: {
  parsedTitle?: string | null;
  description?: string | null;
  message: string;
  type: string;
}) {
  const cleanTitle = cleanText(parsedTitle);

  if (cleanTitle && !GENERIC_CALENDAR_TITLES.has(cleanTitle.toLowerCase())) {
    return cleanTitle;
  }

  const cleanDescription = cleanText(description);
  if (cleanDescription && !GENERIC_CALENDAR_TITLES.has(cleanDescription.toLowerCase())) {
    return type === "appointment"
      ? `Appuntamento: ${cleanDescription}`
      : cleanDescription;
  }

  const afterComma = cleanText(message.split(",").slice(1).join(","));
  if (afterComma) {
    return type === "appointment" ? `Appuntamento: ${afterComma}` : afterComma;
  }

  return cleanTitle;
}

export async function handleChatCalendarFlow({
  userId,
  message,
  userLocation,
  cognitiveDecision,
}: {
  userId?: string;
  message: string;
  userLocation: string;
  cognitiveDecision?: CognitiveDecision;
}) {
  let calendarCreatedText = "";
  void cognitiveDecision;
  if (userId) {
    try {
      const calendarIntent = await parseCalendarIntent({
        message,
        nowIso: new Date().toLocaleString("sv-SE", {
          timeZone: "Europe/Rome",
        }).replace(" ", "T"),
        location: userLocation,
      });

      const calendarTitle = deriveCalendarTitle({
        parsedTitle: calendarIntent.title,
        description: calendarIntent.description,
        message,
        type: calendarIntent.type || "appointment",
      });
      if (calendarIntent.has_calendar_intent && calendarTitle) {
        const savedEvent = await createCalendarEvent({
          userId,
          type: calendarIntent.type || "appointment",
          title: calendarTitle,
          description: calendarIntent.description || "",
          startAt: calendarIntent.start_at || null,
          endAt: calendarIntent.end_at || null,
          remindAt: calendarIntent.remind_at || null,
          source: "ghostme",
        });
      if (savedEvent) {
        calendarCreatedText =
          `Fatto. Ho aggiunto "${savedEvent.title || calendarTitle}" al calendario.` +
          (savedEvent.start_at
            ? `\n${new Date(savedEvent.start_at).toLocaleString("it-IT", {
                dateStyle: "short",
                timeStyle: "short",
                timeZone: "Europe/Rome",
              })}`
            : "") +
          (savedEvent.remind_at
            ? `\nPromemoria impostato`
            : "");
      }
      }
    } catch (err) {
      console.log("CALENDAR CREATE FLOW ERROR:", err);
    }
  }

  return calendarCreatedText || null;
}
