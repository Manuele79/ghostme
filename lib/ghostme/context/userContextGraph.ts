import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { classifyLocationState } from "@/lib/ghostme/location/locationStateFreshness";
import {
  filterActiveGoals,
  filterFutureCalendar,
  filterOpenActions,
} from "@/lib/ghostme/context/temporalPriority";

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

export async function loadUserContextGraph(userId: string) {
  if (!userId) {
    return {
      graph: {
        profile: null,
        currentLocation: null,
        lastKnownLocation: null,
        locationStatus: "unknown",
        significantPlaces: [],
        calendarUpcoming: [],
        goals: [],
        actionIntents: [],
        people: [],
        proactiveRecent: [],
        proactiveHandledRecent: [],
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
    proactiveHandledRes,
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
      .select("id, type, title, description, start_at, remind_at, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`start_at.gte.${now},remind_at.gte.${now}`)
      .order("start_at", { ascending: true })
      .limit(5),

    supabaseAdmin
      .from("goals_desires")
      .select("id, title, description, category, importance, status, updated_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("importance", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("action_intents")
      .select("id, intent_type, title, description, priority, status, updated_at")
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
      .gte(
        "updated_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .order("created_at", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id, category, title, message, status, priority, created_at")
      .eq("user_id", userId)
      .in("status", ["dismissed", "answered", "expired"])
      .order("created_at", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("house_learned_rules")
      .select("id, rule_key, title, description, status, confidence, updated_at")
      .eq("user_id", userId)
      .in("status", ["active", "learning"])
      .order("confidence", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("house_automation_controls")
      .select("id, automation_key, automation_name, room_key, control_type, status, last_action, last_reason, expires_at, updated_at")
      .eq("user_id", userId)
      .in("status", [
        "pending",
        "pending_confirmation",
        "suggested",
        "proposed",
        "needs_review",
        "active",
        "enabled",
      ])
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("updated_at", { ascending: false })
      .limit(8),

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

  const locationFreshness = classifyLocationState(currentLocationRes.data);
  const graph = {
    profile: profileRes.data || null,
    currentLocation: locationFreshness.currentLocation,
    lastKnownLocation: locationFreshness.lastKnownLocation,
    locationStatus: locationFreshness.status,
    significantPlaces: placesRes.data || [],
    calendarUpcoming: filterFutureCalendar(calendarRes.data || [], []),
    goals: filterActiveGoals(goalsRes.data || []),
    actionIntents: filterOpenActions(actionsRes.data || [], []),
    people: peopleRes.data || [],
    proactiveRecent: proactiveRes.data || [],
    proactiveHandledRecent: proactiveHandledRes.data || [],
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

  if (graph.locationStatus === "current") {
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
