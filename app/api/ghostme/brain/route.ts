import { NextResponse } from "next/server";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";

function dedupeProactiveMessages(messages: any[]) {
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

function isVisibleProactiveMessage(message: any) {
  if (!["unread", "read"].includes(message.status)) return false;

  const dailyCategories = ["agenda", "daily_briefing", "reminder"];
  if (!dailyCategories.includes(message.category)) return true;

  const visibleAt = new Date(
    message.updated_at || message.scheduled_for || message.created_at || ""
  );
  if (Number.isNaN(visibleAt.getTime())) return true;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return visibleAt >= startOfToday;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = await getAuthenticatedUserId(req, body.userId);

    const snapshot = await buildGhostBrainSnapshot(userId);

    const { data: proactiveRows } = await supabaseAdmin
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

    const proactiveMessages = dedupeProactiveMessages(
      (proactiveRows || []).filter(isVisibleProactiveMessage)
    );

    return NextResponse.json({
      snapshot,
      profile: snapshot.profile || null,
      traits: null,
      memories: snapshot.memory.activeMemories || [],
      timeline: snapshot.memory.timeline || [],
      goals: snapshot.goals.activeGoals || [],
      mentalState: snapshot.profile?.mentalState || null,
      actions: snapshot.actions || [],
      calendarEvents: snapshot.calendar.upcoming || [],
      proactiveMessage: proactiveMessages[0] || null,
      proactiveMessages,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.log("BRAIN API ERROR:", err);
    return NextResponse.json({ error: "Errore brain API" }, { status: 500 });
  }
}
