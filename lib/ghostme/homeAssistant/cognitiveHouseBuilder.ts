import { getHAStates } from "./haClient";

type HAState = {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
};

function name(s: HAState) {
  return s.attributes?.friendly_name || s.entity_id;
}

function isOn(s: HAState) {
  return ["on", "playing", "paused", "home"].includes(
    String(s.state).toLowerCase()
  );
}

const tvMap: Record<string, string> = {
  "media_player.lg_webos_tv_uk6200pla": "TV cucina",
  "media_player.hisense_43a5fe_dal10537_airplay": "TV camera",
};

export async function buildCognitiveHouse() {
  const states = (await getHAStates()) as HAState[];

  if (!states.length) {
    return "Casa cognitiva non disponibile";
  }

  const lines: string[] = [];

  const people = states.filter((s) => s.entity_id.startsWith("person."));
  const peopleAtHome = people.filter((p) => p.state !== "not_home");

  lines.push(`Persone probabili in casa: ${peopleAtHome.length || 0}`);

  for (const p of people) {
    lines.push(`${name(p)}: ${p.state === "home" ? "a casa" : p.state}`);
  }

  const presence = states.filter((s) => {
    const id = s.entity_id.toLowerCase();
    const n = name(s).toLowerCase();

    return (
      isOn(s) &&
      (
        id.includes("occupazione") ||
        id.includes("presence") ||
        id.includes("presenza") ||
        id.includes("movimento") ||
        id.includes("motion") ||
        id.startsWith("sensor.matter") ||
        n.includes("occupazione") ||
        n.includes("presence") ||
        n.includes("presenza") ||
        n.includes("movimento")
      )
    );
  });

  if (presence.length) {
    lines.push(
      `Presenze/movimenti attivi: ${presence.map(name).join(", ")}`
    );
  }

  const lights = states.filter(
    (s) => s.entity_id.startsWith("light.") && s.state === "on"
  );

  const switches = states.filter(
    (s) => s.entity_id.startsWith("switch.") && s.state === "on"
  );

  if (lights.length) {
    lines.push(`Luci accese: ${lights.map(name).join(", ")}`);
  }

  if (switches.length) {
    lines.push(`Prese/interruttori accesi: ${switches.map(name).join(", ")}`);
  }

  const media = states.filter(
    (s) =>
      s.entity_id.startsWith("media_player.") &&
      ["on", "playing", "paused"].includes(String(s.state).toLowerCase())
  );

  if (media.length) {
    lines.push(
      `Media attivi: ${media
        .map((m) => tvMap[m.entity_id] || name(m))
        .join(", ")}`
    );
  }

  const weather = states.find((s) => s.entity_id.startsWith("weather."));
  if (weather) {
    lines.push(`Meteo: ${weather.state}`);
  }

  const sun = states.find((s) => s.entity_id === "sun.sun");
  if (sun) {
    lines.push(sun.state === "above_horizon" ? "È giorno" : "È notte");
  }

  return `
CASA COGNITIVA

${lines.join("\n")}
`.trim();
}