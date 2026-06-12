import { NextResponse } from "next/server";
import { getHAStates } from "@/lib/ghostme/homeAssistant/haClient";
import { getEntityInfo } from "@/lib/ghostme/homeAssistant/homeEntityMapper";

function isUsefulEvent(entityType: string) {
  return [
    "person",
    "presence",
    "motion",
    "lux",
    "light",
    "switch",
    "tv",
    "phone",
    "weather",
    "sun",
    "temperature",
    "humidity",
    "co2",
    "noise",
    "pressure",
    "climate",
    "fan",
    "appliance",
    "automation",
  ].includes(entityType);
}

export async function GET() {
  const states = await getHAStates();

  const mapped = states
    .map((s: any) => {
      const info = getEntityInfo(s.entity_id);

      return {
        entity_id: s.entity_id,
        friendly_name: s.attributes?.friendly_name || "",
        state: s.state,
        type: info.type,
        room: info.room || null,
        useful: isUsefulEvent(info.type),
      };
    })
    .filter((x: any) => x.useful);

  return NextResponse.json({
    totalStates: states.length,
    usefulMapped: mapped.length,
    sample: mapped.slice(0, 80),
  });
}