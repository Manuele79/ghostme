import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: "userId mancante" }, { status: 400 });
    }

    const [
      profileRes,
      traitsRes,
      memoriesRes,
      timelineRes,
      goalsRes,
      mentalRes,
      actionsRes,
      calendarEventsRes,
    ] = await Promise.all([
      supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabaseAdmin
        .from("traits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabaseAdmin
        .from("memories_active")
        .select("*")
        .eq("user_id", userId)
        .order("pinned", { ascending: false })
        .order("importance", { ascending: false })
        .limit(40),

      supabaseAdmin
        .from("autobiographical_timeline")
        .select("*")
        .eq("user_id", userId)
        .order("event_date", { ascending: false })
        .limit(40),

      supabaseAdmin
        .from("goals_desires")
        .select("*")
        .eq("user_id", userId)
        .order("importance", { ascending: false })
        .limit(40),

      supabaseAdmin
        .from("mental_states")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabaseAdmin
        .from("action_intents")
        .select("*")
        .eq("user_id", userId)
        .order("priority", { ascending: false })
        .limit(40),

      supabaseAdmin
        .from("calendar_events")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("remind_at", { ascending: true })
        .limit(80),
    ]);

    return NextResponse.json({
      profile: profileRes.data || null,
      traits: traitsRes.data || null,
      memories: memoriesRes.data || [],
      timeline: timelineRes.data || [],
      goals: goalsRes.data || [],
      mentalState: mentalRes.data || null,
      actions: actionsRes.data || [],
      calendarEvents: calendarEventsRes.data || [],
    });
  } catch (err) {
    console.log("BRAIN API ERROR:", err);
    return NextResponse.json({ error: "Errore brain API" }, { status: 500 });
  }
}