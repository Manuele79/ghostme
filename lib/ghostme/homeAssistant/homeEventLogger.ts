import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getHAStates } from "./haClient";
import { getEntityInfo } from "./homeEntityMapper";

type HAState = {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
  last_changed?: string;
  last_updated?: string;
};

function friendlyName(s: HAState) {
  return s.attributes?.friendly_name || s.entity_id;
}

function clean(value: any) {
  return String(value ?? "").toLowerCase().trim();
}

function numericState(value: any) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function isMainIndoorTemperature(entityId: string) {
  const id = entityId.toLowerCase();

  return (
    id === "sensor.camera_temperatura_ambiente" ||
    id === "climate.camera"
  );
}

function isUsefulEvent(entityType: string, entityId?: string) {
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
      "fan",
      "appliance",
      "automation",
    ].includes(entityType)
  ) {
    return true;
  }

  if (entityType === "temperature" && entityId) {
    return isMainIndoorTemperature(entityId);
  }

  return false;
}

function getEventType(entityType: string, state: string) {
  const cleanState = clean(state);

  if (entityType === "motion") return cleanState === "on" ? "motion_on" : "motion_off";
  if (entityType === "presence") return cleanState === "on" ? "presence_on" : "presence_off";
  if (entityType === "temperature") return "temperature_changed";
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

function shouldSaveStateChange({
  entityType,
  entityId,
  oldState,
  newState,
  eventType,
}: {
  entityType: string;
  entityId: string;
  oldState?: string | null;
  newState: string;
  eventType: string;
}) {
  const oldClean = clean(oldState);
  const newClean = clean(newState);

  if (oldClean === newClean) {
    return { save: false, reason: "same_state" };
  }

  if (["unknown", "unavailable", "none", ""].includes(newClean)) {
    return { save: false, reason: "invalid_state" };
  }

  if (entityType === "temperature") {
    if (!isMainIndoorTemperature(entityId)) {
      return { save: false, reason: "temperature_not_primary" };
    }

    const oldNum = numericState(oldState);
    const newNum = numericState(newState);

    if (oldNum === null || newNum === null) {
      return { save: true, reason: "temperature_first_or_non_numeric" };
    }

    if (Math.abs(newNum - oldNum) < 1) {
      return { save: false, reason: "temperature_delta_under_1" };
    }

    return { save: true, reason: "temperature_delta_ok" };
  }

  if (["humidity_changed", "pressure_changed", "co2_changed", "noise_changed", "lux_changed"].includes(eventType)) {
    return { save: false, reason: "raw_environment_ignored" };
  }

  if (entityType === "weather") {
    return { save: true, reason: "weather_state_changed" };
  }

  if (entityType === "sun") {
    return { save: true, reason: "sun_state_changed" };
  }

  return { save: true, reason: "useful_state_change" };
}

export async function logHomeAssistantSnapshot(userId: string) {
  if (!userId) {
    return {
      inserted: 0,
      useful: 0,
      skippedSame: 0,
      skippedFiltered: 0,
      errors: ["missing_user_id"],
    };
  }

  const states = (await getHAStates()) as HAState[];

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
  const errors: any[] = [];

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

    if (!isUsefulEvent(info.type, state.entity_id)) continue;

    useful++;

    const newState = String(state.state ?? "");

    const last = await getLastHouseEvent({
      userId,
      entityId: state.entity_id,
    });

    const eventType = getEventType(info.type, newState);

    const decision = shouldSaveStateChange({
      entityType: info.type,
      entityId: state.entity_id,
      oldState: last?.new_state || null,
      newState,
      eventType,
    });

    if (!decision.save) {
      if (decision.reason === "same_state") {
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