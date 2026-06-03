import { NextResponse } from "next/server";
import { saveSignificantPlace } from "@/lib/ghostme/location/placeService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const saved = await saveSignificantPlace({
      userId: body.userId,
      label: body.label,
      category: body.category || "unknown",
      latitude: body.latitude,
      longitude: body.longitude,
      radiusMeters: body.radiusMeters || 30,
    });

    if (!saved) {
      return NextResponse.json(
        { error: "Luogo non salvato" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      place: saved,
    });
  } catch (err) {
    console.log("SAVE PLACE API ERROR:", err);

    return NextResponse.json(
      { error: "Errore salvataggio luogo" },
      { status: 500 }
    );
  }
}