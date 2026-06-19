import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildDailyProactiveLogicalKey,
  upsertProactiveMessage,
} from "@/lib/ghostme/proactive/proactiveMessageService";

type ReminderEvent = {
  id: string;
  title: string;
  remind_at: string;
};

function buildEventReminderLogicalKey(event: ReminderEvent) {
  return `${buildDailyProactiveLogicalKey(
    "reminder",
    new Date(event.remind_at)
  )}_${event.id}`;
}

function formatReminderTime(value: string) {
  return new Date(value).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });
}

export async function refreshReminderMessage(userId: string) {
  if (!userId) return;

  const windowStart = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const windowEnd = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const { data: events, error } = await supabaseAdmin
    .from("calendar_events")
    .select("id, title, remind_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .not("remind_at", "is", null)
    .gte("remind_at", windowStart)
    .lte("remind_at", windowEnd)
    .order("remind_at", { ascending: true })
    .limit(20);

  if (error) throw error;

  const activeKeys = new Set<string>();
  for (const event of (events || []) as ReminderEvent[]) {
    const logicalKey = buildEventReminderLogicalKey(event);
    activeKeys.add(logicalKey);

    await upsertProactiveMessage({
      userId,
      title: "Promemoria",
      message: `Promemoria:\n- ${formatReminderTime(event.remind_at)} - ${event.title}`,
      category: "reminder",
      priority: 10,
      logicalKey,
    });
  }

  const { data: cards, error: cardsError } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id, logical_key, status, created_at")
    .eq("user_id", userId)
    .eq("category", "reminder")
    .in("status", ["unread", "read", "dismissed", "answered", "expired"])
    .order("created_at", { ascending: false });

  if (cardsError) throw cardsError;

  const keptKeys = new Set<string>();
  const expireIds: string[] = [];

  for (const card of cards || []) {
    const logicalKey = String(card.logical_key || "");
    const isCurrent = activeKeys.has(logicalKey);

    if (isCurrent && !keptKeys.has(logicalKey)) {
      keptKeys.add(logicalKey);
      continue;
    }

    if (!["answered", "expired"].includes(card.status)) {
      expireIds.push(card.id);
    }
  }

  if (expireIds.length) {
    const { error: expireError } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .in("id", expireIds);

    if (expireError) throw expireError;
  }
}

export async function refreshActiveReminderUsers() {
  const windowStart = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const windowEnd = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const [eventsResult, cardsResult] = await Promise.all([
    supabaseAdmin
      .from("calendar_events")
      .select("user_id")
      .eq("status", "active")
      .not("remind_at", "is", null)
      .gte("remind_at", windowStart)
      .lte("remind_at", windowEnd),
    supabaseAdmin
      .from("ghost_proactive_messages")
      .select("user_id")
      .eq("category", "reminder")
      .in("status", ["unread", "read", "dismissed"]),
  ]);

  if (eventsResult.error) throw eventsResult.error;
  if (cardsResult.error) throw cardsResult.error;

  const userIds = [
    ...new Set(
      [...(eventsResult.data || []), ...(cardsResult.data || [])]
        .map((row) => row.user_id)
        .filter((userId): userId is string => Boolean(userId))
    ),
  ];
  let processed = 0;
  const failedUserIds: string[] = [];

  for (const userId of userIds) {
    try {
      await refreshReminderMessage(userId);
      processed++;
    } catch (err) {
      failedUserIds.push(userId);
      console.log("REMINDER WORKER USER ERROR:", userId, err);
    }
  }

  return {
    users: userIds.length,
    processed,
    failed: failedUserIds.length,
  };
}
