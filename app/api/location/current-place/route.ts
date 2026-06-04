import { NextResponse } from "next/server";
import { detectCurrentPlace } from "@/lib/ghostme/location/placeService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.userId || body.latitude == null || body.longitude == null) {
      return NextResponse.json(
        { error: "Dati posizione mancanti" },
        { status: 400 }
      );
    }

    const place = await detectCurrentPlace({
      userId: body.userId,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
    });

    return NextResponse.json({
      success: true,
      place,
    });
  } catch (err) {
    console.log("CURRENT PLACE API ERROR:", err);
    return NextResponse.json(
      { error: "Errore rilevamento luogo" },
      { status: 500 }
    );
  }
}