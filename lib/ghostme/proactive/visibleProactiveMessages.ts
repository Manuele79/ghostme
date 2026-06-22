import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { dedupeProactiveMessages } from "@/lib/ghostme/proactive/proactiveMessageDedupe";
import { buildDailyProactiveLogicalKey } from "@/lib/ghostme/proactive/proactiveMessageService";
import {
  VISIBLE_PROACTIVE_CATEGORIES,
  VISIBLE_PROACTIVE_STATUSES,
} from "@/lib/ghostme/proactive/proactiveCardLifecycle";

const OBSERVATION_TTL_MS = 24 * 60 * 60 * 1000;
const CURIOSITY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LEGACY_REMINDER_TTL_MS = 2 * 60 * 60 * 1000;
const SUGGESTION_TTL_MS = 24 * 60 * 60 * 1000;
const PROJECT_TTL_MS = 48 * 60 * 60 * 1000;
const SOCIAL_TTL_MS = 72 * 60 * 60 * 1000;

async function expireStaleVisibleCards(userId: string) {
  const { data: cards, error } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id, category, logical_key, created_at, updated_at, scheduled_for")
    .eq("user_id", userId)
    .in("status", VISIBLE_PROACTIVE_STATUSES)
    .in("category", [
      "agenda",
      "daily_briefing",
      "observation",
      "reminder",
      "curiosity",
      "suggestion",
      "project",
      "social",
    ]);
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

      const freshnessAt = new Date(
        card.scheduled_for || card.created_at || 0
      ).getTime();
      if (card.category === "observation") {
        return !Number.isFinite(freshnessAt) || now - freshnessAt > OBSERVATION_TTL_MS;
      }

      if (card.category === "curiosity") {
        return !Number.isFinite(freshnessAt) || now - freshnessAt > CURIOSITY_TTL_MS;
      }

      if (card.category === "suggestion") {
        return !Number.isFinite(freshnessAt) || now - freshnessAt > SUGGESTION_TTL_MS;
      }

      if (card.category === "project") {
        return !Number.isFinite(freshnessAt) || now - freshnessAt > PROJECT_TTL_MS;
      }

      if (card.category === "social") {
        return !Number.isFinite(freshnessAt) || now - freshnessAt > SOCIAL_TTL_MS;
      }

      if (card.category === "reminder") {
        const eventId = String(card.logical_key || "").match(
          /^reminder_\d{4}-\d{2}-\d{2}_(.+)$/
        )?.[1];
        return eventId
          ? !activeReminderIds.has(eventId)
          : !Number.isFinite(freshnessAt) || now - freshnessAt > LEGACY_REMINDER_TTL_MS;
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
  const staleVisibleIds = currentRows
    .filter((message) => !keptIds.has(message.id))
    .map((message) => message.id);
  const bandLimits = { critical: 1, high: 2, normal: 3 };
  const bandCounts = { critical: 0, high: 0, normal: 0 };
  const limitedRows = dedupedRows.filter((message) => {
    const priority = Number(message.priority || 0);
    const band = priority >= 9 ? "critical" : priority >= 7 ? "high" : priority >= 4 ? "normal" : null;
    if (!band) return true;
    if (bandCounts[band] >= bandLimits[band]) {
      staleVisibleIds.push(message.id);
      return false;
    }
    bandCounts[band] += 1;
    return true;
  });

  if (staleVisibleIds.length) {
    const { error: duplicateError } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .in("status", VISIBLE_PROACTIVE_STATUSES)
      .in("id", staleVisibleIds);
    if (duplicateError) throw duplicateError;
  }

  return limitedRows.slice(0, 20);
}
