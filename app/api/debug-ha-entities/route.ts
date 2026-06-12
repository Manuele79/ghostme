import { NextResponse } from "next/server";
import { getHAStates } from "@/lib/ghostme/homeAssistant/haClient";

export async function GET() {
  const states = await getHAStates();

  const useful = states
    .filter((s: any) => {
      const id = String(s.entity_id || "").toLowerCase();
      const name = String(s.attributes?.friendly_name || "").toLowerCase();

      return (
        id.startsWith("binary_sensor.") ||
        id.startsWith("sensor.") ||
        id.startsWith("light.") ||
        id.startsWith("switch.") ||
        id.startsWith("media_player.") ||
        id.startsWith("climate.") ||
        id.startsWith("fan.") ||
        id.startsWith("person.") ||
        id.includes("movimento") ||
        id.includes("presenza") ||
        id.includes("occupazione") ||
        id.includes("illuminamento") ||
        id.includes("temperatura") ||
        name.includes("movimento") ||
        name.includes("presenza") ||
        name.includes("illuminamento") ||
        name.includes("temperatura")
      );
    })
    .map((s: any) => ({
      entity_id: s.entity_id,
      friendly_name: s.attributes?.friendly_name || "",
      state: s.state,
      unit: s.attributes?.unit_of_measurement || "",
    }))
    .sort((a: any, b: any) => a.entity_id.localeCompare(b.entity_id));

  return NextResponse.json({
    count: useful.length,
    entities: useful,
  });
}