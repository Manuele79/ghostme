import { getHAStates } from "./haClient";

type HAState = {
  entity_id: string;
  state: string;
  attributes?: Record<string, any>;
  last_changed?: string;
  last_updated?: string;
};

function friendlyName(s: HAState) {
  return s.attributes?.friendly_name || s.entity_id;
}

function isUnavailable(s: HAState) {
  return ["unavailable", "unknown", "none", ""].includes(
    String(s.state || "").toLowerCase()
  );
}

function isTechnicalNoise(entityId: string) {
  const id = entityId.toLowerCase();

  return (
    id.startsWith("update.") ||
    id.includes("version") ||
    id.includes("aggiornamento") ||
    id.includes("update") ||
    id.includes("file_editor") ||
    id.includes("terminal_ssh") ||
    id.includes("duck_dns") ||
    id.includes("supervisor") ||
    id.includes("backup") ||
    id.includes("diagnostic")
  );
}

function isPresenceOrMotion(s: HAState) {
  const id = s.entity_id.toLowerCase();
  const name = friendlyName(s).toLowerCase();

  return (
    id.startsWith("person.") ||
    id.startsWith("device_tracker.") ||
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

function isLightOrSwitch(s: HAState) {
  const id = s.entity_id.toLowerCase();

  return (
    id.startsWith("light.") ||
    id.startsWith("switch.")
  );
}

function isMedia(s: HAState) {
  return s.entity_id.toLowerCase().startsWith("media_player.");
}

function isEnvironment(s: HAState) {
  const id = s.entity_id.toLowerCase();
  const name = friendlyName(s).toLowerCase();
  const unit = String(s.attributes?.unit_of_measurement || "").toLowerCase();

  return (
    id.startsWith("weather.") ||
    id === "sun.sun" ||
    unit === "lx" ||
    unit === "°c" ||
    unit === "c" ||
    name.includes("illuminamento") ||
    name.includes("luminosità") ||
    name.includes("temperature") ||
    name.includes("temperatura") ||
    name.includes("umidità") ||
    name.includes("humidity")
  );
}

function isPhoneUseful(s: HAState) {
  const id = s.entity_id.toLowerCase();
  const name = friendlyName(s).toLowerCase();

  return (
    id.includes("battery") ||
    id.includes("batteria") ||
    id.includes("wifi") ||
    id.includes("wi_fi") ||
    id.includes("bluetooth") ||
    id.includes("charger") ||
    id.includes("do_not_disturb") ||
    id.includes("geocoded") ||
    id.includes("last_update") ||
    name.includes("battery") ||
    name.includes("batteria") ||
    name.includes("wi-fi") ||
    name.includes("wifi") ||
    name.includes("bluetooth") ||
    name.includes("caricatore") ||
    name.includes("non disturbare")
  );
}

function formatLine(s: HAState) {
  const name = friendlyName(s);
  const unit = s.attributes?.unit_of_measurement
    ? ` ${s.attributes.unit_of_measurement}`
    : "";

  return `- ${name}: ${s.state}${unit}`;
}

function section(title: string, items: HAState[], limit = 20) {
  if (!items.length) return "";

  return `
${title}
${items.slice(0, limit).map(formatLine).join("\n")}
`.trim();
}

export async function buildHomeContext() {
  const states = (await getHAStates()) as HAState[];

  if (!states.length) return "";

  const cleanStates = states.filter(
    (s) => !isTechnicalNoise(s.entity_id) && !isUnavailable(s)
  );

  const presence = cleanStates.filter(isPresenceOrMotion);
  const lightsAndSwitches = cleanStates.filter(isLightOrSwitch);
  const media = cleanStates.filter(isMedia);
  const environment = cleanStates.filter(isEnvironment);
  const phone = cleanStates.filter(isPhoneUseful);

  const activeLightsAndSwitches = lightsAndSwitches.filter((s) =>
    ["on", "playing"].includes(String(s.state).toLowerCase())
  );

  const activeMedia = media.filter((s) =>
    ["on", "playing", "paused"].includes(String(s.state).toLowerCase())
  );

  const parts = [
    section("PRESENZA / MOVIMENTO", presence, 30),
    section("LUCI E PRESE ACCESE", activeLightsAndSwitches, 25),
    section("MEDIA ATTIVI", activeMedia, 10),
    section("AMBIENTE", environment, 25),
    section("TELEFONI", phone, 25),
  ].filter(Boolean);

  if (!parts.length) return "";

  return `
HOME ASSISTANT CONTEXT
${parts.join("\n\n")}
`.trim();
}