import { supabase } from "@/lib/supabase";

type DetectedTopic = {
  topic: string;
  category: string;
  entity_type: string;
};

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
}: {
  userId: string;
  detectedTopics: DetectedTopic[];
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

  const directLower = directTopics.map(norm);

  const { data: allLinks } = await supabase
    .from("topic_links")
    .select("*")
    .eq("user_id", userId)
    .order("weight", { ascending: false })
    .limit(300);

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

  const searchTerms = networkTopics.map(norm);

  const linkedTopicsContext = [...firstLevelLinks, ...secondLevelLinks]
    .slice(0, 25)
    .map(
      (link) =>
        `${link.source_topic} ↔ ${link.target_topic} | peso ${link.weight || 1}`
    )
    .join("\n");

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
    .limit(200);

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

        const score =
          directBoost +
          (topic.weight || 0) * 3 +
          (topic.relationship_strength || 0) * 2 +
          (topic.mention_count || 0);

        return { ...topic, score };
      })
      .sort((a, b) => b.score - a.score) || [];

  const lifeTopicsContext = relevantTopics
    .slice(0, 14)
    .map(
      (t) =>
        `${t.topic} | ${t.entity_type} | ${t.category} | peso ${t.weight || 0} | forza ${
          t.relationship_strength || 0
        } | ${t.description || "nessuna descrizione"}`
    )
    .join("\n");

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
    .limit(200);

  const memoryContext =
    allMemories
      ?.filter((memory) =>
        includesAny(`${memory.title} ${memory.content} ${memory.category}`, searchTerms)
      )
      .map((memory) => {
        const score =
          (memory.importance || 0) * 3 +
          (memory.pinned ? 20 : 0);

        return { ...memory, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(
        (m) =>
          `${m.pinned ? "[PINNED]" : ""} [${m.category}] (${m.importance}) ${
            m.title ? `${m.title}: ` : ""
          }${m.content}`
      )
      .join("\n") || "";

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
    .limit(150);

  const episodicContext =
    allEpisodes
      ?.filter((episode) => {
        const related = episode.related_topics || [];
        const text = `${episode.summary} ${related.join(" ")}`;
        return includesAny(text, searchTerms);
      })
      .slice(0, 10)
      .map(
        (e) =>
          `${e.summary} | tono: ${e.emotional_tone} | topics: ${
            e.related_topics?.join(", ") || ""
          }`
      )
      .join("\n") || "";

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
    .limit(20);

  const summaryContext =
    summaries
      ?.filter((summary) => {
        const text = `${summary.title} ${summary.summary} ${
          summary.topics?.join(" ") || ""
        }`;
        return includesAny(text, searchTerms);
      })
      .slice(0, 6)
      .map(
        (s) =>
          `${s.title || "Riassunto"} | tono: ${s.emotional_tone} | topics: ${
            s.topics?.join(", ") || ""
          } | ${s.summary}`
      )
      .join("\n") || "";

  return {
    memoryContext,
    episodicContext,
    lifeTopicsContext,
    summaryContext,
    linkedTopicsContext,
  };
}