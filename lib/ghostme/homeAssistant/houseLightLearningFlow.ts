import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { analyzeHousePatterns } from "@/lib/ghostme/homeAssistant/housePatternEngine";
import { learnHouseRoutes } from "@/lib/ghostme/homeAssistant/houseRouteLearningEngine";

const LIGHT_LEARNING_SOURCE = "home_assistant_webhook_light_learning";
const WEBHOOK_SOURCE = "home_assistant_webhook";
const COOLDOWN_MS = 15 * 60 * 1000;
const MAX_EVENT_AGE_MS = 5 * 60 * 1000;
const LIGHT_EVENT_LIMIT = 500;

const LEARNING_EVENT_TYPES = new Set([
  "motion_on",
  "presence_on",
  "light_on",
  "tv_on",
  "person_location_changed",
  "temperature_changed",
  "humidity_changed",
  "climate_on",
]);

const ROUTE_EVENT_TYPES = new Set([
  "motion_on",
  "presence_on",
  "person_location_changed",
]);

function isRecentEvent(occurredAt: string) {
  const occurredTime = new Date(occurredAt).getTime();
  if (Number.isNaN(occurredTime)) return false;

  const age = Date.now() - occurredTime;
  return age >= -60_000 && age <= MAX_EVENT_AGE_MS;
}

export function shouldRunHouseLightLearning({
  eventType,
  priority,
  occurredAt,
}: {
  eventType: string;
  priority: number;
  occurredAt: string;
}) {
  if (priority < 7) return false;
  if (!LEARNING_EVENT_TYPES.has(eventType)) return false;
  return isRecentEvent(occurredAt);
}

async function restoreWebhookSource(userId: string, eventId: string) {
  await supabaseAdmin
    .from("house_events")
    .update({ source: WEBHOOK_SOURCE })
    .eq("id", eventId)
    .eq("user_id", userId)
    .eq("source", LIGHT_LEARNING_SOURCE);
}

export async function runHouseLightLearning({
  userId,
  eventId,
  eventType,
  priority,
  occurredAt,
}: {
  userId: string;
  eventId: string;
  eventType: string;
  priority: number;
  occurredAt: string;
}) {
  if (
    !userId ||
    !eventId ||
    !shouldRunHouseLightLearning({ eventType, priority, occurredAt })
  ) {
    return { ran: false, reason: "event_not_eligible" };
  }

  const { data: claimedEvent, error: claimError } = await supabaseAdmin
    .from("house_events")
    .update({ source: LIGHT_LEARNING_SOURCE })
    .eq("id", eventId)
    .eq("user_id", userId)
    .eq("source", WEBHOOK_SOURCE)
    .select("id")
    .maybeSingle();

  if (claimError || !claimedEvent) {
    if (claimError) {
      console.error("HOUSE LIGHT LEARNING CLAIM ERROR", {
        userId,
        eventId,
        message: claimError.message,
      });
    }
    return { ran: false, reason: "event_not_claimed" };
  }

  const cooldownSince = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const { data: firstTrigger, error: cooldownError } = await supabaseAdmin
    .from("house_events")
    .select("id")
    .eq("user_id", userId)
    .eq("source", LIGHT_LEARNING_SOURCE)
    .gte("occurred_at", cooldownSince)
    .order("occurred_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (cooldownError) {
    console.error("HOUSE LIGHT LEARNING COOLDOWN ERROR", {
      userId,
      eventId,
      message: cooldownError.message,
    });
    await restoreWebhookSource(userId, eventId);
    return { ran: false, reason: "cooldown_check_failed" };
  }

  if (!firstTrigger || firstTrigger.id !== eventId) {
    await restoreWebhookSource(userId, eventId);
    return { ran: false, reason: "cooldown_active" };
  }

  try {
    const patterns = await analyzeHousePatterns(userId, {
      eventLimit: LIGHT_EVENT_LIMIT,
    });
    const routes = ROUTE_EVENT_TYPES.has(eventType)
      ? await learnHouseRoutes(userId, { eventLimit: LIGHT_EVENT_LIMIT })
      : [];

    return {
      ran: true,
      reason: "light_learning_completed",
      patterns: patterns.length,
      routes: routes.length,
    };
  } catch (error) {
    console.error("HOUSE LIGHT LEARNING ERROR", {
      userId,
      eventId,
      message: error instanceof Error ? error.message : String(error),
    });
    return { ran: false, reason: "light_learning_failed" };
  }
}
