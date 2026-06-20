import type {
  CuriosityItem,
  CuriositySnapshot,
} from "@/lib/ghostme/curiosity/curiositySnapshot";
import { normalizeProactiveText } from "@/lib/ghostme/proactive/proactiveMessageDedupe";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";

const MAX_CURIOSITY_CARDS = 2;
const MIN_CURIOSITY_PRIORITY = 8;
const MIN_CURIOSITY_CONFIDENCE = 55;

export function buildCuriosityCardLogicalKey({
  type,
  title,
}: {
  type: string;
  title: string;
}) {
  const stableTitle = normalizeProactiveText(title)
    .replace(/\s+/g, "_")
    .slice(0, 120);

  return `curiosity_snapshot_${type}_${stableTitle || "untitled"}`;
}

export function selectImportantCuriosities(
  snapshot: CuriositySnapshot,
  preferredLogicalKeys: string[] = []
) {
  const preferred = new Set(preferredLogicalKeys);
  const eligible = [...(snapshot.curiosities || [])]
    .filter(
      (curiosity) =>
        curiosity.priority >= MIN_CURIOSITY_PRIORITY &&
        curiosity.confidence >= MIN_CURIOSITY_CONFIDENCE
    )
    .sort(
      (left, right) =>
        right.priority + right.confidence / 100 -
        (left.priority + left.confidence / 100)
    );
  const preferredCuriosities = eligible.filter((curiosity) =>
    preferred.has(buildCuriosityCardLogicalKey(curiosity))
  );
  const remainingCuriosities = eligible.filter(
    (curiosity) => !preferred.has(buildCuriosityCardLogicalKey(curiosity))
  );

  return [...preferredCuriosities, ...remainingCuriosities].slice(
    0,
    MAX_CURIOSITY_CARDS
  );
}

async function writeCuriosityCard(userId: string, curiosity: CuriosityItem) {
  await upsertProactiveMessage({
    userId,
    title: curiosity.title,
    message: curiosity.description,
    category: "curiosity",
    priority: curiosity.priority,
    logicalKey: buildCuriosityCardLogicalKey(curiosity),
  });
}

export async function writeCuriositySnapshotCards({
  userId,
  snapshot,
  preferredLogicalKeys = [],
}: {
  userId: string;
  snapshot: CuriositySnapshot;
  preferredLogicalKeys?: string[];
}) {
  const curiosities = selectImportantCuriosities(
    snapshot,
    preferredLogicalKeys
  );

  for (const curiosity of curiosities) {
    await writeCuriosityCard(userId, curiosity);
  }

  return { processed: curiosities.length };
}
