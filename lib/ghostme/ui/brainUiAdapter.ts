import type { BrainData } from "@/components/ghost/types";
import type { GhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";
import type { DecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";

type BrainApiResponse = {
  snapshot?: GhostBrainSnapshot | null;
  memories?: unknown;
  timeline?: unknown;
  goals?: unknown;
  mentalState?: unknown;
  actions?: unknown;
  calendarEvents?: unknown;
  proactiveMessage?: BrainData["proactiveMessage"];
  proactiveMessages?: unknown;
  people?: GhostBrainSnapshot["people"] | null;
  projects?: GhostBrainSnapshot["projects"] | null;
  curiosity?: GhostBrainSnapshot["curiosity"] | null;
  trueProactive?: GhostBrainSnapshot["trueProactive"] | null;
  house?: GhostBrainSnapshot["home"] | null;
  decisionSnapshot?: DecisionSnapshot | null;
};

function preferArray<T>(...candidates: unknown[]): T[] {
  let firstArray: T[] | null = null;

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    const candidateArray = candidate as T[];
    firstArray ??= candidateArray;
    if (candidateArray.length) return candidateArray;
  }

  return firstArray || [];
}

export function adaptBrainApiResponse(
  data: BrainApiResponse,
  previousActions: unknown = []
): BrainData {
  const snapshot = data.snapshot || null;
  const snapshotWithDecision = snapshot as
    | (GhostBrainSnapshot & { decisionSnapshot?: DecisionSnapshot | null })
    | null;
  const proactiveMessages = preferArray<BrainData["proactiveMessages"][number]>(
    data.proactiveMessages,
    snapshot?.proactive?.recent
  );
  const actionSources = [
    data.actions,
    snapshot?.actions,
    snapshot?.goals?.pendingActions,
  ];
  const actions = actionSources.some(Array.isArray)
    ? preferArray(...actionSources)
    : preferArray(previousActions, []);

  return {
    snapshot,
    memories: preferArray(data.memories, snapshot?.memory?.activeMemories),
    timeline: preferArray(data.timeline, snapshot?.memory?.timeline),
    goals: preferArray(data.goals, snapshot?.goals?.activeGoals),
    mentalState: data.mentalState ?? snapshot?.profile?.mentalState ?? null,
    actions,
    calendarEvents: preferArray(
      data.calendarEvents,
      snapshot?.calendar?.upcoming
    ),
    proactiveMessage: data.proactiveMessage || proactiveMessages[0] || null,
    proactiveMessages,
    people: data.people ?? snapshot?.people ?? null,
    projects: data.projects ?? snapshot?.projects ?? null,
    curiosity: data.curiosity ?? snapshot?.curiosity ?? null,
    trueProactive: data.trueProactive ?? snapshot?.trueProactive ?? null,
    house: data.house ?? snapshot?.home ?? null,
    decisionSnapshot:
      data.decisionSnapshot ?? snapshotWithDecision?.decisionSnapshot ?? null,
  };
}
