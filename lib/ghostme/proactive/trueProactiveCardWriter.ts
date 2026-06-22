import {
  normalizeProactiveText,
} from "@/lib/ghostme/proactive/proactiveMessageDedupe";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import type { TrueProactiveCandidate } from "@/lib/ghostme/proactive/trueProactiveSnapshot";
import { buildCuriosityCardLogicalKey } from "@/lib/ghostme/proactive/curiosityCardWriter";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { VISIBLE_PROACTIVE_STATUSES } from "@/lib/ghostme/proactive/proactiveCardLifecycle";

export type TrueProactiveCardCategory =
  | "observation"
  | "curiosity"
  | "project"
  | "social"
  | "suggestion";

const MAX_TRUE_PROACTIVE_CARDS = 6;

export function buildTrueProactiveLogicalKey(
  candidate: TrueProactiveCandidate
) {
  if (
    candidate.type === "high_confidence_curiosity" &&
    candidate.source.startsWith("curiosity:")
  ) {
    return buildCuriosityCardLogicalKey({
      type: candidate.source.slice("curiosity:".length),
      title: candidate.title,
    });
  }

  const stableTitle = normalizeProactiveText(candidate.title)
    .replace(/\s+/g, "_")
    .slice(0, 120);

  return `true_proactive_${candidate.kind}_${candidate.type}_${stableTitle || "untitled"}`;
}

export function mapTrueProactiveCategory(
  candidate: TrueProactiveCandidate
): TrueProactiveCardCategory {
  if (candidate.kind === "curiosity") return "curiosity";
  if (candidate.kind === "memory_link") return "project";
  if (candidate.kind === "insight" || candidate.kind === "pattern") {
    return "observation";
  }
  if (candidate.type === "home_safety") return "observation";
  if (candidate.type === "relationship_attention") return "social";
  return "suggestion";
}

export async function writeTrueProactiveCards({
  userId,
  selected,
}: {
  userId: string;
  selected: TrueProactiveCandidate[];
}) {
  const { data: activeCards, error } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("priority")
    .eq("user_id", userId)
    .in("status", VISIBLE_PROACTIVE_STATUSES);
  if (error) throw error;

  const bandFor = (priority: number) =>
    priority >= 9 ? "critical" : priority >= 7 ? "high" : priority >= 4 ? "normal" : "low";
  const limits = { critical: 1, high: 2, normal: 3, low: Infinity };
  const counts = { critical: 0, high: 0, normal: 0, low: 0 };
  for (const card of activeCards || []) {
    counts[bandFor(Number(card.priority || 0))] += 1;
  }

  const candidates: TrueProactiveCandidate[] = [];
  for (const proactiveCandidate of selected || []) {
    const band = proactiveCandidate.priorityBand;
    if (counts[band] >= limits[band]) continue;
    counts[band] += 1;
    candidates.push(proactiveCandidate);
    if (candidates.length >= MAX_TRUE_PROACTIVE_CARDS) break;
  }

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
