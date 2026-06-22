import { NextResponse } from "next/server";
import { detectCurrentPlace, toPublicSignificantPlace } from "@/lib/ghostme/location/placeService";
import { getAuthenticatedUserId, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.latitude == null || body.longitude == null) {
      return NextResponse.json(
        { error: "Dati posizione mancanti" },
        { status: 400 }
      );
    }
    const userId = await getAuthenticatedUserId(req, body.userId);

    const place = await detectCurrentPlace({
      userId,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
    });

    return NextResponse.json({
      success: true,
      place: toPublicSignificantPlace(place),
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.log("CURRENT PLACE API ERROR:", err);
    return NextResponse.json(
      { error: "Errore rilevamento luogo" },
      { status: 500 }
    );
  }
}
