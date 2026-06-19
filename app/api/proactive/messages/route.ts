import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function dedupeMessages(messages: any[]) {
  const seen = new Set<string>();
  const result: any[] = [];

  for (const message of messages || []) {
    const key = [
      message.category || "",
      message.title || "",
      message.message || "",
    ].join("|");

    if (seen.has(key)) continue;
    seen.add(key);
    result.push(message);
  }

  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.userId) {
      return NextResponse.json({ error: "userId mancante" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("*")
      .eq("user_id", body.userId)
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
      messages: dedupeMessages(data || []),
    });
  } catch (err) {
    console.log("GET PROACTIVE MESSAGES ERROR:", err);
    return NextResponse.json({ error: "Errore lettura osservazioni" }, { status: 500 });
  }
}
