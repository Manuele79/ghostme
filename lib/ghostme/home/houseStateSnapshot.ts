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
    person: "manu" | "vale" | null;
    userId: string | null;
    state: string;
    isHome: boolean;
    presenceKnown: boolean;
    source: string | null;
    confidence: number;
    lastUpdated: string | null;
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
  occupancySince: string | null;
  lastUpdated: string | null;
};

const DEFAULT_DB_FRESHNESS_MS = 6 * 60 * 60 * 1000;
const MANU_USER_ID =
  process.env.GHOSTME_MANUELE_USER_ID ||
  process.env.GHOSTME_HOME_ASSISTANT_USER_ID ||
  process.env.HOME_ASSISTANT_USER_ID ||
  "d8d8e77a-4af3-42e1-9810-16f534be4093";
const VALE_USER_ID =
  process.env.GHOSTME_VALENTINA_USER_ID ||
  "533d9261-0724-41f7-b949-46687e56aa02";

type HouseholdMember = {
  person: "manu" | "vale";
  name: "Manu" | "Vale";
  userId: string;
};

type LocationPresenceRow = {
  user_id: string;
  current_place_label: string | null;
  place_category: string | null;
  source: string | null;
  confidence: number | null;
  updated_at: string | null;
  last_changed_at: string | null;
};

function householdMembers(): HouseholdMember[] {
  return [
    { person: "manu", name: "Manu", userId: MANU_USER_ID },
    { person: "vale", name: "Vale", userId: VALE_USER_ID },
  ];
}

function dbFreshnessWindowMs() {
  const configuredMinutes = Number(process.env.HOUSE_SNAPSHOT_MAX_AGE_MINUTES);
  return Number.isFinite(configuredMinutes) && configuredMinutes > 0
    ? configuredMinutes * 60 * 1000
    : DEFAULT_DB_FRESHNESS_MS;
}

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

function isHomeLocation(row?: LocationPresenceRow | null) {
  return Boolean(
    row &&
      (clean(row.place_category) === "home" ||
        isHomeState(row.current_place_label))
  );
}

function adjustedConfidence(value: unknown, updatedAt?: string | null) {
  const confidence = Math.min(100, Math.max(0, Number(value || 0)));
  const age = updatedAt ? Date.now() - new Date(updatedAt).getTime() : Infinity;
  if (!Number.isFinite(age) || age > 24 * 60 * 60 * 1000) {
    return Math.min(confidence, 40);
  }
  if (age > 6 * 60 * 60 * 1000) return Math.min(confidence, 60);
  return confidence;
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
  userId: string,
  { forceLive = false }: { forceLive?: boolean } = {}
): Promise<HouseStateSnapshot> {
  const homeAssistantConfigured = canAccessHomeAssistant(userId);
  const members = householdMembers();

  const [entitiesRes, eventsRes, locationsRes] = await Promise.all([
    supabaseAdmin
      .from("house_entities")
      .select("entity_id, entity_name, room_key, entity_type, updated_at")
      .eq("user_id", userId)
      .limit(120),
    supabaseAdmin
      .from("house_events")
      .select("entity_id, entity_name, entity_type, room_key, event_type, new_state, value, occurred_at")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false })
      .limit(250),
    supabaseAdmin
      .from("user_location_state")
      .select("user_id, current_place_label, place_category, source, confidence, updated_at, last_changed_at")
      .in(
        "user_id",
        members.map((member) => member.userId)
      ),
  ]);

  const latestEventByEntity = new Map<string, any>();
  for (const event of eventsRes.data || []) {
    if (!latestEventByEntity.has(event.entity_id)) {
      latestEventByEntity.set(event.entity_id, event);
    }
  }
  const databaseStates: HAState[] = Array.from(latestEventByEntity.values()).map(
    (event) => ({
      entity_id: event.entity_id,
      state: event.new_state,
      attributes: {
        ...(event.value?.attributes || {}),
        friendly_name:
          event.value?.attributes?.friendly_name || event.entity_name || event.entity_id,
      },
      last_changed: event.occurred_at,
      last_updated: event.occurred_at,
    })
  );
  const latestDatabaseTimestamp = latestTimestamp(
    (eventsRes.data || []).map((event: any) => event.occurred_at)
  );
  const latestDatabaseTime = latestDatabaseTimestamp
    ? new Date(latestDatabaseTimestamp).getTime()
    : 0;
  const databaseIsFresh =
    latestDatabaseTime > 0 &&
    Date.now() - latestDatabaseTime <= dbFreshnessWindowMs();
  const liveStates =
    homeAssistantConfigured && (forceLive || !databaseIsFresh)
      ? ((await getHAStates({ force: forceLive })) as HAState[])
      : [];
  const states = liveStates.length ? liveStates : databaseStates;

  const cleanStates = (states || []).filter(
    (state) => !["unknown", "unavailable", "none", ""].includes(clean(state.state))
  );

  const haPeople = cleanStates
    .filter((state) => getEntityInfo(state.entity_id).type === "person")
    .map((state) => {
      const info = getEntityInfo(state.entity_id);

      return {
        entityId: state.entity_id,
        name: friendlyName(state),
        person: info.person || null,
        state: state.state,
        isHome: isHomeState(state.state),
        presenceKnown: true,
        source: "home_assistant",
        confidence: 90,
        lastUpdated: state.last_updated || state.last_changed || null,
      };
    });

  const locations = new Map(
    ((locationsRes.data || []) as LocationPresenceRow[]).map((row) => [
      row.user_id,
      row,
    ])
  );
  const people = members.map((member) => {
    const ha = haPeople.find((person) => person.person === member.person);
    const location = locations.get(member.userId) || null;
    const locationUpdatedAt =
      location?.updated_at || location?.last_changed_at || null;
    const locationConfidence = adjustedConfidence(
      location?.confidence,
      locationUpdatedAt
    );
    const haConfidence = adjustedConfidence(90, ha?.lastUpdated || null);
    const useLocation =
      Boolean(location) &&
      (!ha ||
        new Date(locationUpdatedAt || 0).getTime() >=
          new Date(ha.lastUpdated || 0).getTime());

    if (useLocation && location) {
      return {
        entityId: ha?.entityId || `ghostme_user.${member.person}`,
        name: member.name,
        person: member.person,
        userId: member.userId,
        state: location.current_place_label || "sconosciuto",
        isHome: isHomeLocation(location),
        presenceKnown: Boolean(
          location.current_place_label || location.place_category
        ),
        source: location.source || "user_location_state",
        confidence: locationConfidence,
        lastUpdated: locationUpdatedAt,
      };
    }

    return {
      entityId: ha?.entityId || `ghostme_user.${member.person}`,
      name: member.name,
      person: member.person,
      userId: member.userId,
      state: ha?.state || "sconosciuto",
      isHome: Boolean(ha?.isHome),
      presenceKnown: Boolean(ha),
      source: ha?.source || null,
      confidence: haConfidence,
      lastUpdated: ha?.lastUpdated || null,
    };
  });

  const peopleHome = people.filter(
    (person) => person.presenceKnown && person.isHome
  );
  const knownPeople = people.filter((person) => person.presenceKnown);

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
        ["on", "playing", "paused", "idle"].includes(clean(state.state))
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
        : knownPeople.length === members.length
          ? "empty"
          : activeRooms.length > 0
            ? "activity_detected"
            : !homeAssistantConfigured && knownPeople.length === 0
              ? "not_configured"
              : "unknown";
  const occupancySince =
    occupancyStatus === "empty"
      ? latestTimestamp(people.map((person) => person.lastUpdated))
      : null;

  const signals = buildSignals({
    occupancyStatus,
    activeRooms,
    media,
  });

  const lastUpdated = latestTimestamp([
    ...cleanStates.map((state) => state.last_updated || state.last_changed),
    ...(entitiesRes.data || []).map((row: any) => row.updated_at),
    ...(eventsRes.data || []).map((row: any) => row.occurred_at),
    ...(locationsRes.data || []).map(
      (row: LocationPresenceRow) => row.updated_at || row.last_changed_at
    ),
  ]);
  const householdConfidence = knownPeople.length
    ? Math.min(
        knownPeople.length < members.length ? 60 : 100,
        Math.round(
          knownPeople.reduce(
            (total, person) => total + person.confidence,
            0
          ) / knownPeople.length
        )
      )
    : confidenceFor({
        peopleCount: 0,
        hasPersonEntities: false,
        activeRooms,
      });

  return {
    occupancyStatus,
    people,
    activeRooms,
    media,
    signals,
    confidence: householdConfidence,
    occupancySince,
    lastUpdated,
  };
}
