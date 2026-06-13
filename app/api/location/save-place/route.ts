import { NextResponse } from "next/server";
import { saveSignificantPlace } from "@/lib/ghostme/location/placeService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (
      !body.userId ||
      !body.label ||
      body.latitude == null ||
      body.longitude == null
    ) {
      return NextResponse.json(
        { error: "Dati luogo mancanti" },
        { status: 400 }
      );
    }

    const saved = await saveSignificantPlace({
      userId: body.userId,
      label: body.label,
      category: body.category || "unknown",
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      radiusMeters: body.radiusMeters || 100,
      externalName: body.externalName || body.external_name || null,
      externalCategory: body.externalCategory || body.external_category || null,
      address: body.address || null,
      confidence: body.confidence || 70,
      source: body.source || "manual",
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