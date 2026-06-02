import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function generateCuriosityMessage(userId: string) {
  if (!userId) return null;

  // evita una curiosità ogni 5 minuti: GhostMe sì, stalker no 😄
  const { data: recent } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "curiosity")
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (recent && recent.length > 0) return null;

  const { data: topics } = await supabaseAdmin
    .from("life_topics")
    .select("topic, category, entity_type, description, weight, mention_count, status, needs_clarification, last_mentioned_at")
    .eq("user_id", userId)
    .order("weight", { ascending: false })
    .limit(20);

  if (!topics?.length) return null;

  const missingMeaning = topics.find(
    (t) =>
      !t.description &&
      (t.mention_count || 0) >= 3 &&
      t.status !== "archived"
  );

  if (missingMeaning) {
    return `Ho notato che "${missingMeaning.topic}" continua a comparire, ma non ho ancora capito bene cosa rappresenta per te. È qualcosa di importante o solo un argomento passato di lì?`;
  }

  const dominant = topics.find(
    (t) =>
      (t.weight || 0) >= 8 &&
      (t.mention_count || 0) >= 5 &&
      t.status !== "archived"
  );

  if (dominant) {
    return `"${dominant.topic}" sta diventando uno degli argomenti più presenti nel tuo mondo. È davvero una priorità in questo periodo o ci stiamo girando attorno perché è rimasta aperta?`;
  }

  return null;
}