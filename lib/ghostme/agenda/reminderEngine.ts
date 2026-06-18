import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildDailyProactiveLogicalKey,
  upsertProactiveMessage,
} from "@/lib/ghostme/proactive/proactiveMessageService";

function buildEventReminderLogicalKey(event: any) {
  const dayKey = buildDailyProactiveLogicalKey(
    "reminder",
    new Date(event.start_at || event.remind_at || Date.now())
  );

  return `${dayKey}_${event.id}`;
}

function formatReminderTime(value?: string | null) {
  if (!value) return "orario non specificato";

  return new Date(value).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });
}

export async function refreshReminderMessage(userId: string) {
  if (!userId) return;

  const now = new Date();
  const nextReminderWindow = new Date(Date.now() + 30 * 60 * 1000);

  const { data: reminders } = await supabaseAdmin
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("start_at", now.toISOString())
    .lte("start_at", nextReminderWindow.toISOString())
    .order("start_at", { ascending: true })
    .limit(10);

  if (!reminders?.length) {
    await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("category", "reminder")
      .in("status", ["unread", "read"]);
    return;
  }

  for (const event of reminders) {
    const time = formatReminderTime(event.start_at || event.remind_at);
    const message = `Promemoria appuntamento:\n- ${time} - ${event.title}`;

    await upsertProactiveMessage({
      userId,
      title: "Promemoria",
      message,
      category: "reminder",
      priority: 10,
      logicalKey: buildEventReminderLogicalKey(event),
    });
  }
}
