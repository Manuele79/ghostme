import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";

export type GhostCurrentContext = {
  timeContext: string;
  dayContext: string;
  userLocation: string | null;
  currentPlace: string | null;
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
};

export async function buildCurrentContext(
  userId: string
): Promise<GhostCurrentContext> {
  const situation = await buildGhostSituation(userId);

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

  const contextSummary = `
    SITUAZIONE ATTUALE:
    ${situation.situationSummary}

    INTERPRETAZIONE CONTESTUALE:
    Momento: ${situation.timeContext}, ${situation.dayContext}
    Località profilo: ${situation.userLocation || "non specificata"}
    Luogo attuale: ${situation.currentPlace || "sconosciuto"}
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
`.trim();

  return {
    timeContext: situation.timeContext,
    dayContext: situation.dayContext,
    userLocation: situation.userLocation,
    currentPlace: situation.currentPlace,
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
  };
}