
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";
import { buildBehaviorPrompt } from "@/lib/ghostme/behavior/behaviorRulesEngine";
import { buildHomeReasoning } from "@/lib/ghostme/homeAssistant/homeReasoningBuilder";
import { buildContextSignals, ContextSignal } from "@/lib/ghostme/context/contextSignals";

export type GhostCurrentContext = {
  timeContext: string;
  dayContext: string;
  userLocation: string | null;
  currentPlace: string | null;
  currentPlaceCategory: string | null;
  currentPlaceAddress: string | null;
  locationConfidence: number | null;
  lastLocationChange: string | null;
  activeProjects: string[];
  activeGoals: string[];
  pendingActions: string[];
  upcomingCalendar: string[];
  calendarToday: string[];
  dominantTopics: string[];
  mentalState: string;
  situationSummary: string;
  contextSummary: string;
  recentEpisodes: string[];
  recentTimelineEvents: string[];
  recentSummaries: string[];
  dynamicProfile: string[];
  activeContradictions: string[];
  importantLinks: string[];
  behaviorPatterns: string[];
  behaviorRules: string[];
  recentObservations: string[];
  behaviorRulesContext: string;
  reasoningSummary: string;
  recentProactiveMessages: string[];
  contextSignals: ContextSignal[];
  homeContext: string;
  homeSignals: string[];
};

export async function buildCurrentContext(
  userId: string
): Promise<GhostCurrentContext> {
  const situation = await buildGhostSituation(userId);
  const contextSignals = buildContextSignals(situation);
  const homeContext = await buildHomeReasoning();
  const homeSignals = homeContext
  .split("\n")
  .map((line) => line.trim().replace("- ", ""))
  .filter((line) =>
    [
      "house_empty",
      "one_person_home",
      "two_people_home",
      "media_active",
      "lights_active",
      "night_mode",
      "day_mode",
      "relax_mode_possible",
      "home_activity_possible",
    ].some((signal) => line === signal || line.startsWith("active_rooms:"))
  );

  const behaviorRulesContext = await buildBehaviorPrompt(userId);

  const { data: recentProactiveRows } = await supabaseAdmin
  .from("ghost_proactive_messages")
  .select("category, title, message, created_at")
  .eq("user_id", userId)
  .in("status", ["unread", "read"])
  .order("created_at", { ascending: false })
  .limit(10);

  const recentProactiveMessages =
    recentProactiveRows?.map(
      (m) =>
        `[${m.category || "general"}] ${m.title || "Messaggio"}: ${m.message}`
    ) || [];

   const signalSummary = contextSignals.length
  ? contextSignals
      .map(
        (s) =>
          `- ${s.key} | ${s.category} | priorità ${s.priority} | ${s.reason}`
      )
      .join("\n")
  : "nessun segnale operativo forte"; 

  const homeSignalSummary = homeSignals.length
  ? homeSignals.map((s) => `- ${s}`).join("\n")
  : "nessun segnale casa forte";

  const activeProjects = situation.dominantTopics
    .filter((t) => t.category === "project" || t.entity_type === "project")
    .map((t) => t.topic)
    .slice(0, 5);

  const activeGoals = situation.activeGoals
    .map((g) => g.title)
    .slice(0, 5);

  const pendingActions = situation.pendingActions
    .map((a) => `${a.intent_type}: ${a.title}`)
    .slice(0, 5);

  const upcomingCalendar = situation.upcomingEvents
    .map((e) => `${e.type}: ${e.title} ${e.start_at || e.remind_at || ""}`)
    .slice(0, 5);

  const calendarToday = situation.calendarToday
    .map((e) => `${e.type}: ${e.title} ${e.start_at || e.remind_at || ""}`)
    .slice(0, 5);

  const dominantTopics = situation.dominantTopics
    .map((t) => t.topic)
    .slice(0, 8);

  const mentalState = situation.mentalState
    ? `stress ${situation.mentalState.stress ?? 0}, entusiasmo ${
        situation.mentalState.entusiasmo ?? 0
      }, stanchezza ${situation.mentalState.stanchezza ?? 0}, focus ${
        situation.mentalState.focus ?? 0
      }`
    : "nessuno stato mentale recente";

    const recentEpisodes = situation.recentEpisodes
      .map((e) => e.title || e.summary || e.description || "episodio")
      .slice(0, 5);

    const recentTimelineEvents = situation.recentTimelineEvents
      .map((e) => e.title || e.summary || "evento timeline")
      .slice(0, 5);

    const recentSummaries = situation.recentSummaries
      .map((s) => s.title || s.summary || "riassunto")
      .slice(0, 5);

    const dynamicProfile = situation.dynamicProfile
      .map((p) => `${p.trait}: ${p.description || ""}`)
      .slice(0, 5);

    const activeContradictions = situation.activeContradictions
      .map((c) => c.tema || c.topic || c.descrizione || "contraddizione")
      .slice(0, 5);

    const importantLinks = situation.importantLinks
      .map((l) => `${l.source_topic} ↔ ${l.target_topic}`)
      .slice(0, 8);

    const behaviorRules = situation.behaviorRules
      .map((r) => `[${r.target_area || "general"}] ${r.rule_text}`)
      .slice(0, 10);


    const behaviorPatterns = situation.behaviorPatterns
      .map(
        (p) =>
          `${p.title || p.pattern_type} | stato ${p.status} | confidenza ${p.confidence} | occorrenze ${p.occurrences}`
      )
      .slice(0, 6);

    const recentObservations = situation.recentObservations
      .map(
        (o) =>
          `${o.event_type} | luogo ${o.place_label || "sconosciuto"} | ${o.occurred_at}`
      )
      .slice(0, 8);

    const reasoningSummary = `
      Luogo attuale: ${situation.currentPlace || "luogo sconosciuto"}.
      Categoria luogo: ${situation.currentPlaceCategory || "non classificata"}.
      Indirizzo luogo: ${situation.currentPlaceAddress || "non disponibile"}.
      Confidenza luogo: ${situation.locationConfidence ?? "non disponibile"}.
      Ultimo cambio luogo: ${situation.lastLocationChange || "non disponibile"}.
      Momento: ${situation.timeContext}, ${situation.dayContext}.
      Progetti attivi principali: ${activeProjects.join(", ") || "nessuno"}.
      Topic dominanti: ${dominantTopics.join(", ") || "nessuno"}.
      Obiettivi attivi: ${activeGoals.join(", ") || "nessuno"}.
      Azioni aperte: ${pendingActions.join(", ") || "nessuna"}.
      Eventi oggi: ${calendarToday.join(", ") || "nessuno"}.
      Stato mentale: ${mentalState}.
      Memorie recenti utili: ${recentEpisodes.join(", ") || "nessuna"}.
      Collegamenti importanti: ${importantLinks.join(", ") || "nessuno"}.
      Pattern comportamentali: ${behaviorPatterns.join(", ") || "nessuno"}.
      Regole comportamentali: ${behaviorRules.join(", ") || "nessuna"}.
      Osservazioni recenti: ${recentObservations.join(", ") || "nessuna"}.
      Messaggi proattivi recenti: ${recentProactiveMessages.join(" | ") || "nessuno"}.
      Segnali operativi attivi:
      ${signalSummary}
      Contesto casa:
      ${homeContext}
      Segnali casa:
      ${homeSignalSummary}
      `.trim();  

    const contextSummary = `
      SITUAZIONE ATTUALE:
      ${situation.situationSummary}

      INTERPRETAZIONE CONTESTUALE:
      Momento: ${situation.timeContext}, ${situation.dayContext}
      Località profilo: ${situation.userLocation || "non specificata"}
      Luogo attuale: ${situation.currentPlace || "sconosciuto"}
      Categoria luogo: ${situation.currentPlaceCategory || "non classificata"}
      Indirizzo luogo: ${situation.currentPlaceAddress || "non disponibile"}
      Confidenza luogo: ${situation.locationConfidence ?? "non disponibile"}
      Ultimo cambio luogo: ${situation.lastLocationChange || "non disponibile"}
      Progetti attivi: ${activeProjects.join(", ") || "nessuno"}
      Obiettivi attivi: ${activeGoals.join(", ") || "nessuno"}
      Azioni pendenti: ${pendingActions.join(", ") || "nessuna"}
      Eventi oggi: ${calendarToday.join(", ") || "nessuno"}
      Prossimi eventi: ${upcomingCalendar.join(", ") || "nessuno"}
      Topic dominanti: ${dominantTopics.join(", ") || "nessuno"}
      Stato mentale: ${mentalState}
      Episodi recenti: ${recentEpisodes.join(", ") || "nessuno"}
      Timeline recente: ${recentTimelineEvents.join(", ") || "nessuna"}
      Riassunti recenti: ${recentSummaries.join(", ") || "nessuno"}
      Profilo dinamico: ${dynamicProfile.join(", ") || "nessuno"}
      Contraddizioni attive: ${activeContradictions.join(", ") || "nessuna"}
      Collegamenti importanti: ${importantLinks.join(", ") || "nessuno"}
      Pattern comportamentali: ${behaviorPatterns.join(", ") || "nessuno"}
      Regole comportamentali: ${behaviorRules.join(", ") || "nessuna"}
      Osservazioni recenti: ${recentObservations.join(", ") || "nessuna"}
      SEGNALI OPERATIVI ATTIVI:
      ${signalSummary}
      Regole comportamentali attive:
      ${behaviorRulesContext || "nessuna regola comportamentale attiva"}
      Sintesi ragionata: ${reasoningSummary}
      Messaggi proattivi recenti:
      ${recentProactiveMessages.join("\n") || "nessuno"}
      HOME ASSISTANT:
      ${homeContext}
      SEGNALI CASA:
      ${homeSignalSummary}
  `.trim();

  return {
    timeContext: situation.timeContext,
    dayContext: situation.dayContext,
    userLocation: situation.userLocation,
    currentPlace: situation.currentPlace,
    currentPlaceCategory: situation.currentPlaceCategory,
    currentPlaceAddress: situation.currentPlaceAddress,
    locationConfidence: situation.locationConfidence,
    lastLocationChange: situation.lastLocationChange,
    activeProjects,
    activeGoals,
    pendingActions,
    upcomingCalendar,
    calendarToday,
    dominantTopics,
    mentalState,
    situationSummary: situation.situationSummary,
    contextSummary,
    recentEpisodes,
    recentTimelineEvents,
    recentSummaries,
    dynamicProfile,
    activeContradictions,
    importantLinks,
    behaviorRules,
    behaviorPatterns,
    recentObservations,
    contextSignals,
    behaviorRulesContext,
    reasoningSummary,
    recentProactiveMessages,
    homeContext,
    homeSignals,
  };
}