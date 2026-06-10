import { getHAStates } from "./haClient";

export async function buildHomeReasoning() {
  const states: any[] = await getHAStates();

  if (!states.length) {
    return "";
  }

  const lines: string[] = [];

  // Persone
  const persons = states.filter((s) =>
    s.entity_id.startsWith("person.")
  );

  for (const p of persons) {
    lines.push(
      `${p.attributes?.friendly_name || p.entity_id}: ${
        p.state === "home" ? "a casa" : p.state
      }`
    );
  }

  // TV
  const tvs = states.filter(
    (s) =>
      s.entity_id.startsWith("media_player.") &&
      ["on", "playing", "paused"].includes(
        String(s.state).toLowerCase()
      )
  );

  for (const tv of tvs) {
    lines.push(
      `${tv.attributes?.friendly_name || "TV"} accesa`
    );
  }

  // Luci accese
  const lights = states.filter(
    (s) =>
      s.entity_id.startsWith("light.") &&
      s.state === "on"
  );

  if (lights.length) {
    lines.push(
      `Luci accese: ${lights
        .map((l) => l.attributes?.friendly_name || l.entity_id)
        .join(", ")}`
    );
  }

  // Meteo
  const weather = states.find((s) =>
    s.entity_id.startsWith("weather.")
  );

  if (weather) {
    lines.push(`Meteo: ${weather.state}`);
  }

  // Sole
  const sun = states.find(
    (s) => s.entity_id === "sun.sun"
  );

  if (sun) {
    lines.push(
      sun.state === "above_horizon"
        ? "È giorno"
        : "È notte"
    );
  }

  return `
CONTESTO CASA

${lines.join("\n")}
`.trim();
}