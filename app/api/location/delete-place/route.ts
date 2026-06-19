import { NextResponse } from "next/server";
import { deleteLocationPlaceFlow } from "@/lib/ghostme/location/locationDeletePlaceFlow";
import { getAuthenticatedUserId, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Dati luogo mancanti" }, { status: 400 });
    const userId = await getAuthenticatedUserId(req, body.userId);

    await deleteLocationPlaceFlow(body.id, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.log("DELETE PLACE ERROR:", err);

    return NextResponse.json(
      { error: "Errore eliminazione luogo" },
      { status: 500 }
    );
  }
}
