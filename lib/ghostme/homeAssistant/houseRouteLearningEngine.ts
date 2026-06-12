import { supabaseAdmin } from "@/lib/supabaseAdmin";

const VALID_PATHS = new Set([
  "salotto→scale",
  "scale→salotto",
  "scale→cucina",
  "cucina→scale",
  "scale→camera",
  "camera→scale",
  "scale→armadio",
  "armadio→scale",
  "armadio→bagno",
  "bagno→armadio",
  "salotto→fuori_casa",
  "fuori_casa→salotto",
  "cucina→fuori_casa",
  "fuori_casa→cucina",
]);

function routeKey(from: string, to: string) {
  return `${from}→${to}`;
}

export async function learnHouseRoutes(userId: string) {
  if (!userId) return [];

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await supabaseAdmin
    .from("house_events")
    .select("room_key, event_type, occurred_at, people_home_count")
    .eq("user_id", userId)
    .gte("occurred_at", since)
    .in("event_type", ["motion_on", "presence_on", "person_location_changed"])
    .order("occurred_at", { ascending: true });

  if (error || !events?.length) {
    console.log("LEARN HOUSE ROUTES ERROR:", error);
    return [];
  }

  const transitions = new Map<string, number>();

  const cleanEvents = events.filter((e) => e.room_key);

  for (let i = 0; i < cleanEvents.length - 1; i++) {
    const current = cleanEvents[i];
    const next = cleanEvents[i + 1];

    if (!current.room_key || !next.room_key) continue;
    if (current.room_key === next.room_key) continue;

    const diffMs =
      new Date(next.occurred_at).getTime() -
      new Date(current.occurred_at).getTime();

    if (diffMs < 0 || diffMs > 90 * 1000) continue;

    const key = routeKey(current.room_key, next.room_key);

    if (!VALID_PATHS.has(key)) continue;

    transitions.set(key, (transitions.get(key) || 0) + 1);
  }

  const learned: any[] = [];

  for (const [path, count] of transitions.entries()) {
    if (count < 2) continue;

    const [fromRoom, toRoom] = path.split("→");

    const confidence = Math.min(10, Math.max(2, Math.round(count / 2)));

    const ruleKey = `route_${fromRoom}_${toRoom}`;

    const title = `Percorso frequente: ${fromRoom} → ${toRoom}`;

    const description = `GhostMe ha osservato più volte il transito ${fromRoom} → ${toRoom}. Può usarlo per capire meglio gli spostamenti in casa e prevenire spegnimenti troppo rapidi.`;

    const payload = {
      user_id: userId,
      rule_key: ruleKey,
      title,
      description,
      trigger_conditions: {
        from_room: fromRoom,
        to_room: toRoom,
        observed_count_30d: count,
        max_seconds_between_events: 90,
      },
      suggested_action: {
        use_route_for_presence_reasoning: true,
        avoid_turning_off_previous_room_immediately: true,
      },
      confidence,
      status: confidence >= 6 ? "active" : "learning",
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabaseAdmin
      .from("house_learned_rules")
      .select("id, confirmations_yes, confirmations_no")
      .eq("user_id", userId)
      .eq("rule_key", ruleKey)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("house_learned_rules")
        .update(payload)
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("house_learned_rules").insert({
        ...payload,
        confirmations_yes: 0,
        confirmations_no: 0,
      });
    }

    learned.push({
      path,
      count,
      confidence,
      status: payload.status,
    });
  }

  return learned;
}