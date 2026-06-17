import { supabase } from "@/lib/supabase";
import { getRelatedTopicContext } from "@/lib/ghostme/topicLinks";

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

export async function buildContextualMemory({
  userId,
  detectedTopics,
  searchHints = [],
}: {
  userId: string;
  detectedTopics: DetectedTopic[];
  searchHints?: string[];
}) {
  if (!userId) {
    return {
      memoryContext: "",
      episodicContext: "",
      lifeTopicsContext: "",
      summaryContext: "",
      linkedTopicsContext: "",
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

  const { data: allLinks } = await supabase
    .from("topic_links")
    .select("*")
    .eq("user_id", userId)
    .order("weight", { ascending: false })
    .limit(120);

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
  ]).slice(0, 18);

  const searchTerms = uniq(
    [...networkTopics, ...searchHints]
      .map(norm)
      .filter(Boolean)
  ).slice(0, 20);

 const linkedTopicsContext = trimBlock(
  [...firstLevelLinks, ...secondLevelLinks]
    .slice(0, 12)
    .map((link) => `${link.source_topic} ↔ ${link.target_topic} | peso ${link.weight || 1}`)
    .join("\n"),
  800
);


  const { data: allTopics } = await supabase
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

  const relevantTopics =
    allTopics
      ?.filter((topic) =>
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
          `${t.topic} | ${t.entity_type} | ${t.category} | peso ${t.weight || 0} | forza ${t.relationship_strength || 0} | ${t.description || "nessuna descrizione"}`
      )
      .join("\n")) || "",
    1000
  );


  const { data: allMemories } = await supabase
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

    const memoryContext = trimBlock(
    (allMemories
      ?.filter((m) => includesAny(`${m.title} ${m.content} ${m.category}`, searchTerms))
      .map((m) => ({
        ...m,
        score: (m.importance || 0) * 3 + (m.pinned ? 20 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(
        (m) =>
          `${m.pinned ? "[PINNED]" : ""} [${m.category}] (${m.importance}) ${m.title ? `${m.title}: ` : ""}${m.content}`
      )
      .join("\n")) || "",
    1100
  );


  const { data: allEpisodes } = await supabase
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

  const episodicContext = trimBlock(
  (allEpisodes
    ?.filter((e) => {
      const text = `${e.summary} ${(e.related_topics || []).join(" ")}`;
      return includesAny(text, searchTerms);
    })
    .slice(0, 6)
    .map(
      (e) =>
        `${e.summary} | tono: ${e.emotional_tone} | topics: ${e.related_topics?.join(", ") || ""}`
    )
    .join("\n")) || "",
  800
);


  const { data: summaries } = await supabase
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

  const summaryContext = trimBlock(
    (summaries
      ?.filter((s) => {
        const text = `${s.title} ${s.summary} ${(s.topics || []).join(" ")}`;
        return includesAny(text, searchTerms);
      })
      .slice(0, 4)
      .map(
        (s) =>
          `${s.title || "Riassunto"} | tono: ${s.emotional_tone} | topics: ${(s.topics || []).join(", ")} | ${s.summary}`
      )
      .join("\n")) || "",
    800
  );

  const cognitiveContext = trimBlock(
    `
  CONTESTO COGNITIVO MIRATO:
  Topic diretti: ${directTopics.join(", ") || "nessuno"}

  Rete collegata:
  ${relatedTopicContext || linkedTopicsContext || "nessun collegamento rilevante"}

  Topic rilevanti:
  ${lifeTopicsContext || "nessun topic rilevante"}

  Memorie rilevanti:
  ${memoryContext || "nessuna memoria rilevante"}

  Episodi rilevanti:
  ${episodicContext || "nessun episodio rilevante"}

  Riassunti rilevanti:
  ${summaryContext || "nessun riassunto rilevante"}
  `.trim(),
    2200
  );

  return {
    memoryContext,
    episodicContext,
    lifeTopicsContext,
    summaryContext,
    linkedTopicsContext,
    relatedTopicContext,
    cognitiveContext,
  };
}
