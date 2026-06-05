import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ObservationEventType =
  | "location_enter"
  | "location_exit"
  | "home_arrived"
  | "home_left"
  | "work_arrived"
  | "work_left"
  | "place_unknown_detected";

export async function recordObservation({
  userId,
  eventType,
  source = "ghostme",
  placeLabel,
  placeId,
  value = {},
  context = {},
  occurredAt,
}: {
  userId: string;
  eventType: ObservationEventType;
  source?: "ghostme" | "browser" | "home_assistant" | "phone";
  placeLabel?: string | null;
  placeId?: string | null;
  value?: any;
  context?: any;
  occurredAt?: string;
}) {
  if (!userId || !eventType) return null;

  const { data, error } = await supabaseAdmin
    .from("observation_events")
    .insert([
      {
        user_id: userId,
        event_type: eventType,
        source,
        place_label: placeLabel || null,
        place_id: placeId || null,
        value,
        context,
        occurred_at: occurredAt || new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.log("RECORD OBSERVATION ERROR:", error);
    return null;
  }

  return data;
}

export async function analyzeLocationPatterns(userId: string) {
  if (!userId) return;

  const { data: events, error } = await supabaseAdmin
    .from("observation_events")
    .select("*")
    .eq("user_id", userId)
    .in("event_type", ["location_enter", "home_arrived", "work_arrived"])
    .gte(
      "occurred_at",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    )
    .order("occurred_at", { ascending: false });

  if (error) {
    console.log("ANALYZE LOCATION PATTERNS ERROR:", error);
    return;
  }

  if (!events?.length) return;

  const grouped = new Map<string, any[]>();

  for (const event of events) {
    const key = event.place_label || "unknown";
    grouped.set(key, [...(grouped.get(key) || []), event]);
  }

  for (const [placeLabel, placeEvents] of grouped.entries()) {
    if (placeLabel === "unknown") continue;
    if (placeEvents.length < 3) continue;

    const existing = await supabaseAdmin
      .from("behavior_patterns")
      .select("id, occurrences, confidence")
      .eq("user_id", userId)
      .eq("pattern_type", "frequent_place")
      .eq("place_label", placeLabel)
      .maybeSingle();

    const confidence = Math.min(placeEvents.length * 2, 10);

    if (existing.data?.id) {
      await supabaseAdmin
        .from("behavior_patterns")
        .update({
          occurrences: placeEvents.length,
          confidence,
          status: confidence >= 7 ? "active" : "learning",
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          learned_from: {
            events: placeEvents.length,
            window_days: 30,
          },
        })
        .eq("id", existing.data.id);

      continue;
    }

    await supabaseAdmin.from("behavior_patterns").insert([
      {
        user_id: userId,
        pattern_type: "frequent_place",
        title: `Luogo frequentato spesso: ${placeLabel}`,
        description: `GhostMe ha rilevato più visite a ${placeLabel} negli ultimi 30 giorni.`,
        place_label: placeLabel,
        place_id: placeEvents[0]?.place_id || null,
        trigger_conditions: {
          place_label: placeLabel,
        },
        learned_from: {
          events: placeEvents.length,
          window_days: 30,
        },
        confidence,
        occurrences: placeEvents.length,
        status: confidence >= 7 ? "active" : "learning",
        first_seen_at:
          placeEvents[placeEvents.length - 1]?.occurred_at ||
          new Date().toISOString(),
        last_seen_at: placeEvents[0]?.occurred_at || new Date().toISOString(),
      },
    ]);
  }
}