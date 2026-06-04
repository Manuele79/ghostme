import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    await supabaseAdmin
      .from("significant_places")
      .delete()
      .eq("id", body.id);

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