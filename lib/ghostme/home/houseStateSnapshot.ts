import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getHAStates } from "@/lib/ghostme/homeAssistant/haClient";
import { getEntityInfo } from "@/lib/ghostme/homeAssistant/homeEntityMapper";
import { canAccessHomeAssistant } from "@/lib/ghostme/homeAssistant/homeAssistantAccess";

type HAState = {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
  last_changed?: string;
  last_updated?: string;
};

export type HouseStateSnapshot = {
  occupancyStatus:
    | "not_configured"
    | "empty"
    | "one_person_home"
    | "multiple_people_home"
    | "activity_detected"
    | "unknown";
  people: Array<{
    entityId: string;
    name: string;
    person?: string | null;
    state: string;
    isHome: boolean;
  }>;
  activeRooms: string[];
  media: Array<{
    entityId: string;
    name: string;
    room?: string | null;
    state: string;
  }>;
  signals: string[];
  confidence: number;
  lastUpdated: string | null;
};

function friendlyName(state: HAState) {
  return state.attributes?.friendly_name || state.entity_id;
}

function clean(value: any) {
  return String(value || "").toLowerCase().trim();
}

function isActiveState(value: any) {
  return ["on", "playing", "paused", "home", "casa"].includes(clean(value));
}

function isHomeState(value: any) {
  return ["home", "casa"].includes(clean(value));
}

function unique(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleanValue = String(value || "").trim();
    const key = clean(cleanValue);
    if (!cleanValue || seen.has(key)) continue;

    seen.add(key);
    result.push(cleanValue);
  }

  return result;
}

function latestTimestamp(values: Array<string | null | undefined>) {
  let latest: string | null = null;
  let latestTime = 0;

  for (const value of values) {
    if (!value) continue;

    const time = new Date(value).getTime();
    if (Number.isNaN(time) || time <= latestTime) continue;

    latestTime = time;
    latest = value;
  }

  return latest;
}

function buildSignals({
  occupancyStatus,
  activeRooms,
  media,
}: {
  occupancyStatus: HouseStateSnapshot["occupancyStatus"];
  activeRooms: string[];
  media: HouseStateSnapshot["media"];
}) {
  const signals: string[] = [];

  if (occupancyStatus === "empty") signals.push("house_empty");
  if (occupancyStatus === "one_person_home") signals.push("one_person_home");
  if (occupancyStatus === "multiple_people_home") signals.push("two_people_home");
  if (media.length) signals.push("media_active");
  if (activeRooms.length) signals.push(`active_rooms:${activeRooms.join(",")}`);

  return signals;
}

function confidenceFor({
  peopleCount,
  hasPersonEntities,
  activeRooms,
}: {
  peopleCount: number;
  hasPersonEntities: boolean;
  activeRooms: string[];
}) {
  if (peopleCount > 0) return 90;
  if (hasPersonEntities) return 80;
  if (activeRooms.length) return 55;
  return 30;
}

export function formatHouseStateContext(snapshot: HouseStateSnapshot) {
  if (snapshot.occupancyStatus === "not_configured") {
    return "Home Assistant non configurato per questo utente.";
  }

  const peopleLines = snapshot.people.map(
    (person) =>
      `${person.name}: ${person.isHome ? "a casa" : person.state || "sconosciuto"}`
  );
  const mediaLines = snapshot.media.map((media) => `${media.name} attiva`);
  const activeRoomLines = snapshot.activeRooms.map(
    (room) => `stanza attiva: ${room}`
  );

  const section = (title: string, lines: string[]) =>
    lines.length ? `${title}\n${lines.map((line) => `- ${line}`).join("\n")}` : "";

  return `
CONTESTO CASA RAGIONATO

${[
  section("PERSONE", peopleLines),
  section("MEDIA ATTIVI", mediaLines),
  section("PRESENZA / MOVIMENTO ATTIVI", activeRoomLines),
  section("SEGNALI CASA", snapshot.signals),
]
  .filter(Boolean)
  .join("\n\n")}
`.trim();
}

export async function buildHouseStateSnapshot(
  userId: string
): Promise<HouseStateSnapshot> {
  if (!canAccessHomeAssistant(userId)) {
    return {
      occupancyStatus: "not_configured",
      people: [],
      activeRooms: [],
      media: [],
      signals: [],
      confidence: 0,
      lastUpdated: null,
    };
  }

  const [states, entitiesRes, eventsRes] = await Promise.all([
    getHAStates() as Promise<HAState[]>,
    supabaseAdmin
      .from("house_entities")
      .select("entity_id, entity_name, room_key, entity_type, updated_at")
      .eq("user_id", userId)
      .limit(120),
    supabaseAdmin
      .from("house_events")
      .select("entity_id, entity_name, entity_type, room_key, event_type, new_state, occurred_at")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false })
      .limit(50),
  ]);

  const cleanStates = (states || []).filter(
    (state) => !["unknown", "unavailable", "none", ""].includes(clean(state.state))
  );

  const people = cleanStates
    .filter((state) => getEntityInfo(state.entity_id).type === "person")
    .map((state) => {
      const info = getEntityInfo(state.entity_id);

      return {
        entityId: state.entity_id,
        name: friendlyName(state),
        person: info.person || null,
        state: state.state,
        isHome: isHomeState(state.state),
      };
    });

  const peopleHome = people.filter((person) => person.isHome);

  const activeRooms = unique(
    cleanStates
      .filter((state) => {
        const info = getEntityInfo(state.entity_id);
        return ["presence", "motion"].includes(info.type) && isActiveState(state.state);
      })
      .map((state) => getEntityInfo(state.entity_id).room || null)
  );

  const media = cleanStates
    .filter((state) => {
      const info = getEntityInfo(state.entity_id);
      return (
        (info.type === "tv" || state.entity_id.startsWith("media_player.")) &&
        ["on", "playing", "paused"].includes(clean(state.state))
      );
    })
    .map((state) => {
      const info = getEntityInfo(state.entity_id);

      return {
        entityId: state.entity_id,
        name: friendlyName(state),
        room: info.room || null,
        state: state.state,
      };
    });

  const occupancyStatus: HouseStateSnapshot["occupancyStatus"] =
    peopleHome.length >= 2
      ? "multiple_people_home"
      : peopleHome.length === 1
        ? "one_person_home"
        : people.length > 0
          ? "empty"
          : activeRooms.length > 0
            ? "activity_detected"
            : "unknown";

  const signals = buildSignals({
    occupancyStatus,
    activeRooms,
    media,
  });

  const lastUpdated = latestTimestamp([
    ...cleanStates.map((state) => state.last_updated || state.last_changed),
    ...(entitiesRes.data || []).map((row: any) => row.updated_at),
    ...(eventsRes.data || []).map((row: any) => row.occurred_at),
  ]);

  return {
    occupancyStatus,
    people,
    activeRooms,
    media,
    signals,
    confidence: confidenceFor({
      peopleCount: peopleHome.length,
      hasPersonEntities: people.length > 0,
      activeRooms,
    }),
    lastUpdated,
  };
}
