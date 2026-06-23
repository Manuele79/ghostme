import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildRecentPastEvidence,
  filterFutureCalendar,
  filterOpenActions,
  annotateHistoricalRows,
  filterActiveGoals,
} from "@/lib/ghostme/context/temporalPriority";

export async function loadDailyBriefingContext(userId: string) {
  const [
    calendarRes,
    goalsRes,
    actionsRes,
    mentalRes,
    timelineRes,
    topicsRes,
    episodesRes,
    summariesRes,
    completedCalendarRes,
    completedActionsRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("calendar_events")
      .select("id, title, type, description, start_at, remind_at, status, updated_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(
        `start_at.gte.${new Date().toISOString()},remind_at.gte.${new Date().toISOString()}`
      )
      .order("start_at", { ascending: true })
      .limit(8),

    supabaseAdmin
      .from("goals_desires")
      .select("title, description, category, importance, status, updated_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("importance", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("action_intents")
      .select("id, intent_type, title, description, priority, status, updated_at")
      .eq("user_id", userId)
      .in("status", ["detected", "active", "open", "pending"])
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

    supabaseAdmin
      .from("episodic_memories")
      .select("summary, related_topics, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("conversation_summaries")
      .select("title, summary, topics, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("calendar_events")
      .select("id, title, type, description, start_at, remind_at, status, updated_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("action_intents")
      .select("id, intent_type, title, description, status, completed_at, updated_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false, nullsFirst: false })
      .limit(10),
  ]);

  const pastEvidence = buildRecentPastEvidence({
    episodes: episodesRes.data || [],
    timeline: timelineRes.data || [],
    summaries: summariesRes.data || [],
    completedCalendar: completedCalendarRes.data || [],
    completedActions: completedActionsRes.data || [],
  });

  return {
    calendar: filterFutureCalendar(calendarRes.data || [], pastEvidence),
    goals: filterActiveGoals(goalsRes.data || []),
    actions: filterOpenActions(actionsRes.data || [], pastEvidence),
    mental: mentalRes.data || null,
    timeline: annotateHistoricalRows(pastEvidence),
    topics: topicsRes.data || [],
  };
}
