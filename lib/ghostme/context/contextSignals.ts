import { GhostSituation } from "@/lib/ghostme/situation/situationEngine";

export type ContextSignal = {
  key: string;
  category:
    | "calendar"
    | "location"
    | "goal"
    | "memory"
    | "behavior"
    | "home"
    | "observation";

  priority: number;
  reason: string;
};

function minutesUntil(value?: string | null) {
  if (!value) return null;

  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return null;

  return Math.round((target - Date.now()) / 60000);
}

function cleanPlace(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function isHome(place: string) {
  return ["casa", "home"].includes(place);
}

function isWork(place: string) {
  return ["lavoro", "work", "ufficio"].includes(place);
}

export function buildContextSignals(
  situation: GhostSituation
): ContextSignal[] {
  const signals: ContextSignal[] = [];

  const place = cleanPlace(situation.currentPlace);
  const placeCategory = cleanPlace(situation.currentPlaceCategory);
  const locationConfidence = Number(situation.locationConfidence || 0);
  const time = cleanPlace(situation.timeContext);

  const calendarToday = situation.calendarToday || [];
  const upcomingEvents = situation.upcomingEvents || [];
  const goals = situation.activeGoals || [];
  const actions = situation.pendingActions || [];
  const patterns = situation.behaviorPatterns || [];
  const observations = situation.recentObservations || [];
  const topics = situation.dominantTopics || [];
  const links = situation.importantLinks || [];

  const nextEvent = upcomingEvents[0];
  const nextEventMinutes = minutesUntil(
    nextEvent?.start_at || nextEvent?.remind_at
  );

  // CALENDARIO
  if (nextEventMinutes !== null && nextEventMinutes >= 0 && nextEventMinutes <= 30) {
    signals.push({
      key: "event_soon_30",
      category: "calendar",
      priority: 10,
      reason: `Evento entro ${nextEventMinutes} minuti: ${nextEvent?.title || "evento"}`,
    });
  } else if (
    nextEventMinutes !== null &&
    nextEventMinutes > 30 &&
    nextEventMinutes <= 90
  ) {
    signals.push({
      key: "event_soon_90",
      category: "calendar",
      priority: 8,
      reason: `Evento entro ${nextEventMinutes} minuti: ${nextEvent?.title || "evento"}`,
    });
  }

  if (calendarToday.length > 0) {
    signals.push({
      key: "calendar_today",
      category: "calendar",
      priority: 7,
      reason: `Ci sono ${calendarToday.length} eventi oggi.`,
    });
  }

  // POSIZIONE
  if (!place) {
    signals.push({
      key: "unknown_place",
      category: "location",
      priority: 6,
      reason: "Il luogo attuale non è riconosciuto.",
    });
  } else {
    signals.push({
      key: "known_place",
      category: "location",
      priority: 4,
      reason: `Luogo attuale riconosciuto: ${situation.currentPlace}`,
    });
  }

    if (placeCategory && placeCategory !== "unknown") {
    signals.push({
        key: `place_category_${placeCategory}`,
        category: "location",
        priority: 7,
        reason: `Il luogo attuale è classificato come ${placeCategory}.`,
    });
    }

    if (placeCategory === "supermarket" || placeCategory === "shop") {
    signals.push({
        key: "shopping_place",
        category: "location",
        priority: 8,
        reason: "L'utente si trova in un luogo collegato alla spesa o agli acquisti.",
    });
    }

    if (placeCategory === "restaurant" || placeCategory === "bar") {
    signals.push({
        key: "food_place",
        category: "location",
        priority: 7,
        reason: "L'utente si trova in un luogo collegato a cibo o pausa.",
    });
    }

    if (placeCategory === "fuel") {
    signals.push({
        key: "fuel_place",
        category: "location",
        priority: 7,
        reason: "L'utente si trova in un luogo collegato al rifornimento.",
    });
    }

    if (!place && locationConfidence >= 70) {
    signals.push({
        key: "precise_unknown_place",
        category: "location",
        priority: 8,
        reason: "La posizione è precisa ma il luogo non è ancora salvato.",
    });
    }

  if (place && !isHome(place)) {
    signals.push({
      key: "away_from_home",
      category: "location",
      priority: 6,
      reason: `Utente fuori casa: ${situation.currentPlace}`,
    });
  }

  if (time === "pranzo" && place && !isHome(place)) {
    signals.push({
      key: "lunch_outside_home",
      category: "location",
      priority: 8,
      reason: "È ora di pranzo e l'utente non risulta a casa.",
    });
  }

  if (time === "sera" && place && !isHome(place) && !isWork(place)) {
    signals.push({
      key: "evening_outside_known_routine",
      category: "location",
      priority: 6,
      reason: "Sera fuori casa: possibile contesto utile.",
    });
  }

  // GOALS / AZIONI
  const importantGoals = goals.filter((g: any) => Number(g.importance || 0) >= 7);

  if (importantGoals.length > 0) {
    signals.push({
      key: "important_active_goal",
      category: "goal",
      priority: 7,
      reason: `Goal importante attivo: ${importantGoals[0]?.title || "goal"}`,
    });
  }

  if (actions.length > 0) {
    signals.push({
      key: "pending_actions",
      category: "goal",
      priority: 7,
      reason: `Ci sono ${actions.length} azioni aperte.`,
    });
  }

  const urgentActions = actions.filter((a: any) => Number(a.priority || 0) >= 7);

  if (urgentActions.length > 0) {
    signals.push({
      key: "important_pending_action",
      category: "goal",
      priority: 8,
      reason: `Azione aperta importante: ${urgentActions[0]?.title || "azione"}`,
    });
  }

  // PATTERN
  const strongPatterns = patterns.filter(
    (p: any) =>
      Number(p.confidence || 0) >= 7 ||
      Number(p.occurrences || 0) >= 5
  );

  if (strongPatterns.length > 0) {
    signals.push({
      key: "strong_behavior_pattern",
      category: "behavior",
      priority: 7,
      reason: `Pattern forte: ${
        strongPatterns[0]?.title || strongPatterns[0]?.pattern_type || "pattern"
      }`,
    });
  }

  // OSSERVAZIONI
  const unknownPlaceEvents = observations.filter(
    (o: any) => o.event_type === "place_unknown_detected"
  );

  if (unknownPlaceEvents.length >= 3) {
    signals.push({
      key: "repeated_unknown_place",
      category: "observation",
      priority: 9,
      reason: "Luogo sconosciuto rilevato più volte: potrebbe essere da salvare.",
    });
  }

  const homeArrived = observations.find(
    (o: any) => o.event_type === "home_arrived"
  );

  const homeLeft = observations.find(
    (o: any) => o.event_type === "home_left"
  );

  if (homeArrived && time === "sera") {
    signals.push({
      key: "evening_home_arrival",
      category: "observation",
      priority: 5,
      reason: "Rientro a casa rilevato in fascia sera.",
    });
  }

  if (homeLeft && nextEventMinutes !== null && nextEventMinutes <= 120) {
    signals.push({
      key: "left_home_before_event",
      category: "calendar",
      priority: 8,
      reason: "Uscita da casa rilevata con evento prossimo.",
    });
  }

  // MEMORIA / LINK
  if (topics.length >= 5) {
    signals.push({
      key: "many_active_topics",
      category: "memory",
      priority: 4,
      reason: "Molti topic attivi: possibile contesto personale ricco.",
    });
  }

  if (links.length >= 5) {
    signals.push({
      key: "strong_memory_graph",
      category: "memory",
      priority: 5,
      reason: "Sono presenti collegamenti forti tra topic personali.",
    });
  }

  return signals
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 12);
}