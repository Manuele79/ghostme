import type { GhostBrainSnapshotCore } from "@/lib/ghostme/context/reasoningService";
import type { DecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";

export type SituationPolicyAction =
  | "say_nothing"
  | "ask_followup"
  | "create_card"
  | "remind"
  | "suggest_action"
  | "wait";

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
  mentalInfluence: {
    load: "low" | "medium" | "high";
    reason: string;
  };
  confidence: number;
  recommendedAction: SituationPolicyAction;
  interventionReason: string;
  interventionPriority: number;
  suppressGenericCuriosity: boolean;
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

function chooseAction({
  snapshot,
  decision,
  openLoops,
  locationEvents,
}: {
  snapshot: GhostBrainSnapshotCore;
  decision: DecisionSnapshot;
  openLoops: UnifiedSituationModel["recentOpenLoops"];
  locationEvents: UnifiedSituationModel["recentLocationEvents"];
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

  if (
    riskSignals.includes("possible_power_overload") ||
    riskSignals.includes("multiple_appliances_active") ||
    riskSignals.includes("appliance_conflict")
  ) {
    return {
      action: "remind" as const,
      priority: 10,
      reason: "Home Assistant segnala un rischio casa concreto",
      suppressGenericCuriosity: true,
    };
  }

  if (nextEvent?.minutes !== null && Number(nextEvent?.minutes) <= 90) {
    return {
      action: "remind" as const,
      priority: Number(nextEvent.minutes) <= 30 ? 9 : 8,
      reason: `Evento imminente: ${nextEvent.event.title || "evento"}`,
      suppressGenericCuriosity: true,
    };
  }

  if (isAtHome && recentHomeArrival && recentUnknownPlace && openLoops.length) {
    return {
      action: "ask_followup" as const,
      priority: 9,
      reason: "Rientro a casa dopo luogo sconosciuto collegato a un open loop",
      suppressGenericCuriosity: true,
    };
  }

  if (openLoops.some((loop) => loop.priority >= 8)) {
    return {
      action: "create_card" as const,
      priority: 8,
      reason: "C'e un open loop recente ad alta priorita",
      suppressGenericCuriosity: true,
    };
  }

  if (decision.nextBestAction !== "no_action") {
    return {
      action: "suggest_action" as const,
      priority: 6,
      reason: `Next best action: ${decision.nextBestAction}`,
      suppressGenericCuriosity: decision.userSituation.mentalLoad !== "low",
    };
  }

  if (decision.doNotDisturb) {
    return {
      action: "say_nothing" as const,
      priority: 1,
      reason: "Momento da non disturbare",
      suppressGenericCuriosity: true,
    };
  }

  return {
    action: "wait" as const,
    priority: 2,
    reason: "Nessun intervento ad alto valore ora",
    suppressGenericCuriosity: false,
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
  const action = chooseAction({
    snapshot,
    decision,
    openLoops,
    locationEvents,
  });
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
    mentalInfluence: mental,
    confidence: Math.max(
      Number(snapshot.location.situation.confidence || 0),
      Number(snapshot.home.state.confidence || 0),
      decision.userSituation.mentalLoad === "high" ? 65 : 50
    ),
    recommendedAction: action.action,
    interventionReason: action.reason,
    interventionPriority: action.priority,
    suppressGenericCuriosity: action.suppressGenericCuriosity,
    updatedAt: snapshot.generatedAt,
  };
}
