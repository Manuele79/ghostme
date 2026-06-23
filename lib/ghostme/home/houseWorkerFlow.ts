import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { analyzeHousePatterns } from "@/lib/ghostme/homeAssistant/housePatternEngine";
import { generateHouseSuggestions } from "@/lib/ghostme/homeAssistant/houseSuggestionEngine";
import { learnHouseRoutes } from "@/lib/ghostme/homeAssistant/houseRouteLearningEngine";
import { generateHouseAutomationSuggestions } from "@/lib/ghostme/homeAssistant/houseAutomationSuggestionEngine";
import { planHouseAutomationControls } from "@/lib/ghostme/homeAssistant/houseAutomationControlPlanner";
import { syncHouseEntities } from "@/lib/ghostme/homeAssistant/houseEntityRegistry";
import { bridgeHomeAssistantLocationFlow } from "@/lib/ghostme/location/haLocationBridgeFlow";
import { requireWorkerRequest, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";
import { getHomeAssistantUserIds } from "@/lib/ghostme/homeAssistant/homeAssistantAccess";
import { getHAStates } from "@/lib/ghostme/homeAssistant/haClient";
import { getEntityInfo } from "@/lib/ghostme/homeAssistant/homeEntityMapper";

const HOUSE_WORKER_BATCH_SIZE = 20;
const HOUSE_WORKER_LOOKBACK_MS = 2 * 60 * 60 * 1000;

type PendingHouseEvent = {
  id: string;
  entity_id: string;
  event_type: string;
  occurred_at: string;
  value: Record<string, unknown> | null;
};

type HAStateLike = {
  entity_id: string;
  state: string;
};

function jsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isHomeState(entityType: string, value: unknown) {
  const state = String(value || "").trim().toLowerCase();
  if (["", "unknown", "unavailable", "not_home"].includes(state)) return false;
  if (entityType === "phone") {
    return state === "home" || state === "casa" || state.includes("windtre");
  }
  return entityType === "person" && (state === "home" || state === "casa");
}

function peopleHomeCount(states: HAStateLike[]) {
  const people = new Set<string>();
  for (const state of states) {
    const info = getEntityInfo(state.entity_id);
    if (!info.person || !isHomeState(info.type, state.state)) continue;
    people.add(info.person);
  }
  return people.size;
}

async function claimSignificantHouseEvents(userId: string) {
  const cutoff = new Date(Date.now() - HOUSE_WORKER_LOOKBACK_MS).toISOString();
  const { data, error } = await supabaseAdmin
    .from("house_events")
    .select("id, entity_id, event_type, occurred_at, value")
    .eq("user_id", userId)
    .gte("occurred_at", cutoff)
    .is("value->>house_worker_processed_at", null)
    .order("occurred_at", { ascending: true })
    .limit(HOUSE_WORKER_BATCH_SIZE);

  if (error) {
    console.log("HOUSE WORKER EVENT READ ERROR:", {
      userId,
      code: error.code || null,
      message: error.message,
    });
    return { events: [] as PendingHouseEvent[], error: error.message };
  }

  const claimed: PendingHouseEvent[] = [];
  for (const event of (data || []) as PendingHouseEvent[]) {
    const processedAt = new Date().toISOString();
    const value = {
      ...jsonObject(event.value),
      house_worker_processed_at: processedAt,
    };
    const claim = await supabaseAdmin
      .from("house_events")
      .update({ value })
      .eq("id", event.id)
      .eq("user_id", userId)
      .is("value->>house_worker_processed_at", null)
      .select("id")
      .maybeSingle();

    if (claim.error) {
      console.log("HOUSE WORKER EVENT CLAIM ERROR:", {
        userId,
        eventId: event.id,
        code: claim.error.code || null,
        message: claim.error.message,
      });
      continue;
    }
    if (claim.data) claimed.push({ ...event, value });
  }

  return { events: claimed, error: null };
}

export async function houseWorkerFlow(req: Request) {
  try {
    requireWorkerRequest(req);
  } catch (err) {
    return {
      status: err instanceof UserContextAuthError ? err.status : 401,
      body: { success: false, error: err instanceof Error ? err.message : "Unauthorized" },
    };
  }

  const userIds = getHomeAssistantUserIds();
  if (!userIds.length) {
    return {
      status: 500,
      body: { success: false, error: "Manca la configurazione utenti Home Assistant" },
    };
  }

  const users = userIds.map((user_id) => ({ user_id }));
  const pendingByUser = await Promise.all(
    users.map(async (user) => ({
      ...user,
      claim: await claimSignificantHouseEvents(user.user_id),
    }))
  );
  const activeUsers = pendingByUser.filter((user) => user.claim.events.length > 0);

  if (!activeUsers.length) {
    console.log("HOUSE WORKER SKIPPED: no significant events");
    return {
      status: 200,
      body: {
        success: true,
        skipped: true,
        reason: "no_significant_events",
        users: users.length,
        eventsClaimed: 0,
        errors: pendingByUser
          .filter((user) => user.claim.error)
          .map((user) => ({ userId: user.user_id, error: user.claim.error })),
        results: [],
      },
    };
  }

  const states = await getHAStates({ force: true });
  const currentPeopleHomeCount = peopleHomeCount(states as HAStateLike[]);
  const results: Array<Record<string, unknown>> = [];

  for (const user of activeUsers) {
    const claimedIds = user.claim.events.map((event) => event.id);
    const occupancyUpdate = await supabaseAdmin
      .from("house_events")
      .update({ people_home_count: currentPeopleHomeCount })
      .eq("user_id", user.user_id)
      .in("id", claimedIds);
    if (occupancyUpdate.error) {
      console.log("HOUSE WORKER OCCUPANCY UPDATE ERROR:", {
        userId: user.user_id,
        code: occupancyUpdate.error.code || null,
        message: occupancyUpdate.error.message,
      });
    }

    const locationBridge = await bridgeHomeAssistantLocationFlow({
      userId: user.user_id,
      states,
    });
    const entitySync = await syncHouseEntities(user.user_id, states);
    const patterns = await analyzeHousePatterns(user.user_id);
    const routes = await learnHouseRoutes(user.user_id);
    const suggestions = await generateHouseSuggestions(user.user_id);
    const automationSuggestions = await generateHouseAutomationSuggestions(user.user_id);
    const controlPlans = await planHouseAutomationControls(user.user_id);

    results.push({
      userId: user.user_id,
      eventsClaimed: user.claim.events.length,
      eventIds: user.claim.events.map((event) => event.id),
      locationBridge,
      entitySync,
      patterns,
      routes,
      suggestionsCreated: suggestions.length + automationSuggestions.length,
      automationSuggestionsCreated: automationSuggestions.length,
      controlPlansCreated: controlPlans.length,
    });
  }

  return {
    status: 200,
    body: {
      success: true,
      skipped: false,
      users: users.length,
      activeUsers: activeUsers.length,
      eventsClaimed: activeUsers.reduce(
        (total, user) => total + user.claim.events.length,
        0
      ),
      results,
    },
  };
}
