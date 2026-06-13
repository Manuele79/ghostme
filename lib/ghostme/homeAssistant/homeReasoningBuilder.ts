import { getHAStates } from "./haClient";

function friendlyName(s: any) {
  return s.attributes?.friendly_name || s.entity_id;
}

function isOnLike(state: string) {
  return ["on", "playing", "paused", "home"].includes(
    String(state || "").toLowerCase()
  );
}

function isNight(states: any[]) {
  const sun = states.find((s) => s.entity_id === "sun.sun");
  return sun?.state === "below_horizon";
}

type RoomKey = "cucina" | "salotto" | "camera" | "bagno" | "scale" | "armadio";

function detectRoom(entityId: string, name: string): RoomKey | null {
  const text = `${entityId} ${name}`.toLowerCase();

  if (text.includes("cucina")) return "cucina";
  if (text.includes("salotto") || text.includes("sala")) return "salotto";
  if (text.includes("camera")) return "camera";
  if (text.includes("bagno")) return "bagno";
  if (text.includes("scale")) return "scale";
  if (text.includes("armadio")) return "armadio";

  return null;
}

function section(title: string, lines: string[]) {
  if (!lines.length) return "";
  return `${title}\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

export async function buildHomeReasoning() {
  const states: any[] = await getHAStates();

  if (!states.length) return "";

  const lines: string[] = [];
  const signals: string[] = [];

  const persons = states.filter((s) => s.entity_id.startsWith("person."));
  const peopleHome = persons.filter((p) =>
    ["home", "casa"].includes(String(p.state || "").toLowerCase())
  );

  if (peopleHome.length === 0) {
    signals.push("house_empty");
  }

  if (peopleHome.length === 1) {
    signals.push("one_person_home");
  }

  if (peopleHome.length >= 2) {
    signals.push("two_people_home");
  }

  const personLines = persons.map(
    (p) =>
      `${friendlyName(p)}: ${
        p.state === "home" ? "a casa" : p.state || "sconosciuto"
      }`
  );

  const mediaNameMap: Record<string, string> = {
    "media_player.lg_webos_tv_uk6200pla": "TV cucina",
    "media_player.hisense_43a5fe_dal10537_airplay": "TV camera",
  };

  const mediaPlayers = states.filter(
    (s) =>
      s.entity_id.startsWith("media_player.") &&
      ["on", "playing", "paused"].includes(String(s.state).toLowerCase())
  );

  const mediaLines = mediaPlayers.map((media) => {
    const name = mediaNameMap[media.entity_id] || friendlyName(media);
    return `${name} attiva`;
  });

  if (mediaPlayers.length) {
    signals.push("media_active");
  }

  const lights = states.filter(
    (s) => s.entity_id.startsWith("light.") && s.state === "on"
  );

  const lightsByRoom = new Map<string, string[]>();

  for (const light of lights) {
    const name = friendlyName(light);
    const room = detectRoom(light.entity_id, name) || "non_classificata";
    lightsByRoom.set(room, [...(lightsByRoom.get(room) || []), name]);
  }

  const lightLines = Array.from(lightsByRoom.entries()).map(
    ([room, items]) => `${room}: ${items.join(", ")}`
  );

  if (lights.length) {
    signals.push("lights_active");
  }

  const motionOrPresence = states.filter((s) => {
    const id = String(s.entity_id || "").toLowerCase();
    const name = String(friendlyName(s) || "").toLowerCase();

    return (
      isOnLike(s.state) &&
      (id.includes("motion") ||
        id.includes("movimento") ||
        id.includes("presence") ||
        id.includes("presenza") ||
        id.includes("occupazione") ||
        name.includes("motion") ||
        name.includes("movimento") ||
        name.includes("presence") ||
        name.includes("presenza") ||
        name.includes("occupazione"))
    );
  });

const activeRooms = Array.from(
  new Set<RoomKey>(
    motionOrPresence
      .map((s) => detectRoom(s.entity_id, friendlyName(s)))
      .filter((room): room is RoomKey => room !== null)
  )
);

  if (activeRooms.length) {
    signals.push(`active_rooms:${activeRooms.join(",")}`);
  }

  const night = isNight(states);

  if (night) {
    signals.push("night_mode");
  } else {
    signals.push("day_mode");
  }

  if (
    peopleHome.length > 0 &&
    mediaPlayers.length > 0 &&
  (["salotto", "cucina", "camera"] as RoomKey[]).some((room) =>
    activeRooms.includes(room)
  )
  ) {
    signals.push("relax_mode_possible");
  }

  if (
    peopleHome.length > 0 &&
    lights.length > 0 &&
    !mediaPlayers.length &&
    !night
  ) {
    signals.push("home_activity_possible");
  }

  const weather = states.find((s) => s.entity_id.startsWith("weather."));
  const weatherLine = weather ? [`Meteo: ${weather.state}`] : [];

  lines.push(section("PERSONE", personLines));
  lines.push(section("MEDIA ATTIVI", mediaLines));
  lines.push(section("LUCI ACCESE PER STANZA", lightLines));
  lines.push(
    section(
      "PRESENZA / MOVIMENTO ATTIVI",
      activeRooms.map((room) => `stanza attiva: ${room}`)
    )
  );
  lines.push(section("AMBIENTE", weatherLine));
  lines.push(section("SEGNALI CASA", signals));

  return `
CONTESTO CASA RAGIONATO

${lines.filter(Boolean).join("\n\n")}
`.trim();
}