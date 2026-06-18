import type { GhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";

export type DecisionSnapshot = {
  priorities: string[];
  suggestedFocus:
    | "focus_on_pending_actions"
    | "relax_recovery"
    | "calendar_attention"
    | "home_state_incoherent"
    | "memory_review"
    | "no_priority";
  possibleActions: string[];
  warnings: string[];
  missingContext: string[];
  userSituation: {
    currentPlace: string | null;
    homeConsistency: GhostBrainSnapshot["home"]["consistency"];
    pendingActionsCount: number;
    upcomingEventsCount: number;
    activeGoalsCount: number;
    importantPeopleCount: number;
    mentalLoad: "low" | "medium" | "high";
  };
  nextBestAction:
    | "review_pending_actions"
    | "clarify_home_location"
    | "check_calendar"
    | "enrich_people_graph"
    | "continue_project"
    | "no_action";
  doNotDisturb: boolean;
  generatedAt: string;
};

const LOCATION_FRESHNESS_WINDOW_MS = 2 * 60 * 60 * 1000;

function isRecent(value?: string | null, windowMs = LOCATION_FRESHNESS_WINDOW_MS) {
  if (!value) return false;

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;

  return Date.now() - time <= windowMs;
}

function clean(value: any) {
  return String(value || "").toLowerCase().trim();
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function hasRelationalMemory(snapshot: GhostBrainSnapshot) {
  return (snapshot.memory.activeMemories || []).some((memory) => {
    const text = `${memory.title || ""} ${memory.content || ""} ${memory.category || ""}`;
    return ["famiglia", "family", "friend", "amico", "moglie", "compagna"].some(
      (term) => clean(text).includes(term)
    );
  });
}

function hasDuplicateProactive(snapshot: GhostBrainSnapshot) {
  const titles = new Set<string>();

  for (const message of snapshot.proactive.recent || []) {
    const key = clean(message.title || message.message);
    if (!key) continue;
    if (titles.has(key)) return true;
    titles.add(key);
  }

  return false;
}

function isHomeLocation(snapshot: GhostBrainSnapshot) {
  const place = clean(snapshot.location.situation.currentPlace);
  const category = clean(snapshot.location.situation.category);
  return ["casa", "home"].includes(place) || category === "home";
}

function hasHomeLocationMismatch(snapshot: GhostBrainSnapshot) {
  if (snapshot.home.consistency?.mismatch) return true;

  const occupancy = snapshot.home.state.occupancyStatus;
  return (
    ["one_person_home", "multiple_people_home"].includes(occupancy) &&
    snapshot.location.situation.currentPlace &&
    !isHomeLocation(snapshot)
  );
}

function buildPriorities(snapshot: GhostBrainSnapshot) {
  const priorities: string[] = [];

  if (snapshot.calendar.today.length || snapshot.calendar.upcoming.length) {
    priorities.push("calendar_events_available");
  }

  if (snapshot.goals.pendingActions.length) {
    priorities.push("pending_actions_available");
  }

  if (snapshot.goals.activeGoals.length) {
    priorities.push("active_goals_available");
  }

  if (snapshot.home.state.occupancyStatus !== "unknown") {
    priorities.push(`home_${snapshot.home.state.occupancyStatus}`);
  }

  if (snapshot.proactive.recent.length) {
    priorities.push("recent_proactive_messages");
  }

  if (
    snapshot.memory.activeMemories.length ||
    snapshot.memory.episodicMemories.length ||
    snapshot.memory.summaries.length
  ) {
    priorities.push("memory_available");
  }

  if (snapshot.location.situation.currentPlace) {
    priorities.push("known_location");
  }

  return unique(priorities).slice(0, 8);
}

function buildWarnings(snapshot: GhostBrainSnapshot) {
  const warnings: string[] = [];
  const locationFresh = isRecent(snapshot.location.situation.lastChangedAt);

  if (snapshot.location.situation.currentPlace && !locationFresh) {
    warnings.push("location_stale");
  }

  if (hasHomeLocationMismatch(snapshot)) {
    warnings.push("home_location_mismatch");
  }

  if (!snapshot.people.items.length && hasRelationalMemory(snapshot)) {
    warnings.push("people_empty_but_relationship_memory_present");
  }

  if (snapshot.goals.pendingActions.length >= 6) {
    warnings.push("many_pending_actions");
  }

  if (hasDuplicateProactive(snapshot)) {
    warnings.push("duplicate_recent_proactive");
  }

  return unique(warnings);
}

function buildMissingContext(snapshot: GhostBrainSnapshot) {
  const missing: string[] = [];
  const locationFresh = isRecent(snapshot.location.situation.lastChangedAt);

  if (!snapshot.people.items.length) missing.push("no_people_graph");
  if (!snapshot.calendar.today.length && !snapshot.calendar.upcoming.length) {
    missing.push("no_calendar_events");
  }
  if (!snapshot.goals.activeGoals.length) missing.push("no_goals");
  if (!snapshot.goals.pendingActions.length) missing.push("no_pending_actions");
  if (!snapshot.location.situation.currentPlace || !locationFresh) {
    missing.push("no_fresh_location");
  }
  if (
    !snapshot.memory.activeMemories.length &&
    !snapshot.memory.episodicMemories.length &&
    !snapshot.memory.summaries.length
  ) {
    missing.push("no_memory");
  }
  if (snapshot.home.state.occupancyStatus === "unknown") {
    missing.push("no_home_state");
  }

  return unique(missing);
}

function buildPossibleActions({
  snapshot,
  warnings,
  missingContext,
}: {
  snapshot: GhostBrainSnapshot;
  warnings: string[];
  missingContext: string[];
}) {
  const actions: string[] = [];

  if (snapshot.calendar.today.length || snapshot.calendar.upcoming.length) {
    actions.push("review_calendar");
  }
  if (snapshot.goals.pendingActions.length) actions.push("review_pending_actions");
  if (warnings.includes("home_location_mismatch")) {
    actions.push("clarify_home_location");
  }
  if (snapshot.goals.activeGoals.length) actions.push("review_active_goals");
  if (warnings.includes("location_stale") || missingContext.includes("no_fresh_location")) {
    actions.push("clarify_location");
  }
  if (missingContext.includes("no_people_graph")) actions.push("enrich_people_graph");
  if (snapshot.memory.activeMemories.length) actions.push("review_memory_anchors");

  return unique(actions).slice(0, 8);
}

function chooseSuggestedFocus({
  snapshot,
  warnings,
}: {
  snapshot: GhostBrainSnapshot;
  warnings: string[];
}): DecisionSnapshot["suggestedFocus"] {
  if (snapshot.calendar.today.length || snapshot.calendar.upcoming.length) {
    return "calendar_attention";
  }

  if (warnings.includes("home_location_mismatch")) {
    return "home_state_incoherent";
  }

  if (snapshot.goals.pendingActions.length) {
    return "focus_on_pending_actions";
  }

  if (
    isHomeLocation(snapshot) &&
    ["one_person_home", "multiple_people_home"].includes(
      snapshot.home.state.occupancyStatus
    )
  ) {
    return "relax_recovery";
  }

  if (
    snapshot.memory.activeMemories.length ||
    snapshot.memory.episodicMemories.length
  ) {
    return "memory_review";
  }

  return "no_priority";
}

function getUpcomingEventsCount(snapshot: GhostBrainSnapshot) {
  return snapshot.calendar.today.length + snapshot.calendar.upcoming.length;
}

function mentalMetric(snapshot: GhostBrainSnapshot, key: string) {
  const value = snapshot.profile?.mentalState?.[key];
  return typeof value === "number" ? value : 0;
}

function buildMentalLoad(snapshot: GhostBrainSnapshot): DecisionSnapshot["userSituation"]["mentalLoad"] {
  const pendingActionsCount = snapshot.goals.pendingActions.length;
  const activeGoalsCount = snapshot.goals.activeGoals.length;
  const upcomingEventsCount = getUpcomingEventsCount(snapshot);
  const stress = mentalMetric(snapshot, "stress");
  const tiredness = mentalMetric(snapshot, "stanchezza");

  if (
    pendingActionsCount >= 6 ||
    activeGoalsCount >= 4 ||
    upcomingEventsCount >= 4 ||
    stress >= 7 ||
    tiredness >= 7
  ) {
    return "high";
  }

  if (
    pendingActionsCount >= 3 ||
    activeGoalsCount >= 2 ||
    upcomingEventsCount >= 2 ||
    stress >= 4 ||
    tiredness >= 4
  ) {
    return "medium";
  }

  return "low";
}

function buildUserSituation(snapshot: GhostBrainSnapshot): DecisionSnapshot["userSituation"] {
  return {
    currentPlace: snapshot.location.situation.currentPlace || null,
    homeConsistency: snapshot.home.consistency,
    pendingActionsCount: snapshot.goals.pendingActions.length,
    upcomingEventsCount: getUpcomingEventsCount(snapshot),
    activeGoalsCount: snapshot.goals.activeGoals.length,
    importantPeopleCount: snapshot.people.importantPeople.length,
    mentalLoad: buildMentalLoad(snapshot),
  };
}

function chooseNextBestAction({
  snapshot,
  warnings,
  missingContext,
}: {
  snapshot: GhostBrainSnapshot;
  warnings: string[];
  missingContext: string[];
}): DecisionSnapshot["nextBestAction"] {
  if (warnings.includes("home_location_mismatch")) {
    return "clarify_home_location";
  }

  if (snapshot.goals.pendingActions.length) {
    return "review_pending_actions";
  }

  if (snapshot.calendar.today.length || snapshot.calendar.upcoming.length) {
    return "check_calendar";
  }

  if (missingContext.includes("no_people_graph")) {
    return "enrich_people_graph";
  }

  if (snapshot.goals.activeGoals.length) {
    return "continue_project";
  }

  return "no_action";
}

function hasRelaxOrNightSignal(snapshot: GhostBrainSnapshot) {
  const signalText = [
    ...((snapshot.home.presence?.signals || []) as string[]),
    ...(snapshot.home.state.signals || []),
    ...(snapshot.signals.context || []).map(
      (signal) => `${signal.key} ${signal.category} ${signal.reason}`
    ),
  ]
    .map(clean)
    .join(" ");

  return (
    signalText.includes("night_mode") ||
    signalText.includes("notte") ||
    signalText.includes("relax")
  );
}

function buildDoNotDisturb(snapshot: GhostBrainSnapshot) {
  const hour = new Date().getHours();
  const tiredness = mentalMetric(snapshot, "stanchezza");

  return hour >= 23 || hour < 7 || tiredness >= 7 || hasRelaxOrNightSignal(snapshot);
}

export function buildDecisionSnapshot(
  snapshot: GhostBrainSnapshot
): DecisionSnapshot {
  const warnings = buildWarnings(snapshot);
  const missingContext = buildMissingContext(snapshot);

  return {
    priorities: buildPriorities(snapshot),
    suggestedFocus: chooseSuggestedFocus({ snapshot, warnings }),
    possibleActions: buildPossibleActions({
      snapshot,
      warnings,
      missingContext,
    }),
    warnings,
    missingContext,
    userSituation: buildUserSituation(snapshot),
    nextBestAction: chooseNextBestAction({
      snapshot,
      warnings,
      missingContext,
    }),
    doNotDisturb: buildDoNotDisturb(snapshot),
    generatedAt: new Date().toISOString(),
  };
}
