import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.id || !body.userId) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const allowedStatuses = ["read", "dismissed", "answered"];

    const nextStatus = allowedStatuses.includes(body.status)
      ? body.status
      : body.dismissed
        ? "dismissed"
        : "read";

    const now = new Date().toISOString();

    const payload: any = {
      status: nextStatus,
      read_at: now,
      updated_at: now,
    };

    if (nextStatus === "answered") {
      payload.answered_at = now;
    }

    const { error } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .update(payload)
      .eq("id", body.id)
      .eq("user_id", body.userId);

    if (error) {
      console.log("MARK PROACTIVE READ ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (err) {
    console.log("MARK PROACTIVE READ API ERROR:", err);
    return NextResponse.json({ error: "Errore API" }, { status: 500 });
  }
}