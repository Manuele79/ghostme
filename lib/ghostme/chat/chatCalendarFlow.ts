import { parseCalendarIntent } from "@/lib/ghostme/calendar/calendarIntent";
import { createCalendarEvent } from "@/lib/ghostme/calendar/calendarService";

export async function handleChatCalendarFlow({
  userId,
  message,
  userLocation,
}: {
  userId?: string;
  message: string;
  userLocation: string;
}) {
  let calendarCreatedText = "";
  if (userId) {
    try {
      const calendarIntent = await parseCalendarIntent({
        message,
        nowIso: new Date().toLocaleString("sv-SE", {
          timeZone: "Europe/Rome",
        }).replace(" ", "T"),
        location: userLocation,
      });

      const calendarTitle = calendarIntent.title?.trim();
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
          `âœ… Fatto. Ho aggiunto "${calendarTitle}" al calendario.` +
          (savedEvent.start_at
            ? `\nðŸ“… ${new Date(savedEvent.start_at).toLocaleString("it-IT", {
                dateStyle: "short",
                timeStyle: "short",
                timeZone: "Europe/Rome",
              })}`
            : "") +
          (savedEvent.remind_at
            ? `\nðŸ”” Promemoria impostato`
            : "");
      }
      }
    } catch (err) {
      console.log("CALENDAR CREATE FLOW ERROR:", err);
    }
  }

  return calendarCreatedText || null;
}
