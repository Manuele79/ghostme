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
      .select("*")
      .eq("user_id", body.userId)
      .maybeSingle();

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