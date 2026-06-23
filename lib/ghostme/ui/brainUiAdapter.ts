import type { BrainData, HomeUiModel } from "@/components/ghost/types";
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

function roomLabel(value: unknown) {
  const room = String(value || "").trim().toLowerCase();
  const labels: Record<string, string> = {
    salotto: "Salotto",
    sala: "Sala",
    scale: "Scale",
    cucina: "Cucina",
    camera: "Camera",
    armadio: "Armadio",
    bagno: "Bagno",
    fuori_casa: "Fuori casa",
  };
  return labels[room] || room.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
}

function buildHomeUiModel(
  house: GhostBrainSnapshot["home"] | null
): HomeUiModel | null {
  const state = house?.state;
  if (!state) return null;
  const people = (["manu", "vale"] as const).map((key) => {
    const person = state.people.find((item) => item.person === key);
    const label: "Manu" | "Vale" = key === "manu" ? "Manu" : "Vale";
    const known = Boolean(person?.presenceKnown);
    return {
      key,
      label,
      isHome: Boolean(known && person?.isHome),
      known,
      detail: !known
        ? "Dato non disponibile"
        : person?.isHome
          ? "A casa"
          : "Fuori casa",
    };
  });
  const manu = people[0];
  const vale = people[1];
  const statusLabel =
    manu.known && vale.known && manu.isHome && vale.isHome
      ? "Manu e Vale in casa"
      : manu.known && vale.known && manu.isHome
        ? "Solo Manu in casa"
        : manu.known && vale.known && vale.isHome
          ? "Solo Vale in casa"
          : manu.known && vale.known
            ? "Casa vuota"
            : "Stato casa non sicuro";
  const lastUpdatedTime = new Date(state.lastUpdated || 0).getTime();
  const fresh =
    Number.isFinite(lastUpdatedTime) &&
    Date.now() - lastUpdatedTime <= 6 * 60 * 60 * 1000;
  const reliable = state.confidence >= 70 && fresh;

  return {
    statusLabel,
    confidenceLabel: reliable
      ? `Confidenza ${state.confidence}%`
      : "Dato non sicuro",
    reliable,
    activeRooms: Array.from(new Set((state.activeRooms || []).map(roomLabel))),
    people,
  };
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
  const house = data.house ?? snapshot?.home ?? null;

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
    house,
    homeUi: buildHomeUiModel(house),
    decisionSnapshot:
      data.decisionSnapshot ?? snapshotWithDecision?.decisionSnapshot ?? null,
  };
}
