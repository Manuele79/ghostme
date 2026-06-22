export const LOCATION_FRESHNESS_WINDOW_MS = 2 * 60 * 60 * 1000;

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

export function classifyLocationState(location: any, now = Date.now()) {
  if (!location) {
    return {
      status: "unknown" as LocationStateStatus,
      currentLocation: null,
      lastKnownLocation: null,
      observedAt: null,
    };
  }

  const observedAt = getLocationStateObservedAt(location);
  const observedTime = validTime(observedAt);
  const isCurrent =
    observedTime !== null &&
    observedTime <= now + 60_000 &&
    now - observedTime <= LOCATION_FRESHNESS_WINDOW_MS;

  return {
    status: (isCurrent ? "current" : "stale") as LocationStateStatus,
    currentLocation: isCurrent ? location : null,
    lastKnownLocation: isCurrent ? null : location,
    observedAt,
  };
}

export function isFreshLocationState(location: any, now = Date.now()) {
  return classifyLocationState(location, now).status === "current";
}
