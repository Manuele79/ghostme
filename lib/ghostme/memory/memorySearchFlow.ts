import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function memorySearchFlow(body: any) {
  if (!body.userId || !body.query?.trim()) {
    return {
      status: 400,
      body: { error: "userId o query mancante" },
    };
  }

  const userId = body.userId;
  const q = `%${body.query.trim()}%`;

  const [
    topicsRes,
    memoriesRes,
    timelineRes,
    goalsRes,
    actionsRes,
    linksRes,
    summariesRes,
    episodesRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("life_topics")
      .select("*")
      .eq("user_id", userId)
      .or(`topic.ilike.${q},description.ilike.${q},notes.ilike.${q}`)
      .limit(10),

    supabaseAdmin
      .from("memories_active")
      .select("*")
      .eq("user_id", userId)
      .or(`title.ilike.${q},content.ilike.${q},category.ilike.${q}`)
      .limit(10),

    supabaseAdmin
      .from("autobiographical_timeline")
      .select("*")
      .eq("user_id", userId)
      .or(`title.ilike.${q},summary.ilike.${q},source_message.ilike.${q}`)
      .limit(10),

    supabaseAdmin
      .from("goals_desires")
      .select("*")
      .eq("user_id", userId)
      .or(`title.ilike.${q},description.ilike.${q},category.ilike.${q}`)
      .limit(10),

    supabaseAdmin
      .from("action_intents")
      .select("*")
      .eq("user_id", userId)
      .or(`title.ilike.${q},description.ilike.${q},source_message.ilike.${q}`)
      .limit(10),

    supabaseAdmin
      .from("topic_links")
      .select("*")
      .eq("user_id", userId)
      .or(`source_topic.ilike.${q},target_topic.ilike.${q},link_type.ilike.${q}`)
      .limit(20),

    supabaseAdmin
      .from("conversation_summaries")
      .select("*")
      .eq("user_id", userId)
      .or(`title.ilike.${q},summary.ilike.${q}`)
      .limit(8),

    supabaseAdmin
      .from("episodic_memories")
      .select("*")
      .eq("user_id", userId)
      .ilike("summary", q)
      .limit(8),
  ]);

  return {
    status: 200,
    body: {
      success: true,
      results: {
        topics: topicsRes.data || [],
        memories: memoriesRes.data || [],
        timeline: timelineRes.data || [],
        goals: goalsRes.data || [],
        actions: actionsRes.data || [],
        links: linksRes.data || [],
        summaries: summariesRes.data || [],
        episodes: episodesRes.data || [],
      },
    },
  };
}
