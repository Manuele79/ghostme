import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function loadDailyBriefingContext(userId: string) {
  const [
    calendarRes,
    goalsRes,
    actionsRes,
    mentalRes,
    timelineRes,
    topicsRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("calendar_events")
      .select("title, type, description, start_at, remind_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(
        `start_at.gte.${new Date().toISOString()},remind_at.gte.${new Date().toISOString()}`
      )
      .order("start_at", { ascending: true })
      .limit(8),

    supabaseAdmin
      .from("goals_desires")
      .select("title, description, category, importance, updated_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("importance", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("action_intents")
      .select("intent_type, title, description, priority, updated_at")
      .eq("user_id", userId)
      .in("status", ["detected", "pending"])
      .order("priority", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("mental_states")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabaseAdmin
      .from("autobiographical_timeline")
      .select("title, summary, event_date, category")
      .eq("user_id", userId)
      .order("event_date", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("life_topics")
      .select(
        "topic, category, entity_type, weight, mention_count, last_mentioned_at, description"
      )
      .eq("user_id", userId)
      .order("weight", { ascending: false })
      .limit(8),
  ]);

  return {
    calendar: calendarRes.data || [],
    goals: goalsRes.data || [],
    actions: actionsRes.data || [],
    mental: mentalRes.data || null,
    timeline: timelineRes.data || [],
    topics: topicsRes.data || [],
  };
}
