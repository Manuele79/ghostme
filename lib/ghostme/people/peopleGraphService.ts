import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function clamp(value: number, min = 1, max = 10) {
  return Math.min(Math.max(value, min), max);
}

export async function upsertPersonFromTopic({
  userId,
  name,
  relationshipType,
  description,
  confidence = 60,
  source = "life_topics",
}: {
  userId: string;
  name: string;
  relationshipType?: string | null;
  description?: string | null;
  confidence?: number;
  source?: string;
}) {
  if (!userId || !name?.trim()) return null;

  const normalizedName = normalizeName(name);

  const { data: existing } = await supabaseAdmin
    .from("people_graph")
    .select("id, mention_count, importance, confidence")
    .eq("user_id", userId)
    .eq("normalized_name", normalizedName)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabaseAdmin
      .from("people_graph")
      .update({
        name: name.trim(),
        relationship_type: relationshipType || null,
        description: description || null,
        mention_count: Number(existing.mention_count || 0) + 1,
        importance: clamp(Number(existing.importance || 5) + 1),
        confidence: Math.max(Number(existing.confidence || 60), confidence),
        last_mentioned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "active",
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.log("PEOPLE GRAPH UPDATE ERROR:", error);
      return null;
    }

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("people_graph")
    .insert({
      user_id: userId,
      name: name.trim(),
      normalized_name: normalizedName,
      relationship_type: relationshipType || null,
      category: "person",
      importance: 5,
      confidence,
      description: description || null,
      source,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.log("PEOPLE GRAPH INSERT ERROR:", error);
    return null;
  }

  return data;
}

export async function syncPeopleGraphFromTopics(userId: string) {
  if (!userId) return { synced: 0 };

  const { data: peopleTopics, error } = await supabaseAdmin
    .from("life_topics")
    .select("topic, category, entity_type, description, relationship_strength, mention_count")
    .eq("user_id", userId)
    .eq("entity_type", "person")
    .neq("status", "archived")
    .limit(100);

  if (error) {
    console.log("SYNC PEOPLE GRAPH TOPICS ERROR:", error);
    return { synced: 0, error: error.message };
  }

  let synced = 0;

  for (const topic of peopleTopics || []) {
    const person = await upsertPersonFromTopic({
      userId,
      name: topic.topic,
      relationshipType: topic.category || null,
      description: topic.description || null,
      confidence: Math.min(
        90,
        50 + Number(topic.mention_count || 0) * 5
      ),
    });

    if (person) synced++;
  }

  return { synced };
}

export async function getPeopleGraphContext(userId: string) {
  if (!userId) return "";

  const { data, error } = await supabaseAdmin
    .from("people_graph")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("importance", { ascending: false })
    .order("mention_count", { ascending: false })
    .limit(12);

  if (error) {
    console.log("GET PEOPLE GRAPH CONTEXT ERROR:", error);
    return "";
  }

  if (!data?.length) return "";

  return data
    .map(
      (p) =>
        `- ${p.name} | relazione ${p.relationship_type || "non specificata"} | importanza ${p.importance} | menzioni ${p.mention_count} | ${p.description || ""}`
    )
    .join("\n");
}