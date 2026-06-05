import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentLocationState } from "@/lib/ghostme/location/placeService";

export type GhostSituation = {
  nowIso: string;
  timeContext: string;
  dayContext: string;
  userLocation: string | null;
  currentPlace: string | null;

  calendarToday: any[];
  upcomingEvents: any[];
  activeGoals: any[];
  pendingActions: any[];
  dominantTopics: any[];
  mentalState: any | null;

  recentEpisodes: any[];
  recentTimelineEvents: any[];
  recentSummaries: any[];
  dynamicProfile: any[];
  activeContradictions: any[];
  importantLinks: any[];

  externalSignals: {
    weatherContext: string | null;
    webContext: string | null;
    homeContext: string | null;
    deviceContext: string | null;
    locationContext: string | null;
  };

  situationSummary: string;
};

function getRomeNow() {
  return new Date();
}

function getTimeContext() {
  const hour = Number(
    new Intl.DateTimeFormat("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      hour12: false,
    }).format(getRomeNow())
  );

  if (hour >= 5 && hour < 11) return "mattina";
  if (hour >= 11 && hour < 14) return "pranzo";
  if (hour >= 14 && hour < 18) return "pomeriggio";
  if (hour >= 18 && hour < 23) return "sera";
  return "notte";
}

function getDayContext() {
  const day = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    weekday: "long",
  }).format(getRomeNow());

  if (day === "sabato") return "sabato";
  if (day === "domenica") return "domenica";
  return "giorno lavorativo";
}

function startOfTodayIsoRome() {
  const now = new Date();

  const romeDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return new Date(`${romeDate}T00:00:00+02:00`).toISOString();
}

function endOfTodayIsoRome() {
  const now = new Date();

  const romeDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return new Date(`${romeDate}T23:59:59+02:00`).toISOString();
}

function formatList(items: any[], mapper: (item: any) => string, empty: string, limit = 5) {
  return items.length ? items.slice(0, limit).map(mapper).join("\n") : empty;
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
    episodesRes,
    timelineRes,
    summariesRes,
    dynamicProfileRes,
    contradictionsRes,
    linksRes,
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
      .gte("start_at", startOfTodayIsoRome())
      .lte("start_at", endOfTodayIsoRome())
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
      .select("topic, category, entity_type, description, weight, mention_count, relationship_strength, status, last_mentioned_at")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("weight", { ascending: false })
      .limit(20),

    supabaseAdmin
      .from("mental_states")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabaseAdmin
      .from("episodic_memories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("autobiographical_timeline")
      .select("*")
      .eq("user_id", userId)
      .order("event_date", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("conversation_summaries")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("dynamic_self_profile")
      .select("*")
      .eq("user_id", userId)
      .order("confidence", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("contradictions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "unresolved")
      .order("confidence", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("topic_links")
      .select("*")
      .eq("user_id", userId)
      .order("weight", { ascending: false })
      .limit(12),
  ]);

  const profile = profileRes.data || null;
  const currentLocationState = await getCurrentLocationState(userId);
  const currentPlace = currentLocationState?.current_place_label || null;
  const calendarToday = calendarTodayRes.data || [];
  const upcomingEvents = upcomingCalendarRes.data || [];
  const activeGoals = goalsRes.data || [];
  const pendingActions = actionsRes.data || [];
  const dominantTopics = topicsRes.data || [];
  const mentalState = mentalRes.data || null;

  const recentEpisodes = episodesRes.data || [];
  const recentTimelineEvents = timelineRes.data || [];
  const recentSummaries = summariesRes.data || [];
  const dynamicProfile = dynamicProfileRes.data || [];
  const activeContradictions = contradictionsRes.data || [];
  const importantLinks = linksRes.data || [];

  const timeContext = getTimeContext();
  const dayContext = getDayContext();

  const externalSignals = {
    weatherContext: null,
    webContext: null,
    homeContext: null,
    deviceContext: null,
    locationContext: profile?.location || null,
  };

  const situationSummary = `
DATA/ORA:
${nowIso}

MOMENTO:
${timeContext}, ${dayContext}

LOCALITÀ PROFILO:
${profile?.location || "non specificata"}

LUOGO ATTUALE:
${currentPlace || "sconosciuto"}

CALENDARIO OGGI:
${formatList(
  calendarToday,
  (e) => `- ${e.title} | ${e.start_at || e.remind_at || ""}`,
  "nessun evento oggi"
)}

PROSSIMI EVENTI:
${formatList(
  upcomingEvents,
  (e) => `- ${e.title} | ${e.start_at || e.remind_at || ""}`,
  "nessun evento prossimo"
)}

GOAL ATTIVI:
${formatList(
  activeGoals,
  (g) => `- ${g.title} | importanza ${g.importance} | ${g.category}`,
  "nessun goal attivo"
)}

AZIONI APERTE:
${formatList(
  pendingActions,
  (a) => `- ${a.intent_type}: ${a.title} | priorità ${a.priority}`,
  "nessuna azione aperta"
)}

TOPIC DOMINANTI:
${formatList(
  dominantTopics,
  (t) => `- ${t.topic} | ${t.category} | peso ${t.weight} | menzioni ${t.mention_count}`,
  "nessun topic dominante",
  8
)}

STATO MENTALE:
${
  mentalState
    ? `stress ${mentalState.stress ?? 0}, entusiasmo ${mentalState.entusiasmo ?? 0}, stanchezza ${mentalState.stanchezza ?? 0}, focus ${mentalState.focus ?? 0}`
    : "nessuno stato mentale recente"
}

PROFILO DINAMICO:
${formatList(
  dynamicProfile,
  (p) => `- ${p.trait} | confidenza ${p.confidence} | ${p.description || ""}`,
  "nessun profilo dinamico recente",
  5
)}

EPISODI RECENTI:
${formatList(
  recentEpisodes,
  (e) => `- ${e.title || e.summary || "episodio"} | ${e.emotional_tone || ""}`,
  "nessun episodio recente",
  5
)}

TIMELINE RECENTE:
${formatList(
  recentTimelineEvents,
  (e) => `- ${e.title || e.summary || "evento"} | ${e.event_date || ""}`,
  "nessun evento timeline recente",
  5
)}

RIASSUNTI RECENTI:
${formatList(
  recentSummaries,
  (s) => `- ${s.title || "riassunto"} | ${s.summary || ""}`,
  "nessun riassunto recente",
  3
)}

CONTRADDIZIONI ATTIVE:
${formatList(
  activeContradictions,
  (c) => `- ${c.tema || c.topic || "tema"} | ${c.descrizione || c.old_statement || ""}`,
  "nessuna contraddizione attiva",
  3
)}

COLLEGAMENTI IMPORTANTI:
${formatList(
  importantLinks,
  (l) => `- ${l.source_topic} ↔ ${l.target_topic} | ${l.link_type} | peso ${l.weight}`,
  "nessun collegamento importante",
  6
)}

SEGNALI ESTERNI PREDISPOSTI:
meteo: ${externalSignals.weatherContext || "non collegato qui"}
web: ${externalSignals.webContext || "non collegato qui"}
home: ${externalSignals.homeContext || "non collegato"}
device: ${externalSignals.deviceContext || "non collegato"}
`.trim();

  return {
    nowIso,
    timeContext,
    dayContext,
    userLocation: profile?.location || null,
    currentPlace,

    calendarToday,
    upcomingEvents,
    activeGoals,
    pendingActions,
    dominantTopics,
    mentalState,

    recentEpisodes,
    recentTimelineEvents,
    recentSummaries,
    dynamicProfile,
    activeContradictions,
    importantLinks,

    externalSignals,
    situationSummary,
  };
}