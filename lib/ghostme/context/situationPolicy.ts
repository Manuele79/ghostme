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

export type SituationPeopleAssessment = {
  score: number;
  confidence: number;
  relevantPeople: Array<{
    name: string;
    relevance: "low" | "medium" | "high";
    score: number;
    reasons: string[];
    signals: string[];
  }>;
  reasons: string[];
  signals: string[];
};

export type SituationHomeAssessment = {
  score: number;
  confidence: number;
  level: "quiet" | "active" | "relevant" | "critical";
  reasons: string[];
  signals: string[];
};

export type SituationLearningAssessment = {
  repeatRisk: "low" | "medium" | "high";
  disturbanceRisk: "low" | "medium" | "high";
  confidence: number;
  reasons: string[];
  signals: string[];
  penalties: string[];
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
  homeAssessment: SituationHomeAssessment;
  peopleAssessment: SituationPeopleAssessment;
  momentAssessment: SituationMomentAssessment;
  learningAssessment: SituationLearningAssessment;
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

function relevanceLevel(score: number): SituationPeopleAssessment["relevantPeople"][number]["relevance"] {
  if (score >= 65) return "high";
  if (score >= 35) return "medium";
  return "low";
}

function homeLevel(score: number): SituationHomeAssessment["level"] {
  if (score >= 80) return "critical";
  if (score >= 55) return "relevant";
  if (score >= 25) return "active";
  return "quiet";
}

function personDisplayName(value: any) {
  return String(value?.name || value?.person || value?.topic || "").trim();
}

function includesPerson(values: any[], name: string) {
  const key = clean(name);
  if (!key) return false;

  return (values || []).some((value) =>
    (value?.people || []).some((person: any) => clean(person) === key)
  );
}

function includesPersonText(value: any, name: string) {
  const key = clean(name);
  if (!key) return false;

  return clean(
    [
      value?.title,
      value?.description,
      value?.content,
      value?.summary,
      value?.reason,
      value?.target_label,
      value?.place,
      value?.source,
    ]
      .filter(Boolean)
      .join(" ")
  ).includes(key);
}

function latestPersonEvidence(values: Array<string | null | undefined>) {
  return values
    .map((value) => ({
      value,
      time: new Date(value || 0).getTime(),
    }))
    .filter((entry) => entry.value && Number.isFinite(entry.time))
    .sort((left, right) => right.time - left.time)[0]?.value || null;
}

function buildPeopleAssessment({
  snapshot,
}: {
  snapshot: GhostBrainSnapshotCore;
}): SituationPeopleAssessment {
  const people = snapshot.people.items || [];
  const importantPeople = snapshot.people.importantPeople || [];
  const relationship = snapshot.people.relationshipMemory;
  const social = snapshot.people.socialSuggestions;
  const peopleAtHome = (snapshot.home.state.people || [])
    .filter((person) => person.presenceKnown && person.isHome)
    .map((person) => person.name)
    .filter(Boolean);
  const currentPlace = snapshot.location.situation.currentPlace;
  const projectsWithPeople = snapshot.projects.projects || [];
  const relevantPeople: SituationPeopleAssessment["relevantPeople"] = [];

  for (const person of people) {
    const name = personDisplayName(person);
    if (!name) continue;

    const reasons: string[] = [];
    const signals: string[] = [];
    const activity = relationship.personActivity.find(
      (item) => clean(item.person) === clean(name)
    );
    const attention = social.relationshipAttention.find(
      (item) => clean(item.person) === clean(name)
    );
    const hasRecentMention =
      includesPerson(relationship.recentMentions, name) ||
      Number(activity?.recentMentions || 0) > 0;
    const hasOpenLoop =
      includesPerson(relationship.openLoops, name) ||
      Number(activity?.openLoops || 0) > 0 ||
      Boolean(attention?.signals.includes("person_with_open_loop"));
    const hasSharedEvent =
      includesPerson(relationship.sharedEvents, name) ||
      Number(activity?.linkedEvents || 0) > 0 ||
      Boolean(attention?.signals.includes("upcoming_shared_event"));
    const hasPlaceLink =
      Boolean(currentPlace) &&
      (relationship.relatedPlaces || []).some(
        (place) =>
          includesPerson([place], name) &&
          (clean(place.place).includes(clean(currentPlace)) ||
            clean(currentPlace).includes(clean(place.place)))
      );
    const isHomeNow = peopleAtHome.some((item) => clean(item) === clean(name));
    const hasProjectLink = projectsWithPeople.some((project) =>
      (project.relatedPeople || []).some(
        (related: any) =>
          clean(personDisplayName(related)) === clean(name) ||
          includesPersonText(related, name)
      )
    );
    const hasGraphLink = (person.graph_links || []).length || snapshot.people.links.some(
      (link) => link.person_id === person.id || link.target_id === person.id
    );
    const importance = Number(person.importance || activity?.importance || 0);
    const mentionCount = Number(person.mention_count || activity?.totalMentions || 0);
    const latestEvidence = latestPersonEvidence([
      person.last_mentioned_at,
      person.updated_at,
      activity?.lastMentionedAt,
      attention?.lastMentionedAt,
    ]);
    const recentEvidence = (hoursSince(latestEvidence) ?? Infinity) <= 14 * 24;

    let score = 0;
    if (hasOpenLoop) {
      score += 35;
      pushSignal({
        reasons,
        signals,
        reason: `${name}: punto aperto personale`,
        signal: "people:open_loop",
      });
    }
    if (hasSharedEvent) {
      score += 28;
      pushSignal({
        reasons,
        signals,
        reason: `${name}: evento condiviso rilevante`,
        signal: "people:shared_event",
      });
    }
    if (hasRecentMention) {
      score += Number(activity?.recentMentions || 0) >= 3 ? 22 : 12;
      pushSignal({
        reasons,
        signals,
        reason: `${name}: presenza in memoria recente`,
        signal: "people:recent_memory",
      });
    }
    if (isHomeNow) {
      score += 18;
      pushSignal({
        reasons,
        signals,
        reason: `${name}: presente ora nel contesto casa`,
        signal: "people:present_home",
      });
    }
    if (hasPlaceLink) {
      score += 14;
      pushSignal({
        reasons,
        signals,
        reason: `${name}: collegamento con il luogo attuale`,
        signal: "people:place_link",
      });
    }
    if (hasProjectLink) {
      score += 12;
      pushSignal({
        reasons,
        signals,
        reason: `${name}: collegamento con progetto/goal`,
        signal: "people:project_link",
      });
    }
    if (hasGraphLink) {
      score += 8;
      signals.push("people:graph_link");
    }
    if (importance >= 7) {
      score += 10;
      signals.push("people:important_person");
    }
    if (mentionCount >= 5) {
      score += 6;
      signals.push("people:frequent_mentions");
    }
    if (recentEvidence) {
      score += 6;
      signals.push("people:fresh_evidence");
    }
    if (
      attention?.signals.every((signal) =>
        ["relationship_context_sparse", "no_recent_mentions", "reconnect_candidate"].includes(signal)
      )
    ) {
      score -= 14;
      signals.push("people:weak_or_intrusive_signal");
    }

    const finalScore = clampScore(score);
    if (finalScore < 25) continue;

    relevantPeople.push({
      name,
      relevance: relevanceLevel(finalScore),
      score: finalScore,
      reasons: Array.from(new Set(reasons)).slice(0, 4),
      signals: Array.from(new Set(signals)).slice(0, 8),
    });
  }

  const sortedPeople = relevantPeople
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
  const reasons = Array.from(
    new Set(sortedPeople.flatMap((person) => person.reasons))
  ).slice(0, 8);
  const signals = Array.from(
    new Set(sortedPeople.flatMap((person) => person.signals))
  ).slice(0, 12);
  const strongestScore = sortedPeople[0]?.score || 0;
  const concreteSignalCount = signals.filter(
    (signal) => !["people:weak_or_intrusive_signal"].includes(signal)
  ).length;
  const confidence = clampScore(
    (relationship.confidence || 0) * 0.5 +
      (social.confidence || 0) * 0.3 +
      (concreteSignalCount >= 3 ? 20 : concreteSignalCount >= 2 ? 12 : concreteSignalCount ? 6 : 0)
  );

  return {
    score: strongestScore,
    confidence,
    relevantPeople: sortedPeople,
    reasons,
    signals,
  };
}

function buildHomeAssessment({
  snapshot,
  homeEvents,
}: {
  snapshot: GhostBrainSnapshotCore;
  homeEvents: UnifiedSituationModel["recentHomeEvents"];
}): SituationHomeAssessment {
  const reasons: string[] = [];
  const signals: string[] = [];
  const state = snapshot.home.state;
  const routes = snapshot.home.routes;
  const comfortRisk = snapshot.home.comfortRisk;
  const highPriorityHomeEvent = [...homeEvents]
    .filter((event) => Number(event.priority || 0) >= 8)
    .sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0))[0];
  const relevantHomeEvent = [...homeEvents]
    .filter((event) => Number(event.priority || 0) >= 5)
    .sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0))[0];
  const activeRooms = state.activeRooms || [];
  const media = state.media || [];
  const riskSignals = comfortRisk.riskSignals || [];
  const comfortSignals = comfortRisk.comfortSignals || [];
  const automationSignals = comfortRisk.automationSignals || [];
  const suggestions = comfortRisk.suggestions || [];
  const learnedRules = snapshot.home.learnedRules || [];
  const automationControls = snapshot.home.automationControls || [];
  const patterns = snapshot.home.patterns || [];
  const activePattern = patterns.find(
    (pattern) =>
      ["active", "learning"].includes(String(pattern.status || "")) &&
      (Number(pattern.confidence || 0) >= 7 || Number(pattern.occurrences || 0) >= 3)
  );
  const recentRoute = routes.recentRoute;
  const routeAge = hoursSince(recentRoute?.occurredAt);
  const freshRoute = routeAge !== null && routeAge <= 2;
  const emptyHours = hoursSince(state.occupancySince);

  let score = 0;
  if (riskSignals.length) {
    score += riskSignals.includes("possible_power_overload") ? 38 : 30;
    pushSignal({
      reasons,
      signals,
      reason: "la casa segnala un rischio concreto",
      signal: "home:risk",
    });
  }
  if (snapshot.home.consistency?.mismatch) {
    score += 22;
    pushSignal({
      reasons,
      signals,
      reason: `stato casa incoerente: ${snapshot.home.consistency.reason}`,
      signal: "home:location_mismatch",
    });
  }
  if (highPriorityHomeEvent) {
    score += 22;
    pushSignal({
      reasons,
      signals,
      reason: `evento casa importante: ${highPriorityHomeEvent.eventType}`,
      signal: "home:event_high",
    });
  } else if (relevantHomeEvent) {
    score += 10;
    pushSignal({
      reasons,
      signals,
      reason: `evento casa recente: ${relevantHomeEvent.eventType}`,
      signal: "home:event_relevant",
    });
  }
  if (comfortSignals.length) {
    score += comfortSignals.some((signal) =>
      ["hot_home", "cold_home", "humid_home"].includes(signal)
    )
      ? 18
      : 10;
    pushSignal({
      reasons,
      signals,
      reason: "comfort casa rilevante",
      signal: "home:comfort",
    });
  }
  if (routes.possibleMovement === "uncertain_movement" && routes.confidence >= 50) {
    score += 14;
    pushSignal({
      reasons,
      signals,
      reason: "movimento casa incerto",
      signal: "home:route_uncertain",
    });
  } else if (freshRoute && routes.confidence >= 60) {
    score += 10;
    pushSignal({
      reasons,
      signals,
      reason: `routine stanza recente: ${recentRoute?.path}`,
      signal: "home:route_recent",
    });
  }
  if (activeRooms.length >= 2) {
    score += 12;
    pushSignal({
      reasons,
      signals,
      reason: `piu stanze attive: ${activeRooms.join(", ")}`,
      signal: "home:rooms_active",
    });
  } else if (activeRooms.length === 1) {
    score += 6;
    signals.push("home:room_active");
  }
  if (media.length) {
    score += activeRooms.length ? 10 : 6;
    pushSignal({
      reasons,
      signals,
      reason: `media attivi: ${media.map((item) => item.name).slice(0, 2).join(", ")}`,
      signal: "home:media_active",
    });
  }
  if (state.occupancyStatus === "empty" && emptyHours !== null && emptyHours >= 3) {
    score += 12;
    pushSignal({
      reasons,
      signals,
      reason: `casa vuota da circa ${Math.floor(emptyHours)} ore`,
      signal: "home:empty_long",
    });
  } else if (
    ["one_person_home", "multiple_people_home", "activity_detected"].includes(
      state.occupancyStatus
    )
  ) {
    score += 8;
    signals.push(`home:${state.occupancyStatus}`);
  }
  if (automationSignals.length || suggestions.length) {
    score += suggestions.includes("review_appliance_load") ? 16 : 8;
    pushSignal({
      reasons,
      signals,
      reason: "suggerimento casa gia disponibile",
      signal: "home:suggestion",
    });
  }
  if (activePattern) {
    score += 8;
    pushSignal({
      reasons,
      signals,
      reason: `pattern casa attivo: ${activePattern.title || activePattern.pattern_type}`,
      signal: "home:pattern",
    });
  }
  if (learnedRules.length || automationControls.length) {
    score += 6;
    signals.push("home:learned_context");
  }
  if (state.confidence < 40 && !riskSignals.length && !highPriorityHomeEvent) {
    score -= 10;
    signals.push("home:low_confidence");
  }

  const finalScore = clampScore(score);
  const concreteSignals = signals.filter(
    (signal) => !["home:room_active", "home:learned_context", "home:low_confidence"].includes(signal)
  ).length;
  const confidence = clampScore(
    Number(state.confidence || 0) * 0.35 +
      Number(routes.confidence || 0) * 0.2 +
      Number(comfortRisk.confidence || 0) * 0.25 +
      (concreteSignals >= 3 ? 20 : concreteSignals >= 2 ? 12 : concreteSignals ? 6 : 0)
  );

  return {
    score: finalScore,
    confidence,
    level: homeLevel(finalScore),
    reasons: Array.from(new Set(reasons)).slice(0, 8),
    signals: Array.from(new Set(signals)).slice(0, 12),
  };
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
  homeAssessment,
  peopleAssessment,
}: {
  snapshot: GhostBrainSnapshotCore;
  decision: DecisionSnapshot;
  openLoops: UnifiedSituationModel["recentOpenLoops"];
  locationEvents: UnifiedSituationModel["recentLocationEvents"];
  homeEvents: UnifiedSituationModel["recentHomeEvents"];
  behaviorSignals: string[];
  homeAssessment: SituationHomeAssessment;
  peopleAssessment: SituationPeopleAssessment;
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
  const highPriorityOpenLoop = openLoops.find((loop) => loop.priority >= 8);
  const importantAction = (snapshot.actions || []).find(
    (item) => Number(item.priority || 0) >= 8
  );
  const importantGoal = (snapshot.goals.activeGoals || []).find(
    (item) => Number(item.importance || 0) >= 8
  );
  const memorySignal =
    Boolean(snapshot.memory.activeMemories?.length) ||
    Boolean(snapshot.memory.episodicMemories?.length) ||
    Boolean(snapshot.memory.topics?.length);

  let score = 0;
  if (homeAssessment.level === "critical") {
    score += 35;
    pushSignal({
      reasons,
      signals,
      reason: homeAssessment.reasons[0] || "segnale casa critico",
      signal: "home:critical",
    });
  } else if (homeAssessment.level === "relevant" && homeAssessment.confidence >= 45) {
    score += 18;
    pushSignal({
      reasons,
      signals,
      reason: homeAssessment.reasons[0] || "segnale casa rilevante",
      signal: "home:relevant",
    });
  } else if (homeAssessment.level === "active" && homeAssessment.confidence >= 55) {
    score += 8;
    pushSignal({
      reasons,
      signals,
      reason: "attivita casa contestuale",
      signal: "home:contextual_activity",
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
  if (peopleAssessment.score >= 65 && peopleAssessment.confidence >= 50) {
    score += 16;
    const person = peopleAssessment.relevantPeople[0];
    pushSignal({
      reasons,
      signals,
      reason: `persona molto rilevante ora: ${person?.name || "persona"}`,
      signal: "people:high_relevance",
    });
  } else if (peopleAssessment.score >= 35 && peopleAssessment.confidence >= 40) {
    score += 8;
    pushSignal({
      reasons,
      signals,
      reason: "segnale persona collegato al momento",
      signal: "people:contextual_relevance",
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

function messageAgeHours(message: any) {
  return hoursSince(
    message?.updated_at ||
      message?.created_at ||
      message?.answered_at ||
      message?.read_at
  );
}

function isProtectedAction(action: {
  action: SituationPolicyAction;
  dedupeKey: string | null;
  sourceSignals: string[];
}) {
  if (action.action !== "remind") return false;
  return Boolean(
    action.dedupeKey?.startsWith("policy_calendar_") ||
      action.dedupeKey === "policy_home_safety" ||
      action.sourceSignals.includes("calendar:imminent_event") ||
      action.sourceSignals.includes("home:risk_signal")
  );
}

function categoryForAction(action: SituationPolicyAction) {
  if (action === "remind") return "agenda";
  if (action === "suggest_action") return "suggestion";
  return "observation";
}

function messageMatchesAction({
  message,
  dedupeKey,
  reason,
}: {
  message: any;
  dedupeKey: string | null;
  reason: string;
}) {
  const key = clean(dedupeKey);
  const logicalKey = clean(message?.logical_key);
  const text = textFor(message);
  const target = clean(dedupeKey || reason);

  if (key && logicalKey && key === logicalKey) return true;
  if (!target || !text) return false;

  return Boolean(
    text.includes(target) ||
      target.includes(text) ||
      (logicalKey && target.includes(logicalKey))
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
    .some((message) => messageMatchesAction({ message, dedupeKey, reason }));
}

function buildLearningAssessment({
  snapshot,
  action,
}: {
  snapshot: GhostBrainSnapshotCore;
  action: {
    action: SituationPolicyAction;
    priority: number;
    reason: string;
    sourceSignals: string[];
    dedupeKey: string | null;
    suppressGenericCuriosity: boolean;
  };
}): SituationLearningAssessment {
  const reasons: string[] = [];
  const signals: string[] = [];
  const penalties: string[] = [];
  const recent = snapshot.proactive.recent || [];
  const handled = snapshot.proactive.handledRecent || [];
  const protectedAction = isProtectedAction(action);
  const actionCategory = categoryForAction(action.action);
  let repeat = 0;
  let disturbance = 0;

  const similarRecent = recent.filter((message) => {
    const age = messageAgeHours(message);
    return (
      (age ?? Infinity) <= 48 &&
      messageMatchesAction({
        message,
        dedupeKey: action.dedupeKey,
        reason: action.reason,
      })
    );
  });
  const similarHandled = handled.filter((message) => {
    const age = messageAgeHours(message);
    return (
      (age ?? Infinity) <= 14 * 24 &&
      messageMatchesAction({
        message,
        dedupeKey: action.dedupeKey,
        reason: action.reason,
      })
    );
  });
  const answeredSimilar = similarHandled.filter(
    (message) => clean(message.status) === "answered"
  );
  const negativeSimilar = similarHandled.filter((message) =>
    ["dismissed", "expired"].includes(clean(message.status))
  );
  const sameCategoryNegative = handled.filter((message) => {
    const age = messageAgeHours(message);
    return (
      (age ?? Infinity) <= 14 * 24 &&
      clean(message.category) === clean(actionCategory) &&
      ["dismissed", "expired"].includes(clean(message.status))
    );
  });

  if (similarRecent.length) {
    repeat += protectedAction ? 2 : 5;
    reasons.push("card simile ancora recente o visibile");
    penalties.push("tema gia visibile di recente");
    signals.push("learning:recent_similar_visible");
  }

  if (negativeSimilar.length) {
    repeat += protectedAction ? 2 : 5;
    disturbance += protectedAction ? 1 : 3;
    reasons.push("card simile gia ignorata o scaduta");
    penalties.push("feedback negativo recente su tema simile");
    signals.push("learning:similar_negative_feedback");
  }

  if (answeredSimilar.length) {
    repeat = Math.max(0, repeat - 3);
    disturbance = Math.max(0, disturbance - 2);
    reasons.push("tema simile ha avuto risposta utile");
    signals.push("learning:similar_answered");
  }

  if (recent.length >= 3) {
    disturbance += protectedAction ? 1 : 3;
    penalties.push("molte card visibili di recente");
    signals.push("learning:many_recent_cards");
  } else if (recent.length >= 2) {
    disturbance += protectedAction ? 0 : 1;
    signals.push("learning:some_recent_cards");
  }

  if (sameCategoryNegative.length >= 2) {
    disturbance += protectedAction ? 1 : 3;
    penalties.push("categoria spesso ignorata di recente");
    signals.push("learning:category_negative_feedback");
  }

  const confidence = clampScore(
    similarRecent.length * 25 +
      negativeSimilar.length * 25 +
      answeredSimilar.length * 20 +
      Math.min(30, recent.length * 8 + handled.length * 3)
  );

  return {
    repeatRisk: riskLevel(repeat),
    disturbanceRisk: riskLevel(disturbance),
    confidence,
    reasons: Array.from(new Set(reasons)).slice(0, 6),
    signals: Array.from(new Set(signals)).slice(0, 8),
    penalties: Array.from(new Set(penalties)).slice(0, 6),
  };
}

function buildValueAssessment({
  snapshot,
  decision,
  action,
  openLoops,
  locationEvents,
  homeEvents,
  momentAssessment,
  homeAssessment,
  peopleAssessment,
  learningAssessment,
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
  homeAssessment: SituationHomeAssessment;
  peopleAssessment: SituationPeopleAssessment;
  learningAssessment: SituationLearningAssessment;
}): SituationValueAssessment {
  const reasons: string[] = [];
  const penalties: string[] = [];
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
  const strongHomeSignal =
    homeAssessment.score >= 55 &&
    homeAssessment.confidence >= 45 &&
    homeAssessment.signals.some((signal) =>
      [
        "home:risk",
        "home:location_mismatch",
        "home:event_high",
        "home:comfort",
        "home:route_uncertain",
        "home:suggestion",
      ].includes(signal)
    );
  const mediumHomeSignal =
    homeAssessment.score >= 25 &&
    homeAssessment.confidence >= 45 &&
    !homeAssessment.signals.every((signal) =>
      ["home:room_active", "home:learned_context", "home:low_confidence"].includes(signal)
    );
  const knownPlace = Boolean(snapshot.location.situation.currentPlace);
  const knownPlaceDetail = snapshot.location.significantPlaces.some(
    (place) =>
      clean(place.label) === clean(snapshot.location.situation.currentPlace) ||
      clean(place.category) === clean(snapshot.location.situation.category)
  );
  const strongPeopleSignal =
    peopleAssessment.score >= 65 &&
    peopleAssessment.confidence >= 50 &&
    peopleAssessment.signals.some((signal) =>
      [
        "people:open_loop",
        "people:shared_event",
        "people:present_home",
        "people:place_link",
        "people:project_link",
      ].includes(signal)
    );
  const mediumPeopleSignal =
    peopleAssessment.score >= 35 &&
    peopleAssessment.confidence >= 40 &&
    !peopleAssessment.signals.every((signal) =>
      ["people:weak_or_intrusive_signal", "people:important_person"].includes(signal)
    );
  const memorySignal =
    Boolean(snapshot.memory.activeMemories?.length) ||
    Boolean(snapshot.memory.episodicMemories?.length) ||
    Boolean(snapshot.memory.topics?.length);

  let utility = 0;
  if (action.action === "remind") utility += 8;
  if (action.action === "ask_followup") utility += 6;
  if (action.action === "create_card") utility += 5;
  if (action.action === "suggest_action") utility += 4;
  if (strongHomeSignal) {
    utility += homeAssessment.level === "critical" ? 8 : 5;
    reasons.push("segnale casa utile");
  } else if (mediumHomeSignal) {
    utility += 2;
    reasons.push("contesto casa attivo");
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
  if (strongPeopleSignal) {
    utility += 5;
    reasons.push("persona rilevante nel momento");
  } else if (mediumPeopleSignal) {
    utility += 2;
    reasons.push("segnale persona contestuale");
  }
  if (memorySignal) utility += 2;
  if (momentAssessment.level === "exceptional") utility += 6;
  else if (momentAssessment.level === "important") utility += 4;
  else if (momentAssessment.level === "interesting") utility += 2;

  let urgency = 0;
  if (nextEvent?.minutes !== null && nextEvent?.minutes !== undefined) {
    if (Number(nextEvent.minutes) <= 30) urgency += 10;
    else if (Number(nextEvent.minutes) <= 90) urgency += 7;
    else if (Number(nextEvent.minutes) <= 180) urgency += 4;
  }
  if (recentLocationSignal) urgency += 3;
  if (homeAssessment.level === "critical") urgency += 6;
  else if (strongHomeSignal) urgency += 3;
  if (highPriorityOpenLoop) urgency += 2;
  if (momentAssessment.level === "exceptional") urgency += 4;
  else if (momentAssessment.level === "important") urgency += 2;

  let contextFit = 0;
  if (knownPlace) contextFit += 3;
  if (knownPlaceDetail) contextFit += 2;
  if (recentLocationSignal) contextFit += 2;
  if (mediumHomeSignal) contextFit += 3;
  if (strongHomeSignal) contextFit += 2;
  if (strongPeopleSignal) contextFit += 3;
  else if (mediumPeopleSignal) contextFit += 1;
  if (action.sourceSignals.length >= 3) contextFit += 2;
  if (snapshot.signals.context.length >= 3) contextFit += 2;
  if (!decision.missingContext.includes("no_fresh_location")) contextFit += 1;
  if (momentAssessment.confidence >= 70) contextFit += 2;
  if (momentAssessment.signals.length >= 3) contextFit += 2;

  let signalQuality = 0;
  if (knownPlace) signalQuality += 2;
  if (Number(snapshot.location.situation.confidence || 0) >= 70) signalQuality += 2;
  if (Number(snapshot.home.state.confidence || 0) >= 60) signalQuality += 2;
  if (homeAssessment.confidence >= 70) signalQuality += 2;
  else if (homeAssessment.confidence >= 45 && mediumHomeSignal) signalQuality += 1;
  if (snapshot.signals.context.length >= 2) signalQuality += 2;
  if (strongPeopleSignal) signalQuality += 2;
  else if (mediumPeopleSignal) signalQuality += 1;
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
  if (action.action === "ask_followup" && decision.userSituation.mentalLoad !== "low") {
    disturbance += 2;
  }
  if (learningAssessment.disturbanceRisk === "high") disturbance += 5;
  else if (learningAssessment.disturbanceRisk === "medium") disturbance += 2;

  let repeat = 0;
  if (learningAssessment.repeatRisk === "high") repeat += 7;
  else if (learningAssessment.repeatRisk === "medium") repeat += 3;
  penalties.push(...learningAssessment.penalties);

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
  homeAssessment,
  peopleAssessment,
}: {
  snapshot: GhostBrainSnapshotCore;
  decision: DecisionSnapshot;
  openLoops: UnifiedSituationModel["recentOpenLoops"];
  locationEvents: UnifiedSituationModel["recentLocationEvents"];
  homeEvents: UnifiedSituationModel["recentHomeEvents"];
  momentAssessment: SituationMomentAssessment;
  homeAssessment: SituationHomeAssessment;
  peopleAssessment: SituationPeopleAssessment;
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
    homeAssessment.score >= 55 && homeAssessment.confidence >= 45
      ? "home:relevant_signal"
      : null,
    peopleAssessment.score >= 65 && peopleAssessment.confidence >= 50
      ? "people:high_relevance"
      : null,
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

  const learningAssessment = buildLearningAssessment({
    snapshot,
    action,
  });
  const valueAssessment = buildValueAssessment({
    snapshot,
    decision,
    action,
    openLoops,
    locationEvents,
    homeEvents,
    momentAssessment,
    homeAssessment,
    peopleAssessment,
    learningAssessment,
  });
  const valuedAction = applyValueAssessment({
    action,
    value: valueAssessment,
    decision,
  });

  return {
    ...valuedAction,
    learningAssessment,
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
  const homeAssessment = buildHomeAssessment({
    snapshot,
    homeEvents,
  });
  const peopleAssessment = buildPeopleAssessment({
    snapshot,
  });
  const momentAssessment = buildMomentAssessment({
    snapshot,
    decision,
    openLoops,
    locationEvents,
    homeEvents,
    behaviorSignals,
    homeAssessment,
    peopleAssessment,
  });
  const action = chooseAction({
    snapshot,
    decision,
    openLoops,
    locationEvents,
    homeEvents,
    momentAssessment,
    homeAssessment,
    peopleAssessment,
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
    homeAssessment,
    peopleAssessment,
    momentAssessment,
    learningAssessment: action.learningAssessment,
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
