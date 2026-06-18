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

  if (snapshot.actions.length) {
    priorities.push("pending_actions_available");
  }

  if (snapshot.goals.length) {
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

  if (snapshot.actions.length >= 6) {
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
  if (!snapshot.goals.length) missing.push("no_goals");
  if (!snapshot.actions.length) missing.push("no_pending_actions");
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
  if (snapshot.actions.length) actions.push("review_pending_actions");
  if (snapshot.goals.length) actions.push("review_active_goals");
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

  if (snapshot.actions.length) {
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
    generatedAt: new Date().toISOString(),
  };
}
