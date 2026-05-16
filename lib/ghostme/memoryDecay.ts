import { supabase } from "@/lib/supabase";

function daysBetween(dateString?: string | null) {
  if (!dateString) return 999;

  const last = new Date(dateString).getTime();
  const now = Date.now();

  return Math.floor((now - last) / (1000 * 60 * 60 * 24));
}

export async function applyMemoryDecay(userId: string) {
  if (!userId) return;

  const { data: topics, error } = await supabase
    .from("life_topics")
    .select("*")
    .eq("user_id", userId);

  if (error || !topics?.length) {
    console.log("MEMORY DECAY READ ERROR:", error);
    return;
  }

  for (const topic of topics) {
    const daysOld = daysBetween(topic.last_mentioned_at);

    let nextWeight = topic.weight || 1;
    let nextStrength = topic.relationship_strength || 1;
    let nextStatus = topic.status || "active";

    const isStrongTopic =
      (topic.mention_count || 0) >= 5 ||
      nextStrength >= 7 ||
      nextWeight >= 7;

    const isRecent = daysOld <= 14;

    // Topic forti: diventano core
    if (isStrongTopic) {
      nextStatus = "core";
      nextWeight = Math.min(nextWeight, 10);
      nextStrength = Math.min(nextStrength, 10);
    }

    // Topic deboli e vecchi: calano
    if (!isStrongTopic && daysOld > 30) {
      nextWeight = Math.max(nextWeight - 1, 1);
      nextStrength = Math.max(nextStrength - 1, 1);
      nextStatus = "fading";
    }

    // Topic molto vecchi e poco importanti: archiviati
    if (
      !isStrongTopic &&
      daysOld > 90 &&
      (topic.mention_count || 0) <= 2
    ) {
      nextStatus = "archived";
    }

    // Topic recenti: restano attivi
    if (!isStrongTopic && isRecent) {
      nextStatus =
        topic.status === "unknown" ? "unknown" : "active";
    }

    const changed =
      nextWeight !== topic.weight ||
      nextStrength !== topic.relationship_strength ||
      nextStatus !== topic.status;

    if (!changed) continue;

    const { error: updateError } = await supabase
      .from("life_topics")
      .update({
        weight: nextWeight,
        relationship_strength: nextStrength,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", topic.id);

    console.log("MEMORY DECAY UPDATE:", topic.topic, {
      daysOld,
      nextWeight,
      nextStrength,
      nextStatus,
      updateError,
    });
  }
}