import { NextResponse } from "next/server";
import { updateCurrentLocationFlow } from "@/lib/ghostme/location/locationUpdateFlow";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.userId) {
      return NextResponse.json({ error: "userId mancante" }, { status: 400 });
    }

    const result = await updateCurrentLocationFlow(body);

    return NextResponse.json({
      success: true,
      location: result.location,
    });
  } catch (err) {
    console.log("UPDATE CURRENT LOCATION API ERROR:", err);
    if (err instanceof Error && err.message === "Luogo attuale non salvato") {
      return NextResponse.json({ error: "Luogo attuale non salvato" }, { status: 500 });
    }

    return NextResponse.json({ error: "Errore posizione attuale" }, { status: 500 });
  }
}
