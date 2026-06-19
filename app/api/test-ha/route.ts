import { NextResponse } from "next/server";
import { getHAStates } from "@/lib/ghostme/homeAssistant/haClient";
import { requireDevelopmentOrWorker, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function GET(req: Request) {
  try {
    requireDevelopmentOrWorker(req);
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
    if (err instanceof UserContextAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
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
