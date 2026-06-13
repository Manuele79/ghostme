import { supabase } from "@/lib/supabase";

type LinkableTopic = {
  topic: string;
  category?: string;
  entity_type?: string;
  confidence?: number;
};

const BLOCKED_LINK_TOPICS = new Set(
  [
    "dimmi",
    "qual",
    "quale",
    "quali",
    "considera",
    "potresti",
    "prenditi",
    "hahaha",
    "ahahah",
    "ahah",
    "risposta",
    "rispondendo",
    "osservazione",
    "osservazioni",
    "attuale",
    "attuali",
    "momento",
    "utile",
    "meglio",
    "supportarti",
    "anche",
    "allora",
    "ok",
    "bene",
    "grazie",
    "fatto",
    "vai",
    "alfa",
    "romeo",
    "ai",
    "pc",
    "tv",
  ].map((x) => x.toLowerCase())
);

const CANONICAL_TOPICS: Record<string, string> = {
  ghostme: "GhostMe",
  "ghost me": "GhostMe",
  askdj: "AskDJ",
  "ask dj": "AskDJ",
  "home assistant": "Home Assistant",
  domotica: "Domotica",
  lavoro: "Lavoro",
  valentina: "Valentina",
  vale: "Valentina",
  alex: "Alex",
  "moto / piaggio": "Moto / Piaggio",
  "moto piaggio": "Moto / Piaggio",
  piaggio: "Moto / Piaggio",
  snowboard: "Snowboard",
  "alfa romeo": "Alfa Romeo",
};

function normalizeTopic(topic: string) {
  const clean = String(topic || "").trim().replace(/\s+/g, " ");
  const lower = clean.toLowerCase();

  if (CANONICAL_TOPICS[lower]) return CANONICAL_TOPICS[lower];

  return clean.replace(/\b\w/g, (l) => l.toUpperCase());
}

function isBadTopic(topic: string, item?: LinkableTopic) {
  const clean = String(topic || "").trim();
  const lower = clean.toLowerCase();

  if (!clean) return true;
  if (clean.length < 3) return true;
  if (BLOCKED_LINK_TOPICS.has(lower)) return true;

  // blocca topic singoli troppo generici
  if (/^[a-zà-ù]+$/i.test(clean) && clean.length < 4) return true;

  // blocca unknown deboli
  if (
    item?.entity_type === "unknown" &&
    Number(item?.confidence || 0) < 85
  ) {
    return true;
  }

  return false;
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
        .filter((t) => t.topic && !isBadTopic(t.topic, t))
        .map((t) => {
          const normalizedTopic = normalizeTopic(t.topic);

          return [
            normalizedTopic.toLowerCase(),
            {
              ...t,
              topic: normalizedTopic,
            },
          ];
        })
    ).values()
  );

  if (cleanTopics.length < 2) return;

  for (let i = 0; i < cleanTopics.length; i++) {
    for (let j = i + 1; j < cleanTopics.length; j++) {
      const [sourceTopic, targetTopic] = makePair(
        cleanTopics[i].topic,
        cleanTopics[j].topic
      );

      if (sourceTopic.toLowerCase() === targetTopic.toLowerCase()) continue;
      if (isBadTopic(sourceTopic) || isBadTopic(targetTopic)) continue;

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

        if (updateError) {
          console.log("TOPIC LINK UPDATE ERROR:", updateError);
        }
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

        if (insertError) {
          console.log("TOPIC LINK INSERT ERROR:", insertError);
        }
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
    .map((t) => normalizeTopic(t))
    .filter((t) => !isBadTopic(t));

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

  const cleanLinks =
    links?.filter(
      (l) =>
        !isBadTopic(l.source_topic) &&
        !isBadTopic(l.target_topic)
    ) || [];

  if (!cleanLinks.length) return "";

  const relatedNames = Array.from(
    new Set(
      cleanLinks.flatMap((link) => [
        normalizeTopic(link.source_topic),
        normalizeTopic(link.target_topic),
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

  const linksText = cleanLinks
    .map(
      (l) =>
        `- ${normalizeTopic(l.source_topic)} ↔ ${normalizeTopic(
          l.target_topic
        )} | ${l.link_type} | peso ${l.weight}`
    )
    .join("\n");

  return `
COLLEGAMENTI MIRATI:
${linksText}

DETTAGLI TOPIC COLLEGATI:
${topicDescriptions || "nessun dettaglio"}
`.trim();
}