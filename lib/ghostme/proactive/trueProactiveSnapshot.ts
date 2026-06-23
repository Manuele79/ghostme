import type { DecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";
import type { GhostBrainSnapshotCore } from "@/lib/ghostme/context/reasoningService";

export type TrueProactiveCandidate = {
  type:
    | "home_safety"
    | "imminent_calendar"
    | "important_open_loop"
    | "project_focus"
    | "high_confidence_curiosity"
    | "relationship_attention"
    | "event_follow_up"
    | "linked_calendar_action"
    | "stalled_goal"
    | "home_empty_long"
    | "routine_change";
  kind:
    | "insight"
    | "pattern"
    | "suggestion"
    | "smart_reminder"
    | "memory_link"
    | "curiosity";
  priorityBand: "critical" | "high" | "normal" | "low";
  title: string;
  reason: string;
  priority: number;
  confidence: number;
  source: string;
};

export type SuppressedTrueProactiveCandidate = TrueProactiveCandidate & {
  suppressionReason:
    | "duplicate"
    | "already_active"
    | "already_handled"
    | "weak_curiosity"
    | "low_value"
    | "do_not_disturb"
    | "selection_limit";
};

export type TrueProactiveSnapshot = {
  candidates: TrueProactiveCandidate[];
  selected: TrueProactiveCandidate[];
  suppressed: SuppressedTrueProactiveCandidate[];
  reasons: string[];
  confidence: number;
  lastUpdated: string | null;
};

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

function normalize(value: any) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function priorityBand(priority: number): TrueProactiveCandidate["priorityBand"] {
  if (priority >= 9) return "critical";
  if (priority >= 7) return "high";
  if (priority >= 4) return "normal";
  return "low";
}

function candidate(
  value: Omit<TrueProactiveCandidate, "priorityBand">
): TrueProactiveCandidate {
  return { ...value, priorityBand: priorityBand(value.priority) };
}

function latestTimestamp(values: Array<string | null | undefined>) {
  let latest: string | null = null;
  let latestTime = 0;

  for (const value of values) {
    if (!value) continue;

    const time = new Date(value).getTime();
    if (Number.isNaN(time) || time <= latestTime) continue;

    latest = value;
    latestTime = time;
  }

  return latest;
}

function minutesUntil(value: any) {
  const time = new Date(value || "").getTime();
  if (Number.isNaN(time)) return null;
  return Math.round((time - Date.now()) / 60000);
}

function rowText(row: any) {
  return normalize(
    `${row?.title || ""} ${row?.description || ""} ${row?.content || ""}`
  );
}

function sharesConcreteTerms(left: any, right: any) {
  const ignored = new Set([
    "azione", "attivita", "evento", "oggi", "domani", "fare", "con", "per",
    "del", "della", "dei", "delle", "un", "una", "il", "la", "lo",
  ]);
  const leftTerms = new Set(
    rowText(left).split(" ").filter((term) => term.length >= 4 && !ignored.has(term))
  );
  return rowText(right)
    .split(" ")
    .some((term) => term.length >= 4 && leftTerms.has(term));
}

function hoursSince(value: any) {
  if (!value) return null;
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? (Date.now() - time) / (60 * 60 * 1000) : null;
}

function isRecent(row: any, days = 7) {
  const value =
    row?.updated_at || row?.created_at || row?.event_date || row?.start_at;
  const timestamp = new Date(value || 0).getTime();
  return (
    Number.isFinite(timestamp) &&
    timestamp >= Date.now() - days * 24 * 60 * 60 * 1000
  );
}

function candidateTextMatchesMessage(
  candidate: TrueProactiveCandidate,
  message: any
) {
  const title = normalize(candidate.title);
  const content = normalize(`${message?.title || ""} ${message?.message || ""}`);
  return Boolean(title && title.length >= 4 && content.includes(title));
}

function buildRawCandidates({
  snapshot,
  decision,
}: {
  snapshot: GhostBrainSnapshotCore;
  decision: DecisionSnapshot;
}) {
  const candidates: TrueProactiveCandidate[] = [];
  const riskSignals = snapshot.home.comfortRisk.riskSignals || [];
  const seriousHomeRisk = riskSignals.find((signal) =>
    ["possible_power_overload", "multiple_appliances_active", "appliance_conflict"].includes(
      signal
    )
  );

  if (seriousHomeRisk) {
    candidates.push(candidate({
      type: "home_safety",
      kind: "smart_reminder",
      title: "Attenzione carico casa",
      reason: "Ci sono più carichi attivi insieme: controlla che sia tutto intenzionale.",
      priority: 10,
      confidence: clamp(snapshot.home.comfortRisk.confidence),
      source: "home.comfortRisk",
    }));
  }

  const futureEvents = [
    ...(snapshot.calendar.today || []),
    ...(snapshot.calendar.upcoming || []),
  ]
    .map((event) => ({
      event,
      minutes: minutesUntil(event.start_at || event.remind_at),
    }))
    .filter(
      (entry): entry is { event: any; minutes: number } =>
        entry.minutes !== null && entry.minutes >= 0 && entry.minutes <= 90
    )
    .sort((left, right) => left.minutes - right.minutes);
  const nextEvent = futureEvents[0];

  if (nextEvent) {
    candidates.push(candidate({
      type: "imminent_calendar",
      kind: "smart_reminder",
      title: nextEvent.event.title || "Evento imminente",
      reason: `${nextEvent.event.title || "Hai un evento"} tra ${nextEvent.minutes} minuti.`,
      priority: nextEvent.minutes <= 30 ? 9 : 8,
      confidence: 90,
      source: "calendar",
    }));
  }

  const relationshipLoop = [...(snapshot.people.relationshipMemory.openLoops || [])]
    .sort(
      (left, right) => Number(right.priority || 0) - Number(left.priority || 0)
    )
    .find((loop) => Number(loop.priority || 0) >= 7);
  const importantAction = [...(snapshot.actions || [])]
    .sort(
      (left, right) => Number(right.priority || 0) - Number(left.priority || 0)
    )
    .find((action) => Number(action.priority || 0) >= 8);
  const openLoop = relationshipLoop || importantAction;

  if (openLoop) {
    candidates.push(candidate({
      type: "important_open_loop",
      kind: relationshipLoop ? "smart_reminder" : "suggestion",
      title: openLoop.title || openLoop.description || "Azione importante aperta",
      reason: relationshipLoop
        ? `Hai ancora un punto aperto che riguarda ${relationshipLoop.people?.join(", ") || openLoop.title}.`
        : `Hai ancora aperto: ${openLoop.title || openLoop.description}.`,
      priority: 8,
      confidence: clamp(55 + Number(openLoop.priority || 0) * 5),
      source: relationshipLoop ? "people.relationshipMemory" : "goals.actions",
    }));
  }

  const focus = snapshot.projects.advisor.currentFocus;
  if (focus && (focus.nextAction || focus.status === "stalled")) {
    candidates.push(candidate({
      type: "project_focus",
      kind: "suggestion",
      title: focus.project,
      reason: focus.nextAction
        ? `Per ${focus.project}, il prossimo passo utile è: ${focus.nextAction}.`
        : `Potresti dedicare 30 minuti a ${focus.project}.`,
      priority: 7,
      confidence: clamp(snapshot.projects.advisor.confidence),
      source: "projects.advisor",
    }));
  }

  const curiosity = (snapshot.curiosity.curiosities || []).find(
    (entry) => entry.priority >= 8 && entry.confidence >= 70
  );
  if (curiosity) {
    candidates.push(candidate({
      type: "high_confidence_curiosity",
      kind: "curiosity",
      title: curiosity.title,
      reason: curiosity.description,
      priority: 6,
      confidence: clamp(curiosity.confidence),
      source: `curiosity:${curiosity.type}`,
    }));
  }

  const relationshipAttention = snapshot.people.socialSuggestions.relationshipAttention.find(
    (attention) =>
      attention.priority >= 3 &&
      !attention.signals.every((signal) => signal === "relationship_context_sparse")
  );
  if (relationshipAttention && relationshipAttention.priority >= 3) {
    const isPattern = relationshipAttention.signals.some((signal) =>
      ["frequent_recent_mentions", "many_recent_connections"].includes(signal)
    );
    candidates.push(candidate({
      type: "relationship_attention",
      kind: isPattern ? "pattern" : "smart_reminder",
      title: relationshipAttention.person,
      reason: relationshipAttention.reason,
      priority: relationshipAttention.signals.includes("person_with_open_loop") ? 7 : 6,
      confidence: clamp(snapshot.people.socialSuggestions.confidence),
      source: "people.socialSuggestions",
    }));
  }

  const recentCompletedEvent = [...(snapshot.calendar.completed || [])]
    .map((event) => ({
      event,
      hours: hoursSince(event.start_at || event.remind_at || event.updated_at),
    }))
    .filter(
      (entry): entry is { event: any; hours: number } =>
        entry.hours !== null && entry.hours >= 1 && entry.hours <= 72
    )
    .sort((left, right) => left.hours - right.hours)[0]?.event;
  if (recentCompletedEvent?.title) {
    candidates.push(candidate({
      type: "event_follow_up",
      kind: "curiosity",
      title: recentCompletedEvent.title,
      reason: `Come è andata con ${recentCompletedEvent.title}?`,
      priority: 7,
      confidence: 85,
      source: "calendar.completed",
    }));
  }

  const linkedEventAction = [...(snapshot.calendar.upcoming || []), ...(snapshot.calendar.today || [])]
    .flatMap((event) =>
      (snapshot.actions || [])
        .filter((action) => sharesConcreteTerms(event, action))
        .map((action) => ({ event, action }))
    )[0];
  if (linkedEventAction) {
    candidates.push(candidate({
      type: "linked_calendar_action",
      kind: "smart_reminder",
      title: linkedEventAction.event.title || "Evento con azione collegata",
      reason: `Per ${linkedEventAction.event.title}, hai ancora aperto: ${linkedEventAction.action.title || linkedEventAction.action.description}.`,
      priority: 7,
      confidence: 82,
      source: "calendar+actions",
    }));
  }

  const staleGoal = (snapshot.goals.activeGoals || []).find((goal) => {
    const age = hoursSince(goal.updated_at || goal.created_at);
    return (
      Number(goal.importance || 0) >= 7 &&
      age !== null &&
      age >= 7 * 24 &&
      !(snapshot.actions || []).some(
        (action) => isRecent(action, 14) && sharesConcreteTerms(goal, action)
      )
    );
  });
  if (staleGoal) {
    candidates.push(candidate({
      type: "stalled_goal",
      kind: "curiosity",
      title: staleGoal.title || "Obiettivo senza passi recenti",
      reason: `${staleGoal.title || "Questo obiettivo"} è ancora aperto, ma non risultano azioni collegate recenti. Qual è il prossimo passo concreto?`,
      priority: 6,
      confidence: clamp(60 + Number(staleGoal.importance || 0) * 3),
      source: "goals+actions",
    }));
  }

  const emptyHours = hoursSince(snapshot.home.state.occupancySince);
  if (
    snapshot.home.state.occupancyStatus === "empty" &&
    emptyHours !== null &&
    emptyHours >= 3 &&
    emptyHours <= 24
  ) {
    candidates.push(candidate({
      type: "home_empty_long",
      kind: "insight",
      title: "Casa vuota da parecchio",
      reason: `La casa risulta vuota da circa ${Math.floor(emptyHours)} ore.`,
      priority: 6,
      confidence: clamp(snapshot.home.state.confidence),
      source: "home.state",
    }));
  }

  const recentRoute = snapshot.home.routes.recentRoute;
  if (
    recentRoute &&
    snapshot.home.routes.confidence >= 60 &&
    !snapshot.home.routes.knownRoutes.some((route) => route.path === recentRoute.path)
  ) {
    candidates.push(candidate({
      type: "routine_change",
      kind: "pattern",
      title: "Routine di casa diversa",
      reason: `Il passaggio recente ${recentRoute.from} → ${recentRoute.to} non compare nelle routine note.`,
      priority: 5,
      confidence: clamp(snapshot.home.routes.confidence),
      source: "home.routes",
    }));
  }

  const importantProject = snapshot.projects.importantProject;
  const recentProjectMemories = (importantProject?.recentMemories || []).filter(
    (memory) => isRecent(memory)
  );
  const mentalState = snapshot.profile?.mentalState;
  if (
    importantProject &&
    recentProjectMemories.length >= 2 &&
    Number(mentalState?.stanchezza || 0) >= 7
  ) {
    candidates.push(
      candidate({
        type: "project_focus",
        kind: "insight",
        title: `${importantProject.name} e stanchezza`,
        reason: `Negli ultimi giorni sei tornato spesso su ${importantProject.name} e la stanchezza è alta.`,
        priority: 7,
        confidence: clamp(Math.max(importantProject.confidence, 70)),
        source: "memory+projects+mental_state",
      })
    );
  }

  if (importantProject && recentProjectMemories.length >= 3) {
    candidates.push(
      candidate({
        type: "project_focus",
        kind: "pattern",
        title: `Ritorno frequente su ${importantProject.name}`,
        reason: `Negli ultimi giorni torni spesso su ${importantProject.name}: sembra una priorità stabile.`,
        priority: 6,
        confidence: clamp(importantProject.confidence),
        source: "projects.recentMemories",
      })
    );
  }

  const linkedProject = snapshot.projects.projects.find(
    (project) => project.relatedPeople.length && project.relatedGoals.length
  );
  if (linkedProject) {
    const person = linkedProject.relatedPeople[0]?.name;
    const goal = linkedProject.relatedGoals[0]?.title;
    candidates.push(
      candidate({
        type: "project_focus",
        kind: "memory_link",
        title: `${linkedProject.name}: persone e obiettivi`,
        reason: `${linkedProject.name} collega ${person || "una persona importante"} al goal ${goal || "attivo"}.`,
        priority: 6,
        confidence: clamp(linkedProject.confidence),
        source: "projects+people+goals",
      })
    );
  }

  return candidates;
}

function isSelected(candidate: TrueProactiveCandidate) {
  if (candidate.priorityBand === "critical" && candidate.confidence >= 55) return true;
  if (candidate.priorityBand === "high" && candidate.confidence >= 55) return true;
  if (
    candidate.priorityBand === "normal" &&
    candidate.confidence >= 70 &&
    ["insight", "pattern", "memory_link", "smart_reminder"].includes(
      candidate.kind
    )
  ) {
    return true;
  }
  if (
    candidate.type === "high_confidence_curiosity" &&
    candidate.confidence >= 80
  ) {
    return true;
  }
  if (
    candidate.type === "relationship_attention" &&
    candidate.confidence >= 75
  ) {
    return true;
  }
  if (candidate.type === "stalled_goal" && candidate.confidence >= 75) {
    return true;
  }
  if (candidate.type === "routine_change" && candidate.confidence >= 60) {
    return true;
  }
  return false;
}

export function buildTrueProactiveSnapshot({
  snapshot,
  decision,
}: {
  snapshot: GhostBrainSnapshotCore;
  decision: DecisionSnapshot;
}): TrueProactiveSnapshot {
  const rawCandidates = buildRawCandidates({ snapshot, decision }).sort(
    (left, right) =>
      right.priority + right.confidence / 100 -
      (left.priority + left.confidence / 100)
  );
  const eligible: TrueProactiveCandidate[] = [];
  const suppressed: SuppressedTrueProactiveCandidate[] = [];
  const seen = new Set<string>();

  for (const candidate of rawCandidates) {
    const key = `${candidate.kind}|${normalize(candidate.title)}`;
    let suppressionReason: SuppressedTrueProactiveCandidate["suppressionReason"] | null =
      null;

    if (!key || seen.has(key)) suppressionReason = "duplicate";
    else if (
      candidate.type === "high_confidence_curiosity" &&
      candidate.confidence < 70
    ) {
      suppressionReason = "weak_curiosity";
    } else if (
      (snapshot.proactive.handledRecent || []).some((message) =>
        candidateTextMatchesMessage(candidate, message)
      )
    ) {
      suppressionReason = "already_handled";
    } else if (
      (snapshot.proactive.recent || []).some((message) =>
        candidateTextMatchesMessage(candidate, message)
      )
    ) {
      suppressionReason = "already_active";
    } else if (
      decision.doNotDisturb &&
      candidate.type !== "home_safety" &&
      !(candidate.type === "imminent_calendar" && candidate.priority === 9)
    ) {
      suppressionReason = "do_not_disturb";
    } else if (candidate.priority < 5 || candidate.confidence < 45) {
      suppressionReason = "low_value";
    }

    seen.add(key);
    if (suppressionReason) {
      suppressed.push({ ...candidate, suppressionReason });
    } else {
      eligible.push(candidate);
    }
  }

  const bandLimits: Record<TrueProactiveCandidate["priorityBand"], number> = {
    critical: 1,
    high: 2,
    normal: 3,
    low: 0,
  };
  const bandCounts: Record<TrueProactiveCandidate["priorityBand"], number> = {
    critical: 0,
    high: 0,
    normal: 0,
    low: 0,
  };
  const candidates: TrueProactiveCandidate[] = [];
  const maxSelectedCandidates = 3;
  for (const candidate of eligible) {
    if (candidates.length >= maxSelectedCandidates) {
      suppressed.push({ ...candidate, suppressionReason: "selection_limit" });
      continue;
    }
    if (bandCounts[candidate.priorityBand] >= bandLimits[candidate.priorityBand]) {
      suppressed.push({ ...candidate, suppressionReason: "selection_limit" });
      continue;
    }
    bandCounts[candidate.priorityBand] += 1;
    candidates.push(candidate);
  }

  const selected: TrueProactiveCandidate[] = [];
  for (const candidate of candidates) {
    if (isSelected(candidate)) selected.push(candidate);
    else suppressed.push({ ...candidate, suppressionReason: "low_value" });
  }

  const reasons = Array.from(
    new Set([
      ...selected.map((candidate) => `selected:${candidate.type}:${candidate.reason}`),
      ...suppressed.map(
        (candidate) => `suppressed:${candidate.type}:${candidate.suppressionReason}`
      ),
    ])
  );

  return {
    candidates,
    selected,
    suppressed,
    reasons,
    confidence: selected.length
      ? Math.round(
          selected.reduce((total, candidate) => total + candidate.confidence, 0) /
            selected.length
        )
      : 0,
    lastUpdated: latestTimestamp([
      snapshot.generatedAt,
      snapshot.curiosity.lastUpdated,
      snapshot.projects.advisor.lastUpdated,
      snapshot.people.relationshipMemory.lastUpdated,
      snapshot.people.socialSuggestions.lastUpdated,
      snapshot.home.comfortRisk.lastUpdated,
      snapshot.home.routes.lastUpdated,
      ...snapshot.calendar.today.map((event) => event.updated_at || event.start_at),
      ...snapshot.calendar.upcoming.map(
        (event) => event.updated_at || event.start_at
      ),
      ...snapshot.proactive.recent.map((message) => message.created_at),
      ...snapshot.proactive.handledRecent.map((message) => message.created_at),
    ]),
  };
}
