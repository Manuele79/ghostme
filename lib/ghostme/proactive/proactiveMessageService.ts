import { supabaseAdmin } from "@/lib/supabaseAdmin";

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function upsertProactiveMessage({
  userId,
  title,
  message,
  category,
  priority,
}: {
  userId: string;
  title: string;
  message: string;
  category: string;
  priority: number;
}) {
  if (!userId || !message?.trim()) return;

  const { data: existing } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", category)
    .gte("created_at", startOfTodayIso())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { data: oldMessage } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("message, status")
      .eq("id", existing.id)
      .maybeSingle();

    const messageChanged = oldMessage?.message !== message;

    await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({
        title,
        message,
        priority,
        status: messageChanged ? "unread" : oldMessage?.status || "read",
        read_at: messageChanged ? null : undefined,
        scheduled_for: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return;
  }

  await supabaseAdmin.from("ghost_proactive_messages").insert({
    user_id: userId,
    title,
    message,
    category,
    status: "unread",
    priority,
    scheduled_for: new Date().toISOString(),
  });
}