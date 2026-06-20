import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { dedupeProactiveMessages } from "@/lib/ghostme/proactive/proactiveMessageDedupe";
import { buildDailyProactiveLogicalKey } from "@/lib/ghostme/proactive/proactiveMessageService";
import {
  VISIBLE_PROACTIVE_CATEGORIES,
  VISIBLE_PROACTIVE_STATUSES,
} from "@/lib/ghostme/proactive/proactiveCardLifecycle";

export async function loadVisibleProactiveMessages(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("*")
    .eq("user_id", userId)
    .in("status", VISIBLE_PROACTIVE_STATUSES)
    .in("category", VISIBLE_PROACTIVE_CATEGORIES)
    .order("priority", { ascending: false })
    .order("scheduled_for", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const todayKeys: Record<string, string> = {
    agenda: buildDailyProactiveLogicalKey("agenda"),
    daily_briefing: buildDailyProactiveLogicalKey("daily_briefing"),
  };
  const currentRows = (data || []).filter((message) => {
    const expectedKey = todayKeys[message.category];
    return !expectedKey || message.logical_key === expectedKey;
  });

  return dedupeProactiveMessages(currentRows).slice(0, 20);
}
