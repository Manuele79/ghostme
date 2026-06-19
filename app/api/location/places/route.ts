import { NextResponse } from "next/server";
import { getSignificantPlaces } from "@/lib/ghostme/location/placeService";
import { getAuthenticatedUserId, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = await getAuthenticatedUserId(req, body.userId);
    const places = await getSignificantPlaces(userId);

    return NextResponse.json({
      success: true,
      places,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.log("GET PLACES API ERROR:", err);
    return NextResponse.json({ error: "Errore lettura luoghi" }, { status: 500 });
  }
}
