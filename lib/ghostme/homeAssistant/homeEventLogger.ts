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

function isUsefulEvent(entityType: string) {
  return [
    "person",
    "presence",
    "motion",
    "lux",
    "light",
    "switch",
    "tv",
    "phone",
    "weather",
    "sun",
    "temperature",
    "humidity",
    "co2",
    "noise",
    "pressure",
    "climate",
    "fan",
    "appliance",
    "automation",
  ].includes(entityType);
}

function getEventType(entityType: string, state: string) {
  const cleanState = String(state || "").toLowerCase();

  if (entityType === "motion") return cleanState === "on" ? "motion_on" : "motion_off";
  if (entityType === "presence") return cleanState === "on" ? "presence_on" : "presence_off";
  if (entityType === "lux") return "lux_changed";
  if (entityType === "temperature") return "temperature_changed";
  if (entityType === "humidity") return "humidity_changed";
  if (entityType === "co2") return "co2_changed";
  if (entityType === "noise") return "noise_changed";
  if (entityType === "pressure") return "pressure_changed";
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
    .select("id, new_state, occurred_at")
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

export async function logHomeAssistantSnapshot(userId: string) {
  if (!userId) {
    return { inserted: 0, useful: 0, skippedSame: 0, errors: ["missing_user_id"] };
  }

  const states = (await getHAStates()) as HAState[];

  if (!states.length) {
    return { inserted: 0, useful: 0, skippedSame: 0, errors: ["no_ha_states"] };
  }

  let inserted = 0;
  let useful = 0;
  let skippedSame = 0;
  const errors: any[] = [];

  const peopleHomeCount = states.filter((s) => {
    const id = String(s.entity_id || "").toLowerCase();
    const state = String(s.state || "").toLowerCase();

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

    if (last?.new_state === newState) {
      skippedSame++;
      continue;
    }

    const eventType = getEventType(info.type, newState);

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
    errors: errors.slice(0, 10),
  };
}