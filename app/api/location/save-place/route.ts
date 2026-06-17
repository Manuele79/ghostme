import { NextResponse } from "next/server";
import { saveLocationPlaceFlow } from "@/lib/ghostme/location/locationSavePlaceFlow";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await saveLocationPlaceFlow(body);

    if (result.status === 200) {
      return NextResponse.json(result.body);
    }

    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.log("SAVE PLACE API ERROR:", err);

    return NextResponse.json(
      { error: "Errore salvataggio luogo" },
      { status: 500 }
    );
  }
}
