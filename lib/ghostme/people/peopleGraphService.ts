import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  extractMemoryPersonNames,
  isLikelyRealPerson,
  isPersonMemory,
  isPersonTopic,
  normalizePersonName,
} from "@/lib/ghostme/people/peopleSnapshot";
import { getPeopleGraphLinksForPeople } from "@/lib/ghostme/people/peopleGraphLinkService";

type PersonCandidate = {
  name: string;
  relationshipType: string | null;
  description: string | null;
  topicMentionCount: number;
  memoryEvidence: Set<string>;
  importance: number;
  confidence: number;
  lastMentionedAt: string | null;
  sources: Set<string>;
};

function clamp(value: number, min = 1, max = 10) {
  return Math.min(Math.max(value, min), max);
}

function latestTimestamp(left?: string | null, right?: string | null) {
  const leftTime = new Date(left || "").getTime();
  const rightTime = new Date(right || "").getTime();

  if (Number.isNaN(leftTime)) return right || null;
  if (Number.isNaN(rightTime)) return left || null;
  return rightTime > leftTime ? right || null : left || null;
}

function inferRelationshipType(category: unknown, text: unknown) {
  const cleanCategory = String(category || "").trim().toLowerCase();
  const cleanText = String(text || "").trim().toLowerCase();

  if (["family", "friend", "relationship", "colleague"].includes(cleanCategory)) {
    return cleanCategory;
  }
  if (
    [
      "moglie",
      "marito",
      "compagna",
      "compagno",
      "madre",
      "padre",
      "mamma",
      "papa",
      "papà",
      "sorella",
      "fratello",
      "figlia",
      "figlio",
    ].some((term) => cleanText.includes(term))
  ) {
    return "family";
  }
  if (["amica", "amico", "friend"].some((term) => cleanText.includes(term))) {
    return "friend";
  }
  if (["collega", "colleague"].some((term) => cleanText.includes(term))) {
    return "colleague";
  }

  return null;
}

function containsPersonName(text: unknown, normalizedName: string) {
  const normalizedText = normalizePersonName(text).replace(/[^a-z0-9]+/g, " ");
  const normalizedNeedle = normalizedName.replace(/[^a-z0-9]+/g, " ");
  return Boolean(
    normalizedNeedle && ` ${normalizedText} `.includes(` ${normalizedNeedle} `)
  );
}

function mergeCandidate(
  candidates: Map<string, PersonCandidate>,
  input: {
    name: string;
    relationshipType?: string | null;
    description?: string | null;
    topicMentionCount?: number;
    memoryEvidence?: string | null;
    importance?: number;
    confidence?: number;
    lastMentionedAt?: string | null;
    source: string;
  }
) {
  const key = normalizePersonName(input.name);
  if (!key) return;

  const existing = candidates.get(key);
  const candidate: PersonCandidate = existing || {
    name: input.name.trim(),
    relationshipType: null,
    description: null,
    topicMentionCount: 0,
    memoryEvidence: new Set<string>(),
    importance: 1,
    confidence: 0,
    lastMentionedAt: null,
    sources: new Set<string>(),
  };

  candidate.relationshipType =
    candidate.relationshipType || input.relationshipType || null;
  candidate.description = candidate.description || input.description || null;
  candidate.topicMentionCount = Math.max(
    candidate.topicMentionCount,
    Number(input.topicMentionCount || 0)
  );
  if (input.memoryEvidence) candidate.memoryEvidence.add(input.memoryEvidence);
  candidate.importance = Math.max(
    candidate.importance,
    Number(input.importance || 0)
  );
  candidate.confidence = Math.max(
    candidate.confidence,
    Number(input.confidence || 0)
  );
  candidate.lastMentionedAt = latestTimestamp(
    candidate.lastMentionedAt,
    input.lastMentionedAt
  );
  candidate.sources.add(input.source);
  candidates.set(key, candidate);
}

function logSyncError(
  stage: string,
  userId: string,
  error: { message?: string; code?: string } | null,
  name?: string
) {
  console.error("PEOPLE GRAPH SYNC ERROR", {
    stage,
    userId,
    name: name || null,
    code: error?.code || null,
    message: error?.message || "unknown_error",
  });
}

export async function upsertPersonFromTopic({
  userId,
  name,
  relationshipType,
  description,
  confidence = 60,
  source = "life_topics",
  mentionCount = 1,
  importance = 5,
  lastMentionedAt = null,
}: {
  userId: string;
  name: string;
  relationshipType?: string | null;
  description?: string | null;
  confidence?: number;
  source?: string;
  mentionCount?: number;
  importance?: number;
  lastMentionedAt?: string | null;
}) {
  if (!userId || !name?.trim()) return null;
  if (
    !isLikelyRealPerson({
      name,
      entity_type: "person",
      relationship_type: relationshipType || null,
      description: description || null,
    })
  ) {
    return null;
  }

  const normalizedName = normalizePersonName(name);
  const { data: existingRows, error: lookupError } = await supabaseAdmin
    .from("people_graph")
    .select("id, name, normalized_name, relationship_type, category, importance, confidence, description, source, status, mention_count, last_mentioned_at, updated_at")
    .eq("user_id", userId)
    .eq("normalized_name", normalizedName)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (lookupError) {
    logSyncError("lookup", userId, lookupError, name);
    return null;
  }

  const existing = existingRows?.[0] || null;
  const now = new Date().toISOString();
  const stablePayload = {
    user_id: userId,
    name: name.trim(),
    normalized_name: normalizedName,
    relationship_type:
      relationshipType || existing?.relationship_type || null,
    category: "person",
    importance: clamp(Math.round(Number(importance || 1))),
    confidence: Math.min(100, Math.max(0, Math.round(confidence))),
    description: description || existing?.description || null,
    source,
    status: "active",
    mention_count: Math.max(1, Math.round(Number(mentionCount || 1))),
    last_mentioned_at:
      lastMentionedAt || existing?.last_mentioned_at || now,
  };

  if (existing?.id) {
    const unchanged =
      existing.name === stablePayload.name &&
      existing.normalized_name === stablePayload.normalized_name &&
      (existing.relationship_type || null) === stablePayload.relationship_type &&
      existing.category === stablePayload.category &&
      Number(existing.importance || 0) === stablePayload.importance &&
      Number(existing.confidence || 0) === stablePayload.confidence &&
      (existing.description || null) === stablePayload.description &&
      existing.source === stablePayload.source &&
      existing.status === stablePayload.status &&
      Number(existing.mention_count || 0) === stablePayload.mention_count &&
      (existing.last_mentioned_at || null) === stablePayload.last_mentioned_at;

    if (unchanged) return existing;

    const { data, error } = await supabaseAdmin
      .from("people_graph")
      .update({ ...stablePayload, updated_at: now })
      .eq("id", existing.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      logSyncError("update", userId, error, name);
      return null;
    }

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("people_graph")
    .insert({ ...stablePayload, updated_at: now })
    .select()
    .single();

  if (error) {
    logSyncError("insert", userId, error, name);
    return null;
  }

  return data;
}

export async function syncPeopleGraphFromTopics(userId: string) {
  if (!userId) return { synced: 0, candidates: 0, errors: ["missing_user_id"] };

  const [topicsResult, memoriesResult] = await Promise.all([
    supabaseAdmin
      .from("life_topics")
      .select("id, topic, category, entity_type, description, notes, weight, relationship_strength, mention_count, last_mentioned_at, updated_at")
      .eq("user_id", userId)
      .neq("status", "archived")
      .limit(200),
    supabaseAdmin
      .from("memories_active")
      .select("id, title, content, category, importance, pinned, updated_at")
      .eq("user_id", userId)
      .or("category.eq.person,category.eq.family,category.eq.friend,category.eq.relationship,category.eq.colleague,title.ilike.Info su %,content.ilike.%moglie%,content.ilike.%marito%,content.ilike.%compagna%,content.ilike.%compagno%,content.ilike.%mamma%,content.ilike.%padre%,content.ilike.%amica%,content.ilike.%amico%,content.ilike.%collega%")
      .limit(100),
  ]);

  const errors: string[] = [];
  if (topicsResult.error) {
    errors.push(`life_topics:${topicsResult.error.message}`);
    logSyncError("read_life_topics", userId, topicsResult.error);
  }
  if (memoriesResult.error) {
    errors.push(`memories_active:${memoriesResult.error.message}`);
    logSyncError("read_memories_active", userId, memoriesResult.error);
  }

  const candidates = new Map<string, PersonCandidate>();
  for (const topic of (topicsResult.data || []).filter(isPersonTopic)) {
    const topicText = `${topic.description || ""} ${topic.notes || ""}`;
    const mentionCount = Number(topic.mention_count || 0);
    mergeCandidate(candidates, {
      name: topic.topic,
      relationshipType: inferRelationshipType(topic.category, topicText),
      description: topic.description || topic.notes || null,
      topicMentionCount: mentionCount,
      importance: Number(topic.relationship_strength || topic.weight || 1),
      confidence: Math.min(
        95,
        55 +
          (topic.entity_type === "person" ? 20 : 0) +
          Math.min(20, mentionCount * 3)
      ),
      lastMentionedAt: topic.last_mentioned_at || topic.updated_at || null,
      source: "life_topics",
    });
  }

  for (const memory of (memoriesResult.data || []).filter(isPersonMemory)) {
    const memoryText = `${memory.title || ""} ${memory.content || ""}`;
    const evidenceKey = String(
      memory.id || `${memory.title || "memory"}:${memory.updated_at || ""}`
    );
    const extractedNames = extractMemoryPersonNames(memory);

    for (const name of extractedNames) {
      const row = {
        name,
        category: memory.category,
        description: memory.content,
        content: memory.content,
      };
      if (!isLikelyRealPerson(row)) continue;

      mergeCandidate(candidates, {
        name,
        relationshipType: inferRelationshipType(memory.category, memoryText),
        description: memory.content || null,
        memoryEvidence: evidenceKey,
        importance: Number(memory.importance || (memory.pinned ? 8 : 5)),
        confidence: Math.min(
          90,
          65 + Number(memory.pinned ? 10 : 0) + Number(memory.importance || 0)
        ),
        lastMentionedAt: memory.updated_at || null,
        source: "memories_active",
      });
    }

    for (const [key, candidate] of candidates.entries()) {
      if (!containsPersonName(memoryText, key)) continue;
      candidate.memoryEvidence.add(evidenceKey);
      candidate.importance = Math.max(
        candidate.importance,
        Number(memory.importance || 0)
      );
      candidate.lastMentionedAt = latestTimestamp(
        candidate.lastMentionedAt,
        memory.updated_at || null
      );
      candidate.sources.add("memories_active");
    }
  }

  let synced = 0;
  for (const candidate of candidates.values()) {
    const person = await upsertPersonFromTopic({
      userId,
      name: candidate.name,
      relationshipType: candidate.relationshipType,
      description: candidate.description,
      confidence: candidate.confidence,
      source: Array.from(candidate.sources).sort().join("+") || "sync",
      mentionCount: Math.max(
        1,
        candidate.topicMentionCount,
        candidate.memoryEvidence.size
      ),
      importance: candidate.importance,
      lastMentionedAt: candidate.lastMentionedAt,
    });

    if (person) synced++;
    else errors.push(`upsert:${normalizePersonName(candidate.name)}`);
  }

  if (errors.length) {
    console.error("PEOPLE GRAPH SYNC COMPLETED WITH ERRORS", {
      userId,
      candidates: candidates.size,
      synced,
      errors,
    });
  }

  return { synced, candidates: candidates.size, errors };
}

export async function getPeopleGraphContext(userId: string) {
  if (!userId) return "";

  const { data, error } = await supabaseAdmin
    .from("people_graph")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("importance", { ascending: false })
    .order("mention_count", { ascending: false })
    .limit(12);

  if (error) {
    console.error("GET PEOPLE GRAPH CONTEXT ERROR", {
      userId,
      code: error.code || null,
      message: error.message,
    });
    return "";
  }

  if (!data?.length) return "";

  const links = await getPeopleGraphLinksForPeople({
    userId,
    personIds: data.map((person) => person.id),
    limit: 80,
  });
  const peopleById = new Map(data.map((person) => [person.id, person.name]));

  return data
    .map((person) => {
      const adjacent = links.filter(
        (link) => link.person_id === person.id || link.target_id === person.id
      );
      const cluster = adjacent
        .slice(0, 5)
        .map((link) => {
          const label =
            link.target_type === "person" && link.target_id === person.id
              ? peopleById.get(link.person_id) || link.person_id
              : link.target_label || link.target_key;
          return `${link.target_type}:${label}`;
        })
        .join(", ");
      return `- ${person.name} | relazione ${person.relationship_type || "non specificata"} | importanza ${person.importance} | menzioni ${person.mention_count} | collegamenti ${adjacent.length}${cluster ? ` [${cluster}]` : ""} | ${person.description || ""}`;
    })
    .join("\n");
}
