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

const COOLDOWN_MS = 5 * 60 * 1000;
const LUX_DAY_NIGHT_THRESHOLD = 50;

function clean(value: any) {
  return String(value ?? "").toLowerCase().trim();
}

function numericState(value: any) {
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

function classifyTemperature({
  oldState,
  newState,
}: HomeEventSignificanceInput) {
  const oldNum = numericState(oldState);
  const newNum = numericState(newState);

  if (newNum === null) {
    return result(false, "temperature_non_numeric", "environment", 1);
  }

  if (newNum >= 28 && (oldNum === null || oldNum < 28)) {
    return result(true, "temperature_hot_threshold", "environment", 8);
  }

  if (newNum <= 16 && (oldNum === null || oldNum > 16)) {
    return result(true, "temperature_cold_threshold", "environment", 8);
  }

  if (oldNum === null) {
    return result(false, "temperature_first_normal_value", "environment", 2);
  }

  const delta = Math.abs(newNum - oldNum);

  if (delta < 1) {
    return result(false, "temperature_delta_under_1", "environment", 1);
  }

  return result(true, "temperature_delta_ok", "environment", 5);
}

function classifyHumidity({
  oldState,
  newState,
}: HomeEventSignificanceInput) {
  const oldNum = numericState(oldState);
  const newNum = numericState(newState);

  if (newNum === null) {
    return result(false, "humidity_non_numeric", "environment", 1);
  }

  if (newNum >= 70 && (oldNum === null || oldNum < 70)) {
    return result(true, "humidity_high_threshold", "environment", 7);
  }

  if (newNum <= 30 && (oldNum === null || oldNum > 30)) {
    return result(true, "humidity_low_threshold", "environment", 7);
  }

  if (oldNum !== null && Math.abs(newNum - oldNum) >= 5) {
    return result(true, "humidity_delta_over_5", "environment", 6);
  }

  return result(false, "humidity_delta_small", "environment", 1);
}

function classifyLux(input: HomeEventSignificanceInput) {
  const oldNum = numericState(input.oldState);
  const newNum = numericState(input.newState);
  if (oldNum === null || newNum === null) {
    return result(false, "lux_non_numeric", "environment", 1);
  }
  const crossed =
    (oldNum < LUX_DAY_NIGHT_THRESHOLD && newNum >= LUX_DAY_NIGHT_THRESHOLD) ||
    (oldNum >= LUX_DAY_NIGHT_THRESHOLD && newNum < LUX_DAY_NIGHT_THRESHOLD);
  return crossed
    ? result(true, "lux_day_night_threshold_crossed", "environment", 4)
    : result(false, "lux_without_threshold_crossing", "environment", 1);
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

  if (oldClean === "off" && newClean === "on") {
    return result(true, `${entityType}_activated`, "presence", 9);
  }

  if (oldClean === "on" && newClean === "off") {
    return result(true, `${entityType}_cleared`, "presence", 5);
  }

  return result(true, `${entityType}_changed`, "presence", 6);
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
    return result(
      false,
      millisecondsSince(input.lastOccurredAt) !== null &&
        millisecondsSince(input.lastOccurredAt)! <= COOLDOWN_MS
        ? "same_state_recent"
        : "same_state",
      "duplicate",
      0
    );
  }

  let decision: HomeEventSignificance;
  if (entityType === "temperature") decision = classifyTemperature(input);
  else if (entityType === "humidity") decision = classifyHumidity(input);
  else if (["pressure", "co2", "noise"].includes(entityType)) {
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
  } else if (["climate", "fan", "appliance", "automation"].includes(entityType)) {
    decision = result(true, `${entityType}_state_changed`, "system", 4);
  } else {
    decision = result(false, "unsupported_entity_type", "other", 0);
  }

  const cooldownEligible = [
    "temperature",
    "humidity",
    "lux",
    "motion",
    "presence",
    ...(repeatedAutomationTrigger ? ["automation"] : []),
  ].includes(entityType);
  const criticalEnvironmentThreshold =
    ["temperature", "humidity"].includes(entityType) && decision.priority >= 7;
  const meaningfulPresenceClear =
    ["motion", "presence"].includes(entityType) && newClean === "off";
  if (
    decision.significant &&
    cooldownEligible &&
    !criticalEnvironmentThreshold &&
    !meaningfulPresenceClear
  ) {
    const cooldowns = [
      [input.lastOccurredAt, "same_device_cooldown"],
      [input.lastEventTypeOccurredAt, "same_event_type_cooldown"],
      [input.lastRoomEventOccurredAt, "same_room_cooldown"],
    ] as const;
    for (const [timestamp, reason] of cooldowns) {
      const age = millisecondsSince(timestamp);
      if (age !== null && age >= 0 && age < COOLDOWN_MS) {
        return result(false, reason, "cooldown", 0);
      }
    }
  }

  return decision;
}
