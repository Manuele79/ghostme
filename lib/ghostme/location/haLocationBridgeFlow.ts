import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getHAStates } from "@/lib/ghostme/homeAssistant/haClient";
import {
  canAccessHomeAssistant,
  getHomeAssistantPersonForUser,
} from "@/lib/ghostme/homeAssistant/homeAssistantAccess";
import { classifyLocationState } from "@/lib/ghostme/location/locationStateFreshness";
import {
  analyzeLocationPatterns,
  recordObservation,
} from "@/lib/ghostme/observation/observationEngine";

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
    .select("source, current_place_id, current_place_label, place_category, updated_at, last_changed_at")
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

  const { data: homePlace } = await supabaseAdmin
    .from("significant_places")
    .select("id, label, category, address")
    .eq("user_id", userId)
    .neq("status", "archived")
    .or("label.ilike.Casa,category.eq.home")
    .limit(1)
    .maybeSingle();
  const previousPlace = currentState?.current_place_label || null;
  const previousPlaceId = currentState?.current_place_id || null;
  const nextPlace = homePlace?.label || "Casa";
  const placeChanged =
    previousPlace !== nextPlace || previousPlaceId !== (homePlace?.id || null);

  const { error } = await supabaseAdmin
    .from("user_location_state")
    .upsert(
      {
        user_id: userId,
        current_place_id: homePlace?.id || null,
        current_place_label: nextPlace,
        place_category: homePlace?.category || "home",
        address: homePlace?.address || null,
        source: "home_assistant",
        confidence: 90,
        updated_at: now,
        last_changed_at: placeChanged
          ? now
          : currentState?.last_changed_at || now,
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

  if (placeChanged) {
    await recordObservation({
      userId,
      eventType: "home_arrived",
      source: "home_assistant",
      placeLabel: nextPlace,
      placeId: homePlace?.id || null,
      value: {
        from: previousPlace,
        to: nextPlace,
      },
      context: {
        significant: true,
        significance_category: "presence",
        source_reason: reason,
        previous_place_id: previousPlaceId,
      },
    });
    await analyzeLocationPatterns(userId);
  }

  return {
    updated: true,
    reason,
    source: "home_assistant",
  };
}
