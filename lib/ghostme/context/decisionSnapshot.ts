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
    | "review_appliance_load"
    | "consider_climate_cooling"
    | "consider_light_for_active_room"
    | "check_calendar"
    | "enrich_people_graph"
    | "review_relationship_open_loop"
    | "check_shared_event"
    | "enrich_relationship_context"
    | "continue_project"
    | "review_project_tasks"
    | "revive_project"
    | "reduce_project_load"
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
  if (snapshot.signals.simple?.homeMismatch) return true;
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
  const comfortSignals = snapshot.home.comfortRisk?.comfortSignals || [];
  const riskSignals = snapshot.home.comfortRisk?.riskSignals || [];
  const relationshipMemory = snapshot.people.relationshipMemory;

  if (snapshot.calendar.today.length || snapshot.calendar.upcoming.length) {
    priorities.push("calendar_events_available");
  }

  if (snapshot.goals.pendingActions.length) {
    priorities.push("pending_actions_available");
  }

  if (snapshot.goals.activeGoals.length) {
    priorities.push("active_goals_available");
  }

  if (snapshot.projects.importantProject?.status === "active") {
    priorities.push("project_focus");
  }

  if (snapshot.projects.stalledProjects.length || snapshot.projects.openTasks.length >= 6) {
    priorities.push("project_attention");
  }

  if (
    snapshot.projects.importantProject &&
    ["paused", "stalled"].includes(snapshot.projects.importantProject.status)
  ) {
    priorities.push("project_recovery");
  }

  if (snapshot.home.state.occupancyStatus !== "unknown") {
    priorities.push(`home_${snapshot.home.state.occupancyStatus}`);
  }

  if (hasHomeLocationMismatch(snapshot)) {
    priorities.push("home_mismatch");
  }

  if (
    riskSignals.includes("possible_power_overload") ||
    riskSignals.includes("multiple_appliances_active") ||
    riskSignals.includes("appliance_conflict")
  ) {
    priorities.push("home_power_risk");
  }

  if (
    comfortSignals.includes("hot_home") ||
    comfortSignals.includes("cold_home") ||
    comfortSignals.includes("humid_home") ||
    comfortSignals.includes("low_light_with_presence")
  ) {
    priorities.push("home_comfort_attention");
  }

  if (snapshot.home.routes?.possibleMovement === "uncertain_movement") {
    priorities.push("home_route_attention");
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

  if (relationshipMemory?.sharedEvents.length) {
    priorities.push("relationship_event");
  }

  if (relationshipMemory?.openLoops.length) {
    priorities.push("relationship_open_loop");
  }

  if (
    relationshipMemory?.recentMentions.length ||
    relationshipMemory?.sharedEvents.length ||
    relationshipMemory?.openLoops.length
  ) {
    priorities.push("relationship_attention");
  }

  return unique(priorities).slice(0, 8);
}

function buildWarnings(snapshot: GhostBrainSnapshot) {
  const warnings: string[] = [];
  const locationFresh = isRecent(snapshot.location.situation.lastChangedAt);
  const comfortSignals = snapshot.home.comfortRisk?.comfortSignals || [];
  const riskSignals = snapshot.home.comfortRisk?.riskSignals || [];
  const relationshipMemory = snapshot.people.relationshipMemory;

  if (snapshot.location.situation.currentPlace && !locationFresh) {
    warnings.push("location_stale");
  }

  if (hasHomeLocationMismatch(snapshot)) {
    warnings.push("home_location_mismatch");
  }

  if (!snapshot.people.items.length && hasRelationalMemory(snapshot)) {
    warnings.push("people_empty_but_relationship_memory_present");
  }

  if (
    snapshot.people.items.length > 0 &&
    !relationshipMemory?.recentMentions.length &&
    !relationshipMemory?.sharedEvents.length &&
    !relationshipMemory?.openLoops.length
  ) {
    warnings.push("relationship_context_sparse");
  }

  if ((relationshipMemory?.openLoops.length || 0) >= 3) {
    warnings.push("relationship_open_loops_many");
  }

  if (snapshot.goals.pendingActions.length >= 6) {
    warnings.push("many_pending_actions");
  }

  if (snapshot.projects.stalledProjects.length) {
    warnings.push("project_stalled");
  }

  if (snapshot.projects.openTasks.length >= 6) {
    warnings.push("project_overloaded");
  }

  if (!snapshot.projects.activeProjects.length) {
    warnings.push("no_active_project");
  }

  if (hasDuplicateProactive(snapshot)) {
    warnings.push("duplicate_recent_proactive");
  }

  if (snapshot.home.routes?.possibleMovement === "uncertain_movement") {
    warnings.push("home_route_uncertain_movement");
  }

  if (
    riskSignals.includes("possible_power_overload") ||
    riskSignals.includes("multiple_appliances_active")
  ) {
    warnings.push("home_power_risk");
  }

  if (riskSignals.includes("appliance_conflict")) {
    warnings.push("home_appliance_conflict");
  }

  if (comfortSignals.includes("hot_home")) {
    warnings.push("home_comfort_hot");
  }

  if (comfortSignals.includes("cold_home")) {
    warnings.push("home_comfort_cold");
  }

  if (comfortSignals.includes("humid_home")) {
    warnings.push("home_humidity_high");
  }

  return unique(warnings);
}

function buildMissingContext(snapshot: GhostBrainSnapshot) {
  const missing: string[] = [];
  const locationFresh = isRecent(snapshot.location.situation.lastChangedAt);

  if (snapshot.signals.simple?.needsPeopleEnrichment || !snapshot.people.items.length) {
    missing.push("no_people_graph");
  }
  if (!snapshot.calendar.today.length && !snapshot.calendar.upcoming.length) {
    missing.push("no_calendar_events");
  }
  if (!snapshot.goals.activeGoals.length) missing.push("no_goals");
  if (!snapshot.goals.pendingActions.length) missing.push("no_pending_actions");
  if (
    snapshot.signals.simple?.needsLocationClarification ||
    !snapshot.location.situation.currentPlace ||
    !locationFresh
  ) {
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
  const homeSuggestions = snapshot.home.comfortRisk?.suggestions || [];
  const relationshipMemory = snapshot.people.relationshipMemory;

  if (snapshot.signals.simple?.hasUpcomingEvent) {
    actions.push("review_calendar");
  }
  if (snapshot.signals.simple?.hasPendingActions) {
    actions.push("review_pending_actions");
  }
  if (snapshot.signals.simple?.homeMismatch || warnings.includes("home_location_mismatch")) {
    actions.push("clarify_home_location");
  }
  if (warnings.includes("home_route_uncertain_movement")) {
    actions.push("review_house_route");
  }
  if (
    warnings.includes("home_power_risk") ||
    homeSuggestions.includes("review_appliance_load")
  ) {
    actions.push("review_appliance_load");
  }
  if (
    warnings.includes("home_comfort_hot") ||
    homeSuggestions.includes("consider_climate_cooling")
  ) {
    actions.push("consider_climate_cooling");
  }
  if (
    warnings.includes("home_comfort_cold") ||
    homeSuggestions.includes("consider_climate_heating")
  ) {
    actions.push("consider_heating");
  }
  if (homeSuggestions.includes("consider_light_for_active_room")) {
    actions.push("consider_light_for_active_room");
  }
  if (snapshot.projects.importantProject?.status === "active") {
    actions.push("continue_project");
  }
  if (snapshot.projects.openTasks.length) {
    actions.push("review_project_tasks");
  }
  if (snapshot.projects.stalledProjects.length) {
    actions.push("revive_project");
  }
  if (warnings.includes("project_overloaded")) {
    actions.push("reduce_project_load");
  }
  if (snapshot.projects.importantProject?.relatedGoals.length) {
    actions.push("review_project_goal");
  }
  if (snapshot.signals.simple?.needsGoalReview) actions.push("review_active_goals");
  if (warnings.includes("location_stale") || missingContext.includes("no_fresh_location")) {
    actions.push("clarify_location");
  }
  if (missingContext.includes("no_people_graph")) actions.push("enrich_people_graph");
  if (relationshipMemory?.openLoops.length) {
    actions.push("review_relationship_open_loops");
  }
  if (
    warnings.includes("relationship_context_sparse") ||
    (snapshot.people.items.length > 0 && !relationshipMemory?.recentMentions.length)
  ) {
    actions.push("enrich_relationship_context");
  }
  if (relationshipMemory?.sharedEvents.length) {
    actions.push("check_shared_event");
  }
  if (
    relationshipMemory?.relationships.length &&
    !relationshipMemory?.recentMentions.length &&
    !relationshipMemory?.openLoops.length
  ) {
    actions.push("reconnect_with_person");
  }
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
  if (snapshot.signals.simple?.calendarPressure) {
    return "calendar_attention";
  }

  if (warnings.includes("home_location_mismatch")) {
    return "home_state_incoherent";
  }

  if (snapshot.signals.simple?.hasPendingActions) {
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

  if (snapshot.signals.simple?.highMentalLoad) {
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
  const homeSuggestions = snapshot.home.comfortRisk?.suggestions || [];
  const relationshipMemory = snapshot.people.relationshipMemory;

  if (warnings.includes("home_power_risk")) {
    return "review_appliance_load";
  }

  if (snapshot.signals.simple?.homeMismatch || warnings.includes("home_location_mismatch")) {
    return "clarify_home_location";
  }

  if (
    warnings.includes("home_comfort_hot") ||
    homeSuggestions.includes("consider_climate_cooling")
  ) {
    return "consider_climate_cooling";
  }

  if (homeSuggestions.includes("consider_light_for_active_room")) {
    return "consider_light_for_active_room";
  }

  if (warnings.includes("project_overloaded")) {
    return "reduce_project_load";
  }

  if (
    snapshot.projects.importantProject?.status === "stalled" ||
    (!snapshot.projects.activeProjects.length && snapshot.projects.stalledProjects.length)
  ) {
    return "revive_project";
  }

  if (
    snapshot.projects.importantProject?.status === "active" &&
    snapshot.projects.importantProject.pendingActions.length
  ) {
    return "review_project_tasks";
  }

  if (snapshot.projects.importantProject?.status === "active") {
    return "continue_project";
  }

  if (relationshipMemory?.openLoops.length) {
    return "review_relationship_open_loop";
  }

  if (relationshipMemory?.sharedEvents.length) {
    return "check_shared_event";
  }

  if (snapshot.signals.simple?.hasPendingActions) {
    return "review_pending_actions";
  }

  if (snapshot.signals.simple?.calendarPressure) {
    return "check_calendar";
  }

  if (
    snapshot.signals.simple?.needsPeopleEnrichment ||
    missingContext.includes("no_people_graph")
  ) {
    return "enrich_people_graph";
  }

  if (warnings.includes("relationship_context_sparse")) {
    return "enrich_relationship_context";
  }

  if (snapshot.signals.simple?.hasOpenGoals) {
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
  if (snapshot.signals.simple?.doNotDisturb) return true;

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
