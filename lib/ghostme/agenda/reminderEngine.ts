import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  const { data: existing } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "reminder")
    .eq("status", "unread")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!reminders?.length) {
    if (existing?.id) {
      await supabaseAdmin
        .from("ghost_proactive_messages")
        .update({
          status: "read",
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
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

  if (existing?.id) {
    await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({
        title: "Promemoria",
        message,
        priority: 10,
        scheduled_for: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return;
  }

  await supabaseAdmin.from("ghost_proactive_messages").insert({
    user_id: userId,
    title: "Promemoria",
    message,
    category: "reminder",
    status: "unread",
    priority: 10,
    scheduled_for: new Date().toISOString(),
  });
}