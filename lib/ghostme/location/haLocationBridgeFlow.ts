import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getHAStates } from "@/lib/ghostme/homeAssistant/haClient";
import {
  canAccessHomeAssistant,
  getHomeAssistantPersonForUser,
} from "@/lib/ghostme/homeAssistant/homeAssistantAccess";
import { classifyLocationState } from "@/lib/ghostme/location/locationStateFreshness";

type HAState = {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
};

export type HaLocationBridgeResult = {
  updated: boolean;
  reason: string;
  source: "home_assistant";
};

function clean(value: any) {
  return String(value ?? "").toLowerCase().trim();
}

function isManuHomeState(value: any) {
  return ["home", "casa"].includes(clean(value));
}

function isRecognizedHomeWifi(value: any) {
  const state = clean(value);
  return state === "home" || state === "casa" || state.includes("windtre");
}

function findState(states: HAState[], entityId: string) {
  return states.find((state) => state.entity_id === entityId);
}

export async function bridgeHomeAssistantLocationFlow({
  userId,
  states,
}: {
  userId: string;
  states?: HAState[];
}): Promise<HaLocationBridgeResult> {
  if (!userId || !canAccessHomeAssistant(userId)) {
    return {
      updated: false,
      reason: "user_not_linked_to_home_assistant",
      source: "home_assistant",
    };
  }

  const person = getHomeAssistantPersonForUser(userId);
  if (!person) {
    return {
      updated: false,
      reason: "person_mapping_not_configured",
      source: "home_assistant",
    };
  }

  const haStates = states || ((await getHAStates({ force: true })) as HAState[]);

  if (!haStates.length) {
    return {
      updated: false,
      reason: "no_ha_states",
      source: "home_assistant",
    };
  }

  const personState = findState(haStates, `person.${person}`);
  const wifiState = findState(
    haStates,
    person === "manuele"
      ? "sensor.rea_nx9_wi_fi_connection"
      : "sensor.valecph2305_wi_fi_connection"
  );

  const personSaysHome = isManuHomeState(personState?.state);
  const wifiSaysHome = isRecognizedHomeWifi(wifiState?.state);

  if (!personSaysHome && !wifiSaysHome) {
    return {
      updated: false,
      reason: "no_strong_home_signal",
      source: "home_assistant",
    };
  }

  const now = new Date().toISOString();
  const reason = personSaysHome
    ? `person.${person}_home`
    : `${person}_wifi_home`;

  const { data: currentState } = await supabaseAdmin
    .from("user_location_state")
    .select("source, current_place_label, place_category, updated_at, last_changed_at")
    .eq("user_id", userId)
    .maybeSingle();
  const currentSource = clean(currentState?.source);
  if (
    ["phone", "phone_gps", "browser", "browser_gps"].includes(currentSource) &&
    classifyLocationState(currentState).status === "current"
  ) {
    return {
      updated: false,
      reason: "recent_gps_has_priority",
      source: "home_assistant",
    };
  }

  const { error } = await supabaseAdmin
    .from("user_location_state")
    .upsert(
      {
        user_id: userId,
        current_place_label: "Casa",
        place_category: "home",
        source: "home_assistant",
        confidence: 90,
        updated_at: now,
        last_changed_at: now,
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.log("HA LOCATION BRIDGE ERROR:", error);
    return {
      updated: false,
      reason: "update_failed",
      source: "home_assistant",
    };
  }

  return {
    updated: true,
    reason,
    source: "home_assistant",
  };
}
