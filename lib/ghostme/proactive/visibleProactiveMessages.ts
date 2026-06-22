import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { dedupeProactiveMessages } from "@/lib/ghostme/proactive/proactiveMessageDedupe";
import { buildDailyProactiveLogicalKey } from "@/lib/ghostme/proactive/proactiveMessageService";
import {
  VISIBLE_PROACTIVE_CATEGORIES,
  VISIBLE_PROACTIVE_STATUSES,
} from "@/lib/ghostme/proactive/proactiveCardLifecycle";

const OBSERVATION_TTL_MS = 24 * 60 * 60 * 1000;
const LEGACY_REMINDER_TTL_MS = 2 * 60 * 60 * 1000;

async function expireStaleVisibleCards(userId: string) {
  const { data: cards, error } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id, category, logical_key, created_at, updated_at")
    .eq("user_id", userId)
    .in("status", VISIBLE_PROACTIVE_STATUSES)
    .in("category", ["agenda", "daily_briefing", "observation", "reminder"]);
  if (error) throw error;

  const now = Date.now();
  const todayKeys: Record<string, string> = {
    agenda: buildDailyProactiveLogicalKey("agenda"),
    daily_briefing: buildDailyProactiveLogicalKey("daily_briefing"),
  };
  const reminderEventIds = (cards || [])
    .filter((card) => card.category === "reminder")
    .map((card) =>
      String(card.logical_key || "").match(
        /^reminder_\d{4}-\d{2}-\d{2}_(.+)$/
      )?.[1]
    )
    .filter(Boolean) as string[];
  const activeReminderResult = reminderEventIds.length
    ? await supabaseAdmin
        .from("calendar_events")
        .select("id, remind_at")
        .eq("user_id", userId)
        .eq("status", "active")
        .in("id", reminderEventIds)
    : { data: [] as Array<{ id: string; remind_at: string | null }>, error: null };
  if (activeReminderResult.error) throw activeReminderResult.error;
  const activeReminderEvents = activeReminderResult.data;
  const activeReminderIds = new Set(
    (activeReminderEvents || [])
      .filter((event) => {
        const remindAt = new Date(event.remind_at || 0).getTime();
        return Number.isFinite(remindAt) && remindAt >= now - 30 * 60 * 1000;
      })
      .map((event) => event.id)
  );

  const staleIds = (cards || [])
    .filter((card) => {
      const expectedKey = todayKeys[card.category];
      if (expectedKey) return card.logical_key !== expectedKey;

      const updatedAt = new Date(card.updated_at || card.created_at || 0).getTime();
      if (card.category === "observation") {
        return !Number.isFinite(updatedAt) || now - updatedAt > OBSERVATION_TTL_MS;
      }

      if (card.category === "reminder") {
        const eventId = String(card.logical_key || "").match(
          /^reminder_\d{4}-\d{2}-\d{2}_(.+)$/
        )?.[1];
        return eventId
          ? !activeReminderIds.has(eventId)
          : !Number.isFinite(updatedAt) || now - updatedAt > LEGACY_REMINDER_TTL_MS;
      }

      return false;
    })
    .map((card) => card.id);

  if (staleIds.length) {
    const { error: expireError } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .in("status", VISIBLE_PROACTIVE_STATUSES)
      .in("id", staleIds);
    if (expireError) throw expireError;
  }
}

export async function loadVisibleProactiveMessages(userId: string) {
  await expireStaleVisibleCards(userId);

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
  const dedupedRows = dedupeProactiveMessages(currentRows);
  const keptIds = new Set(dedupedRows.map((message) => message.id));
  const duplicateIds = currentRows
    .filter((message) => !keptIds.has(message.id))
    .map((message) => message.id);

  if (duplicateIds.length) {
    const { error: duplicateError } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .in("status", VISIBLE_PROACTIVE_STATUSES)
      .in("id", duplicateIds);
    if (duplicateError) throw duplicateError;
  }

  return dedupedRows.slice(0, 20);
}
