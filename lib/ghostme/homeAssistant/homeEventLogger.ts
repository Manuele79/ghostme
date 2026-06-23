import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getHAStates } from "./haClient";
import { getEntityInfo } from "./homeEntityMapper";
import {
  classifyHomeEventSignificance,
  HOME_EVENT_THRESHOLDS,
  type HomeEventSignificance,
} from "./homeEventSignificance";

type HAState = {
  entity_id: string;
  state: string;
  attributes?: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
};

type PreviousHouseEvent = {
  id?: string | null;
  new_state?: string | null;
  occurred_at?: string | null;
};

export type SignificantHomeEventInput = {
  userId: string;
  entityId: string;
  entityName: string;
  entityType: string;
  roomKey?: string | null;
  eventType: string;
  oldState?: string | null;
  newState: string;
  attributes?: Record<string, unknown>;
  lastChanged?: string | null;
  lastUpdated?: string | null;
  person?: string | null;
  occurredAt: string;
  decision: HomeEventSignificance;
  previousEvent?: PreviousHouseEvent | null;
  webhookEventType?: string | null;
};

function isRecentDuplicate(
  previous: PreviousHouseEvent | null | undefined,
  newState: string
) {
  if (!previous?.occurred_at || clean(previous.new_state) !== clean(newState)) {
    return false;
  }
  const age = Date.now() - new Date(previous.occurred_at).getTime();
  return (
    Number.isFinite(age) &&
    age >= 0 &&
    age < HOME_EVENT_THRESHOLDS.duplicateWindowMs
  );
}

const AUTOMATION_CONSEQUENCE_EVENTS = new Set([
  "light_on",
  "light_off",
  "tv_on",
  "tv_off",
  "climate_on",
  "climate_off",
]);

type RecentAutomation = {
  id: string;
  entity_name: string | null;
  value: Record<string, unknown> | null;
};

function jsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function automationResult(attributes: Record<string, unknown> | undefined) {
  if (!attributes) return null;
  for (const key of ["result", "action", "service", "target", "description"]) {
    const value = attributes[key];
    if (["string", "number", "boolean"].includes(typeof value)) {
      return String(value);
    }
  }
  return null;
}

async function findRecentRoomAutomation(input: SignificantHomeEventInput) {
  if (
    !input.roomKey ||
    !AUTOMATION_CONSEQUENCE_EVENTS.has(input.eventType)
  ) {
    return null;
  }
  const occurredAt = new Date(input.occurredAt).getTime();
  if (!Number.isFinite(occurredAt)) return null;
  const since = new Date(
    occurredAt - HOME_EVENT_THRESHOLDS.automationConsequenceWindowMs
  ).toISOString();
  const { data, error } = await supabaseAdmin
    .from("house_events")
    .select("id, entity_name, value")
    .eq("user_id", input.userId)
    .eq("room_key", input.roomKey)
    .eq("event_type", "automation_on")
    .gte("occurred_at", since)
    .lte("occurred_at", input.occurredAt)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("HOUSE AUTOMATION CORRELATION ERROR:", {
      userId: input.userId,
      roomKey: input.roomKey,
      message: error.message,
    });
    return null;
  }
  return (data as RecentAutomation | null) || null;
}

async function attachAutomationConsequence({
  automation,
  eventId,
  input,
}: {
  automation: RecentAutomation;
  eventId: string;
  input: SignificantHomeEventInput;
}) {
  const value = jsonObject(automation.value);
  const existing = Array.isArray(value.observed_results)
    ? value.observed_results
    : [];
  const observedResult = {
    event_id: eventId,
    entity_id: input.entityId,
    entity_name: input.entityName,
    event_type: input.eventType,
    occurred_at: input.occurredAt,
  };
  const observedResults = [
    ...existing.filter(
      (item) => jsonObject(item).event_id !== eventId
    ),
    observedResult,
  ].slice(-10);
  const { error } = await supabaseAdmin
    .from("house_events")
    .update({ value: { ...value, observed_results: observedResults } })
    .eq("id", automation.id)
    .eq("user_id", input.userId);
  if (error) {
    console.log("HOUSE AUTOMATION RESULT UPDATE ERROR:", {
      automationId: automation.id,
      eventId,
      message: error.message,
    });
  }
}

export async function logSignificantHomeEvent(
  input: SignificantHomeEventInput
) {
  if (isRecentDuplicate(input.previousEvent, input.newState)) {
    return { inserted: false, id: null, reason: "duplicate_recent" };
  }

  const relatedAutomation = await findRecentRoomAutomation(input);
  const contextOnly = input.decision.category === "context";
  const value = {
    attributes: input.attributes || {},
    last_changed: input.lastChanged || null,
    last_updated: input.lastUpdated || null,
    person: input.person || null,
    save_reason: input.decision.reason,
    significance_category: input.decision.category,
    significance_priority: input.decision.priority,
    webhook_event_type: input.webhookEventType || null,
    automation_result:
      input.entityType === "automation"
        ? automationResult(input.attributes)
        : null,
    caused_by_automation: relatedAutomation
      ? {
          id: relatedAutomation.id,
          name: relatedAutomation.entity_name,
        }
      : null,
    ...(contextOnly
      ? { house_worker_processed_at: new Date().toISOString() }
      : {}),
  };

  const { data, error } = await supabaseAdmin
    .from("house_events")
    .insert({
      user_id: input.userId,
      entity_id: input.entityId,
      entity_name: input.entityName,
      entity_type: input.entityType,
      room_key: input.roomKey || null,
      event_type: input.eventType,
      old_state: input.oldState || input.previousEvent?.new_state || null,
      new_state: input.newState,
      value,
      people_home_count: null,
      target_user: input.person || null,
      source: "home_assistant_webhook",
      occurred_at: input.occurredAt,
    })
    .select("id")
    .single();

  if (error) {
    console.log("HOUSE EVENT INSERT ERROR:", error);
    return { inserted: false, id: null, reason: "insert_failed", error };
  }

  if (relatedAutomation) {
    await attachAutomationConsequence({
      automation: relatedAutomation,
      eventId: data.id,
      input,
    });
  }

  return { inserted: true, id: data.id, reason: input.decision.reason };
}

function friendlyName(s: HAState) {
  return s.attributes?.friendly_name || s.entity_id;
}

function clean(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function isUsefulEvent(entityType: string) {
  if (
    [
      "person",
      "presence",
      "motion",
      "light",
      "switch",
      "tv",
      "phone",
      "weather",
      "sun",
      "climate",
      "humidity",
      "lux",
      "co2",
      "noise",
      "pressure",
      "fan",
      "appliance",
      "automation",
      "temperature",
    ].includes(entityType)
  ) {
    return true;
  }

  return false;
}

function getEventType(entityType: string, state: string) {
  const cleanState = clean(state);

  if (entityType === "motion") return cleanState === "on" ? "motion_on" : "motion_off";
  if (entityType === "presence") return cleanState === "on" ? "presence_on" : "presence_off";
  if (entityType === "temperature") return "temperature_changed";
  if (entityType === "humidity") return "humidity_changed";
  if (entityType === "lux") return "lux_changed";
  if (entityType === "pressure") return "pressure_changed";
  if (entityType === "co2") return "co2_changed";
  if (entityType === "noise") return "noise_changed";
  if (entityType === "light") return cleanState === "on" ? "light_on" : "light_off";
  if (entityType === "switch") return cleanState === "on" ? "switch_on" : "switch_off";

  if (entityType === "tv") {
    return ["on", "playing", "paused", "idle"].includes(cleanState)
      ? "tv_on"
      : "tv_off";
  }

  if (entityType === "phone") {
    return cleanState === "home" || cleanState.includes("windtre")
      ? "phone_home"
      : "phone_not_home";
  }

  if (entityType === "person") return "person_location_changed";
  if (entityType === "weather") return "weather_changed";
  if (entityType === "sun") return "sun_changed";

  if (entityType === "climate") {
    return ["heat", "cool", "auto", "dry", "fan_only", "on"].includes(cleanState)
      ? "climate_on"
      : "climate_off";
  }

  if (entityType === "fan") return cleanState === "on" ? "fan_on" : "fan_off";
  if (entityType === "appliance") return "appliance_changed";
  if (entityType === "automation") return cleanState === "on" ? "automation_on" : "automation_off";

  return "state_changed";
}

async function getLastHouseEvent({
  userId,
  entityId,
}: {
  userId: string;
  entityId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("house_events")
    .select("id, new_state, event_type, occurred_at")
    .eq("user_id", userId)
    .eq("entity_id", entityId)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("HOUSE EVENT LAST READ ERROR:", error);
  }

  return data || null;
}

export async function logHomeAssistantSnapshot(
  userId: string,
  providedStates?: HAState[]
) {
  if (!userId) {
    return {
      inserted: 0,
      useful: 0,
      skippedSame: 0,
      skippedFiltered: 0,
      errors: ["missing_user_id"],
    };
  }

  const states = providedStates || ((await getHAStates({ force: true })) as HAState[]);

  if (!states.length) {
    return {
      inserted: 0,
      useful: 0,
      skippedSame: 0,
      skippedFiltered: 0,
      errors: ["no_ha_states"],
    };
  }

  let inserted = 0;
  let useful = 0;
  let skippedSame = 0;
  let skippedFiltered = 0;
  const filteredReasons: Record<string, number> = {};
  const errors: Array<Record<string, unknown>> = [];

  const peopleHomeCount = states.filter((s) => {
    const id = clean(s.entity_id);
    const state = clean(s.state);

    return (
      (id === "person.manuele" || id === "person.valentina") &&
      state !== "not_home" &&
      state !== "unknown" &&
      state !== "unavailable"
    );
  }).length;

  for (const state of states) {
    const info = getEntityInfo(state.entity_id);

    if (!isUsefulEvent(info.type)) continue;

    useful++;

    const newState = String(state.state ?? "");

    const last = await getLastHouseEvent({
      userId,
      entityId: state.entity_id,
    });

    const eventType = getEventType(info.type, newState);

    const decision = classifyHomeEventSignificance({
      entityType: info.type,
      entityId: state.entity_id,
      oldState: last?.new_state || null,
      newState,
      eventType,
      lastOccurredAt: last?.occurred_at || null,
    });

    if (!decision.significant) {
      if (decision.reason === "same_state" || decision.reason === "same_state_recent") {
        skippedSame++;
      } else {
        skippedFiltered++;
        filteredReasons[decision.reason] =
          (filteredReasons[decision.reason] || 0) + 1;
      }
      continue;
    }

    const payload = {
      user_id: userId,
      entity_id: state.entity_id,
      entity_name: friendlyName(state),
      entity_type: info.type,
      room_key: info.room || null,
      event_type: eventType,
      old_state: last?.new_state || null,
      new_state: newState,
      value: {
        attributes: state.attributes || {},
        last_changed: state.last_changed || null,
        last_updated: state.last_updated || null,
        person: info.person || null,
        save_reason: decision.reason,
        significance_category: decision.category,
        significance_priority: decision.priority,
        ...(decision.category === "context"
          ? { house_worker_processed_at: new Date().toISOString() }
          : {}),
      },
      people_home_count: peopleHomeCount,
      target_user: info.person || null,
      source: "home_assistant",
      occurred_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin.from("house_events").insert(payload);

    if (error) {
      console.log("HOUSE EVENT INSERT ERROR:", error);
      errors.push({
        entity_id: state.entity_id,
        type: info.type,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      continue;
    }

    inserted++;
  }

  return {
    inserted,
    useful,
    skippedSame,
    skippedFiltered,
    filteredReasons,
    errors: errors.slice(0, 10),
  };
}
