import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type PeopleSnapshot = {
  items: any[];
  importantPeople: any[];
  relationshipContext: string;
  lastUpdated: string | null;
};

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

function normalizeName(value: any) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const RELATION_TERMS = [
  "moglie",
  "marito",
  "compagna",
  "compagno",
  "amica",
  "amico",
  "figlia",
  "figlio",
  "sorella",
  "fratello",
  "family",
  "friend",
];

function hasRelationshipTerm(value: any) {
  const text = clean(value);
  return RELATION_TERMS.some((term) => text.includes(term));
}

function isPersonTopic(topic: any) {
  return (
    clean(topic.entity_type) === "person" ||
    ["family", "friend"].includes(clean(topic.category)) ||
    hasRelationshipTerm(topic.description) ||
    hasRelationshipTerm(topic.notes)
  );
}

function extractMemoryPersonNames(memory: any) {
  const names: string[] = [];
  const title = String(memory.title || "").trim();
  const infoMatch = title.match(/^Info su\s+(.+)$/i);

  if (infoMatch?.[1]) {
    names.push(infoMatch[1].trim());
  }

  return names;
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

function mergePeople({
  peopleRows,
  topicRows,
  memoryRows,
}: {
  peopleRows: any[];
  topicRows: any[];
  memoryRows: any[];
}) {
  const map = new Map<string, any>();

  for (const person of peopleRows || []) {
    const key = normalizeName(person.normalized_name || person.name);
    if (!key) continue;

    map.set(key, {
      ...person,
      name: person.name,
      relationship_type: person.relationship_type || null,
      description: person.description || null,
      importance: Number(person.importance || 0),
      mention_count: Number(person.mention_count || 0),
      source: person.source || "people_graph",
    });
  }

  for (const topic of (topicRows || []).filter(isPersonTopic)) {
    const key = normalizeName(topic.topic);
    if (!key) continue;

    const existing = map.get(key);
    map.set(key, {
      ...(existing || {}),
      name: existing?.name || topic.topic,
      relationship_type: existing?.relationship_type || topic.category || null,
      description: existing?.description || topic.description || null,
      importance: Math.max(
        Number(existing?.importance || 0),
        Number(topic.relationship_strength || topic.weight || 0)
      ),
      mention_count: Math.max(
        Number(existing?.mention_count || 0),
        Number(topic.mention_count || 0)
      ),
      source: existing?.source || "life_topics",
    });
  }

  for (const memory of memoryRows || []) {
    const text = `${memory.title || ""} ${memory.content || ""}`;
    const memoryNames = extractMemoryPersonNames(memory);

    for (const name of memoryNames) {
      const key = normalizeName(name);
      if (!key) continue;

      const existing = map.get(key);
      map.set(key, {
        ...(existing || {}),
        name: existing?.name || name,
        relationship_type:
          existing?.relationship_type || memory.category || null,
        description: existing?.description || memory.content || null,
        importance: Math.max(
          Number(existing?.importance || 0),
          Number(memory.importance || 0)
        ),
        mention_count: Number(existing?.mention_count || 0),
        source: existing?.source || "memories_active",
        memory_titles: [
          ...(existing?.memory_titles || []),
          memory.title,
        ].filter(Boolean),
      });
    }

    for (const [key, person] of map.entries()) {
      if (!key || !clean(text).includes(key)) continue;

      map.set(key, {
        ...person,
        memory_titles: [...(person.memory_titles || []), memory.title].filter(Boolean),
      });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      Number(b.importance || 0) +
      Number(b.mention_count || 0) -
      (Number(a.importance || 0) + Number(a.mention_count || 0))
  );
}

function buildRelationshipContext(items: any[]) {
  if (!items.length) return "";

  return items
    .slice(0, 12)
    .map(
      (person) =>
        `- ${person.name} | relazione ${
          person.relationship_type || "non specificata"
        } | importanza ${person.importance || 0} | menzioni ${
          person.mention_count || 0
        } | ${person.description || ""}`
    )
    .join("\n");
}

export async function buildPeopleSnapshot(
  userId: string
): Promise<PeopleSnapshot> {
  if (!userId) {
    return {
      items: [],
      importantPeople: [],
      relationshipContext: "",
      lastUpdated: null,
    };
  }

  const [peopleRes, topicsRes, memoriesRes] = await Promise.all([
    supabaseAdmin
      .from("people_graph")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("importance", { ascending: false })
      .order("mention_count", { ascending: false })
      .limit(20),

    supabaseAdmin
      .from("life_topics")
      .select("topic, category, entity_type, description, notes, weight, mention_count, relationship_strength, last_mentioned_at, updated_at")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("relationship_strength", { ascending: false })
      .limit(80),

    supabaseAdmin
      .from("memories_active")
      .select("title, content, category, importance, pinned, updated_at")
      .eq("user_id", userId)
      .or("category.eq.family,category.eq.friend,title.ilike.%Info su%,content.ilike.%moglie%,content.ilike.%marito%,content.ilike.%compagna%,content.ilike.%compagno%,content.ilike.%amica%,content.ilike.%amico%")
      .order("importance", { ascending: false })
      .limit(20),
  ]);

  const items = mergePeople({
    peopleRows: peopleRes.data || [],
    topicRows: topicsRes.data || [],
    memoryRows: memoriesRes.data || [],
  });

  const importantPeople = items
    .filter(
      (person) =>
        Number(person.importance || 0) >= 7 ||
        Number(person.mention_count || 0) >= 3
    )
    .slice(0, 8);

  return {
    items,
    importantPeople,
    relationshipContext: buildRelationshipContext(items),
    lastUpdated: latestTimestamp([
      ...(peopleRes.data || []).map((person: any) => person.updated_at),
      ...(peopleRes.data || []).map((person: any) => person.last_mentioned_at),
      ...(topicsRes.data || []).map((topic: any) => topic.updated_at),
      ...(topicsRes.data || []).map((topic: any) => topic.last_mentioned_at),
      ...(memoriesRes.data || []).map((memory: any) => memory.updated_at),
    ]),
  };
}
