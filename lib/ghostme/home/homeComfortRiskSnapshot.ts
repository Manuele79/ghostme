import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { HouseStateSnapshot } from "@/lib/ghostme/home/houseStateSnapshot";
import type { HouseRouteSnapshot } from "@/lib/ghostme/home/houseRouteSnapshot";

export type HomeComfortRiskSnapshot = {
  comfortSignals: string[];
  riskSignals: string[];
  automationSignals: string[];
  suggestions: string[];
  confidence: number;
  lastUpdated: string | null;
};

function clean(value: any) {
  return String(value || "").toLowerCase().trim();
}

function numericState(value: any) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function latestTimestamp(values: Array<string | null | undefined>) {
  let latest: string | null = null;
  let latestTime = 0;

  for (const value of values) {
    if (!value) continue;

    const time = new Date(value).getTime();
    if (Number.isNaN(time) || time <= latestTime) continue;

    latest = value;
    latestTime = time;
  }

  return latest;
}

function isActiveState(value: any) {
  return ["on", "playing", "paused", "idle", "running", "active"].includes(
    clean(value)
  );
}

function buildComfortSignals({
  events,
  houseState,
}: {
  events: any[];
  houseState: HouseStateSnapshot;
}) {
  const signals: string[] = [];
  const activeRooms = houseState.activeRooms || [];

  for (const event of events) {
    const value = numericState(event.new_state);
    const reason = clean(event.value?.save_reason);

    if (event.entity_type === "temperature") {
      if (value !== null && value >= 28) signals.push("hot_home");
      if (value !== null && value <= 16) signals.push("cold_home");
      if (reason === "temperature_hot_threshold") signals.push("hot_home");
      if (reason === "temperature_cold_threshold") signals.push("cold_home");
    }

    if (event.entity_type === "humidity") {
      if (value !== null && value >= 70) signals.push("humid_home");
      if (reason === "humidity_high_threshold") signals.push("humid_home");
    }

    if (
      event.event_type === "lux_changed" &&
      value !== null &&
      value <= 80 &&
      event.room_key &&
      activeRooms.includes(event.room_key)
    ) {
      signals.push("low_light_with_presence");
    }

    if (
      ["tv_on", "media_on"].includes(event.event_type) ||
      (event.entity_type === "tv" && isActiveState(event.new_state))
    ) {
      signals.push("media_room_active");
    }
  }

  if (houseState.media.length && activeRooms.length) {
    signals.push("media_room_active");
  }

  return unique(signals);
}

function buildRiskSignals(events: any[]) {
  const signals: string[] = [];
  const activeAppliances = events.filter(
    (event) =>
      event.entity_type === "appliance" &&
      isActiveState(event.new_state) &&
      !clean(event.new_state).includes("off")
  );

  const uniqueAppliances = new Set(
    activeAppliances.map((event) => event.entity_id)
  );

  if (uniqueAppliances.size >= 2) {
    signals.push("multiple_appliances_active");
  }

  const hasWasher = activeAppliances.some((event) =>
    clean(`${event.entity_id} ${event.entity_name}`).includes("lavatrice")
  );
  const hasDishwasher = activeAppliances.some((event) =>
    clean(`${event.entity_id} ${event.entity_name}`).includes("lavastoviglie")
  );

  if (hasWasher && hasDishwasher) {
    signals.push("possible_power_overload");
  }

  const applianceChanges = activeAppliances.filter(
    (event) => event.event_type === "appliance_changed"
  );

  if (applianceChanges.length >= 3) {
    signals.push("appliance_conflict");
  }

  return unique(signals);
}

function buildAutomationSignals({
  events,
  learnedRules,
  automationControls,
}: {
  events: any[];
  learnedRules: any[];
  automationControls: any[];
}) {
  const signals: string[] = [];

  if (
    events.some(
      (event) =>
        event.entity_type === "automation" &&
        ["automation_on", "automation_off"].includes(event.event_type)
    )
  ) {
    signals.push("known_automation_active");
  }

  if (learnedRules.length) {
    signals.push("learned_rule_relevant");
  }

  if (automationControls.length) {
    signals.push("routine_detected");
  }

  return unique(signals);
}

function buildSuggestions({
  comfortSignals,
  riskSignals,
  automationSignals,
  routes,
}: {
  comfortSignals: string[];
  riskSignals: string[];
  automationSignals: string[];
  routes?: HouseRouteSnapshot | null;
}) {
  const suggestions: string[] = [];

  if (comfortSignals.includes("hot_home")) {
    suggestions.push("consider_climate_cooling");
  }
  if (comfortSignals.includes("cold_home")) {
    suggestions.push("consider_climate_heating");
  }
  if (comfortSignals.includes("humid_home")) {
    suggestions.push("check_humidity_comfort");
  }
  if (comfortSignals.includes("low_light_with_presence")) {
    suggestions.push("consider_light_for_active_room");
  }
  if (riskSignals.includes("possible_power_overload")) {
    suggestions.push("review_appliance_load");
  }
  if (automationSignals.includes("learned_rule_relevant")) {
    suggestions.push("review_relevant_house_rule");
  }
  if (routes?.possibleMovement === "uncertain_movement") {
    suggestions.push("avoid_assuming_room_presence");
  }

  return unique(suggestions).slice(0, 8);
}

function confidenceFor({
  comfortSignals,
  riskSignals,
  automationSignals,
}: {
  comfortSignals: string[];
  riskSignals: string[];
  automationSignals: string[];
}) {
  const score =
    comfortSignals.length * 18 +
    riskSignals.length * 22 +
    automationSignals.length * 12;

  return Math.min(90, Math.max(25, score || 25));
}

export async function buildHomeComfortRiskSnapshot({
  userId,
  houseState,
  routes,
  learnedRules = [],
  automationControls = [],
}: {
  userId: string;
  houseState: HouseStateSnapshot;
  routes?: HouseRouteSnapshot | null;
  learnedRules?: any[];
  automationControls?: any[];
}): Promise<HomeComfortRiskSnapshot> {
  if (!userId) {
    return {
      comfortSignals: [],
      riskSignals: [],
      automationSignals: [],
      suggestions: [],
      confidence: 25,
      lastUpdated: houseState.lastUpdated,
    };
  }

  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await supabaseAdmin
    .from("house_events")
    .select("entity_id, entity_name, entity_type, room_key, event_type, new_state, value, occurred_at")
    .eq("user_id", userId)
    .gte("occurred_at", since)
    .in("entity_type", [
      "temperature",
      "humidity",
      "lux",
      "presence",
      "motion",
      "tv",
      "appliance",
      "automation",
    ])
    .order("occurred_at", { ascending: false })
    .limit(80);

  if (error) {
    console.log("HOME COMFORT RISK EVENTS ERROR:", error);
  }

  const recentEvents = events || [];
  const comfortSignals = buildComfortSignals({ events: recentEvents, houseState });
  const riskSignals = buildRiskSignals(recentEvents);
  const automationSignals = buildAutomationSignals({
    events: recentEvents,
    learnedRules,
    automationControls,
  });
  const suggestions = buildSuggestions({
    comfortSignals,
    riskSignals,
    automationSignals,
    routes,
  });

  return {
    comfortSignals,
    riskSignals,
    automationSignals,
    suggestions,
    confidence: confidenceFor({
      comfortSignals,
      riskSignals,
      automationSignals,
    }),
    lastUpdated: latestTimestamp([
      houseState.lastUpdated,
      routes?.lastUpdated,
      ...(recentEvents || []).map((event: any) => event.occurred_at),
      ...(learnedRules || []).map((rule: any) => rule.updated_at),
      ...(automationControls || []).map((control: any) => control.updated_at),
    ]),
  };
}
