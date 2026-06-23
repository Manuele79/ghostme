import { buildHouseStateSnapshot } from "@/lib/ghostme/home/houseStateSnapshot";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const REVIEW_STATUSES = [
  "pending",
  "pending_confirmation",
  "suggested",
  "proposed",
  "needs_review",
];
const RESOLVED_STATUSES = ["active", "enabled", "disabled", "rejected", "archived"];
const CONTROL_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const INVALID_STATES = new Set(["", "unknown", "unavailable", "none"]);
const CONTROL_EVENT_TYPES = new Set([
  "light_on",
  "light_off",
  "tv_on",
  "tv_off",
  "person_location_changed",
]);

type ControlPlan = {
  automationKey: string;
  automationName: string;
  roomKey?: string | null;
  controlType: string;
  reason: string;
  confidence: number;
};

function clean(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function stablePart(value: unknown) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function romeHour(value: string) {
  return Number(
    new Intl.DateTimeFormat("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      hour12: false,
    }).format(new Date(value))
  );
}

function romeDay(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function confidence10(value: unknown) {
  const number = Number(value || 0);
  return Math.min(10, Math.max(0, number > 10 ? number / 10 : number));
}

function isUsableEvent(event: any) {
  return (
    CONTROL_EVENT_TYPES.has(clean(event?.event_type)) &&
    !INVALID_STATES.has(clean(event?.new_state))
  );
}

async function saveControlPlan(userId: string, plan: ControlPlan) {
  const { data: existing } = await supabaseAdmin
    .from("house_automation_controls")
    .select("id, status")
    .eq("user_id", userId)
    .eq("automation_key", plan.automationKey)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && RESOLVED_STATUSES.includes(clean(existing.status))) return null;

  const now = new Date();
  const payload = {
    user_id: userId,
    automation_key: plan.automationKey,
    automation_name: plan.automationName,
    room_key: plan.roomKey || null,
    control_type: plan.controlType,
    status: existing?.status && REVIEW_STATUSES.includes(existing.status)
      ? existing.status
      : "needs_review",
    last_action: "proposed",
    last_reason: `${plan.reason} | confidenza ${plan.confidence}/10`,
    expires_at: new Date(now.getTime() + CONTROL_TTL_MS).toISOString(),
    updated_at: now.toISOString(),
  };
  const { data, error } = await supabaseAdmin
    .from("house_automation_controls")
    .upsert(payload, { onConflict: "user_id,automation_key" })
    .select()
    .single();
  if (error) {
    console.log("HOUSE AUTOMATION CONTROL PLAN ERROR:", error);
    return null;
  }

  await upsertProactiveMessage({
    userId,
    title: plan.automationName,
    message: plan.reason,
    category: "home_question",
    priority: plan.confidence >= 8 ? 6 : 5,
    logicalKey: `home_control_${plan.automationKey}`,
  });

  return data;
}

async function expireOldReviewControls(userId: string) {
  const now = new Date().toISOString();
  const staleSince = new Date(Date.now() - CONTROL_TTL_MS).toISOString();
  await supabaseAdmin
    .from("house_automation_controls")
    .update({ status: "expired", expires_at: now, updated_at: now })
    .eq("user_id", userId)
    .in("status", REVIEW_STATUSES)
    .lt("expires_at", now);
  await supabaseAdmin
    .from("house_automation_controls")
    .update({ status: "expired", expires_at: now, updated_at: now })
    .eq("user_id", userId)
    .in("status", REVIEW_STATUSES)
    .is("expires_at", null)
    .lt("updated_at", staleSince);
}

function latestDeviceEvents(events: any[]) {
  const latest = new Map<string, any>();
  for (const event of events) {
    if (event.entity_id && !latest.has(event.entity_id)) {
      latest.set(event.entity_id, event);
    }
  }
  return Array.from(latest.values());
}

function emptyHousePlan(houseState: any, events: any[]): ControlPlan | null {
  if (houseState.occupancyStatus !== "empty") return null;
  const active = latestDeviceEvents(events).filter((event) => {
    const occurredAt = new Date(event.occurred_at || 0).getTime();
    return (
      ["light_on", "tv_on"].includes(event.event_type) &&
      Number.isFinite(occurredAt) &&
      occurredAt >= Date.now() - 6 * 60 * 60 * 1000
    );
  });
  if (!active.length) return null;

  const names = active
    .slice(0, 3)
    .map((event) => event.entity_name || event.room_key || event.entity_id)
    .filter(Boolean);
  return {
    automationKey: "empty_house_active_lights_media",
    automationName: "Casa vuota con luci o TV attive",
    controlType: "suggest_empty_house_shutdown_review",
    reason: `La casa risulta vuota, ma risultano ancora attivi: ${names.join(", ")}. Vuoi che GhostMe ti suggerisca di spegnerli quando succede?`,
    confidence: Math.max(7, Math.round(Number(houseState.confidence || 0) / 10)),
  };
}

function routePlan(rules: any[]): ControlPlan | null {
  const rule = [...rules]
    .filter(
      (item) =>
        clean(item.rule_key).startsWith("route_") &&
        ["learning", "active"].includes(clean(item.status)) &&
        confidence10(item.confidence) >= 6
    )
    .sort((left, right) => confidence10(right.confidence) - confidence10(left.confidence))[0];
  if (!rule) return null;

  const from = clean(rule.trigger_conditions?.from_room);
  const to = clean(rule.trigger_conditions?.to_room);
  if (!from || !to) return null;
  const count = Number(rule.trigger_conditions?.observed_count_30d || 0);
  return {
    automationKey: `route_review_${stablePart(from)}_${stablePart(to)}`,
    automationName: `Routine ${from} → ${to}`,
    roomKey: to,
    controlType: "suggest_route_as_presence_rule",
    reason: `Il passaggio ${from} → ${to} è stato osservato${count ? ` ${count} volte` : " più volte"}. Vuoi salvarlo come routine suggerita, senza eseguire automazioni automatiche?`,
    confidence: Math.round(confidence10(rule.confidence)),
  };
}

function eveningLightPlan({
  events,
  entities,
  patterns,
}: {
  events: any[];
  entities: any[];
  patterns: any[];
}): ControlPlan | null {
  const recentEntityIds = new Set(
    entities
      .filter((entity) => entity.is_useful !== false && clean(entity.entity_type) === "light")
      .map((entity) => entity.entity_id)
  );
  const groups = new Map<string, any[]>();
  for (const event of events) {
    if (
      event.event_type !== "light_on" ||
      !recentEntityIds.has(event.entity_id) ||
      !event.occurred_at ||
      romeHour(event.occurred_at) < 18
    ) {
      continue;
    }
    groups.set(event.entity_id, [...(groups.get(event.entity_id) || []), event]);
  }

  const strongest = Array.from(groups.values())
    .filter((items) => items.length >= 3 && new Set(items.map((item) => romeDay(item.occurred_at))).size >= 2)
    .sort((left, right) => right.length - left.length)[0];
  if (!strongest) return null;
  const sample = strongest[0];
  const room = clean(sample.room_key);
  const supportedByPattern = patterns.some((pattern) => {
    const text = clean(`${pattern.title || ""} ${pattern.description || ""}`);
    return text.includes("luci") && text.includes(room) && (text.includes("sera") || text.includes("notte"));
  });
  if (!supportedByPattern && strongest.length < 4) return null;

  const name = sample.entity_name || room || sample.entity_id;
  return {
    automationKey: `evening_light_${stablePart(sample.entity_id)}`,
    automationName: `Routine luce serale: ${name}`,
    roomKey: room || null,
    controlType: "suggest_evening_light_rule",
    reason: `${name} è stata accesa ${strongest.length} volte di sera in giorni diversi. Vuoi creare una regola suggerita da approvare?`,
    confidence: Math.min(9, 5 + Math.floor(strongest.length / 2)),
  };
}

function presenceTimeoutPlan(houseState: any, events: any[]): ControlPlan | null {
  const people = houseState.people || [];
  if (people.length < 2 || people.some((person: any) => person.isHome)) return null;
  const transitions = events.filter((event) => event.event_type === "person_location_changed");
  if (transitions.length < 4 || new Set(transitions.map((event) => event.entity_id)).size < 2) {
    return null;
  }

  return {
    automationKey: "two_people_away_empty_timeout",
    automationName: "Conferma casa vuota dopo 15 minuti",
    controlType: "suggest_empty_house_presence_timeout",
    reason: "Manuele e Valentina risultano fuori casa. Vuoi che GhostMe consideri la casa vuota dopo 15 minuti, soltanto come regola di ragionamento approvata?",
    confidence: Math.max(7, Math.round(Number(houseState.confidence || 0) / 10)),
  };
}

export async function planHouseAutomationControls(userId: string) {
  if (!userId) return [];
  await expireOldReviewControls(userId);

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recentEntitiesSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [rulesRes, patternsRes, eventsRes, entitiesRes, houseState] = await Promise.all([
    supabaseAdmin
      .from("house_learned_rules")
      .select("rule_key, title, trigger_conditions, confidence, status, updated_at")
      .eq("user_id", userId)
      .in("status", ["learning", "active"]),
    supabaseAdmin
      .from("house_patterns")
      .select("pattern_type, title, description, confidence, occurrences, status, last_seen_at")
      .eq("user_id", userId)
      .in("status", ["learning", "active"]),
    supabaseAdmin
      .from("house_events")
      .select("entity_id, entity_name, entity_type, room_key, event_type, new_state, people_home_count, occurred_at")
      .eq("user_id", userId)
      .gte("occurred_at", since)
      .order("occurred_at", { ascending: false })
      .limit(600),
    supabaseAdmin
      .from("house_entities")
      .select("entity_id, entity_name, entity_type, room_key, is_useful, can_trigger_event, updated_at")
      .eq("user_id", userId)
      .gte("updated_at", recentEntitiesSince)
      .eq("is_useful", true)
      .limit(150),
    buildHouseStateSnapshot(userId),
  ]);

  if (rulesRes.error) console.log("HOUSE CONTROL RULES READ ERROR:", rulesRes.error);
  if (patternsRes.error) console.log("HOUSE CONTROL PATTERNS READ ERROR:", patternsRes.error);
  if (eventsRes.error) console.log("HOUSE CONTROL EVENTS READ ERROR:", eventsRes.error);
  if (entitiesRes.error) console.log("HOUSE CONTROL ENTITIES READ ERROR:", entitiesRes.error);

  const events = (eventsRes.data || []).filter(isUsableEvent);
  const plans = [
    emptyHousePlan(houseState, events),
    routePlan(rulesRes.data || []),
    eveningLightPlan({
      events,
      entities: entitiesRes.data || [],
      patterns: patternsRes.data || [],
    }),
    presenceTimeoutPlan(houseState, events),
  ].filter(Boolean) as ControlPlan[];

  const processed = [];
  for (const plan of plans) {
    const control = await saveControlPlan(userId, plan);
    if (control) processed.push(control);
    if (processed.length >= 3) break;
  }
  return processed;
}
