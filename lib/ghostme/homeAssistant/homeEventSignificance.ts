export type HomeEventSignificanceInput = {
  entityType: string;
  entityId: string;
  oldState?: string | null;
  newState: string;
  eventType: string;
  lastOccurredAt?: string | null;
};

export type HomeEventSignificance = {
  significant: boolean;
  reason: string;
  category: string;
  priority: number;
};

const SAME_STATE_WINDOW_MS = 5 * 60 * 1000;

function clean(value: any) {
  return String(value ?? "").toLowerCase().trim();
}

function numericState(value: any) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function minutesSince(value?: string | null) {
  if (!value) return null;

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;

  return Math.round((Date.now() - time) / 60000);
}

function isMainIndoorTemperature(entityId: string) {
  const id = entityId.toLowerCase();

  return (
    id === "sensor.camera_temperatura_ambiente" ||
    id === "climate.camera"
  );
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
  entityId,
  oldState,
  newState,
}: HomeEventSignificanceInput) {
  if (!isMainIndoorTemperature(entityId)) {
    return result(false, "temperature_not_primary", "environment", 1);
  }

  const oldNum = numericState(oldState);
  const newNum = numericState(newState);

  if (newNum === null) {
    return result(false, "temperature_non_numeric", "environment", 1);
  }

  if (newNum >= 28) {
    return result(true, "temperature_hot_threshold", "environment", 8);
  }

  if (newNum <= 16) {
    return result(true, "temperature_cold_threshold", "environment", 8);
  }

  if (oldNum === null) {
    return result(false, "temperature_first_normal_value", "environment", 2);
  }

  const delta = Math.abs(newNum - oldNum);

  if (delta >= 2) {
    return result(true, "temperature_delta_over_2", "environment", 7);
  }

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

  if (newNum >= 70) {
    return result(true, "humidity_high_threshold", "environment", 7);
  }

  if (oldNum !== null && Math.abs(newNum - oldNum) >= 10) {
    return result(true, "humidity_delta_over_10", "environment", 6);
  }

  return result(false, "humidity_delta_small", "environment", 1);
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

  if (oldClean === newClean) {
    const ageMinutes = minutesSince(input.lastOccurredAt);
    return result(
      false,
      ageMinutes !== null && ageMinutes <= SAME_STATE_WINDOW_MS / 60000
        ? "same_state_recent"
        : "same_state",
      "duplicate",
      0
    );
  }

  if (entityType === "temperature") return classifyTemperature(input);
  if (entityType === "humidity") return classifyHumidity(input);

  if (["pressure", "co2", "noise"].includes(entityType)) {
    return result(false, `${entityType}_raw_environment_ignored`, "environment", 1);
  }

  if (entityType === "lux") {
    return result(false, "lux_micro_change_ignored", "environment", 1);
  }

  if (["motion", "presence"].includes(entityType)) {
    return classifyMotionOrPresence({ ...input, entityType });
  }

  if (entityType === "tv") return classifyMedia(input);

  if (["light", "switch"].includes(entityType)) {
    return classifyLightOrSwitch({ ...input, entityType });
  }

  if (["person", "phone"].includes(entityType)) {
    return result(true, `${entityType}_state_changed`, "presence", 8);
  }

  if (["weather", "sun", "climate", "fan", "appliance", "automation"].includes(entityType)) {
    return result(true, `${entityType}_state_changed`, "system", 4);
  }

  return result(false, "unsupported_entity_type", "other", 0);
}
