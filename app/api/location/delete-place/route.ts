import { NextResponse } from "next/server";
import { deleteLocationPlaceFlow } from "@/lib/ghostme/location/locationDeletePlaceFlow";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    await deleteLocationPlaceFlow(body.id);

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.log("DELETE PLACE ERROR:", err);

    return NextResponse.json(
      { error: "Errore eliminazione luogo" },
      { status: 500 }
    );
  }
}
