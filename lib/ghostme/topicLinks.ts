import { supabase } from "@/lib/supabase";

type LinkableTopic = {
  topic: string;
  category?: string;
  entity_type?: string;
  confidence?: number;
};

function normalizeTopic(topic: string) {
  return topic.trim();
}

function makePair(a: string, b: string) {
  const first = normalizeTopic(a);
  const second = normalizeTopic(b);

  return first.toLowerCase() < second.toLowerCase()
    ? [first, second]
    : [second, first];
}

export async function saveTopicLinks({
  userId,
  topics,
  linkType = "mentioned_together",
}: {
  userId: string;
  topics: LinkableTopic[];
  linkType?: string;
}) {
  if (!userId) return;
  if (!topics || topics.length < 2) return;

  const cleanTopics = Array.from(
    new Map(
      topics
        .filter((t) => t.topic && t.topic.trim().length > 1)
        .map((t) => [t.topic.toLowerCase(), t])
    ).values()
  );

  if (cleanTopics.length < 2) return;

  for (let i = 0; i < cleanTopics.length; i++) {
    for (let j = i + 1; j < cleanTopics.length; j++) {
      const [sourceTopic, targetTopic] = makePair(
        cleanTopics[i].topic,
        cleanTopics[j].topic
      );

      const { data: existingLink, error: existingError } =
        await supabase
          .from("topic_links")
          .select("*")
          .eq("user_id", userId)
          .eq("source_topic", sourceTopic)
          .eq("target_topic", targetTopic)
          .eq("link_type", linkType)
          .maybeSingle();

      if (existingError) {
        console.log("TOPIC LINK READ ERROR:", existingError);
        continue;
      }

      if (existingLink) {
        const nextWeight = Math.min(
          (existingLink.weight || 1) + 1,
          10
        );

        const { error: updateError } = await supabase
          .from("topic_links")
          .update({
            weight: nextWeight,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingLink.id);

        console.log("TOPIC LINK UPDATE ERROR:", updateError);
      } else {
        const { error: insertError } = await supabase
          .from("topic_links")
          .insert([
            {
              user_id: userId,
              source_topic: sourceTopic,
              target_topic: targetTopic,
              link_type: linkType,
              weight: 1,
            },
          ]);

        console.log("TOPIC LINK INSERT ERROR:", insertError);
      }
    }
  }
}

export async function getRelatedTopicContext({
  userId,
  topics,
  limit = 12,
}: {
  userId: string;
  topics: string[];
  limit?: number;
}) {
  if (!userId || !topics?.length) return "";

  const cleanTopics = topics
    .filter(Boolean)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  if (!cleanTopics.length) return "";

  const lowerTopics = cleanTopics.map((t) => t.toLowerCase());

  const { data: links, error: linksError } = await supabase
    .from("topic_links")
    .select("*")
    .eq("user_id", userId)
    .or(
      lowerTopics
        .map(
          (topic) =>
            `source_topic.ilike.${topic},target_topic.ilike.${topic}`
        )
        .join(",")
    )
    .order("weight", { ascending: false })
    .limit(limit);

  if (linksError) {
    console.log("RELATED TOPIC LINKS ERROR:", linksError);
    return "";
  }

  if (!links?.length) return "";

  const relatedNames = Array.from(
    new Set(
      links.flatMap((link) => [
        link.source_topic,
        link.target_topic,
      ])
    )
  );

  const { data: lifeTopics } = await supabase
    .from("life_topics")
    .select("topic, category, entity_type, description, weight, mention_count, relationship_strength")
    .eq("user_id", userId)
    .in("topic", relatedNames);

  const topicDescriptions =
    lifeTopics
      ?.map(
        (t) =>
          `- ${t.topic} | ${t.entity_type || "unknown"} | ${
            t.category || "general"
          } | ${t.description || "nessuna descrizione"}`
      )
      .join("\n") || "";

  const linksText = links
    .map(
      (l) =>
        `- ${l.source_topic} ↔ ${l.target_topic} | ${l.link_type} | peso ${l.weight}`
    )
    .join("\n");

  return `
COLLEGAMENTI MIRATI:
${linksText}

DETTAGLI TOPIC COLLEGATI:
${topicDescriptions || "nessun dettaglio"}
`.trim();
}