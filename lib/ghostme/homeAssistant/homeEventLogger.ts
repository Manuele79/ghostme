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

  if (entityType === "motion") {
    return cleanState === "on" ? "motion_on" : "motion_off";
  }

  if (entityType === "presence") {
    return cleanState === "on" ? "presence_on" : "presence_off";
  }

  if (entityType === "lux") {
    return "lux_changed";
  }

  if (entityType === "temperature") {
    return "temperature_changed";
  }

  if (entityType === "light") {
    return cleanState === "on" ? "light_on" : "light_off";
  }

  if (entityType === "switch") {
    return cleanState === "on" ? "switch_on" : "switch_off";
  }

  if (entityType === "tv") {
    return ["on", "playing", "paused"].includes(cleanState)
      ? "tv_on"
      : "tv_off";
  }

  if (entityType === "phone") {
    return cleanState === "home" || cleanState.includes("home")
      ? "phone_home"
      : "phone_not_home";
  }

  if (entityType === "weather") {
    return "weather_changed";
  }

  if (entityType === "sun") {
    return "sun_changed";
  }

  if (entityType === "climate") {
    return ["heat", "cool", "auto", "dry", "fan_only", "on"].includes(cleanState)
      ? "climate_on"
      : "climate_off";
  }

  if (entityType === "automation") {
    return cleanState === "on" ? "automation_on" : "automation_off";
  }

  return "state_changed";
}

async function getLastHouseEvent({
  userId,
  entityId,
}: {
  userId: string;
  entityId: string;
}) {
  const { data } = await supabaseAdmin
    .from("house_events")
    .select("id, new_state, occurred_at")
    .eq("user_id", userId)
    .eq("entity_id", entityId)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data || null;
}

export async function logHomeAssistantSnapshot(userId: string) {
  if (!userId) return { inserted: 0 };

  const states = (await getHAStates()) as HAState[];

  if (!states.length) return { inserted: 0 };

  let inserted = 0;

  const peopleHomeCount = states.filter(
    (s) =>
      s.entity_id.startsWith("person.") &&
      String(s.state).toLowerCase() !== "not_home"
  ).length;

  for (const state of states) {
    const info = getEntityInfo(state.entity_id);

    if (!isUsefulEvent(info.type)) continue;

    const last = await getLastHouseEvent({
      userId,
      entityId: state.entity_id,
    });

    if (last?.new_state === String(state.state)) {
      continue;
    }

    const eventType = getEventType(info.type, state.state);

    const { error } = await supabaseAdmin.from("house_events").insert({
      user_id: userId,
      entity_id: state.entity_id,
      entity_name: friendlyName(state),
      entity_type: info.type,
      room_key: info.room || null,
      event_type: eventType,
      old_state: last?.new_state || null,
      new_state: String(state.state),
      value: {
        attributes: state.attributes || {},
        last_changed: state.last_changed || null,
        last_updated: state.last_updated || null,
      },
      people_home_count: peopleHomeCount,
      source: "home_assistant",
      occurred_at: new Date().toISOString(),
    });

    if (error) {
      console.log("HOUSE EVENT INSERT ERROR:", error);
      continue;
    }

    inserted++;
  }

  return { inserted };
}