import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type GhostCurrentContext = {
  timeContext: string;
  activeProjects: string[];
  activeGoals: string[];
  pendingActions: string[];
  upcomingCalendar: string[];
  dominantTopics: string[];
  mentalState: string;
  contextSummary: string;
};

function getTimeContext() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return "mattina";
  if (hour >= 11 && hour < 14) return "pranzo";
  if (hour >= 14 && hour < 18) return "pomeriggio";
  if (hour >= 18 && hour < 23) return "sera";
  return "notte";
}

export async function buildCurrentContext(userId: string): Promise<GhostCurrentContext> {
  const [
    topicsRes,
    goalsRes,
    actionsRes,
    calendarRes,
    mentalRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("life_topics")
      .select("topic, category, entity_type, weight, mention_count")
      .eq("user_id", userId)
      .order("weight", { ascending: false })
      .limit(12),

    supabaseAdmin
      .from("goals_desires")
      .select("title, category, importance, status")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("importance", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("action_intents")
      .select("title, intent_type, priority, status")
      .eq("user_id", userId)
      .in("status", ["detected", "pending"])
      .order("priority", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("calendar_events")
      .select("title, type, start_at, remind_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("start_at", { ascending: true })
      .limit(8),

    supabaseAdmin
      .from("mental_states")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const topics = topicsRes.data || [];
  const goals = goalsRes.data || [];
  const actions = actionsRes.data || [];
  const calendar = calendarRes.data || [];
  const mental = mentalRes.data;

  const activeProjects = topics
    .filter((t) => t.category === "project" || t.entity_type === "project")
    .map((t) => t.topic)
    .slice(0, 5);

  const dominantTopics = topics.map((t) => t.topic).slice(0, 8);

  const activeGoals = goals.map((g) => g.title).slice(0, 5);

  const pendingActions = actions
    .map((a) => `${a.intent_type}: ${a.title}`)
    .slice(0, 5);

  const upcomingCalendar = calendar
    .map((c) => `${c.type}: ${c.title} ${c.start_at || c.remind_at || ""}`)
    .slice(0, 5);

  const mentalState = mental
    ? `stress ${mental.stress ?? 0}, entusiasmo ${mental.entusiasmo ?? 0}, stanchezza ${mental.stanchezza ?? 0}, focus ${mental.focus ?? 0}`
    : "nessuno stato mentale recente";

  const timeContext = getTimeContext();

  const contextSummary = `
Momento: ${timeContext}
Progetti attivi: ${activeProjects.join(", ") || "nessuno"}
Obiettivi attivi: ${activeGoals.join(", ") || "nessuno"}
Azioni pendenti: ${pendingActions.join(", ") || "nessuna"}
Calendario prossimo: ${upcomingCalendar.join(", ") || "nessuno"}
Topic dominanti: ${dominantTopics.join(", ") || "nessuno"}
Stato mentale: ${mentalState}
`.trim();

  return {
    timeContext,
    activeProjects,
    activeGoals,
    pendingActions,
    upcomingCalendar,
    dominantTopics,
    mentalState,
    contextSummary,
  };
}