import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getPeopleGraphLinksForPeople,
  type PeopleGraphLink,
} from "@/lib/ghostme/people/peopleGraphLinkService";

export type PeopleSnapshot = {
  items: any[];
  importantPeople: any[];
  links: PeopleGraphLink[];
  relationshipContext: string;
  lastUpdated: string | null;
};

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

export function normalizePersonName(value: any) {
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
  "amici",
  "collega",
  "colleghi",
  "figlia",
  "figlio",
  "madre",
  "padre",
  "mamma",
  "papa",
  "sorella",
  "fratello",
  "famiglia",
  "persona",
  "family",
  "friend",
  "relationship",
  "colleague",
];

const HUMAN_CATEGORIES = [
  "person",
  "family",
  "friend",
  "relationship",
  "colleague",
];

const NON_PERSON_CATEGORIES = [
  "project",
  "home",
  "work",
  "object",
  "system",
  "vehicle",
  "place",
  "automation",
  "calendar",
  "service",
  "animal",
];

const EXCLUDED_NAME_TERMS = [
  "ghostme",
  "home assistant",
  "vespa",
  "piaggio",
  "ciao",
  "osservazione",
  "osservazione dei luoghi",
  "risposta",
  "programma",
  "progetto",
  "automazione",
  "luogo",
  "luoghi",
  "sistema",
  "calendario",
  "agenda",
  "promemoria",
  "appuntamento",
];

const GENERIC_RELATIONSHIP_NAMES = new Set([
  "moglie",
  "mia moglie",
  "marito",
  "mio marito",
  "compagna",
  "mia compagna",
  "compagno",
  "mio compagno",
  "amica",
  "mia amica",
  "amico",
  "mio amico",
]);

const NON_PERSON_TEXT_TERMS = [
  "progetto",
  "programma",
  "sistema",
  "automazione",
  "home assistant",
  "ghostme",
  "luogo",
  "luoghi",
  "mezzo",
  "veicolo",
  "vespa",
  "piaggio",
  "scooter",
  "moto",
  "osservazione dei luoghi",
];

function hasRelationshipTerm(value: any) {
  const text = clean(value);
  return RELATION_TERMS.some((term) => text.includes(term));
}

function hasAnyTerm(value: any, terms: string[]) {
  const text = clean(value);
  return terms.some((term) => text.includes(term));
}

function hasHumanCategory(value: any) {
  return HUMAN_CATEGORIES.includes(clean(value));
}

function hasNonPersonCategory(value: any) {
  return NON_PERSON_CATEGORIES.includes(clean(value));
}

function isExcludedName(value: any) {
  const name = normalizePersonName(value);
  return (
    Boolean(name) &&
    (GENERIC_RELATIONSHIP_NAMES.has(name) ||
      EXCLUDED_NAME_TERMS.some((term) => name.includes(term)))
  );
}

function hasNonPersonText(value: any) {
  return hasAnyTerm(value, NON_PERSON_TEXT_TERMS);
}

function hasHumanEvidence(row: any) {
  const text = [
    row.name,
    row.topic,
    row.relationship_type,
    row.category,
    row.entity_type,
    row.description,
    row.notes,
    row.content,
  ].join(" ");

  return (
    clean(row.entity_type) === "person" ||
    hasHumanCategory(row.category) ||
    hasHumanCategory(row.relationship_type) ||
    hasRelationshipTerm(text)
  );
}

export function isLikelyRealPerson(row: any) {
  const name = row.name || row.topic;
  const text = `${row.description || ""} ${row.notes || ""} ${row.content || ""}`;

  if (!name || isExcludedName(name)) return false;
  if (hasNonPersonCategory(row.category) || hasNonPersonCategory(row.entity_type)) {
    return false;
  }
  if (hasNonPersonText(text) && !hasRelationshipTerm(text)) return false;

  return hasHumanEvidence(row);
}

export function isPersonTopic(topic: any) {
  return isLikelyRealPerson(topic);
}

export function isPersonMemory(memory: any) {
  const text = `${memory.title || ""} ${memory.content || ""} ${memory.category || ""}`;

  if (hasNonPersonCategory(memory.category)) return false;
  if (hasNonPersonText(text) && !hasRelationshipTerm(text)) return false;

  return hasHumanCategory(memory.category) || hasRelationshipTerm(text);
}

export function extractMemoryPersonNames(memory: any) {
  const names: string[] = [];
  const title = String(memory.title || "").trim();
  const text = `${title} ${memory.content || ""}`;
  const infoMatch = title.match(/^Info su\s+(.+)$/i);

  if (infoMatch?.[1] && isPersonMemory(memory) && !isExcludedName(infoMatch[1])) {
    names.push(infoMatch[1].trim());
  }

  if (isPersonMemory(memory)) {
    const patterns = [
      /\b([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’-]{2,}(?:\s+[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’-]{2,})?)\s+(?:[èÈ]|[eE]')\s+(?:mia|mio|la mia|il mio)\s+(?:moglie|marito|compagna|compagno|amica|amico|madre|padre|mamma|papà|sorella|fratello)\b/gu,
      /\b(?:[Mm]ia|[Mm]io|[Ll]a mia|[Ii]l mio)\s+(?:moglie|marito|compagna|compagno|amica|amico|madre|padre|mamma|papà|sorella|fratello)\s+(?:[Ss]i chiama|[èÈ]|[eE]')?\s*([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’-]{2,}(?:\s+[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’-]{2,})?)/gu,
      /\b[Cc]on\s+([A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’-]{2,}(?:\s+[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’-]{2,})?)/gu,
    ];

    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) {
        const name = String(match[1] || "").trim();
        if (name && !isExcludedName(name)) names.push(name);
      }
    }

    if (
      hasHumanCategory(memory.category) &&
      /^[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’-]{2,}(?:\s+[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’-]{2,})?$/u.test(title) &&
      !isExcludedName(title)
    ) {
      names.push(title);
    }
  }

  return mergeUnique(names);
}

function mergeUnique(values: any[]) {
  const seen = new Set<string>();
  const result: any[] = [];

  for (const value of values || []) {
    const key = clean(value);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    result.push(value);
  }

  return result;
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

function latestValue(left: any, right: any) {
  return latestTimestamp([left || null, right || null]);
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
    const key = normalizePersonName(person.normalized_name || person.name);
    if (!key || !isLikelyRealPerson(person)) continue;

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
    const key = normalizePersonName(topic.topic);
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
      last_mentioned_at: latestValue(
        existing?.last_mentioned_at,
        topic.last_mentioned_at || topic.updated_at
      ),
      source: existing?.source || "life_topics",
    });
  }

  for (const memory of memoryRows || []) {
    const text = `${memory.title || ""} ${memory.content || ""}`;
    const memoryNames = extractMemoryPersonNames(memory);

    for (const name of memoryNames) {
      const key = normalizePersonName(name);
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
        memory_titles: mergeUnique([
          ...(existing?.memory_titles || []),
          memory.title,
        ]),
      });
    }

    for (const [key, person] of map.entries()) {
      if (!key || !clean(text).includes(key)) continue;

      map.set(key, {
        ...person,
        memory_titles: mergeUnique([...(person.memory_titles || []), memory.title]),
      });
    }
  }

  return Array.from(map.values()).filter(isLikelyRealPerson).sort(
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
      links: [],
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

  const mergedItems = mergePeople({
    peopleRows: peopleRes.data || [],
    topicRows: topicsRes.data || [],
    memoryRows: memoriesRes.data || [],
  });
  const personIds = mergedItems.map((person) => person.id).filter(Boolean);
  const links = await getPeopleGraphLinksForPeople({ userId, personIds });
  const items = mergedItems.map((person) => ({
    ...person,
    graph_links: person.id
      ? links.filter(
          (link) => link.person_id === person.id || link.target_id === person.id
        )
      : [],
  }));

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
    links,
    relationshipContext: buildRelationshipContext(items),
    lastUpdated: latestTimestamp([
      ...(peopleRes.data || []).map((person: any) => person.updated_at),
      ...(peopleRes.data || []).map((person: any) => person.last_mentioned_at),
      ...(topicsRes.data || []).map((topic: any) => topic.updated_at),
      ...(topicsRes.data || []).map((topic: any) => topic.last_mentioned_at),
      ...(memoriesRes.data || []).map((memory: any) => memory.updated_at),
      ...links.map((link) => link.updated_at),
    ]),
  };
}
