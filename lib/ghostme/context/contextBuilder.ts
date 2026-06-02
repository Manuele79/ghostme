import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";

export type GhostCurrentContext = {
  timeContext: string;
  dayContext: string;
  userLocation: string | null;
  activeProjects: string[];
  activeGoals: string[];
  pendingActions: string[];
  upcomingCalendar: string[];
  calendarToday: string[];
  dominantTopics: string[];
  mentalState: string;
  situationSummary: string;
  contextSummary: string;
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

  const contextSummary = `
SITUAZIONE ATTUALE:
${situation.situationSummary}

INTERPRETAZIONE CONTESTUALE:
Momento: ${situation.timeContext}, ${situation.dayContext}
Località profilo: ${situation.userLocation || "non specificata"}
Progetti attivi: ${activeProjects.join(", ") || "nessuno"}
Obiettivi attivi: ${activeGoals.join(", ") || "nessuno"}
Azioni pendenti: ${pendingActions.join(", ") || "nessuna"}
Eventi oggi: ${calendarToday.join(", ") || "nessuno"}
Prossimi eventi: ${upcomingCalendar.join(", ") || "nessuno"}
Topic dominanti: ${dominantTopics.join(", ") || "nessuno"}
Stato mentale: ${mentalState}
`.trim();

  return {
    timeContext: situation.timeContext,
    dayContext: situation.dayContext,
    userLocation: situation.userLocation,
    activeProjects,
    activeGoals,
    pendingActions,
    upcomingCalendar,
    calendarToday,
    dominantTopics,
    mentalState,
    situationSummary: situation.situationSummary,
    contextSummary,
  };
}