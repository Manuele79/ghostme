import {
  normalizeProactiveText,
} from "@/lib/ghostme/proactive/proactiveMessageDedupe";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import type { TrueProactiveCandidate } from "@/lib/ghostme/proactive/trueProactiveSnapshot";

export type TrueProactiveCardCategory =
  | "observation"
  | "curiosity"
  | "project"
  | "social"
  | "suggestion";

const MAX_TRUE_PROACTIVE_CARDS = 3;

const CATEGORY_BY_TYPE: Record<
  TrueProactiveCandidate["type"],
  TrueProactiveCardCategory
> = {
  home_safety: "observation",
  imminent_calendar: "suggestion",
  important_open_loop: "suggestion",
  project_focus: "project",
  high_confidence_curiosity: "curiosity",
  relationship_attention: "social",
};

export function buildTrueProactiveLogicalKey(
  candidate: TrueProactiveCandidate
) {
  const stableTitle = normalizeProactiveText(candidate.title)
    .replace(/\s+/g, "_")
    .slice(0, 120);

  return `true_proactive_${candidate.type}_${stableTitle || "untitled"}`;
}

export function mapTrueProactiveCategory(
  candidate: TrueProactiveCandidate
): TrueProactiveCardCategory {
  return CATEGORY_BY_TYPE[candidate.type];
}

export async function writeTrueProactiveCards({
  userId,
  selected,
}: {
  userId: string;
  selected: TrueProactiveCandidate[];
}) {
  const candidates = (selected || []).slice(0, MAX_TRUE_PROACTIVE_CARDS);

  for (const candidate of candidates) {
    await upsertProactiveMessage({
      userId,
      title: candidate.title,
      message: candidate.reason,
      category: mapTrueProactiveCategory(candidate),
      priority: candidate.priority,
      logicalKey: buildTrueProactiveLogicalKey(candidate),
    });
  }

  return { processed: candidates.length };
}
