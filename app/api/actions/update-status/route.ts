import { NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_STATUSES = ["completed", "archived", "pending"] as const;

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = body.id as string;
    const status = body.status as (typeof ALLOWED_STATUSES)[number];

    if (!id || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Dati non validi" },
        { status: 400 }
      );
    }

    const userId = await getAuthenticatedUserId(req, body.userId);
    const updatedAt = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("action_intents")
      .update({ status, updated_at: updatedAt })
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, status, updated_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Azione non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, action: data });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json(
      { success: false, error: "Errore API" },
      { status: 500 }
    );
  }
}
