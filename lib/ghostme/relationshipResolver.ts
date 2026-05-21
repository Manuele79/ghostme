import { supabase } from "@/lib/supabase";

type RelationshipResult = {
  matched: boolean;
  topic?: string;
  description?: string;
};

const genericRelationshipTopics = new Set([
  "moglie",
  "mia moglie",
  "marito",
  "mio marito",
  "compagna",
  "mia compagna",
  "compagno",
  "mio compagno",
  "amico",
  "mio amico",
  "amica",
  "mia amica",
  "cane",
  "mio cane",
  "gatto",
  "mio gatto",
]);

function normalizeName(name: string) {
  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
}

function classifyRelation(relation: string) {
  const lower = relation.toLowerCase();

  if (
    lower.includes("moglie") ||
    lower.includes("marito") ||
    lower.includes("compagna") ||
    lower.includes("compagno")
  ) {
    return {
      category: "family",
      entity_type: "person",
    };
  }

  if (lower.includes("amico") || lower.includes("amica")) {
    return {
      category: "friend",
      entity_type: "person",
    };
  }

  if (lower.includes("cane") || lower.includes("gatto")) {
    return {
      category: "family",
      entity_type: "animal",
    };
  }

  return {
    category: "general",
    entity_type: "unknown",
  };
}

function extractNamedRelationship(message: string) {
  const patterns = [
    /\b([A-ZÀ-Ù][a-zà-ù]+)\s+(è|e')\s+(mia moglie|mio marito|mia compagna|mio compagno|mio amico|mia amica|il mio cane|la mia cagna|il mio gatto|la mia gatta)\b/i,
    /\b(mia moglie|mio marito|mia compagna|mio compagno|mio amico|mia amica|il mio cane|la mia cagna|il mio gatto|la mia gatta)\s+(si chiama|è|e')\s+([A-ZÀ-Ù][a-zà-ù]+)\b/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (!match) continue;

    if (/si chiama|mia|mio|il mio|la mia/i.test(match[1])) {
      return {
        name: normalizeName(match[3]),
        relation: match[1].toLowerCase(),
      };
    }

    return {
      name: normalizeName(match[1]),
      relation: match[3].toLowerCase(),
    };
  }

  return null;
}

export function removeGenericRelationshipTopics<T extends { topic: string }>(
  topics: T[]
) {
  return topics.filter(
    (t) => !genericRelationshipTopics.has(t.topic.toLowerCase().trim())
  );
}

export async function resolveNamedRelationship({
  userId,
  message,
}: {
  userId: string;
  message: string;
}): Promise<RelationshipResult> {
  if (!userId || !message?.trim()) {
    return { matched: false };
  }

  const extracted = extractNamedRelationship(message);

  if (!extracted) {
    return { matched: false };
  }

  const { name, relation } = extracted;
  const classification = classifyRelation(relation);

  const description = `${name} è ${relation.replace(/^mia |^mio |^il mio |^la mia /i, "")} di Manuele.`;

  const { data: existingTopic } = await supabase
    .from("life_topics")
    .select("id")
    .eq("user_id", userId)
    .ilike("topic", name)
    .limit(1)
    .maybeSingle();

  if (existingTopic) {
    await supabase
      .from("life_topics")
      .update({
        category: classification.category,
        entity_type: classification.entity_type,
        description,
        status: "known",
        needs_clarification: false,
        clarification_asked: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingTopic.id);
  } else {
    await supabase.from("life_topics").insert([
      {
        user_id: userId,
        topic: name,
        category: classification.category,
        entity_type: classification.entity_type,
        description,
        weight: 8,
        status: "known",
        mention_count: 1,
        needs_clarification: false,
        clarification_asked: true,
        relationship_strength: 8,
        last_mentioned_at: new Date().toISOString(),
      },
    ]);
  }

  const memoryTitle = `Info su ${name}`;

  const { data: existingMemory } = await supabase
    .from("memories_active")
    .select("id")
    .eq("user_id", userId)
    .eq("title", memoryTitle)
    .limit(1);

  if (existingMemory && existingMemory.length > 0) {
    await supabase
      .from("memories_active")
      .update({
        content: description,
        category: classification.category,
        importance: 10,
        pinned: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingMemory[0].id);
  } else {
    await supabase.from("memories_active").insert([
      {
        user_id: userId,
        title: memoryTitle,
        content: description,
        category: classification.category,
        importance: 10,
        pinned: true,
      },
    ]);
  }

  await supabase
    .from("life_topics")
    .delete()
    .eq("user_id", userId)
    .in("topic", Array.from(genericRelationshipTopics));

  return {
    matched: true,
    topic: name,
    description,
  };
}