import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { annotateHistoricalRows } from "@/lib/ghostme/context/temporalPriority";

export type MemorySnapshot = {
  activeMemories: any[];
  episodicMemories: any[];
  summaries: any[];
  timeline: any[];
  topics: any[];
  lastUpdated: string | null;
};

function latestTimestamp(values: Array<string | null | undefined>) {
  let latest: string | null = null;
  let latestTime = 0;

  for (const value of values) {
    if (!value) continue;

    const time = new Date(value).getTime();
    if (Number.isNaN(time) || time <= latestTime) continue;

    latest = value;
    latestTime = time;
  }

  return latest;
}

export async function buildMemorySnapshot(
  userId: string
): Promise<MemorySnapshot> {
  if (!userId) {
    return {
      activeMemories: [],
      episodicMemories: [],
      summaries: [],
      timeline: [],
      topics: [],
      lastUpdated: null,
    };
  }

  const [
    memoriesRes,
    episodesRes,
    summariesRes,
    timelineRes,
    topicsRes,
    linksRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("memories_active")
      .select("title, content, category, importance, pinned, updated_at")
      .eq("user_id", userId)
      .or("pinned.eq.true,importance.gte.7")
      .order("pinned", { ascending: false })
      .order("importance", { ascending: false })
      .limit(12),

    supabaseAdmin
      .from("episodic_memories")
      .select("summary, emotional_tone, related_topics, importance, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("conversation_summaries")
      .select("title, summary, topics, emotional_tone, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("autobiographical_timeline")
      .select("*")
      .eq("user_id", userId)
      .order("event_date", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("life_topics")
      .select("topic, category, entity_type, description, weight, mention_count, relationship_strength, status, last_mentioned_at, updated_at")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("weight", { ascending: false })
      .limit(20),

    supabaseAdmin
      .from("topic_links")
      .select("updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  return {
    activeMemories: annotateHistoricalRows(memoriesRes.data || []),
    episodicMemories: annotateHistoricalRows(episodesRes.data || []),
    summaries: annotateHistoricalRows(summariesRes.data || []),
    timeline: annotateHistoricalRows(timelineRes.data || []),
    topics: topicsRes.data || [],
    lastUpdated: latestTimestamp([
      ...(memoriesRes.data || []).map((memory: any) => memory.updated_at),
      ...(episodesRes.data || []).map((episode: any) => episode.created_at),
      ...(summariesRes.data || []).map((summary: any) => summary.updated_at),
      ...(timelineRes.data || []).map((event: any) => event.updated_at || event.event_date),
      ...(topicsRes.data || []).map((topic: any) => topic.updated_at),
      ...(topicsRes.data || []).map((topic: any) => topic.last_mentioned_at),
      ...(linksRes.data || []).map((link: any) => link.updated_at),
    ]),
  };
}
