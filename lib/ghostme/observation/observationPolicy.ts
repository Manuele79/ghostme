export const CURRENT_OBSERVATION_WINDOW_MS = 24 * 60 * 60 * 1000;
export const MAX_CURRENT_OBSERVATIONS = 6;

const HIDDEN_STATUSES = new Set([
  "stale",
  "duplicate",
  "expired",
  "dismissed",
  "answered",
  "archived",
]);

const SIGNIFICANT_EVENT_TYPES = new Set([
  "location_enter",
  "location_exit",
  "home_arrived",
  "home_left",
  "work_arrived",
  "work_left",
  "place_unknown_detected",
]);

function clean(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function eventTime(event: any) {
  const value = new Date(event?.occurred_at || 0).getTime();
  return Number.isFinite(value) ? value : 0;
}

function deviceKey(event: any) {
  return clean(
    event?.context?.device_id ||
      event?.context?.entity_id ||
      event?.context?.device ||
      event?.source
  );
}

function placeKey(event: any) {
  return clean(
    event?.place_id ||
      event?.context?.candidate_place_id ||
      event?.place_label ||
      "unknown_place"
  );
}

export function observationIdentity(event: any) {
  return [
    clean(event?.user_id),
    clean(event?.event_type || event?.category),
    placeKey(event),
    deviceKey(event),
  ].join("|");
}

export function isUsableObservation(
  event: any,
  { now = Date.now(), currentOnly = false }: { now?: number; currentOnly?: boolean } = {}
) {
  if (!SIGNIFICANT_EVENT_TYPES.has(clean(event?.event_type))) return false;
  if (HIDDEN_STATUSES.has(clean(event?.status))) return false;

  const expiresAt = event?.expires_at || event?.context?.expires_at;
  if (expiresAt && new Date(expiresAt).getTime() <= now) return false;

  const occurredAt = eventTime(event);
  if (!occurredAt || occurredAt > now + 5 * 60 * 1000) return false;
  if (currentOnly && occurredAt < now - CURRENT_OBSERVATION_WINDOW_MS) return false;

  // Un singolo fix GPS sconosciuto serve al learning, non al ragionamento.
  if (
    currentOnly &&
    event.event_type === "place_unknown_detected" &&
    !event?.context?.candidate_place_id
  ) {
    return false;
  }

  return true;
}

export function cleanObservations(
  events: any[],
  {
    currentOnly = false,
    limit,
    duplicateWindowMs = 15 * 60 * 1000,
  }: { currentOnly?: boolean; limit?: number; duplicateWindowMs?: number } = {}
) {
  const sorted = [...events]
    .filter((event) => isUsableObservation(event, { currentOnly }))
    .sort((a, b) => eventTime(b) - eventTime(a));
  const lastSeen = new Map<string, number>();
  const cleanEvents = sorted.filter((event) => {
    const identity = observationIdentity(event);
    const occurredAt = eventTime(event);
    const previous = lastSeen.get(identity);
    if (previous !== undefined && previous - occurredAt < duplicateWindowMs) {
      return false;
    }
    lastSeen.set(identity, occurredAt);
    return true;
  });

  return typeof limit === "number" ? cleanEvents.slice(0, limit) : cleanEvents;
}
