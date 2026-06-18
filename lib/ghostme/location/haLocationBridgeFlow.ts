import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getHAStates } from "@/lib/ghostme/homeAssistant/haClient";

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
  if (!userId) {
    return {
      updated: false,
      reason: "missing_user_id",
      source: "home_assistant",
    };
  }

  const haStates = states || ((await getHAStates()) as HAState[]);

  if (!haStates.length) {
    return {
      updated: false,
      reason: "no_ha_states",
      source: "home_assistant",
    };
  }

  const manuPerson = findState(haStates, "person.manuele");
  const manuWifi = findState(haStates, "sensor.rea_nx9_wi_fi_connection");

  const personSaysHome = isManuHomeState(manuPerson?.state);
  const wifiSaysHome = isRecognizedHomeWifi(manuWifi?.state);

  if (!personSaysHome && !wifiSaysHome) {
    return {
      updated: false,
      reason: "no_strong_home_signal",
      source: "home_assistant",
    };
  }

  const now = new Date().toISOString();
  const reason = personSaysHome
    ? "person.manuele_home"
    : "rea_nx9_wifi_home";

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
