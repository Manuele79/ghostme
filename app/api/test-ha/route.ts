import { NextResponse } from "next/server";
import { getHAStates } from "@/lib/ghostme/homeAssistant/haClient";

export async function GET() {
  try {
    const states = await getHAStates();

    return NextResponse.json({
      success: true,
      count: states.length,
      sample: states.slice(0, 20).map((s: any) => ({
        entity_id: s.entity_id,
        state: s.state,
        friendly_name: s.attributes?.friendly_name || null,
      })),
    });
  } catch (err) {
    console.log("TEST HA ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Errore test Home Assistant",
      },
      { status: 500 }
    );
  }
}