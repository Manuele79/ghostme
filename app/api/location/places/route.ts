import { NextResponse } from "next/server";
import { getSignificantPlaces } from "@/lib/ghostme/location/placeService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.userId) {
      return NextResponse.json({ error: "userId mancante" }, { status: 400 });
    }

    const places = await getSignificantPlaces(body.userId);

    return NextResponse.json({
      success: true,
      places,
    });
  } catch (err) {
    console.log("GET PLACES API ERROR:", err);
    return NextResponse.json({ error: "Errore lettura luoghi" }, { status: 500 });
  }
}