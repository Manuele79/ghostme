import { getHAStates } from "./haClient";

type HAState = {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
};

function friendlyName(s: HAState) {
  return s.attributes?.friendly_name || s.entity_id;
}

function isOnState(state: string) {
  return ["on", "playing", "paused", "home"].includes(
    String(state || "").toLowerCase()
  );
}

function isUnavailable(s: HAState) {
  return ["unavailable", "unknown", "none", ""].includes(
    String(s.state || "").toLowerCase()
  );
}

const mediaNameMap: Record<string, string> = {
  "media_player.lg_webos_tv_uk6200pla": "TV cucina",
  "media_player.hisense_43a5fe_dal10537_airplay": "TV camera",
};

function section(title: string, lines: string[]) {
  if (!lines.length) return "";

  return `
${title}
${lines.map((line) => `- ${line}`).join("\n")}
`.trim();
}

function isPresenceOrMotion(s: HAState) {
  const id = s.entity_id.toLowerCase();
  const name = friendlyName(s).toLowerCase();

  return (
    id.includes("occupazione") ||
    id.includes("presence") ||
    id.includes("presenza") ||
    id.includes("movimento") ||
    id.includes("motion") ||
    id.startsWith("sensor.matter") ||
    name.includes("occupazione") ||
    name.includes("presence") ||
    name.includes("presenza") ||
    name.includes("movimento") ||
    name.includes("motion")
  );
}

function isPhoneSensor(s: HAState) {
  const id = s.entity_id.toLowerCase();
  const name = friendlyName(s).toLowerCase();

  return (
    id.includes("rea_nx9") ||
    id.includes("cph2305") ||
    name.includes("rea-nx9") ||
    name.includes("cph2305") ||
    name.includes("manuele") ||
    name.includes("valentina")
  );
}

export async function buildCognitiveHouse() {
  const states = (await getHAStates()) as HAState[];

  if (!states.length) {
    return "CASA COGNITIVA\n- Home Assistant non disponibile";
  }

  const cleanStates = states.filter((s) => !isUnavailable(s));

  const people = cleanStates.filter((s) => s.entity_id.startsWith("person."));
  const peopleLines = people.map((p) => {
    const status = p.state === "home" ? "a casa" : p.state;
    return `${friendlyName(p)}: ${status}`;
  });

  const peopleAtHome = people.filter((p) => p.state !== "not_home");

  const presenceActive = cleanStates
    .filter((s) => isPresenceOrMotion(s) && isOnState(s.state))
    .map((s) => friendlyName(s));

  const lightsOn = cleanStates
    .filter((s) => s.entity_id.startsWith("light.") && s.state === "on")
    .map((s) => friendlyName(s));

  const switchesOn = cleanStates
    .filter((s) => {
      if (!s.entity_id.startsWith("switch.")) return false;

      const id = s.entity_id.toLowerCase();
      const name = friendlyName(s).toLowerCase();

      if (
        id.includes("matter_server") ||
        id.includes("file_editor") ||
        id.includes("terminal") ||
        id.includes("hacs") ||
        name.includes("matter server") ||
        name.includes("file editor") ||
        name.includes("terminal") ||
        name.includes("hacs")
      ) {
        return false;
      }

      return s.state === "on";
    })
    .map((s) => friendlyName(s));

  const mediaActive = cleanStates
    .filter(
      (s) =>
        s.entity_id.startsWith("media_player.") &&
        ["on", "playing", "paused"].includes(String(s.state).toLowerCase())
    )
    .map((s) => mediaNameMap[s.entity_id] || friendlyName(s));

  const weather = cleanStates.find((s) => s.entity_id.startsWith("weather."));
  const sun = cleanStates.find((s) => s.entity_id === "sun.sun");

  const environmentLines: string[] = [];

  if (weather) {
    environmentLines.push(`Meteo: ${weather.state}`);
  }

  if (sun) {
    environmentLines.push(sun.state === "above_horizon" ? "È giorno" : "È notte");
  }

  const phoneLines = cleanStates
    .filter(isPhoneSensor)
    .filter((s) => {
      const id = s.entity_id.toLowerCase();
      const name = friendlyName(s).toLowerCase();

      return (
        id.includes("battery_level") ||
        id.includes("battery_state") ||
        id.includes("wi_fi_connection") ||
        id.includes("wifi_connection") ||
        id.includes("charger_type") ||
        name.includes("battery level") ||
        name.includes("battery state") ||
        name.includes("wi-fi connection") ||
        name.includes("wifi connection") ||
        name.includes("charger type")
      );
    })
    .map((s) => `${friendlyName(s)}: ${s.state}${s.attributes?.unit_of_measurement ? ` ${s.attributes.unit_of_measurement}` : ""}`);

  const lines = [
    `Persone probabili in casa: ${peopleAtHome.length}`,
    "",
    section("PERSONE", peopleLines),
    section("PRESENZA / MOVIMENTO ATTIVI", presenceActive),
    section("LUCI ACCESE", lightsOn),
    section("PRESE / SWITCH ACCESI", switchesOn),
    section("MEDIA ATTIVI", mediaActive),
    section("AMBIENTE", environmentLines),
    section("TELEFONI", phoneLines),
  ].filter(Boolean);

  return `
CASA COGNITIVA

${lines.join("\n\n")}
`.trim();
}