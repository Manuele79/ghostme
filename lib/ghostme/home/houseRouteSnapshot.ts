import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { HouseStateSnapshot } from "@/lib/ghostme/home/houseStateSnapshot";

export type HouseRouteSnapshot = {
  knownRoutes: Array<{
    from: string;
    to: string;
    path: string;
    source: "learned" | "static";
    confidence: number;
    status?: string | null;
  }>;
  recentRoute: {
    from: string;
    to: string;
    path: string;
    occurredAt: string | null;
  } | null;
  activeRooms: string[];
  possibleMovement:
    | "salotto_to_cucina"
    | "cucina_to_salotto"
    | "towards_bathroom"
    | "towards_bedroom"
    | "uncertain_movement"
    | "no_movement";
  confidence: number;
  lastUpdated: string | null;
};

const STATIC_ROUTES = [
  ["salotto", "scale"],
  ["scale", "salotto"],
  ["scale", "cucina"],
  ["cucina", "scale"],
  ["scale", "camera"],
  ["camera", "scale"],
  ["scale", "armadio"],
  ["armadio", "scale"],
  ["armadio", "bagno"],
  ["bagno", "armadio"],
];

const MOVEMENT_EVENT_TYPES = [
  "motion_on",
  "presence_on",
  "light_on",
  "switch_on",
  "tv_on",
  "person_location_changed",
];

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleanValue = clean(value);
    if (!cleanValue || seen.has(cleanValue)) continue;

    seen.add(cleanValue);
    result.push(cleanValue);
  }

  return result;
}

function routePath(from: string, to: string) {
  return `${from} -> ${to}`;
}

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

function staticRoutes(): HouseRouteSnapshot["knownRoutes"] {
  return STATIC_ROUTES.map(([from, to]) => ({
    from,
    to,
    path: routePath(from, to),
    source: "static",
    confidence: 55,
    status: "fallback",
  }));
}

function routeFromRule(rule: any) {
  const conditions = rule.trigger_conditions || {};
  const from = clean(conditions.from_room);
  const to = clean(conditions.to_room);

  if (!from || !to) return null;

  return {
    from,
    to,
    path: routePath(from, to),
    source: "learned" as const,
    confidence: Math.min(100, Number(rule.confidence || 0) * 10),
    status: rule.status || null,
  };
}

function recentRouteFromEvents(events: any[]) {
  const cleanEvents = (events || [])
    .filter((event) => clean(event.room_key))
    .sort(
      (a, b) =>
        new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );

  for (let i = 0; i < cleanEvents.length - 1; i++) {
    const current = cleanEvents[i];
    const previous = cleanEvents[i + 1];
    const from = clean(previous.room_key);
    const to = clean(current.room_key);

    if (!from || !to || from === to) continue;

    const diffMs =
      new Date(current.occurred_at).getTime() -
      new Date(previous.occurred_at).getTime();

    if (diffMs < 0 || diffMs > 5 * 60 * 1000) continue;

    return {
      from,
      to,
      path: routePath(from, to),
      occurredAt: current.occurred_at || null,
    };
  }

  return null;
}

function inferPossibleMovement({
  recentRoute,
  activeRooms,
}: {
  recentRoute: HouseRouteSnapshot["recentRoute"];
  activeRooms: string[];
}): HouseRouteSnapshot["possibleMovement"] {
  const rooms = activeRooms.map(clean);

  if (recentRoute?.from === "salotto" && recentRoute.to === "cucina") {
    return "salotto_to_cucina";
  }

  if (recentRoute?.from === "cucina" && recentRoute.to === "salotto") {
    return "cucina_to_salotto";
  }

  if (
    recentRoute?.to === "bagno" ||
    (rooms.includes("armadio") && rooms.includes("bagno"))
  ) {
    return "towards_bathroom";
  }

  if (recentRoute?.to === "camera" || rooms.includes("camera")) {
    return "towards_bedroom";
  }

  if (recentRoute || rooms.length > 1 || rooms.includes("scale")) {
    return "uncertain_movement";
  }

  return "no_movement";
}

function confidenceFor({
  knownRoutes,
  recentRoute,
  activeRooms,
}: {
  knownRoutes: HouseRouteSnapshot["knownRoutes"];
  recentRoute: HouseRouteSnapshot["recentRoute"];
  activeRooms: string[];
}) {
  if (recentRoute && knownRoutes.some((route) => route.path === recentRoute.path)) {
    return 80;
  }

  if (recentRoute) return 65;
  if (activeRooms.length > 1) return 55;
  if (activeRooms.length === 1) return 40;
  return 25;
}

export async function buildHouseRouteSnapshot({
  userId,
  houseState,
}: {
  userId: string;
  houseState: HouseStateSnapshot;
}): Promise<HouseRouteSnapshot> {
  const activeRooms = unique(houseState.activeRooms || []);

  if (!userId) {
    return {
      knownRoutes: staticRoutes(),
      recentRoute: null,
      activeRooms,
      possibleMovement: inferPossibleMovement({ recentRoute: null, activeRooms }),
      confidence: activeRooms.length ? 40 : 25,
      lastUpdated: houseState.lastUpdated,
    };
  }

  const [rulesRes, eventsRes] = await Promise.all([
    supabaseAdmin
      .from("house_learned_rules")
      .select("rule_key, title, trigger_conditions, confidence, status, updated_at")
      .eq("user_id", userId)
      .in("status", ["learning", "active"])
      .like("rule_key", "route_%")
      .order("confidence", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("house_events")
      .select("room_key, event_type, occurred_at")
      .eq("user_id", userId)
      .in("event_type", MOVEMENT_EVENT_TYPES)
      .not("room_key", "is", null)
      .order("occurred_at", { ascending: false })
      .limit(30),
  ]);

  if (rulesRes.error) {
    console.log("HOUSE ROUTE SNAPSHOT RULES ERROR:", rulesRes.error);
  }

  if (eventsRes.error) {
    console.log("HOUSE ROUTE SNAPSHOT EVENTS ERROR:", eventsRes.error);
  }

  const learnedRoutes = (rulesRes.data || [])
    .map(routeFromRule)
    .filter(Boolean) as HouseRouteSnapshot["knownRoutes"];
  const knownRoutes = learnedRoutes.length ? learnedRoutes : staticRoutes();
  const recentRoute = recentRouteFromEvents(eventsRes.data || []);
  const possibleMovement = inferPossibleMovement({ recentRoute, activeRooms });

  return {
    knownRoutes,
    recentRoute,
    activeRooms,
    possibleMovement,
    confidence: confidenceFor({ knownRoutes, recentRoute, activeRooms }),
    lastUpdated: latestTimestamp([
      houseState.lastUpdated,
      ...(rulesRes.data || []).map((rule: any) => rule.updated_at),
      ...(eventsRes.data || []).map((event: any) => event.occurred_at),
    ]),
  };
}
