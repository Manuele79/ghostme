import type {
  CuriosityItem,
  CuriositySnapshot,
} from "@/lib/ghostme/curiosity/curiositySnapshot";
import { HIGH_VALUE_CURIOSITY_TYPES } from "@/lib/ghostme/curiosity/curiositySnapshot";
import { normalizeProactiveText } from "@/lib/ghostme/proactive/proactiveMessageDedupe";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
  preferredLogicalKeys: string[] = [],
  excludedLogicalKeys = new Set<string>()
) {
  const preferred = new Set(preferredLogicalKeys);
  const eligible = [...(snapshot.curiosities || [])]
    .filter(
      (curiosity) =>
        curiosity.priority >= MIN_CURIOSITY_PRIORITY &&
        curiosity.confidence >= MIN_CURIOSITY_CONFIDENCE &&
        !excludedLogicalKeys.has(buildCuriosityCardLogicalKey(curiosity))
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

  return [...preferredCuriosities, ...remainingCuriosities];
}

async function writeCuriosityCard(
  userId: string,
  curiosity: CuriosityItem,
  priority = curiosity.priority
) {
  await upsertProactiveMessage({
    userId,
    title: curiosity.title,
    message: curiosity.description,
    category: "curiosity",
    priority,
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
  const { data: history, error } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id, logical_key, created_at")
    .eq("user_id", userId)
    .eq("category", "curiosity")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  const askedLogicalKeys = new Set(
    (history || [])
      .map((card) => String(card.logical_key || ""))
      .filter(Boolean)
  );
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const cardsToday = (history || []).filter(
    (card) =>
      card.created_at &&
      new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Rome",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(card.created_at)) === today
  ).length;
  const normalDailyLimit = snapshot.memoryCompleteness >= 70 ? 1 : 2;
  const expandedDailyLimit =
    snapshot.memoryCompleteness < 45 && snapshot.highValueGaps >= 3
      ? Math.min(4, snapshot.highValueGaps)
      : normalDailyLimit;
  const remainingBudget = Math.max(0, expandedDailyLimit - cardsToday);
  if (!remainingBudget) return { processed: 0 };

  const eligible = selectImportantCuriosities(
    snapshot,
    preferredLogicalKeys,
    askedLogicalKeys
  );
  const normalSlots = Math.max(0, normalDailyLimit - cardsToday);
  const normalQuestions = eligible.slice(0, normalSlots);
  const selectedKeys = new Set(normalQuestions.map(buildCuriosityCardLogicalKey));
  const extraQuestions = eligible
    .filter(
      (curiosity) =>
        !selectedKeys.has(buildCuriosityCardLogicalKey(curiosity)) &&
        HIGH_VALUE_CURIOSITY_TYPES.has(curiosity.type) &&
        curiosity.priority >= 8 &&
        curiosity.confidence >= 60
    )
    .slice(0, Math.max(0, remainingBudget - normalQuestions.length));
  const curiosities = [...normalQuestions, ...extraQuestions].slice(
    0,
    remainingBudget
  );
  const extraQuestionKeys = new Set(
    extraQuestions.map(buildCuriosityCardLogicalKey)
  );

  for (const curiosity of curiosities) {
    await writeCuriosityCard(
      userId,
      curiosity,
      extraQuestionKeys.has(buildCuriosityCardLogicalKey(curiosity))
        ? Math.min(curiosity.priority, 6)
        : curiosity.priority
    );
  }

  return { processed: curiosities.length };
}
