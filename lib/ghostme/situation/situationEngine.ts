import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type GhostSituation = {
  nowIso: string;
  timeContext: string;
  dayContext: string;
  userLocation: string | null;
  calendarToday: any[];
  upcomingEvents: any[];
  activeGoals: any[];
  pendingActions: any[];
  dominantTopics: any[];
  mentalState: any | null;
  situationSummary: string;
};

function getTimeContext() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return "mattina";
  if (hour >= 11 && hour < 14) return "pranzo";
  if (hour >= 14 && hour < 18) return "pomeriggio";
  if (hour >= 18 && hour < 23) return "sera";
  return "notte";
}

function getDayContext() {
  const day = new Date().getDay();

  if (day === 0) return "domenica";
  if (day === 6) return "sabato";
  return "giorno lavorativo";
}

function startOfTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfTodayIso() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export async function buildGhostSituation(userId: string): Promise<GhostSituation> {
  const nowIso = new Date().toISOString();

  const [
    profileRes,
    calendarTodayRes,
    upcomingCalendarRes,
    goalsRes,
    actionsRes,
    topicsRes,
    mentalRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("full_name, job, location, hobbies, sports, relationship_status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabaseAdmin
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gte("start_at", startOfTodayIso())
      .lte("start_at", endOfTodayIso())
      .order("start_at", { ascending: true })
      .limit(10),

    supabaseAdmin
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gte("start_at", nowIso)
      .order("start_at", { ascending: true })
      .limit(10),

    supabaseAdmin
      .from("goals_desires")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("importance", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("action_intents")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["detected", "pending"])
      .order("priority", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("life_topics")
      .select("topic, category, entity_type, description, weight, mention_count, relationship_strength, status")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("weight", { ascending: false })
      .limit(15),

    supabaseAdmin
      .from("mental_states")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const profile = profileRes.data || null;
  const calendarToday = calendarTodayRes.data || [];
  const upcomingEvents = upcomingCalendarRes.data || [];
  const activeGoals = goalsRes.data || [];
  const pendingActions = actionsRes.data || [];
  const dominantTopics = topicsRes.data || [];
  const mentalState = mentalRes.data || null;

  const timeContext = getTimeContext();
  const dayContext = getDayContext();

  const situationSummary = `
DATA/ORA:
${nowIso}

MOMENTO:
${timeContext}, ${dayContext}

LOCALITÀ PROFILO:
${profile?.location || "non specificata"}

CALENDARIO OGGI:
${
  calendarToday.length
    ? calendarToday.map((e) => `- ${e.title} | ${e.start_at || e.remind_at || ""}`).join("\n")
    : "nessun evento oggi"
}

PROSSIMI EVENTI:
${
  upcomingEvents.length
    ? upcomingEvents.slice(0, 5).map((e) => `- ${e.title} | ${e.start_at || e.remind_at || ""}`).join("\n")
    : "nessun evento prossimo"
}

GOAL ATTIVI:
${
  activeGoals.length
    ? activeGoals.slice(0, 5).map((g) => `- ${g.title} | importanza ${g.importance} | ${g.category}`).join("\n")
    : "nessun goal attivo"
}

AZIONI APERTE:
${
  pendingActions.length
    ? pendingActions.slice(0, 5).map((a) => `- ${a.intent_type}: ${a.title} | priorità ${a.priority}`).join("\n")
    : "nessuna azione aperta"
}

TOPIC DOMINANTI:
${
  dominantTopics.length
    ? dominantTopics.slice(0, 8).map((t) => `- ${t.topic} | ${t.category} | peso ${t.weight}`).join("\n")
    : "nessun topic dominante"
}

STATO MENTALE:
${
  mentalState
    ? `stress ${mentalState.stress ?? 0}, entusiasmo ${mentalState.entusiasmo ?? 0}, stanchezza ${mentalState.stanchezza ?? 0}, focus ${mentalState.focus ?? 0}`
    : "nessuno stato mentale recente"
}
`.trim();

  return {
    nowIso,
    timeContext,
    dayContext,
    userLocation: profile?.location || null,
    calendarToday,
    upcomingEvents,
    activeGoals,
    pendingActions,
    dominantTopics,
    mentalState,
    situationSummary,
  };
}