import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.id || !body.userId) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({
        status: body.dismissed ? "dismissed" : "read",
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .eq("user_id", body.userId);

    if (error) {
      console.log("MARK PROACTIVE READ ERROR:", error);
      return NextResponse.json({ error: "Errore lettura" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.log("MARK PROACTIVE READ API ERROR:", err);
    return NextResponse.json({ error: "Errore API" }, { status: 500 });
  }
}