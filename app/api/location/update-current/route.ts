import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.userId) {
      return NextResponse.json({ error: "userId mancante" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("user_location_state")
      .upsert(
        {
          user_id: body.userId,
          current_place_id: body.placeId || null,
          current_place_label: body.placeLabel || null,
          latitude: body.latitude ?? null,
          longitude: body.longitude ?? null,
          source: body.source || "browser",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      console.log("UPDATE CURRENT LOCATION ERROR:", error);
      return NextResponse.json({ error: "Luogo attuale non salvato" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      location: data,
    });
  } catch (err) {
    console.log("UPDATE CURRENT LOCATION API ERROR:", err);
    return NextResponse.json({ error: "Errore posizione attuale" }, { status: 500 });
  }
}