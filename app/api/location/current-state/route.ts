import { NextResponse } from "next/server";
import { getLocationCurrentStateFlow } from "@/lib/ghostme/location/locationCurrentStateFlow";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.userId) {
      return NextResponse.json({ error: "userId mancante" }, { status: 400 });
    }

    const { data, error } = await getLocationCurrentStateFlow(body.userId);

    if (error) {
      console.log("GET CURRENT STATE ERROR:", error);
      return NextResponse.json({ error: "Errore lettura luogo attuale" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      location: data,
    });
  } catch (err) {
    console.log("CURRENT STATE API ERROR:", err);
    return NextResponse.json({ error: "Errore stato luogo" }, { status: 500 });
  }
}
