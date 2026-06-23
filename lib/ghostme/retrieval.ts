import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase as supabasePublic } from "@/lib/supabase";
import { getRelatedTopicContext } from "@/lib/ghostme/topicLinks";
import { temporalMemoryLabel } from "@/lib/ghostme/context/temporalPriority";

type DetectedTopic = {
  topic: string;
  category: string;
  entity_type: string;
};

function trimBlock(s: string, max = 1100) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) + "\n[...]" : s;
}


function norm(value: string) {
  return String(value || "").toLowerCase().trim();
}

function uniq(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function includesAny(text: string, terms: string[]) {
  const lower = norm(text);
  return terms.some((term) => lower.includes(norm(term)));
}

function logRetrievalError(source: string, error: { message?: string; code?: string } | null) {
  if (!error) return;
  console.error("MEMORY RETRIEVAL ERROR", {
    source,
    code: error.code || null,
    message: error.message || "unknown_error",
  });
}

function recencyScore(value: unknown, preserveHistorical = false) {
  const time = new Date(String(value || 0)).getTime();
  if (!Number.isFinite(time)) return -20;
  const days = (Date.now() - time) / (24 * 60 * 60 * 1000);
  if (days <= 3) return 20;
  if (days <= 14) return 10;
  if (days <= 30) return 3;
  if (days <= 90) return preserveHistorical ? 0 : -5;
  return preserveHistorical ? 0 : -15;
}

export async function buildContextualMemory({
  userId,
  detectedTopics,
  searchHints = [],
  deepRecall = false,
}: {
  userId: string;
  detectedTopics: DetectedTopic[];
  searchHints?: string[];
  deepRecall?: boolean;
}) {
  if (!userId) {
    return {
      memoryContext: "",
      episodicContext: "",
      lifeTopicsContext: "",
      summaryContext: "",
      linkedTopicsContext: "",
      timelineContext: "",
    };
  }

  const directTopics = uniq(
    detectedTopics.map((t) => t.topic).filter(Boolean)
  );

  const relatedTopicContext = await getRelatedTopicContext({
    userId,
    topics: directTopics,
    limit: 16,
  });

  const directLower = directTopics.map(norm);

  // topic_links currently exposes SELECT through the existing anon policy but
  // not through a direct service_role table grant. Keep this one read on the
  // established client until permissions are aligned outside this fix.
  const { data: allLinks, error: linksError } = await supabasePublic
    .from("topic_links")
    .select("*")
    .eq("user_id", userId)
    .order("weight", { ascending: false })
    .limit(120);
  logRetrievalError("topic_links", linksError);

  const firstLevelLinks =
    allLinks?.filter((link) => {
      const source = norm(link.source_topic);
      const target = norm(link.target_topic);

      return directLower.some(
        (topic) =>
          source.includes(topic) ||
          target.includes(topic) ||
          topic.includes(source) ||
          topic.includes(target)
      );
    }) || [];

  const firstLevelTopics = uniq(
    firstLevelLinks.flatMap((link) => [
      link.source_topic,
      link.target_topic,
    ])
  );

  const firstLevelLower = firstLevelTopics.map(norm);

  const secondLevelLinks =
    allLinks?.filter((link) => {
      const source = norm(link.source_topic);
      const target = norm(link.target_topic);

      return firstLevelLower.some(
        (topic) =>
          source.includes(topic) ||
          target.includes(topic) ||
          topic.includes(source) ||
          topic.includes(target)
      );
    }) || [];

  const networkTopics = uniq([
    ...directTopics,
    ...firstLevelTopics,
    ...secondLevelLinks.flatMap((link) => [
      link.source_topic,
      link.target_topic,
    ]),
  ]).slice(0, deepRecall ? 30 : 18);

  const searchTerms = uniq(
    [...networkTopics, ...searchHints]
      .map(norm)
      .filter(Boolean)
  ).slice(0, deepRecall ? 40 : 20);

 const linkedTopicsContext = trimBlock(
  [...firstLevelLinks, ...secondLevelLinks]
    .slice(0, 12)
    .map((link) => `${link.source_topic} ↔ ${link.target_topic} | peso ${link.weight || 1}`)
    .join("\n"),
  800
);


  const { data: allTopics, error: topicsError } = await supabaseAdmin
    .from("life_topics")
    .select(`
      topic,
      entity_type,
      category,
      description,
      weight,
      mention_count,
      relationship_strength,
      status,
      updated_at,
      last_mentioned_at
    `)
    .eq("user_id", userId)
    .order("weight", { ascending: false })
    .limit(60);
  logRetrievalError("life_topics", topicsError);

  const relevantTopics =
    allTopics
      ?.filter(
        (topic) =>
          (deepRecall &&
            ["person", "family", "friend", "relationship", "place", "project"].includes(
              norm(topic.entity_type || topic.category)
            )) ||
          searchTerms.some((term) => {
            const t = norm(topic.topic);
            return t.includes(term) || term.includes(t);
          })
      )
      .map((topic) => {
        const directBoost = directLower.some((d) =>
          norm(topic.topic).includes(d)
        )
          ? 20
          : 0;

    const lastMention = topic.last_mentioned_at
      ? new Date(topic.last_mentioned_at).getTime()
      : 0;

    const daysOld = Math.floor(
      (Date.now() - lastMention) /
      (1000 * 60 * 60 * 24)
    );

    let recencyBonus = 0;

    if (daysOld <= 3) recencyBonus = 20;
    else if (daysOld <= 7) recencyBonus = 15;
    else if (daysOld <= 14) recencyBonus = 10;
    else if (daysOld <= 30) recencyBonus = 5;
    else if (daysOld <= 90) recencyBonus = 0;
    else recencyBonus = -10;
    if (deepRecall && recencyBonus < 0) recencyBonus = 0;

    const score =
      directBoost +
      recencyBonus +
      (topic.weight || 0) * 3 +
      (topic.relationship_strength || 0) * 2 +
      (topic.mention_count || 0);

        return { ...topic, score };
      })
      .sort((a, b) => b.score - a.score) || [];

  const lifeTopicsContext = trimBlock(
    (relevantTopics
      .slice(0, 10)
      .map(
        (t) =>
          `[CONTESTO SEMANTICO — NON STATO OPERATIVO] ${t.topic} | ${t.entity_type} | ${t.category} | peso ${t.weight || 0} | forza ${t.relationship_strength || 0} | ${t.description || "nessuna descrizione"}`
      )
      .join("\n")) || "",
    deepRecall ? 1800 : 1000
  );


  const { data: allMemories, error: memoriesError } = await supabaseAdmin
    .from("memories_active")
    .select(`
      title,
      content,
      category,
      importance,
      pinned,
      updated_at
    `)
    .eq("user_id", userId)
    .order("pinned", { ascending: false })
    .order("importance", { ascending: false })
    .limit(60);
  logRetrievalError("memories_active", memoriesError);

    const memoryContext = trimBlock(
    (allMemories
      ?.filter(
        (m) =>
          includesAny(`${m.title} ${m.content} ${m.category}`, searchTerms) ||
          (deepRecall &&
            (m.pinned ||
              Number(m.importance || 0) >= 6 ||
              ["person", "family", "friend", "relationship", "place"].includes(
                norm(m.category)
              )))
      )
      .map((m) => ({
        ...m,
        score:
          (m.importance || 0) * 3 +
          (m.pinned ? 20 : 0) +
          recencyScore(m.updated_at, deepRecall),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, deepRecall ? 14 : 8)
      .map(
        (m) =>
          `[MEMORIA STORICA/SEMANTICA — NON CALENDARIO NÉ AZIONE ATTUALE] ${m.pinned ? "[PINNED]" : ""} [${m.category}] (${m.importance}) ${m.title ? `${m.title}: ` : ""}${m.content}`
      )
      .join("\n")) || "",
    deepRecall ? 2200 : 1100
  );


  const { data: allEpisodes, error: episodesError } = await supabaseAdmin
    .from("episodic_memories")
    .select(`
      summary,
      emotional_tone,
      related_topics,
      importance,
      created_at
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(80);
  logRetrievalError("episodic_memories", episodesError);

  const episodicContext = trimBlock(
  (allEpisodes
    ?.filter((e) => {
      const text = `${e.summary} ${(e.related_topics || []).join(" ")}`;
      return (
        includesAny(text, searchTerms) ||
        (deepRecall && Number(e.importance || 0) >= 5)
      );
    })
    .map((episode) => ({
      ...episode,
      score:
        Number(episode.importance || 0) * 2 +
        recencyScore(episode.created_at, deepRecall),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, deepRecall ? 10 : 5)
    .map(
      (e) =>
        `[${temporalMemoryLabel(e)}] ${e.summary} | data ${e.created_at || "non disponibile"} | tono: ${e.emotional_tone} | topics: ${e.related_topics?.join(", ") || ""}`
    )
    .join("\n")) || "",
  deepRecall ? 1600 : 800
);


  const { data: summaries, error: summariesError } = await supabaseAdmin
    .from("conversation_summaries")
    .select(`
      title,
      summary,
      topics,
      emotional_tone,
      period_start,
      period_end,
      updated_at
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(16);
  logRetrievalError("conversation_summaries", summariesError);

  const summaryContext = trimBlock(
    (summaries
      ?.filter((s) => {
        const text = `${s.title} ${s.summary} ${(s.topics || []).join(" ")}`;
        return includesAny(text, searchTerms) || deepRecall;
      })
      .map((summary) => ({
        ...summary,
        score: recencyScore(
          summary.updated_at || summary.period_end,
          deepRecall
        ),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, deepRecall ? 6 : 3)
      .map(
        (s) =>
          `[${temporalMemoryLabel(s)}] ${s.title || "Riassunto"} | tono: ${s.emotional_tone} | topics: ${(s.topics || []).join(", ")} | ${s.summary}`
      )
      .join("\n")) || "",
    deepRecall ? 1400 : 800
  );

  let timelineContext = "";
  if (deepRecall) {
    const { data: timeline, error: timelineError } = await supabaseAdmin
      .from("autobiographical_timeline")
      .select("period_label, event_type, title, summary, emotional_tone, importance, related_topics, event_date")
      .eq("user_id", userId)
      .order("event_date", { ascending: false })
      .limit(60);
    logRetrievalError("autobiographical_timeline", timelineError);
    timelineContext = trimBlock(
      (timeline || [])
        .filter((event) => {
          const text = `${event.title || ""} ${event.summary || ""} ${(event.related_topics || []).join(" ")}`;
          return includesAny(text, searchTerms) || Number(event.importance || 0) >= 5;
        })
        .slice(0, 14)
        .map(
          (event) =>
            `[${temporalMemoryLabel(event)}] ${event.period_label || "periodo non specificato"} | ${event.title || event.event_type || "evento"} | ${event.summary || ""}`
        )
        .join("\n"),
      2200
    );
  }

  const cognitiveContext = trimBlock(
    `
  CONTESTO COGNITIVO MIRATO:
  Topic diretti: ${directTopics.join(", ") || "nessuno"}

  Rete collegata:
  ${relatedTopicContext || linkedTopicsContext || "nessun collegamento rilevante"}

  Topic rilevanti:
  ${lifeTopicsContext || "nessun topic rilevante"}

  Nota temporale: questa rete trova collegamenti, ma non prova che un evento sia futuro o che un'azione sia ancora aperta.
  `.trim(),
    2200
  );

  return {
    memoryContext,
    episodicContext,
    lifeTopicsContext,
    summaryContext,
    timelineContext,
    linkedTopicsContext,
    relatedTopicContext,
    cognitiveContext,
  };
}
