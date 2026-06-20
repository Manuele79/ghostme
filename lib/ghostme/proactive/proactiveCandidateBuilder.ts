import {
  buildGhostBrainSnapshot,
  type GhostBrainSnapshot,
} from "@/lib/ghostme/context/reasoningService";
import {
  type GhostCurrentContext,
} from "@/lib/ghostme/context/contextBuilder";
import { buildBehaviorPrompt } from "@/lib/ghostme/behavior/behaviorRulesEngine";
import { buildAgendaMessage } from "@/lib/ghostme/agenda/agendaEngine";
import { decideProactiveMessage } from "@/lib/ghostme/proactive/proactiveDecisionEngine";
import { generateObservationInsight } from "@/lib/ghostme/observation/observationInsightEngine";
import { generatePatternInsight } from "@/lib/ghostme/patterns/patternInsightEngine";
import { applyPatternDecay } from "@/lib/ghostme/patterns/patternDecay";
import { generateCuriosityMessage } from "@/lib/ghostme/curiosity/curiosityEngine";
import { generateButlerMessage } from "@/lib/ghostme/butler/butlerEngine";

function formatMentalState(mentalState: any) {
  return mentalState
    ? `stress ${mentalState.stress ?? 0}, entusiasmo ${
        mentalState.entusiasmo ?? 0
      }, stanchezza ${mentalState.stanchezza ?? 0}, focus ${
        mentalState.focus ?? 0
      }`
    : "nessuno stato mentale recente";
}

function mapTitles(items: any[], fallback: string, limit: number) {
  return (items || [])
    .map((item) => item.title || item.summary || item.description || fallback)
    .slice(0, limit);
}

function buildHomeSignals(snapshot: GhostBrainSnapshot) {
  return snapshot.home.presence.signals || [];
}

function buildSignalSummary(snapshot: GhostBrainSnapshot) {
  return snapshot.signals.context.length
    ? snapshot.signals.context
        .map(
          (signal) =>
            `- ${signal.key} | ${signal.category} | priorita ${signal.priority} | ${signal.reason}`
        )
        .join("\n")
    : "nessun segnale operativo forte";
}

function buildSituationFromSnapshot(snapshot: GhostBrainSnapshot) {
  return {
    calendarToday: snapshot.calendar.today || [],
    upcomingEvents: snapshot.calendar.upcoming || [],
  };
}

function buildCurrentContextFromSnapshot({
  snapshot,
  behaviorRulesContext,
}: {
  snapshot: GhostBrainSnapshot;
  behaviorRulesContext: string;
}): GhostCurrentContext {
  const activeProjects = (snapshot.memory.topics || [])
    .filter((topic) => topic.category === "project" || topic.entity_type === "project")
    .map((topic) => topic.topic)
    .slice(0, 5);
  const activeGoals = mapTitles(snapshot.goals.activeGoals, "goal", 5);
  const pendingActions = (snapshot.actions || [])
    .map((action) => `${action.intent_type}: ${action.title}`)
    .slice(0, 5);
  const upcomingCalendar = (snapshot.calendar.upcoming || [])
    .map((event) => `${event.type}: ${event.title} ${event.start_at || event.remind_at || ""}`)
    .slice(0, 5);
  const calendarToday = (snapshot.calendar.today || [])
    .map((event) => `${event.type}: ${event.title} ${event.start_at || event.remind_at || ""}`)
    .slice(0, 5);
  const dominantTopics = (snapshot.memory.topics || [])
    .map((topic) => topic.topic)
    .slice(0, 8);
  const mentalState = formatMentalState(snapshot.profile?.mentalState);
  const recentEpisodes = mapTitles(snapshot.memory.episodicMemories, "episodio", 5);
  const recentTimelineEvents = mapTitles(snapshot.memory.timeline, "evento timeline", 5);
  const recentSummaries = mapTitles(snapshot.memory.summaries, "riassunto", 5);
  const dynamicProfile = (snapshot.profile?.dynamicProfile || [])
    .map((item: any) => `${item.trait}: ${item.description || ""}`)
    .slice(0, 5);
  const importantLinks: string[] = [];
  const recentProactiveMessages = (snapshot.proactive.recent || [])
    .map(
      (message) =>
        `[${message.category || "general"}] ${message.title || "Messaggio"}: ${message.message}`
    )
    .slice(0, 10);
  const homeSignals = buildHomeSignals(snapshot);
  const signalSummary = buildSignalSummary(snapshot);
  const homeSignalSummary = homeSignals.length
    ? homeSignals.map((signal) => `- ${signal}`).join("\n")
    : "nessun segnale casa forte";

  const reasoningSummary = `
      Luogo attuale: ${snapshot.location.situation.currentPlace || "luogo sconosciuto"}.
      Categoria luogo: ${snapshot.location.situation.category || "non classificata"}.
      Indirizzo luogo: ${snapshot.location.situation.address || "non disponibile"}.
      Confidenza luogo: ${snapshot.location.situation.confidence ?? "non disponibile"}.
      Ultimo cambio luogo: ${snapshot.location.situation.lastChangedAt || "non disponibile"}.
      Progetti attivi principali: ${activeProjects.join(", ") || "nessuno"}.
      Topic dominanti: ${dominantTopics.join(", ") || "nessuno"}.
      Obiettivi attivi: ${activeGoals.join(", ") || "nessuno"}.
      Azioni aperte: ${pendingActions.join(", ") || "nessuna"}.
      Eventi oggi: ${calendarToday.join(", ") || "nessuno"}.
      Stato mentale: ${mentalState}.
      Memorie recenti utili: ${recentEpisodes.join(", ") || "nessuna"}.
      Collegamenti importanti: ${importantLinks.join(", ") || "nessuno"}.
      Messaggi proattivi recenti: ${recentProactiveMessages.join(" | ") || "nessuno"}.
      Segnali operativi attivi:
      ${signalSummary}
      Contesto casa:
      ${snapshot.home.context || "Home Assistant non disponibile"}
      Segnali casa:
      ${homeSignalSummary}
      `.trim();

  const contextSummary = `
      SITUAZIONE ATTUALE:
      Snapshot generato: ${snapshot.generatedAt}

      INTERPRETAZIONE CONTESTUALE:
      Localita profilo: ${snapshot.profile?.location || "non specificata"}
      Luogo attuale: ${snapshot.location.situation.currentPlace || "sconosciuto"}
      Categoria luogo: ${snapshot.location.situation.category || "non classificata"}
      Indirizzo luogo: ${snapshot.location.situation.address || "non disponibile"}
      Confidenza luogo: ${snapshot.location.situation.confidence ?? "non disponibile"}
      Ultimo cambio luogo: ${snapshot.location.situation.lastChangedAt || "non disponibile"}
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
      Collegamenti importanti: ${importantLinks.join(", ") || "nessuno"}
      SEGNALI OPERATIVI ATTIVI:
      ${signalSummary}
      Regole comportamentali attive:
      ${behaviorRulesContext || "nessuna regola comportamentale attiva"}
      Sintesi ragionata: ${reasoningSummary}
      Messaggi proattivi recenti:
      ${recentProactiveMessages.join("\n") || "nessuno"}
      HOME ASSISTANT:
      ${snapshot.home.context || "Home Assistant non disponibile"}
      SEGNALI CASA:
      ${homeSignalSummary}
  `.trim();

  return {
    timeContext: "",
    dayContext: "",
    userLocation: snapshot.profile?.location || null,
    currentPlace: snapshot.location.situation.currentPlace,
    currentPlaceCategory: snapshot.location.situation.category,
    currentPlaceAddress: snapshot.location.situation.address,
    locationConfidence: snapshot.location.situation.confidence,
    lastLocationChange: snapshot.location.situation.lastChangedAt,
    activeProjects,
    activeGoals,
    pendingActions,
    upcomingCalendar,
    calendarToday,
    dominantTopics,
    mentalState,
    situationSummary: contextSummary,
    contextSummary,
    recentEpisodes,
    recentTimelineEvents,
    recentSummaries,
    dynamicProfile,
    activeContradictions: [],
    importantLinks,
    behaviorPatterns: [],
    behaviorRules: [],
    recentObservations: [],
    contextSignals: snapshot.signals.context,
    behaviorRulesContext,
    reasoningSummary,
    recentProactiveMessages,
    homeContext: snapshot.home.context || "",
    homeSignals,
  };
}

export async function buildProactiveCandidatesForUser(user: any) {
  const userId = user.user_id;

  const observationInsight = await generateObservationInsight(userId);
  const patternInsight = await generatePatternInsight(userId);
  const curiosityMessage = await generateCuriosityMessage(userId);

  await applyPatternDecay(userId);

  const snapshot = await buildGhostBrainSnapshot(userId);
  const behaviorRulesContext = await buildBehaviorPrompt(userId);
  const situation = buildSituationFromSnapshot(snapshot) as any;
  const agendaMessage = buildAgendaMessage(situation);
  const currentContext = buildCurrentContextFromSnapshot({
    snapshot,
    behaviorRulesContext,
  });
  const butlerMessage = await generateButlerMessage({
    userName: user.full_name,
    currentContext,
  });

  const proactiveDecision = await decideProactiveMessage({
    userName: user.full_name,
    currentContext,
  });

  const proactiveCandidates = [
    proactiveDecision.shouldSpeak && proactiveDecision.message
      ? {
          title: proactiveDecision.title || "Osservazione GhostMe",
          message: proactiveDecision.message,
          category: proactiveDecision.category || "observation",
          priority: proactiveDecision.priority || 2,
          source: "decision",
        }
      : null,

    observationInsight
      ? {
          title: "Osservazione GhostMe",
          message: observationInsight,
          category: "observation",
          priority: 3,
          source: "observation",
        }
      : null,

    patternInsight
      ? {
          title: "Pattern GhostMe",
          message: patternInsight,
          category: "observation",
          priority: 3,
          source: "pattern",
        }
      : null,

    curiosityMessage
      ? {
          title: "CuriositÃƒÂ  GhostMe",
          message: curiosityMessage,
          category: "curiosity",
          priority: 2,
          source: "curiosity",
        }
      : null,

    butlerMessage
    ? {
        title: "Osservazione GhostMe",
        message: butlerMessage,
        category: "observation",
        priority: 2,
        source: "butler",
      }
    : null,


  ].filter(Boolean) as any[];

  return {
    proactiveCandidates,
    agendaMessage,
    trueProactiveSelected: snapshot.trueProactive.selected,
  };
}
