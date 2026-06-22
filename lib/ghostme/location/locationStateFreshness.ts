export const GPS_LOCATION_FRESHNESS_WINDOW_MS = 30 * 60 * 1000;
export const HA_HOME_FRESHNESS_WINDOW_MS = 4 * 60 * 60 * 1000;
export const LOCATION_FRESHNESS_WINDOW_MS = 60 * 60 * 1000;

export type LocationStateStatus = "current" | "stale" | "unknown";

function validTime(value: unknown) {
  if (!value) return null;
  const time = new Date(String(value)).getTime();
  return Number.isNaN(time) ? null : time;
}

export function getLocationStateObservedAt(location: any) {
  const timestamps = [
    validTime(location?.updated_at),
    validTime(location?.last_changed_at),
  ].filter((value): value is number => value !== null);

  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

export function getLocationFreshnessWindowMs(location: any) {
  const source = String(location?.source || "").toLowerCase();
  if (["phone", "phone_gps", "browser", "browser_gps"].includes(source)) {
    return GPS_LOCATION_FRESHNESS_WINDOW_MS;
  }
  if (source === "home_assistant") {
    const category = String(location?.place_category || "").toLowerCase();
    const label = String(location?.current_place_label || "").toLowerCase();
    return category === "home" || ["casa", "home"].includes(label)
      ? HA_HOME_FRESHNESS_WINDOW_MS
      : 0;
  }
  return LOCATION_FRESHNESS_WINDOW_MS;
}

export function toPublicLocationState(location: any) {
  if (!location) return null;
  const { latitude: _latitude, longitude: _longitude, accuracy: _accuracy, ...safe } =
    location;
  return safe;
}

export function classifyLocationState(location: any, now = Date.now()) {
  if (!location) {
    return {
      status: "unknown" as LocationStateStatus,
      currentLocation: null,
      lastKnownLocation: null,
      observedAt: null,
      expiresAt: null,
    };
  }

  const observedAt = getLocationStateObservedAt(location);
  const observedTime = validTime(observedAt);
  const freshnessWindowMs = getLocationFreshnessWindowMs(location);
  const isCurrent =
    observedTime !== null &&
    observedTime <= now + 60_000 &&
    freshnessWindowMs > 0 && now - observedTime <= freshnessWindowMs;

  return {
    status: (isCurrent ? "current" : "stale") as LocationStateStatus,
    currentLocation: isCurrent ? location : null,
    lastKnownLocation: isCurrent ? null : location,
    observedAt,
    expiresAt:
      observedTime !== null && freshnessWindowMs > 0
        ? new Date(observedTime + freshnessWindowMs).toISOString()
        : null,
  };
}

export function isFreshLocationState(location: any, now = Date.now()) {
  return classifyLocationState(location, now).status === "current";
}
