import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const PEOPLE_GRAPH_TARGET_TYPES = [
  "person",
  "calendar_event",
  "episodic_memory",
  "memory",
  "action_intent",
  "goal",
  "place",
  "topic",
  "project",
  "observation",
] as const;

export type PeopleGraphTargetType = (typeof PEOPLE_GRAPH_TARGET_TYPES)[number];
export type PeopleGraphEvidencePolarity =
  | "supporting"
  | "contradictory"
  | "neutral";

export type PeopleGraphEvidence = {
  key: string;
  source_type: string;
  source_id?: string | null;
  observed_at: string;
  polarity: PeopleGraphEvidencePolarity;
  note?: string | null;
  metadata?: Record<string, unknown>;
};

export type PeopleGraphLink = {
  id: string;
  user_id: string;
  person_id: string;
  target_type: PeopleGraphTargetType;
  target_id: string | null;
  target_key: string;
  target_label: string | null;
  link_type: string;
  weight: number;
  confidence: number;
  evidences: PeopleGraphEvidence[];
  status: "active" | "weak" | "decayed" | "archived";
  last_reinforced_at: string | null;
  last_decayed_at: string | null;
  created_at: string;
  updated_at: string;
};

type PersonNode = {
  id: string;
  name: string;
  normalized_name: string;
};

type SourceRow = Record<string, unknown> & { id?: unknown };

type LinkSource = {
  table: string;
  targetType: Exclude<PeopleGraphTargetType, "person">;
  rows: SourceRow[];
};

const LINK_SELECT =
  "id, user_id, person_id, target_type, target_id, target_key, target_label, link_type, weight, confidence, evidences, status, last_reinforced_at, last_decayed_at, created_at, updated_at";

function normalizePersonName(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function normalizedText(value: unknown) {
  return normalizePersonName(value).replace(/[^a-z0-9]+/g, " ");
}

function containsPerson(text: string, person: PersonNode) {
  const needle = normalizedText(person.normalized_name || person.name).trim();
  return Boolean(needle && ` ${text} `.includes(` ${needle} `));
}

function rowText(row: SourceRow) {
  return normalizedText(
    [
      row.title,
      row.description,
      row.summary,
      row.content,
      row.source_message,
      row.notes,
      row.target_label,
      ...(Array.isArray(row.related_topics) ? row.related_topics : []),
    ].join(" ")
  );
}

function rowLabel(row: SourceRow) {
  return String(
    row.title || row.summary || row.content || row.description || row.id || ""
  )
    .trim()
    .slice(0, 240);
}

function rowTimestamp(row: SourceRow) {
  return String(
    row.updated_at ||
      row.created_at ||
      row.start_at ||
      row.completed_at ||
      new Date().toISOString()
  );
}

function evidenceFor(source: LinkSource, row: SourceRow): PeopleGraphEvidence {
  const observedAt = rowTimestamp(row);
  const sourceId = String(row.id || "");
  return {
    key: `${source.targetType}:${sourceId}:${observedAt}`,
    source_type: source.table,
    source_id: sourceId,
    observed_at: observedAt,
    polarity: "neutral",
    note: rowLabel(row) || null,
    metadata: {
      status: row.status || null,
      start_at: row.start_at || null,
      updated_at: row.updated_at || null,
      emotional_tone: row.emotional_tone || null,
      importance: Number(row.importance || row.priority || 0),
    },
  };
}

function linkedPeople(row: SourceRow, people: PersonNode[]) {
  const text = rowText(row);
  const relatedTopics = new Set(
    (Array.isArray(row.related_topics) ? row.related_topics : []).map((value: unknown) =>
      normalizePersonName(value)
    )
  );

  return people.filter(
    (person) =>
      relatedTopics.has(normalizePersonName(person.name)) ||
      containsPerson(text, person)
  );
}

function edgeStrength(row: SourceRow, directlyRelated: boolean) {
  const importance = Number(row.importance || row.priority || 0);
  return {
    weight: clamp(3 + Math.min(7, importance), 1, 10),
    confidence: clamp((directlyRelated ? 88 : 72) + Math.min(7, importance)),
  };
}

function errorProperty(error: unknown, property: "code" | "message") {
  if (!error || typeof error !== "object" || !(property in error)) return null;
  return String((error as Record<string, unknown>)[property] || "");
}

function logLinkError(stage: string, error: unknown, context: Record<string, unknown>) {
  console.error("PEOPLE GRAPH LINK ERROR", {
    stage,
    code: errorProperty(error, "code"),
    message: errorProperty(error, "message") || String(error || "unknown_error"),
    ...context,
  });
}

export async function upsertPeopleGraphLink({
  userId,
  personId,
  targetType,
  targetId = null,
  targetKey,
  targetLabel = null,
  linkType = "related_to",
  weight = 1,
  confidence = 60,
  evidence,
}: {
  userId: string;
  personId: string;
  targetType: PeopleGraphTargetType;
  targetId?: string | null;
  targetKey?: string | null;
  targetLabel?: string | null;
  linkType?: string;
  weight?: number;
  confidence?: number;
  evidence?: PeopleGraphEvidence | null;
}): Promise<PeopleGraphLink | null> {
  if (!userId || !personId || !targetType || (!targetId && !targetKey)) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .rpc("upsert_people_graph_link", {
      p_user_id: userId,
      p_person_id: personId,
      p_target_type: targetType,
      p_target_id: targetId,
      p_target_key: targetKey || targetId,
      p_target_label: targetLabel,
      p_link_type: linkType,
      p_weight: clamp(weight),
      p_confidence: clamp(confidence),
      p_evidence: evidence || {},
    })
    .single();

  if (error) {
    logLinkError("upsert", error, { userId, personId, targetType, targetId });
    return null;
  }

  return data as PeopleGraphLink;
}

function mergeLinks(rows: unknown[]) {
  const map = new Map<string, PeopleGraphLink>();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const id = String((row as Record<string, unknown>).id || "");
    if (id) map.set(id, row as PeopleGraphLink);
  }
  return Array.from(map.values()).sort(
    (left, right) =>
      Number(right.weight || 0) + Number(right.confidence || 0) -
      (Number(left.weight || 0) + Number(left.confidence || 0))
  );
}

export async function getPeopleGraphLinksForPeople({
  userId,
  personIds,
  limit = 200,
}: {
  userId: string;
  personIds: string[];
  limit?: number;
}): Promise<PeopleGraphLink[]> {
  const ids = Array.from(new Set(personIds.filter(Boolean)));
  if (!userId || !ids.length) return [];

  const [outgoing, incomingPeople] = await Promise.all([
    supabaseAdmin
      .from("people_graph_links")
      .select(LINK_SELECT)
      .eq("user_id", userId)
      .in("person_id", ids)
      .in("status", ["active", "weak"])
      .order("weight", { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from("people_graph_links")
      .select(LINK_SELECT)
      .eq("user_id", userId)
      .eq("target_type", "person")
      .in("target_id", ids)
      .in("status", ["active", "weak"])
      .order("weight", { ascending: false })
      .limit(limit),
  ]);

  if (outgoing.error || incomingPeople.error) {
    logLinkError("read_people", outgoing.error || incomingPeople.error, {
      userId,
      personCount: ids.length,
    });
  }

  return mergeLinks([
    ...(outgoing.data || []),
    ...(incomingPeople.data || []),
  ]).slice(0, limit);
}

export async function getPersonGraphNeighborhood({
  userId,
  personId,
  targetTypes,
  limit = 50,
}: {
  userId: string;
  personId: string;
  targetTypes?: PeopleGraphTargetType[];
  limit?: number;
}) {
  const links = await getPeopleGraphLinksForPeople({
    userId,
    personIds: [personId],
    limit,
  });
  return targetTypes?.length
    ? links.filter((link) => targetTypes.includes(link.target_type))
    : links;
}

async function loadLinkSources(userId: string): Promise<{
  people: PersonNode[];
  sources: LinkSource[];
  errors: string[];
}> {
  const results = await Promise.all([
    supabaseAdmin
      .from("people_graph")
      .select("id, name, normalized_name")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(100),
    supabaseAdmin
      .from("calendar_events")
      .select("id, title, description, status, start_at, updated_at, created_at")
      .eq("user_id", userId)
      .limit(200),
    supabaseAdmin
      .from("episodic_memories")
      .select("id, summary, emotional_tone, importance, related_topics, created_at, updated_at")
      .eq("user_id", userId)
      .limit(200),
    supabaseAdmin
      .from("memories_active")
      .select("id, title, content, category, importance, pinned, created_at, updated_at")
      .eq("user_id", userId)
      .limit(200),
    supabaseAdmin
      .from("action_intents")
      .select("id, title, description, source_message, related_topics, status, priority, goal_id, created_at, updated_at")
      .eq("user_id", userId)
      .limit(200),
    supabaseAdmin
      .from("goals_desires")
      .select("id, title, description, source_message, related_topics, status, importance, created_at, updated_at")
      .eq("user_id", userId)
      .limit(200),
  ]);

  const definitions: Array<[string, LinkSource["targetType"]]> = [
    ["calendar_events", "calendar_event"],
    ["episodic_memories", "episodic_memory"],
    ["memories_active", "memory"],
    ["action_intents", "action_intent"],
    ["goals_desires", "goal"],
  ];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (!result.error) return;
    const source = index === 0 ? "people_graph" : definitions[index - 1][0];
    errors.push(`${source}:${result.error.message}`);
    logLinkError("sync_read", result.error, { userId, source });
  });

  return {
    people: (results[0].data || []) as PersonNode[],
    sources: definitions.map(([table, targetType], index) => ({
      table,
      targetType,
      rows: (results[index + 1].data || []) as SourceRow[],
    })),
    errors,
  };
}

export async function syncPeopleGraphLinks(userId: string) {
  if (!userId) return { linked: 0, candidates: 0, errors: ["missing_user_id"] };

  const { people, sources, errors } = await loadLinkSources(userId);
  let candidates = 0;
  let linked = 0;

  for (const source of sources) {
    for (const row of source.rows) {
      if (!row.id) continue;
      const targetId = String(row.id);
      const matches = linkedPeople(row, people);
      if (!matches.length) continue;

      const relatedTopics = new Set(
        (Array.isArray(row.related_topics) ? row.related_topics : []).map((value: unknown) =>
          normalizePersonName(value)
        )
      );
      const evidence = evidenceFor(source, row);

      for (const person of matches) {
        candidates++;
        const direct = relatedTopics.has(normalizePersonName(person.name));
        const strength = edgeStrength(row, direct);
        const result = await upsertPeopleGraphLink({
          userId,
          personId: person.id,
          targetType: source.targetType,
          targetId,
          targetLabel: rowLabel(row),
          linkType: "mentioned_in",
          ...strength,
          evidence,
        });
        if (result) linked++;
        else errors.push(`${source.targetType}:${targetId}:${person.id}`);
      }

      for (let left = 0; left < matches.length; left++) {
        for (let right = left + 1; right < matches.length; right++) {
          candidates++;
          const pair = [matches[left], matches[right]].sort((a, b) =>
            a.id.localeCompare(b.id)
          );
          const result = await upsertPeopleGraphLink({
            userId,
            personId: pair[0].id,
            targetType: "person",
            targetId: pair[1].id,
            targetLabel: pair[1].name,
            linkType: "co_occurs_with",
            weight: 3,
            confidence: 75,
            evidence,
          });
          if (result) linked++;
          else errors.push(`person:${pair[0].id}:${pair[1].id}`);
        }
      }
    }
  }

  return { linked, candidates, errors };
}

export async function decayPeopleGraphLinks({
  userId,
  decayAfterDays = 45,
  limit = 500,
}: {
  userId: string;
  decayAfterDays?: number;
  limit?: number;
}) {
  if (!userId) return { decayed: 0, errors: ["missing_user_id"] };

  const cutoff = new Date(
    Date.now() - Math.max(1, decayAfterDays) * 24 * 60 * 60 * 1000
  ).toISOString();
  const { data, error } = await supabaseAdmin
    .from("people_graph_links")
    .select("id, weight, confidence")
    .eq("user_id", userId)
    .in("status", ["active", "weak"])
    .lt("last_reinforced_at", cutoff)
    .or(`last_decayed_at.is.null,last_decayed_at.lt.${cutoff}`)
    .limit(limit);

  if (error) {
    logLinkError("decay_read", error, { userId });
    return { decayed: 0, errors: [error.message] };
  }

  const errors: string[] = [];
  let decayed = 0;
  const now = new Date().toISOString();
  for (const link of data || []) {
    const weight = clamp(Number(link.weight || 0) - 1);
    const confidence = clamp(Number(link.confidence || 0) - 1);
    const status = weight === 0 ? "decayed" : weight <= 20 ? "weak" : "active";
    const update = await supabaseAdmin
      .from("people_graph_links")
      .update({ weight, confidence, status, last_decayed_at: now, updated_at: now })
      .eq("id", link.id)
      .eq("user_id", userId);
    if (update.error) errors.push(`${link.id}:${update.error.message}`);
    else decayed++;
  }

  return { decayed, errors };
}
