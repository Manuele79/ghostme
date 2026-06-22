import { NextResponse } from "next/server";
import { getLocationCurrentStateFlow } from "@/lib/ghostme/location/locationCurrentStateFlow";
import { getAuthenticatedUserId, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = await getAuthenticatedUserId(req, body.userId);
    const { data, error, freshness } = await getLocationCurrentStateFlow(userId);

    if (error) {
      console.log("GET CURRENT STATE ERROR:", error);
      return NextResponse.json({ error: "Errore lettura luogo attuale" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      locationStatus: freshness.status,
      observedAt: freshness.observedAt,
      location: freshness.currentLocation,
      lastKnownLocation: freshness.lastKnownLocation,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.log("CURRENT STATE API ERROR:", err);
    return NextResponse.json({ error: "Errore stato luogo" }, { status: 500 });
  }
}
