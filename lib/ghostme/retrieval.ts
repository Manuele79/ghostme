import { supabase } from "@/lib/supabase";

type DetectedTopic = {
  topic: string;
  category: string;
  entity_type: string;
};

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
    };
  }

  const topicNames = detectedTopics.map((t) =>
    t.topic.toLowerCase()
  );

  const { data: linkedTopics } = await supabase
  .from("topic_links")
  .select("*")
  .eq("user_id", userId)
  .or(
    topicNames
      .map(
        (t) =>
          `source_topic.ilike.%${t}%,target_topic.ilike.%${t}%`
      )
      .join(",")
  )
  .order("weight", { ascending: false })
  .limit(20);

const linkedTopicsContext =
  linkedTopics
    ?.map(
      (l) =>
        `${l.source_topic} ↔ ${l.target_topic} (${l.weight})`
    )
    .join("\n") || "";


const relatedTopicNames = Array.from(
  new Set(
    linkedTopics?.flatMap((l) => [
      l.source_topic,
      l.target_topic,
    ]) || []
  )
).filter(Boolean);

  // =========================================================
  // LIFE TOPICS
  // =========================================================

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
      updated_at
    `)
    .eq("user_id", userId)
    .order("weight", { ascending: false })
    .limit(100);

  const searchTopics = [
    ...topicNames,
    ...relatedTopicNames.map((t) => t.toLowerCase()),
  ];

  const relevantTopics =
    allTopics?.filter((topic) => {
      const topicLower = String(topic.topic).toLowerCase();

      return searchTopics.some(
        (name) =>
          topicLower.includes(name) ||
          name.includes(topicLower)
      );
    }) || [];

  const lifeTopicsContext = relevantTopics
    .slice(0, 10)
    .map(
      (t) =>
        `${t.topic} | ${t.entity_type} | ${t.category} | ${
          t.description || "nessuna descrizione"
        }`
    )
    .join("\n");

  // =========================================================
  // MEMORIES ACTIVE
  // =========================================================

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
    .limit(100);

  const relevantMemories =
    allMemories?.filter((memory) => {
      const text =
        `${memory.title} ${memory.content}`.toLowerCase();

      return searchTopics.some((topic) =>
        text.includes(topic)
      );
    }) || [];

  const sortedMemories = [...relevantMemories].sort(
    (a, b) => {
      const aScore =
        (a.importance || 0) + (a.pinned ? 5 : 0);

      const bScore =
        (b.importance || 0) + (b.pinned ? 5 : 0);

      return bScore - aScore;
    }
  );

  const memoryContext = sortedMemories
    .slice(0, 10)
    .map(
      (m) =>
        `${m.pinned ? "[PINNED]" : ""} [${
          m.category
        }] (${m.importance}) ${m.content}`
    )
    .join("\n");

  // =========================================================
  // EPISODIC MEMORIES
  // =========================================================

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
    .limit(100);

    const relevantEpisodes =
    allEpisodes?.filter((episode) => {
        const related =
        episode.related_topics?.map((t: string) =>
            t.toLowerCase()
        ) || [];

        return (
        topicNames.some((topic) =>
            related.includes(topic)
        ) ||
        relatedTopicNames.some((topic) =>
            related.includes(topic.toLowerCase())
        )
        );
    }) || [];

  const episodicContext = relevantEpisodes
    .slice(0, 8)
    .map(
      (e) =>
        `${e.summary} | tono: ${
          e.emotional_tone
        } | topics: ${e.related_topics?.join(", ")}`
    )
    .join("\n");

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
    .limit(5);

    const summaryContext =
    summaries
        ?.map(
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