import { NextResponse } from "next/server";
import { updateCurrentLocationFlow } from "@/lib/ghostme/location/locationUpdateFlow";
import { getAuthenticatedUserId, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = await getAuthenticatedUserId(req, body.userId);
    const result = await updateCurrentLocationFlow({ ...body, userId });

    return NextResponse.json({
      success: true,
      location: result.location,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.log("UPDATE CURRENT LOCATION API ERROR:", err);
    if (err instanceof Error && err.message === "Luogo attuale non salvato") {
      return NextResponse.json({ error: "Luogo attuale non salvato" }, { status: 500 });
    }

    return NextResponse.json({ error: "Errore posizione attuale" }, { status: 500 });
  }
}
