import type { DecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";
import type { GhostBrainSnapshotCore } from "@/lib/ghostme/context/reasoningService";

export type TrueProactiveCandidate = {
  type:
    | "home_safety"
    | "imminent_calendar"
    | "important_open_loop"
    | "project_focus"
    | "high_confidence_curiosity"
    | "relationship_attention";
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
    candidates.push({
      type: "home_safety",
      title: "Attenzione carico casa",
      reason: seriousHomeRisk,
      priority: 10,
      confidence: clamp(snapshot.home.comfortRisk.confidence),
      source: "home.comfortRisk",
    });
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
    candidates.push({
      type: "imminent_calendar",
      title: nextEvent.event.title || "Evento imminente",
      reason: `event_within_${nextEvent.minutes}_minutes`,
      priority: nextEvent.minutes <= 30 ? 9 : 8,
      confidence: 90,
      source: "calendar",
    });
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
    candidates.push({
      type: "important_open_loop",
      title: openLoop.title || openLoop.description || "Azione importante aperta",
      reason: relationshipLoop
        ? "important_relationship_open_loop"
        : "high_priority_action_intent",
      priority: 8,
      confidence: clamp(55 + Number(openLoop.priority || 0) * 5),
      source: relationshipLoop ? "people.relationshipMemory" : "goals.actions",
    });
  }

  const focus = snapshot.projects.advisor.currentFocus;
  if (focus && (focus.nextAction || focus.status === "stalled")) {
    candidates.push({
      type: "project_focus",
      title: focus.project,
      reason:
        focus.nextAction ||
        decision.nextBestAction ||
        snapshot.projects.advisor.suggestedNextSteps[0]?.reason ||
        "project_attention",
      priority: 7,
      confidence: clamp(snapshot.projects.advisor.confidence),
      source: "projects.advisor",
    });
  }

  const curiosity = (snapshot.curiosity.curiosities || []).find(
    (entry) => entry.priority >= 8 && entry.confidence >= 70
  );
  if (curiosity) {
    candidates.push({
      type: "high_confidence_curiosity",
      title: curiosity.title,
      reason: curiosity.description,
      priority: 6,
      confidence: clamp(curiosity.confidence),
      source: `curiosity:${curiosity.type}`,
    });
  }

  const relationshipAttention = snapshot.people.socialSuggestions.relationshipAttention[0];
  if (relationshipAttention?.priority >= 3) {
    candidates.push({
      type: "relationship_attention",
      title: relationshipAttention.person,
      reason: relationshipAttention.signals.join(","),
      priority: 5,
      confidence: clamp(snapshot.people.socialSuggestions.confidence),
      source: "people.socialSuggestions",
    });
  }

  return candidates;
}

function isSelected(candidate: TrueProactiveCandidate) {
  if (candidate.priority >= 7 && candidate.confidence >= 55) return true;
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
    const key = normalize(candidate.title);
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

  const candidates = eligible.slice(0, 3);
  for (const candidate of eligible.slice(3)) {
    suppressed.push({ ...candidate, suppressionReason: "selection_limit" });
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
