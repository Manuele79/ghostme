import { supabaseAdmin } from "@/lib/supabaseAdmin";

function cleanHint(value: any) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function shortText(value: any, max = 60) {
  const clean = cleanHint(value);
  return clean.length > max ? clean.slice(0, max).trim() : clean;
}

function addHints(target: string[], values: any[]) {
  for (const value of values) {
    const clean = cleanHint(value);
    if (!clean) continue;
    target.push(clean);
  }
}

function uniqueHints(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const clean = cleanHint(value);
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;

    seen.add(key);
    result.push(clean);
    if (result.length >= 25) break;
  }

  return result;
}

const LOCATION_FRESHNESS_WINDOW_MS = 2 * 60 * 60 * 1000;

function isFreshLocationState(location: any) {
  const timestamp = location?.updated_at || location?.last_changed_at;
  if (!timestamp) return false;

  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return false;

  return Date.now() - time <= LOCATION_FRESHNESS_WINDOW_MS;
}

export async function loadUserContextGraph(userId: string) {
  if (!userId) {
    return {
      graph: {
        profile: null,
        currentLocation: null,
        significantPlaces: [],
        calendarUpcoming: [],
        goals: [],
        actionIntents: [],
        people: [],
        proactiveRecent: [],
        houseLearnedRules: [],
        houseAutomationControls: [],
        housePatterns: [],
        behaviorPatterns: [],
        topics: [],
        memories: [],
        episodes: [],
        summaries: [],
      },
      searchHints: [],
    };
  }

  const now = new Date().toISOString();

  const [
    profileRes,
    currentLocationRes,
    placesRes,
    calendarRes,
    goalsRes,
    actionsRes,
    peopleRes,
    proactiveRes,
    houseRulesRes,
    houseControlsRes,
    housePatternsRes,
    patternsRes,
    topicsRes,
    memoriesRes,
    episodesRes,
    summariesRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabaseAdmin
      .from("user_location_state")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),

    supabaseAdmin
      .from("significant_places")
      .select("id, label, category, address, last_seen_at, visit_count")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("last_seen_at", { ascending: false, nullsFirst: false })
      .limit(5),

    supabaseAdmin
      .from("calendar_events")
      .select("id, type, title, description, start_at, remind_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`start_at.gte.${now},remind_at.gte.${now}`)
      .order("start_at", { ascending: true })
      .limit(5),

    supabaseAdmin
      .from("goals_desires")
      .select("id, title, description, category, importance, updated_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("importance", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("action_intents")
      .select("id, intent_type, title, description, priority, updated_at")
      .eq("user_id", userId)
      .in("status", ["detected", "pending"])
      .order("priority", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("people_graph")
      .select("id, name, relationship_type, description, importance, mention_count")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("importance", { ascending: false })
      .order("mention_count", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id, category, title, message, status, priority, created_at")
      .eq("user_id", userId)
      .in("status", ["unread", "read"])
      .order("created_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("house_learned_rules")
      .select("id, rule_key, title, description, status, confidence, updated_at")
      .eq("user_id", userId)
      .in("status", ["active", "learning"])
      .order("confidence", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("house_automation_controls")
      .select("id, automation_key, automation_name, room_key, control_type, status, updated_at")
      .eq("user_id", userId)
      .in("status", ["pending", "pending_confirmation", "active"])
      .order("updated_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("house_patterns")
      .select("id, pattern_type, title, description, status, confidence, occurrences, last_seen_at, updated_at")
      .eq("user_id", userId)
      .in("status", ["active", "learning"])
      .order("confidence", { ascending: false })
      .order("last_seen_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("behavior_patterns")
      .select("id, pattern_type, title, description, status, confidence, occurrences, last_seen_at")
      .eq("user_id", userId)
      .in("status", ["active", "learning"])
      .order("confidence", { ascending: false })
      .order("last_seen_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("life_topics")
      .select("topic, category, entity_type, description, weight, mention_count, relationship_strength")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("weight", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("memories_active")
      .select("title, content, category, importance, pinned, updated_at")
      .eq("user_id", userId)
      .or("pinned.eq.true,importance.gte.7")
      .order("pinned", { ascending: false })
      .order("importance", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("episodic_memories")
      .select("summary, emotional_tone, related_topics, importance, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("conversation_summaries")
      .select("title, summary, topics, emotional_tone, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  const graph = {
    profile: profileRes.data || null,
    currentLocation: currentLocationRes.data || null,
    significantPlaces: placesRes.data || [],
    calendarUpcoming: calendarRes.data || [],
    goals: goalsRes.data || [],
    actionIntents: actionsRes.data || [],
    people: peopleRes.data || [],
    proactiveRecent: proactiveRes.data || [],
    houseLearnedRules: houseRulesRes.data || [],
    houseAutomationControls: houseControlsRes.data || [],
    housePatterns: housePatternsRes.data || [],
    behaviorPatterns: patternsRes.data || [],
    topics: topicsRes.data || [],
    memories: memoriesRes.data || [],
    episodes: episodesRes.data || [],
    summaries: summariesRes.data || [],
  };

  const hints: string[] = [];

  if (isFreshLocationState(graph.currentLocation)) {
    addHints(hints, [graph.currentLocation?.current_place_label]);
  }
  addHints(hints, graph.significantPlaces.map((place: any) => place.label));
  addHints(hints, graph.calendarUpcoming.map((event: any) => event.title));
  addHints(hints, graph.goals.map((goal: any) => goal.title));
  addHints(hints, graph.actionIntents.map((action: any) => action.title));
  addHints(hints, graph.people.map((person: any) => person.name));
  addHints(hints, graph.proactiveRecent.map((message: any) => message.title));
  addHints(
    hints,
    graph.houseLearnedRules.flatMap((rule: any) => [rule.title, rule.rule_key])
  );
  addHints(hints, graph.housePatterns.map((pattern: any) => pattern.title));
  addHints(hints, graph.topics.map((topic: any) => topic.topic));
  addHints(
    hints,
    graph.memories.map((memory: any) => memory.title || shortText(memory.content))
  );

  return {
    graph,
    searchHints: uniqueHints(hints),
  };
}
