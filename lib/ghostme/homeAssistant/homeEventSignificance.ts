export type HomeEventSignificanceInput = {
  entityType: string;
  entityId: string;
  oldState?: string | null;
  newState: string;
  eventType: string;
  lastOccurredAt?: string | null;
  lastEventTypeOccurredAt?: string | null;
  lastRoomEventOccurredAt?: string | null;
};

export type HomeEventSignificance = {
  significant: boolean;
  reason: string;
  category: string;
  priority: number;
};

export const HOME_EVENT_THRESHOLDS = {
  duplicateWindowMs: 2 * 60 * 1000,
  cooldownMs: 5 * 60 * 1000,
  contextCooldownMs: 10 * 60 * 1000,
  actuatorCooldownMs: 30 * 1000,
  luxMinDelta: 15,
  luxDayNightThreshold: 50,
  automationConsequenceWindowMs: 45 * 1000,
} as const;

function clean(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function numericState(value: unknown) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function millisecondsSince(value?: string | null) {
  if (!value) return null;

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;

  return Date.now() - time;
}

function result(
  significant: boolean,
  reason: string,
  category: string,
  priority: number
): HomeEventSignificance {
  return {
    significant,
    reason,
    category,
    priority,
  };
}

function classifyLux(input: HomeEventSignificanceInput) {
  if (!/(cucina|bagno|sala)/i.test(input.entityId)) {
    return result(false, "lux_outside_context_rooms", "context", 0);
  }
  const oldNum = numericState(input.oldState);
  const newNum = numericState(input.newState);
  if (oldNum === null || newNum === null) {
    return result(false, "lux_non_numeric", "environment", 1);
  }
  const delta = Math.abs(newNum - oldNum);
  if (delta < HOME_EVENT_THRESHOLDS.luxMinDelta) {
    return result(false, "lux_min_delta", "environment", 1);
  }
  const crossed =
    (oldNum < HOME_EVENT_THRESHOLDS.luxDayNightThreshold &&
      newNum >= HOME_EVENT_THRESHOLDS.luxDayNightThreshold) ||
    (oldNum >= HOME_EVENT_THRESHOLDS.luxDayNightThreshold &&
      newNum < HOME_EVENT_THRESHOLDS.luxDayNightThreshold);
  return crossed
    ? result(true, "lux_context_threshold_crossed", "context", 2)
    : result(true, "lux_context_sample", "context", 1);
}

function homePresenceState(value: unknown) {
  const state = clean(value);
  return state === "home" || state === "casa" || state.includes("windtre");
}

function classifyPersonOrPhone(input: HomeEventSignificanceInput) {
  if (
    clean(input.entityType) === "phone" &&
    !/wi[_-]?fi|wifi.*connection/i.test(input.entityId)
  ) {
    return result(false, "phone_non_presence_sensor", "presence", 0);
  }
  const wasHome = homePresenceState(input.oldState);
  const isHome = homePresenceState(input.newState);
  if (wasHome === isHome) {
    return result(false, "presence_without_home_transition", "presence", 1);
  }
  return isHome
    ? result(true, "person_arrived_home", "presence", 9)
    : result(true, "person_left_home", "presence", 9);
}

function classifyMotionOrPresence({
  oldState,
  newState,
  entityType,
}: HomeEventSignificanceInput) {
  const oldClean = clean(oldState);
  const newClean = clean(newState);

  if (["", "off"].includes(oldClean) && newClean === "on") {
    return result(true, `${entityType}_context_sample`, "context", 1);
  }

  return result(false, `${entityType}_raw_ignored`, "context", 0);
}

function classifyClimate({ oldState, newState }: HomeEventSignificanceInput) {
  const activeStates = ["heat", "cool", "auto", "dry", "fan_only", "on"];
  const wasActive = activeStates.includes(clean(oldState));
  const isActive = activeStates.includes(clean(newState));
  if (!wasActive && isActive) {
    return result(true, "climate_turned_on", "consequence", 8);
  }
  if (wasActive && !isActive) {
    return result(true, "climate_turned_off", "consequence", 7);
  }
  return result(false, "climate_minor_state_change", "system", 1);
}

function classifyMedia({ oldState, newState }: HomeEventSignificanceInput) {
  const oldClean = clean(oldState);
  const newClean = clean(newState);
  const activeStates = ["on", "playing", "paused", "idle"];
  const wasActive = activeStates.includes(oldClean);
  const isActive = activeStates.includes(newClean);

  if (!wasActive && isActive) {
    return result(true, "media_turned_on", "media", 8);
  }

  if (wasActive && !isActive) {
    return result(true, "media_turned_off", "media", 6);
  }

  return result(false, "media_minor_state_change", "media", 2);
}

function classifyLightOrSwitch({
  oldState,
  newState,
  entityType,
}: HomeEventSignificanceInput) {
  const oldClean = clean(oldState);
  const newClean = clean(newState);

  if (oldClean === "off" && newClean === "on") {
    return result(true, `${entityType}_turned_on`, "room_state", 7);
  }

  if (oldClean === "on" && newClean === "off") {
    return result(true, `${entityType}_turned_off`, "room_state", 5);
  }

  return result(false, `${entityType}_micro_change`, "room_state", 1);
}

export function classifyHomeEventSignificance(
  input: HomeEventSignificanceInput
): HomeEventSignificance {
  const entityType = clean(input.entityType);
  const oldClean = clean(input.oldState);
  const newClean = clean(input.newState);

  if (["unknown", "unavailable", "none", ""].includes(newClean)) {
    return result(false, "invalid_state", "invalid", 0);
  }

  const repeatedAutomationTrigger =
    entityType === "automation" &&
    input.eventType === "automation_on" &&
    newClean === "triggered";
  if (oldClean === newClean && !repeatedAutomationTrigger) {
    const age = millisecondsSince(input.lastOccurredAt);
    return result(
      false,
      age !== null && age <= HOME_EVENT_THRESHOLDS.duplicateWindowMs
        ? "same_state_recent"
        : "same_state",
      "duplicate",
      0
    );
  }

  let decision: HomeEventSignificance;
  if (entityType === "temperature") {
    decision = result(false, "ambient_temperature_ignored", "context", 0);
  }
  else if (entityType === "humidity") {
    decision = result(false, "raw_humidity_ignored", "context", 0);
  }
  else if (["pressure", "co2", "noise", "battery", "signal"].includes(entityType)) {
    decision = result(false, `${entityType}_raw_environment_ignored`, "environment", 1);
  } else if (entityType === "lux") decision = classifyLux(input);
  else if (["motion", "presence"].includes(entityType)) {
    decision = classifyMotionOrPresence({ ...input, entityType });
  } else if (entityType === "tv") decision = classifyMedia(input);
  else if (["light", "switch"].includes(entityType)) {
    decision = classifyLightOrSwitch({ ...input, entityType });
  } else if (["person", "phone"].includes(entityType)) {
    decision = classifyPersonOrPhone(input);
  } else if (entityType === "contact") {
    decision = result(
      true,
      newClean === "on" || newClean === "open" ? "contact_opened" : "contact_closed",
      "security",
      8
    );
  } else if (entityType === "climate") {
    decision = classifyClimate(input);
  } else if (entityType === "automation") {
    decision = input.eventType === "automation_on"
      ? result(true, "automation_executed", "automation", 10)
      : result(false, "automation_non_execution_ignored", "system", 0);
  } else if (["fan", "appliance"].includes(entityType)) {
    decision = result(true, `${entityType}_state_changed`, "consequence", 5);
  } else {
    decision = result(false, "unsupported_entity_type", "other", 0);
  }

  const contextEvent = decision.category === "context";
  const actuatorEvent = ["light", "switch", "tv", "climate"].includes(entityType);
  const cooldownEligible =
    contextEvent || repeatedAutomationTrigger || entityType === "automation";
  if (decision.significant && actuatorEvent) {
    const age = millisecondsSince(input.lastOccurredAt);
    if (
      age !== null &&
      age >= 0 &&
      age < HOME_EVENT_THRESHOLDS.actuatorCooldownMs
    ) {
      return result(false, "actuator_cooldown", "cooldown", 0);
    }
  }

  if (decision.significant && cooldownEligible) {
    const cooldowns = [
      [input.lastOccurredAt, "same_device_cooldown"],
      [input.lastEventTypeOccurredAt, "same_event_type_cooldown"],
      [input.lastRoomEventOccurredAt, "same_room_cooldown"],
    ] as const;
    for (const [timestamp, reason] of cooldowns) {
      const age = millisecondsSince(timestamp);
      if (
        age !== null &&
        age >= 0 &&
        age < (contextEvent
          ? HOME_EVENT_THRESHOLDS.contextCooldownMs
          : HOME_EVENT_THRESHOLDS.cooldownMs)
      ) {
        return result(false, reason, "cooldown", 0);
      }
    }
  }

  return decision;
}
