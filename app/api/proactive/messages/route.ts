import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";
import { dedupeProactiveMessages } from "@/lib/ghostme/proactive/proactiveMessageDedupe";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = await getAuthenticatedUserId(req, body.userId);

    const { data, error } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["unread", "read"])
      .in("category", [
        "agenda",
        "reminder",
        "daily_briefing",
        "observation",
        "curiosity",
        "home_question",
      ])
      .order("priority", { ascending: false })
      .order("scheduled_for", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messages: dedupeProactiveMessages(data || []),
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.log("GET PROACTIVE MESSAGES ERROR:", err);
    return NextResponse.json({ error: "Errore lettura osservazioni" }, { status: 500 });
  }
}
