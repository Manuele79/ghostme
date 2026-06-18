import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildDailyProactiveLogicalKey,
  upsertProactiveMessage,
} from "@/lib/ghostme/proactive/proactiveMessageService";

export async function refreshReminderMessage(userId: string) {
  if (!userId) return;

  const now = new Date();
  const nextHour = new Date(Date.now() + 60 * 60 * 1000);

  const { data: reminders } = await supabaseAdmin
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("remind_at", now.toISOString())
    .lte("remind_at", nextHour.toISOString())
    .order("remind_at", { ascending: true })
    .limit(5);

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

  const message =
    "Promemoria imminenti:\n" +
    reminders
      .map((event) => {
        const time = new Date(event.remind_at).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Rome",
        });

        return `• ${time} — ${event.title}`;
      })
      .join("\n");

  await upsertProactiveMessage({
    userId,
    title: "Promemoria",
    message,
    category: "reminder",
    priority: 10,
    logicalKey: buildDailyProactiveLogicalKey("reminder"),
  });
}
