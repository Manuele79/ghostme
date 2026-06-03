import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function runRetentionCleanup(userId: string) {
  if (!userId) return;

  const now = new Date();

  const chatLimit = new Date(now);
  chatLimit.setDate(chatLimit.getDate() - 10);

  const eventLimit = new Date(now);
  eventLimit.setDate(eventLimit.getDate() - 30);

  await supabaseAdmin
    .from("chat_messages")
    .delete()
    .eq("user_id", userId)
    .lt("created_at", chatLimit.toISOString());

  await supabaseAdmin
    .from("ghost_proactive_messages")
    .update({
      status: "archived",
      updated_at: now.toISOString(),
    })
    .eq("user_id", userId)
    .eq("status", "read")
    .lt("created_at", chatLimit.toISOString());

  await supabaseAdmin
    .from("calendar_events")
    .update({
      status: "archived",
      updated_at: now.toISOString(),
    })
    .eq("user_id", userId)
    .in("status", ["completed", "cancelled"])
    .lt("updated_at", eventLimit.toISOString());
}