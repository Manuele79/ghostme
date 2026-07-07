import type { GhostBrainSnapshotCore } from "@/lib/ghostme/context/reasoningService";
import type { DecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";

export type SituationPolicyAction =
  | "say_nothing"
  | "ask_followup"
  | "create_card"
  | "remind"
  | "suggest_action"
  | "wait";

export type SituationValueAssessment = {
  score: number;
  level: "none" | "low" | "medium" | "high";
  shouldIntervene: boolean;
  utility: number;
  urgency: number;
  contextFit: number;
  signalQuality: "low" | "medium" | "high";
  disturbanceRisk: "low" | "medium" | "high";
  repeatRisk: "low" | "medium" | "high";
  reasons: string[];
  penalties: string[];
};

export type SituationMomentAssessment = {
  level: "ordinary" | "interesting" | "important" | "exceptional";
  score: number;
  confidence: number;
  reasons: string[];
  signals: string[];
};

export type UnifiedSituationModel = {
  currentPlace: string | null;
  placeCategory: string | null;
  placeAddress: string | null;
  currentRoom: string | null;
  peoplePresent: string[];
  recentLocationEvents: Array<{
    eventType: string;
    placeLabel: string | null;
    occurredAt: string | null;
    context?: any;
  }>;
  recentHomeEvents: Array<{
    eventType: string;
    entityName: string | null;
    roomKey: string | null;
    occurredAt: string | null;
    priority: number;
  }>;
  imminentCalendar: any[];
  openActions: any[];
  activeGoals: any[];
  recentOpenLoops: Array<{
    title: string;
    source: string;
    priority: number;
    reason: string;
  }>;
  behaviorSignals: string[];
  momentAssessment: SituationMomentAssessment;
  mentalInfluence: {
    load: "low" | "medium" | "high";
    reason: string;
  };
  confidence: number;
  recommendedAction: SituationPolicyAction;
  interventionReason: string;
  interventionPriority: number;
  sourceSignals: string[];
  dedupeKey: string | null;
  suppressGenericCuriosity: boolean;
  valueAssessment: SituationValueAssessment;
  updatedAt: string;
};

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

function minutesUntil(value?: string | null) {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return null;
  return Math.round((time - Date.now()) / 60000);
}

function hoursSince(value?: string | null) {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return null;
  return (Date.now() - time) / (60 * 60 * 1000);
}

function isHomePlace(place?: string | null, category?: string | null) {
  const label = clean(place);
  return label === "casa" || label === "home" || clean(category) === "home";
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function valueLevel(score: number): SituationValueAssessment["level"] {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  if (score >= 25) return "low";
  return "none";
}

function riskLevel(value: number): "low" | "medium" | "high" {
  if (value >= 7) return "high";
  if (value >= 4) return "medium";
  return "low";
}

function signalQualityLevel(value: number): "low" | "medium" | "high" {
  if (value >= 7) return "high";
  if (value >= 4) return "medium";
  return "low";
}

function momentLevel(score: number): SituationMomentAssessment["level"] {
  if (score >= 85) return "exceptional";
  if (score >= 65) return "important";
  if (score >= 35) return "interesting";
  return "ordinary";
}

function pushSignal({
  reasons,
  signals,
  reason,
  signal,
}: {
  reasons: string[];
  signals: string[];
  reason: string;
  signal: string;
}) {
  reasons.push(reason);
  signals.push(signal);
}

function mentalInfluence(snapshot: GhostBrainSnapshotCore) {
  const mental = snapshot.profile?.mentalState || {};
  const stress = Number(mental.stress || 0);
  const tiredness = Number(mental.stanchezza || 0);
  const frustration = Number(mental.frustrazione || 0);
  const pending = snapshot.actions.length;
  const goals = snapshot.goals.activeGoals.length;

  if (tiredness >= 7 || stress >= 8 || pending >= 6 || goals >= 4) {
    return {
      load: "high" as const,
      reason: "carico operativo alto: ridurre rumore e preferire interventi importanti",
    };
  }

  if (tiredness >= 4 || stress >= 4 || frustration >= 6 || pending >= 3) {
    return {
      load: "medium" as const,
      reason: "carico operativo medio: proattivita mirata",
    };
  }

  return {
    load: "low" as const,
    reason: "nessun carico operativo forte",
  };
}

function recentLocationEvents(snapshot: GhostBrainSnapshotCore) {
  const observations = snapshot.currentSituation?.recentLocationEvents || [];
  if (Array.isArray(observations) && observations.length) return observations;
  return [];
}

function recentHomeEvents(snapshot: GhostBrainSnapshotCore) {
  const events = snapshot.currentSituation?.recentHomeEvents || [];
  if (Array.isArray(events) && events.length) return events;
  return [];
}

function buildRecentOpenLoops(snapshot: GhostBrainSnapshotCore) {
  const loops: UnifiedSituationModel["recentOpenLoops"] = [];

  for (const loop of snapshot.people.relationshipMemory.openLoops || []) {
    loops.push({
      title: loop.title || loop.description || "Punto aperto relazionale",
      source: "people.relationshipMemory",
      priority: Number(loop.priority || 6),
      reason: loop.people?.length
        ? `Riguarda ${loop.people.join(", ")}`
        : "Punto relazionale aperto",
    });
  }

  for (const action of snapshot.actions || []) {
    const priority = Number(action.priority || 0);
    if (priority < 7) continue;
    loops.push({
      title: action.title || action.description || "Azione aperta",
      source: "action_intents",
      priority,
      reason: action.intent_type || "azione aperta importante",
    });
  }

  for (const event of snapshot.calendar.completed || []) {
    const age = hoursSince(event.updated_at || event.start_at || event.remind_at);
    if (age === null || age < 1 || age > 72) continue;
    loops.push({
      title: event.title || "Evento recente",
      source: "calendar.completed",
      priority: 7,
      reason: "evento recente da chiudere con follow-up",
    });
  }

  return loops
    .sort((left, right) => right.priority - left.priority)
    .slice(0, 8);
}

function buildMomentAssessment({
  snapshot,
  decision,
  openLoops,
  locationEvents,
  homeEvents,
  behaviorSignals,
}: {
  snapshot: GhostBrainSnapshotCore;
  decision: DecisionSnapshot;
  openLoops: UnifiedSituationModel["recentOpenLoops"];
  locationEvents: UnifiedSituationModel["recentLocationEvents"];
  homeEvents: UnifiedSituationModel["recentHomeEvents"];
  behaviorSignals: string[];
}): SituationMomentAssessment {
  const reasons: string[] = [];
  const signals: string[] = [];
  const riskSignals = snapshot.home.comfortRisk.riskSignals || [];
  const nextEvent = [...snapshot.calendar.today, ...snapshot.calendar.upcoming]
    .map((event) => ({
      event,
      minutes: minutesUntil(event.start_at || event.remind_at),
    }))
    .filter((entry) => entry.minutes !== null && entry.minutes >= 0)
    .sort((left, right) => Number(left.minutes) - Number(right.minutes))[0];
  const currentPlace = snapshot.location.situation.currentPlace;
  const currentPlaceCategory = snapshot.location.situation.category;
  const knownSignificantPlace = snapshot.location.significantPlaces.some(
    (place) =>
      clean(place.label) === clean(currentPlace) ||
      clean(place.category) === clean(currentPlaceCategory)
  );
  const recentLocationChange = locationEvents.find(
    (event) => (hoursSince(event.occurredAt) ?? Infinity) <= 8
  );
  const unknownPlace = locationEvents.find(
    (event) =>
      event.eventType === "place_unknown_detected" &&
      (hoursSince(event.occurredAt) ?? Infinity) <= 14
  );
  const relevantHomeEvent = [...homeEvents]
    .sort((left, right) => right.priority - left.priority)[0];
  const highPriorityOpenLoop = openLoops.find((loop) => loop.priority >= 8);
  const importantAction = (snapshot.actions || []).find(
    (item) => Number(item.priority || 0) >= 8
  );
  const importantGoal = (snapshot.goals.activeGoals || []).find(
    (item) => Number(item.importance || 0) >= 8
  );
  const peopleSignal =
    Boolean(snapshot.people.importantPeople?.length) ||
    Boolean(snapshot.people.relationshipMemory.sharedEvents?.length) ||
    Boolean(snapshot.people.socialSuggestions.relationshipAttention?.length);
  const memorySignal =
    Boolean(snapshot.memory.activeMemories?.length) ||
    Boolean(snapshot.memory.episodicMemories?.length) ||
    Boolean(snapshot.memory.topics?.length);

  let score = 0;
  if (riskSignals.length) {
    score += 35;
    pushSignal({
      reasons,
      signals,
      reason: "rischio casa rilevante",
      signal: "home:risk",
    });
  }
  if (nextEvent?.minutes !== null && nextEvent?.minutes !== undefined) {
    if (Number(nextEvent.minutes) <= 30) score += 30;
    else if (Number(nextEvent.minutes) <= 90) score += 22;
    else if (Number(nextEvent.minutes) <= 180) score += 12;
    pushSignal({
      reasons,
      signals,
      reason: `evento calendario vicino: ${nextEvent.event.title || "evento"}`,
      signal: "calendar:near",
    });
  }
  if (relevantHomeEvent?.priority >= 8) {
    score += 22;
    pushSignal({
      reasons,
      signals,
      reason: "evento casa ad alta priorita",
      signal: "home:event_high",
    });
  } else if (relevantHomeEvent?.priority >= 5) {
    score += 12;
    pushSignal({
      reasons,
      signals,
      reason: "evento casa recente",
      signal: "home:event_recent",
    });
  }
  if (recentLocationChange) {
    score += 14;
    pushSignal({
      reasons,
      signals,
      reason: `cambio luogo recente: ${recentLocationChange.eventType}`,
      signal: "location:recent_change",
    });
  }
  if (unknownPlace) {
    score += 16;
    pushSignal({
      reasons,
      signals,
      reason: "luogo sconosciuto recente",
      signal: "location:unknown_recent",
    });
  }
  if (highPriorityOpenLoop) {
    score += 18;
    pushSignal({
      reasons,
      signals,
      reason: `open loop importante: ${highPriorityOpenLoop.title}`,
      signal: "continuity:open_loop",
    });
  }
  if (importantAction) {
    score += 12;
    pushSignal({
      reasons,
      signals,
      reason: `azione importante aperta: ${importantAction.title || importantAction.description || "azione"}`,
      signal: "action:important",
    });
  }
  if (importantGoal) {
    score += 10;
    pushSignal({
      reasons,
      signals,
      reason: `goal importante attivo: ${importantGoal.title || "goal"}`,
      signal: "goal:important",
    });
  }
  if (knownSignificantPlace) {
    score += 8;
    pushSignal({
      reasons,
      signals,
      reason: "luogo significativo riconosciuto",
      signal: "location:significant_place",
    });
  }
  if (snapshot.home.state.activeRooms?.length || snapshot.home.state.media?.length) {
    score += 8;
    pushSignal({
      reasons,
      signals,
      reason: "attivita casa rilevata",
      signal: "home:activity",
    });
  }
  if (snapshot.home.routes?.possibleMovement === "uncertain_movement") {
    score += 10;
    pushSignal({
      reasons,
      signals,
      reason: "movimento casa incerto",
      signal: "home:route_uncertain",
    });
  }
  if (peopleSignal) {
    score += 8;
    pushSignal({
      reasons,
      signals,
      reason: "persone rilevanti nel contesto",
      signal: "people:relevant",
    });
  }
  if (memorySignal && behaviorSignals.length >= 3) {
    score += 6;
    pushSignal({
      reasons,
      signals,
      reason: "memoria e pattern danno contesto",
      signal: "memory:contextual",
    });
  }
  if (decision.userSituation.mentalLoad === "high") {
    score += 8;
    pushSignal({
      reasons,
      signals,
      reason: "carico operativo alto",
      signal: "mental:high_load",
    });
  }
  if (snapshot.signals.context.some((signal) => signal.priority >= 9)) {
    score += 10;
    pushSignal({
      reasons,
      signals,
      reason: "segnale operativo molto prioritario",
      signal: "context:high_priority",
    });
  }

  const confidenceBase =
    (currentPlace ? 15 : 0) +
    (Number(snapshot.location.situation.confidence || 0) >= 70 ? 15 : 0) +
    (Number(snapshot.home.state.confidence || 0) >= 60 ? 15 : 0) +
    (snapshot.signals.context.length ? 15 : 0) +
    (signals.length >= 3 ? 20 : signals.length >= 2 ? 12 : signals.length ? 6 : 0) +
    (decision.missingContext.length <= 2 ? 20 : decision.missingContext.length <= 4 ? 10 : 0);

  const uniqueReasons = Array.from(new Set(reasons)).slice(0, 8);
  const uniqueSignals = Array.from(new Set(signals)).slice(0, 12);
  const finalScore = clampScore(score);

  return {
    level: momentLevel(finalScore),
    score: finalScore,
    confidence: clampScore(confidenceBase),
    reasons: uniqueReasons.length ? uniqueReasons : ["momento ordinario"],
    signals: uniqueSignals,
  };
}

function textFor(value: any) {
  return clean(
    [
      value?.title,
      value?.message,
      value?.description,
      value?.reason,
      value?.category,
      value?.source,
      value?.logical_key,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function hasRecentSimilarProactive({
  snapshot,
  dedupeKey,
  reason,
}: {
  snapshot: GhostBrainSnapshotCore;
  dedupeKey: string | null;
  reason: string;
}) {
  const target = clean(dedupeKey || reason);
  if (!target) return false;

  return [...(snapshot.proactive.recent || []), ...(snapshot.proactive.handledRecent || [])]
    .some((message) => {
      const text = textFor(message);
      return Boolean(
        text &&
          (text.includes(target) ||
            target.includes(clean(message?.logical_key)) ||
            clean(message?.logical_key) === target)
      );
    });
}

function buildValueAssessment({
  snapshot,
  decision,
  action,
  openLoops,
  locationEvents,
  homeEvents,
  momentAssessment,
}: {
  snapshot: GhostBrainSnapshotCore;
  decision: DecisionSnapshot;
  action: {
    action: SituationPolicyAction;
    priority: number;
    reason: string;
    sourceSignals: string[];
    dedupeKey: string | null;
    suppressGenericCuriosity: boolean;
  };
  openLoops: UnifiedSituationModel["recentOpenLoops"];
  locationEvents: UnifiedSituationModel["recentLocationEvents"];
  homeEvents: UnifiedSituationModel["recentHomeEvents"];
  momentAssessment: SituationMomentAssessment;
}): SituationValueAssessment {
  const reasons: string[] = [];
  const penalties: string[] = [];
  const riskSignals = snapshot.home.comfortRisk.riskSignals || [];
  const comfortSignals = snapshot.home.comfortRisk.comfortSignals || [];
  const nextEvent = [...snapshot.calendar.today, ...snapshot.calendar.upcoming]
    .map((event) => ({
      event,
      minutes: minutesUntil(event.start_at || event.remind_at),
    }))
    .filter((entry) => entry.minutes !== null && entry.minutes >= 0)
    .sort((left, right) => Number(left.minutes) - Number(right.minutes))[0];
  const highPriorityOpenLoop = openLoops.find((loop) => loop.priority >= 8);
  const importantAction = (snapshot.actions || []).find(
    (item) => Number(item.priority || 0) >= 8
  );
  const importantGoal = (snapshot.goals.activeGoals || []).find(
    (item) => Number(item.importance || 0) >= 8
  );
  const recentLocationSignal = locationEvents.some(
    (event) => (hoursSince(event.occurredAt) ?? Infinity) <= 8
  );
  const recentHomeSignal = homeEvents.some((event) => event.priority >= 5);
  const knownPlace = Boolean(snapshot.location.situation.currentPlace);
  const knownPlaceDetail = snapshot.location.significantPlaces.some(
    (place) =>
      clean(place.label) === clean(snapshot.location.situation.currentPlace) ||
      clean(place.category) === clean(snapshot.location.situation.category)
  );
  const peopleSignal =
    Boolean(snapshot.people.importantPeople?.length) ||
    Boolean(snapshot.people.relationshipMemory.openLoops?.length) ||
    Boolean(snapshot.people.relationshipMemory.sharedEvents?.length);
  const memorySignal =
    Boolean(snapshot.memory.activeMemories?.length) ||
    Boolean(snapshot.memory.episodicMemories?.length) ||
    Boolean(snapshot.memory.topics?.length);
  const housePatternSignal =
    Boolean(snapshot.home.patterns?.length) ||
    Boolean(snapshot.home.routes?.recentRoute) ||
    Boolean(snapshot.home.state.activeRooms?.length);

  let utility = 0;
  if (action.action === "remind") utility += 8;
  if (action.action === "ask_followup") utility += 6;
  if (action.action === "create_card") utility += 5;
  if (action.action === "suggest_action") utility += 4;
  if (riskSignals.length) {
    utility += 10;
    reasons.push("rischio casa concreto");
  }
  if (nextEvent?.event) {
    utility += 6;
    reasons.push("collegamento calendario");
  }
  if (importantAction) {
    utility += 5;
    reasons.push("azione aperta importante");
  }
  if (importantGoal) {
    utility += 4;
    reasons.push("goal importante");
  }
  if (highPriorityOpenLoop) {
    utility += 5;
    reasons.push("open loop recente");
  }
  if (peopleSignal) {
    utility += 3;
    reasons.push("segnale persone");
  }
  if (memorySignal) utility += 2;
  if (comfortSignals.length) utility += 2;
  if (momentAssessment.level === "exceptional") utility += 6;
  else if (momentAssessment.level === "important") utility += 4;
  else if (momentAssessment.level === "interesting") utility += 2;

  let urgency = 0;
  if (riskSignals.length) urgency += 10;
  if (nextEvent?.minutes !== null && nextEvent?.minutes !== undefined) {
    if (Number(nextEvent.minutes) <= 30) urgency += 10;
    else if (Number(nextEvent.minutes) <= 90) urgency += 7;
    else if (Number(nextEvent.minutes) <= 180) urgency += 4;
  }
  if (recentLocationSignal) urgency += 3;
  if (recentHomeSignal) urgency += 3;
  if (highPriorityOpenLoop) urgency += 2;
  if (momentAssessment.level === "exceptional") urgency += 4;
  else if (momentAssessment.level === "important") urgency += 2;

  let contextFit = 0;
  if (knownPlace) contextFit += 3;
  if (knownPlaceDetail) contextFit += 2;
  if (recentLocationSignal) contextFit += 2;
  if (recentHomeSignal || housePatternSignal) contextFit += 3;
  if (peopleSignal) contextFit += 2;
  if (action.sourceSignals.length >= 3) contextFit += 2;
  if (snapshot.signals.context.length >= 3) contextFit += 2;
  if (!decision.missingContext.includes("no_fresh_location")) contextFit += 1;
  if (momentAssessment.confidence >= 70) contextFit += 2;
  if (momentAssessment.signals.length >= 3) contextFit += 2;

  let signalQuality = 0;
  if (knownPlace) signalQuality += 2;
  if (Number(snapshot.location.situation.confidence || 0) >= 70) signalQuality += 2;
  if (Number(snapshot.home.state.confidence || 0) >= 60) signalQuality += 2;
  if (snapshot.signals.context.length >= 2) signalQuality += 2;
  if (peopleSignal) signalQuality += 1;
  if (memorySignal) signalQuality += 1;
  if (decision.missingContext.length >= 4) {
    signalQuality -= 2;
    penalties.push("molto contesto mancante");
  }
  if (momentAssessment.confidence >= 70) signalQuality += 2;
  else if (momentAssessment.confidence < 35) signalQuality -= 1;

  let disturbance = 0;
  if (decision.doNotDisturb) disturbance += 8;
  if (decision.userSituation.mentalLoad === "high") disturbance += 4;
  if (snapshot.signals.simple.doNotDisturb) disturbance += 5;
  if (snapshot.proactive.recent.length >= 2) disturbance += 2;
  if (action.action === "ask_followup" && decision.userSituation.mentalLoad !== "low") {
    disturbance += 2;
  }

  let repeat = 0;
  if (hasRecentSimilarProactive({
    snapshot,
    dedupeKey: action.dedupeKey,
    reason: action.reason,
  })) {
    repeat += 7;
    penalties.push("tema gia proposto di recente");
  }
  if (snapshot.proactive.recent.length >= 3) {
    repeat += 3;
    penalties.push("molte card recenti");
  }

  const baseScore =
    utility * 3 +
    urgency * 3 +
    contextFit * 2 +
    signalQuality * 2 -
    disturbance * 4 -
    repeat * 4;
  const score = clampScore(baseScore);
  const level = valueLevel(score);
  const shouldIntervene =
    action.action !== "wait" &&
    action.action !== "say_nothing" &&
    score >= 50 &&
    !(riskLevel(disturbance) === "high" && urgency < 8 && utility < 10);

  if (!shouldIntervene && action.action !== "wait" && action.action !== "say_nothing") {
    penalties.push("valore insufficiente rispetto al disturbo");
  }

  return {
    score,
    level,
    shouldIntervene,
    utility: clampScore(utility * 10),
    urgency: clampScore(urgency * 10),
    contextFit: clampScore(contextFit * 10),
    signalQuality: signalQualityLevel(signalQuality),
    disturbanceRisk: riskLevel(disturbance),
    repeatRisk: riskLevel(repeat),
    reasons,
    penalties,
  };
}

function applyValueAssessment({
  action,
  value,
  decision,
}: {
  action: {
    action: SituationPolicyAction;
    priority: number;
    reason: string;
    sourceSignals: string[];
    dedupeKey: string | null;
    suppressGenericCuriosity: boolean;
  };
  value: SituationValueAssessment;
  decision: DecisionSnapshot;
}) {
  if (action.action === "wait" || action.action === "say_nothing") {
    return action;
  }

  if (value.shouldIntervene) {
    return {
      ...action,
      priority: Math.max(action.priority, Math.ceil(value.score / 10)),
      reason: `${action.reason} | valore ${value.score}/100`,
    };
  }

  const shouldStaySilent =
    value.disturbanceRisk === "high" ||
    decision.doNotDisturb ||
    value.repeatRisk === "high";

  return {
    action: shouldStaySilent ? "say_nothing" as const : "wait" as const,
    priority: 1,
    reason: `Intervento scartato per valore basso (${value.score}/100): ${
      value.penalties.join("; ") || "meglio tacere"
    }`,
    sourceSignals: [...action.sourceSignals, "value:low"],
    dedupeKey: null,
    suppressGenericCuriosity: true,
  };
}

function chooseAction({
  snapshot,
  decision,
  openLoops,
  locationEvents,
  homeEvents,
  momentAssessment,
}: {
  snapshot: GhostBrainSnapshotCore;
  decision: DecisionSnapshot;
  openLoops: UnifiedSituationModel["recentOpenLoops"];
  locationEvents: UnifiedSituationModel["recentLocationEvents"];
  homeEvents: UnifiedSituationModel["recentHomeEvents"];
  momentAssessment: SituationMomentAssessment;
}) {
  const riskSignals = snapshot.home.comfortRisk.riskSignals || [];
  const nextEvent = [...snapshot.calendar.today, ...snapshot.calendar.upcoming]
    .map((event) => ({
      event,
      minutes: minutesUntil(event.start_at || event.remind_at),
    }))
    .filter((entry) => entry.minutes !== null && entry.minutes >= 0)
    .sort((left, right) => Number(left.minutes) - Number(right.minutes))[0];
  const currentPlace = snapshot.location.situation.currentPlace;
  const isAtHome = isHomePlace(
    currentPlace,
    snapshot.location.situation.category
  );
  const recentHomeArrival = locationEvents.some(
    (event) =>
      event.eventType === "home_arrived" &&
      (hoursSince(event.occurredAt) ?? Infinity) <= 8
  );
  const recentUnknownPlace = locationEvents.some(
    (event) =>
      event.eventType === "place_unknown_detected" &&
      (hoursSince(event.occurredAt) ?? Infinity) <= 14
  );
  const sourceSignals = [
    isAtHome ? "current_place:home" : "current_place:away_or_unknown",
    recentHomeArrival ? "moment:recent_home_arrival" : null,
    recentUnknownPlace ? "location:recent_unknown_place" : null,
    openLoops.length ? "continuity:recent_open_loop" : null,
    nextEvent?.event?.title ? "calendar:imminent_event" : null,
    riskSignals.length ? "home:risk_signal" : null,
  ].filter(Boolean) as string[];

  let action: {
    action: SituationPolicyAction;
    priority: number;
    reason: string;
    sourceSignals: string[];
    dedupeKey: string | null;
    suppressGenericCuriosity: boolean;
  };

  if (
    riskSignals.includes("possible_power_overload") ||
    riskSignals.includes("multiple_appliances_active") ||
    riskSignals.includes("appliance_conflict")
  ) {
    action = {
      action: "remind" as const,
      priority: 10,
      reason: "Home Assistant segnala un rischio casa concreto",
      sourceSignals,
      dedupeKey: "policy_home_safety",
      suppressGenericCuriosity: true,
    };
  } else if (nextEvent?.minutes !== null && Number(nextEvent?.minutes) <= 90) {
    action = {
      action: "remind" as const,
      priority: Number(nextEvent.minutes) <= 30 ? 9 : 8,
      reason: `Evento imminente: ${nextEvent.event.title || "evento"}`,
      sourceSignals,
      dedupeKey: `policy_calendar_${nextEvent.event.id || clean(nextEvent.event.title) || "event"}`,
      suppressGenericCuriosity: true,
    };
  } else if (isAtHome && recentHomeArrival && recentUnknownPlace && openLoops.length) {
    action = {
      action: "ask_followup" as const,
      priority: 9,
      reason: "Rientro a casa dopo luogo sconosciuto collegato a un open loop",
      sourceSignals,
      dedupeKey: "policy_continuity_return_unknown_place",
      suppressGenericCuriosity: true,
    };
  } else if (openLoops.some((loop) => loop.priority >= 8)) {
    action = {
      action: "create_card" as const,
      priority: 8,
      reason: "C'e un open loop recente ad alta priorita",
      sourceSignals,
      dedupeKey: `policy_open_loop_${clean(openLoops[0]?.source) || "recent"}`,
      suppressGenericCuriosity: true,
    };
  } else if (decision.nextBestAction !== "no_action") {
    action = {
      action: "suggest_action" as const,
      priority: 6,
      reason: `Next best action: ${decision.nextBestAction}`,
      sourceSignals,
      dedupeKey: `policy_next_best_${decision.nextBestAction}`,
      suppressGenericCuriosity: decision.userSituation.mentalLoad !== "low",
    };
  } else if (decision.doNotDisturb) {
    action = {
      action: "say_nothing" as const,
      priority: 1,
      reason: "Momento da non disturbare",
      sourceSignals: [...sourceSignals, "policy:do_not_disturb"],
      dedupeKey: null,
      suppressGenericCuriosity: true,
    };
  } else {
    action = {
      action: "wait" as const,
      priority: 2,
      reason: "Nessun intervento ad alto valore ora",
      sourceSignals,
      dedupeKey: null,
      suppressGenericCuriosity: false,
    };
  }

  const valueAssessment = buildValueAssessment({
    snapshot,
    decision,
    action,
    openLoops,
    locationEvents,
    homeEvents,
    momentAssessment,
  });
  const valuedAction = applyValueAssessment({
    action,
    value: valueAssessment,
    decision,
  });

  return {
    ...valuedAction,
    valueAssessment,
  };
}

export function buildUnifiedSituationModel({
  snapshot,
  decision,
}: {
  snapshot: GhostBrainSnapshotCore;
  decision: DecisionSnapshot;
}): UnifiedSituationModel {
  const locationEvents = recentLocationEvents(snapshot);
  const homeEvents = recentHomeEvents(snapshot);
  const openLoops = buildRecentOpenLoops(snapshot);
  const mental = mentalInfluence(snapshot);
  const currentRoom =
    snapshot.home.state.activeRooms[0] ||
    snapshot.home.routes.recentRoute?.to ||
    null;
  const peoplePresent = snapshot.home.state.people
    .filter((person) => person.presenceKnown && person.isHome)
    .map((person) => person.name);
  const behaviorSignals = [
    ...(snapshot.home.state.signals || []),
    ...(snapshot.signals.context || []).map((signal) => signal.key),
    ...(snapshot.location.behaviorPatterns || [])
      .filter((pattern) => Number(pattern.confidence || 0) >= 7)
      .map((pattern) => pattern.pattern_type || pattern.title)
      .filter(Boolean),
  ].slice(0, 16);
  const momentAssessment = buildMomentAssessment({
    snapshot,
    decision,
    openLoops,
    locationEvents,
    homeEvents,
    behaviorSignals,
  });
  const action = chooseAction({
    snapshot,
    decision,
    openLoops,
    locationEvents,
    homeEvents,
    momentAssessment,
  });

  return {
    currentPlace: snapshot.location.situation.currentPlace,
    placeCategory: snapshot.location.situation.category,
    placeAddress: snapshot.location.situation.address,
    currentRoom,
    peoplePresent,
    recentLocationEvents: locationEvents,
    recentHomeEvents: homeEvents,
    imminentCalendar: [...snapshot.calendar.today, ...snapshot.calendar.upcoming]
      .filter((event) => {
        const minutes = minutesUntil(event.start_at || event.remind_at);
        return minutes !== null && minutes >= 0 && minutes <= 180;
      })
      .slice(0, 5),
    openActions: snapshot.actions.slice(0, 8),
    activeGoals: snapshot.goals.activeGoals.slice(0, 8),
    recentOpenLoops: openLoops,
    behaviorSignals,
    momentAssessment,
    mentalInfluence: mental,
    confidence: Math.max(
      Number(snapshot.location.situation.confidence || 0),
      Number(snapshot.home.state.confidence || 0),
      decision.userSituation.mentalLoad === "high" ? 65 : 50
    ),
    recommendedAction: action.action,
    interventionReason: action.reason,
    interventionPriority: action.priority,
    sourceSignals: action.sourceSignals,
    dedupeKey: action.dedupeKey,
    suppressGenericCuriosity: action.suppressGenericCuriosity,
    valueAssessment: action.valueAssessment,
    updatedAt: snapshot.generatedAt,
  };
}
