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
import { generateButlerMessage } from "@/lib/ghostme/butler/butlerEngine";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

function normalize(value: any) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function compactText(row: any) {
  return normalize(
    [
      row?.title,
      row?.summary,
      row?.description,
      row?.content,
      row?.intent_type,
      Array.isArray(row?.topics) ? row.topics.join(" ") : "",
      Array.isArray(row?.related_topics) ? row.related_topics.join(" ") : "",
    ].filter(Boolean).join(" ")
  );
}

function timestampFor(row: any) {
  const value =
    row?.start_at ||
    row?.remind_at ||
    row?.event_date ||
    row?.updated_at ||
    row?.created_at ||
    row?.completed_at;
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function hoursSinceValue(value: any) {
  const time = new Date(value || 0).getTime();
  if (!Number.isFinite(time)) return null;
  return (Date.now() - time) / (60 * 60 * 1000);
}

function dayKey(value: any) {
  const date = new Date(value || Date.now());
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function titleFor(row: any) {
  return String(row?.title || row?.summary || row?.description || "").trim();
}

function detectOpenLoopKind(text: string) {
  const checks = [
    {
      kind: "grigliata",
      aliases: ["grigliata", "barbecue", "bbq"],
      question: "Com'e andata la grigliata?",
      placeQuestion:
        "Se era in quel posto nuovo, vuoi che lo salvi come luogo legato agli amici?",
      title: "Com'e andata la grigliata?",
      priority: 9,
    },
    {
      kind: "vespa",
      aliases: ["vespa", "giro in vespa"],
      question: "Com'e andato il giro in Vespa?",
      placeQuestion: "Quel posto nuovo era collegato al giro?",
      title: "Giro in Vespa",
      priority: 8,
    },
    {
      kind: "amici",
      aliases: ["amici", "poldo", "compagnia", "uscita"],
      question: "Com'e andata l'uscita con gli amici?",
      placeQuestion: "Il posto nuovo vale la pena salvarlo per le uscite con gli amici?",
      title: "Uscita con amici",
      priority: 8,
    },
    {
      kind: "home_assistant",
      aliases: ["home assistant", "collegamento", "automazione", "sensore"],
      question: "Hai completato il collegamento Home Assistant che volevi sistemare?",
      placeQuestion: "",
      title: "Home Assistant",
      priority: 7,
    },
    {
      kind: "cliente",
      aliases: ["cliente", "appuntamento", "incontro"],
      question: "Com'e andato l'incontro?",
      placeQuestion: "Quel posto nuovo era legato all'incontro?",
      title: "Incontro",
      priority: 7,
    },
    {
      kind: "ristorante",
      aliases: ["ristorante", "locale", "posto nuovo"],
      question: "Com'era il posto nuovo?",
      placeQuestion: "Vuoi salvarlo tra i luoghi importanti?",
      title: "Posto nuovo",
      priority: 8,
    },
  ];

  return checks.find((check) =>
    check.aliases.some((alias) => text.includes(alias))
  );
}

function collectOpenLoopSources(snapshot: GhostBrainSnapshot) {
  return [
    ...(snapshot.actions || []).map((row) => ({ row, source: "action" })),
    ...(snapshot.calendar.completed || []).map((row) => ({
      row,
      source: "calendar_completed",
    })),
    ...(snapshot.memory.timeline || []).map((row) => ({ row, source: "timeline" })),
    ...(snapshot.memory.episodicMemories || []).map((row) => ({
      row,
      source: "episodic_memory",
    })),
    ...(snapshot.memory.summaries || []).map((row) => ({
      row,
      source: "conversation_summary",
    })),
  ];
}

async function loadRecentLocationObservations(userId: string) {
  const since = new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("observation_events")
    .select("event_type, place_label, value, context, occurred_at")
    .eq("user_id", userId)
    .in("event_type", [
      "home_arrived",
      "home_left",
      "location_enter",
      "location_exit",
      "place_unknown_detected",
    ])
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: false })
    .limit(30);

  if (error) {
    console.log("CONTINUITY OBSERVATIONS ERROR:", error);
    return [];
  }

  return data || [];
}

function buildMomentAwareness(observations: any[], snapshot: GhostBrainSnapshot) {
  const currentPlace = normalize(snapshot.location.situation.currentPlace);
  const isAtHome = currentPlace === "casa" || currentPlace === "home";
  const recentHomeArrival = observations.find(
    (event) =>
      event.event_type === "home_arrived" &&
      (hoursSinceValue(event.occurred_at) ?? Infinity) <= 8
  );
  const unknownBeforeHome = observations.find((event) => {
    if (event.event_type !== "place_unknown_detected") return false;
    if (!recentHomeArrival?.occurred_at) return true;
    return (
      new Date(event.occurred_at || 0).getTime() <=
      new Date(recentHomeArrival.occurred_at || 0).getTime()
    );
  });

  return {
    isAtHome,
    recentHomeArrival: Boolean(recentHomeArrival),
    unknownBeforeHome: Boolean(unknownBeforeHome),
    homeSignals: snapshot.home.presence.signals || [],
  };
}

export async function buildContinuityCandidate(userId: string, snapshot: GhostBrainSnapshot) {
  const observations = await loadRecentLocationObservations(userId);
  const moment = buildMomentAwareness(observations, snapshot);
  if (!moment.isAtHome) {
    console.log("CONTINUITY SKIP: not_at_home", {
      userId,
      currentPlace: snapshot.location.situation.currentPlace,
    });
    return null;
  }

  const candidates = collectOpenLoopSources(snapshot)
    .map(({ row, source }) => {
      const text = compactText(row);
      const kind = detectOpenLoopKind(text);
      const ageHours = hoursSinceValue(timestampFor(row));
      return {
        row,
        source,
        text,
        kind,
        ageHours,
        title: titleFor(row),
      };
    })
    .filter(
      (item) =>
        item.kind &&
        item.ageHours !== null &&
        item.ageHours >= -12 &&
        item.ageHours <= 72
    )
    .sort((left, right) => {
      const leftMomentBoost = moment.recentHomeArrival ? 2 : 0;
      const rightMomentBoost = moment.recentHomeArrival ? 2 : 0;
      return (
        (right.kind?.priority || 0) + rightMomentBoost - 
        ((left.kind?.priority || 0) + leftMomentBoost)
      );
    });

  const openLoop = candidates[0];
  if (!openLoop?.kind) {
    console.log("CONTINUITY SKIP: no_recent_open_loop", {
      userId,
      observations: observations.length,
      recentHomeArrival: moment.recentHomeArrival,
      unknownBeforeHome: moment.unknownBeforeHome,
    });
    return null;
  }

  const messageParts = [openLoop.kind.question];
  if (moment.unknownBeforeHome && openLoop.kind.placeQuestion) {
    messageParts.push(openLoop.kind.placeQuestion);
  }

  const priority = Math.min(
    10,
    openLoop.kind.priority +
      (moment.recentHomeArrival ? 1 : 0) +
      (moment.unknownBeforeHome ? 1 : 0)
  );

  return {
    title: openLoop.kind.title,
    message: messageParts.join(" "),
    category: "observation",
    priority,
    source: "continuity",
    logicalKey: `continuity_${openLoop.kind.kind}_${dayKey(timestampFor(openLoop.row))}`,
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
  const currentSituationSummary =
    snapshot.currentSituation?.summary || "situazione attuale non integrata";

  const reasoningSummary = `
      Situazione attuale integrata: ${currentSituationSummary}
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
      Situazione attuale integrata:
      ${currentSituationSummary}
      Segnali casa:
      ${homeSignalSummary}
      `.trim();

  const contextSummary = `
      SITUAZIONE ATTUALE:
      Snapshot generato: ${snapshot.generatedAt}

      SITUAZIONE ATTUALE INTEGRATA:
      ${currentSituationSummary}

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
    currentSituationSummary,
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

export async function buildProactiveCandidatesForUser(
  user: any,
  prebuiltSnapshot?: GhostBrainSnapshot
) {
  const userId = user.user_id;
  const snapshot = prebuiltSnapshot || (await buildGhostBrainSnapshot(userId));
  const continuityCandidate = await buildContinuityCandidate(userId, snapshot);
  const situation = buildSituationFromSnapshot(snapshot) as any;
  const agendaMessage = buildAgendaMessage(situation);

  if (continuityCandidate) {
    return {
      proactiveCandidates: [continuityCandidate],
      agendaMessage,
    };
  }

  const observationInsight = await generateObservationInsight(userId);
  const patternInsight = await generatePatternInsight(userId);
  // Curiosity cards come exclusively from the structured snapshot writer.
  const curiosityMessage: string | null = null;

  await applyPatternDecay(userId);

  const behaviorRulesContext = await buildBehaviorPrompt(userId);
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
    continuityCandidate,

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
  };
}
