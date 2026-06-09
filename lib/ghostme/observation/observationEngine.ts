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

function getTimeWindow(dateValue: string) {
  const hour = Number(
    new Intl.DateTimeFormat("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      hour12: false,
    }).format(new Date(dateValue))
  );

  if (hour >= 5 && hour < 11) return "mattina";
  if (hour >= 11 && hour < 14) return "pranzo";
  if (hour >= 14 && hour < 18) return "pomeriggio";
  if (hour >= 18 && hour < 23) return "sera";
  return "notte";
}

function getWeekday(dateValue: string) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    weekday: "long",
  }).format(new Date(dateValue));
}

async function upsertBehaviorPattern({
  userId,
  patternType,
  title,
  description,
  placeLabel,
  placeId,
  triggerConditions,
  learnedFrom,
  confidence,
  occurrences,
  firstSeenAt,
  lastSeenAt,
}: any) {
  const { data: existing } = await supabaseAdmin
    .from("behavior_patterns")
    .select("id")
    .eq("user_id", userId)
    .eq("pattern_type", patternType)
    .eq("title", title)
    .maybeSingle();

  const payload = {
    pattern_type: patternType,
    title,
    description,
    place_label: placeLabel || null,
    place_id: placeId || null,
    trigger_conditions: triggerConditions || {},
    learned_from: learnedFrom || {},
    confidence,
    occurrences,
    status: confidence >= 7 ? "active" : "learning",
    first_seen_at: firstSeenAt || new Date().toISOString(),
    last_seen_at: lastSeenAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await supabaseAdmin
      .from("behavior_patterns")
      .update(payload)
      .eq("id", existing.id);

    return;
  }

  await supabaseAdmin.from("behavior_patterns").insert([
    {
      user_id: userId,
      ...payload,
    },
  ]);
}

export async function analyzeLocationPatterns(userId: string) {
  if (!userId) return;

  const sinceIso = new Date(
    Date.now() - 1000 * 60 * 60 * 24 * 30
  ).toISOString();

  const { data: events, error } = await supabaseAdmin
    .from("observation_events")
    .select("*")
    .eq("user_id", userId)
    .gte("occurred_at", sinceIso)
    .order("occurred_at", { ascending: true });

  if (error) {
    console.log("ANALYZE LOCATION PATTERNS ERROR:", error);
    return;
  }

  if (!events?.length) return;

  const enterEvents = events.filter((event) =>
    ["location_enter", "home_arrived", "work_arrived"].includes(event.event_type)
  );

  const unknownEvents = events.filter(
    (event) => event.event_type === "place_unknown_detected"
  );

  const groupedByPlace = new Map<string, any[]>();

  for (const event of enterEvents) {
    const key = event.place_label || "unknown";
    groupedByPlace.set(key, [...(groupedByPlace.get(key) || []), event]);
  }

  for (const [placeLabel, placeEvents] of groupedByPlace.entries()) {
    if (placeLabel === "unknown") continue;
    if (placeEvents.length < 3) continue;

    const confidence = Math.min(placeEvents.length * 2, 10);

    await upsertBehaviorPattern({
      userId,
      patternType: "frequent_place",
      title: `Luogo frequentato spesso: ${placeLabel}`,
      description: `GhostMe ha rilevato più visite a ${placeLabel} negli ultimi 30 giorni.`,
      placeLabel,
      placeId: placeEvents[0]?.place_id || null,
      triggerConditions: {
        place_label: placeLabel,
      },
      learnedFrom: {
        events: placeEvents.length,
        window_days: 30,
      },
      confidence,
      occurrences: placeEvents.length,
      firstSeenAt:
        placeEvents[0]?.occurred_at || new Date().toISOString(),
      lastSeenAt:
        placeEvents[placeEvents.length - 1]?.occurred_at ||
        new Date().toISOString(),
    });

    const groupedByTimeWindow = new Map<string, any[]>();

    for (const event of placeEvents) {
      const timeWindow = getTimeWindow(event.occurred_at);
      groupedByTimeWindow.set(timeWindow, [
        ...(groupedByTimeWindow.get(timeWindow) || []),
        event,
      ]);
    }

    for (const [timeWindow, timeEvents] of groupedByTimeWindow.entries()) {
      if (timeEvents.length < 3) continue;

      const timeConfidence = Math.min(timeEvents.length * 2, 10);

      await upsertBehaviorPattern({
        userId,
        patternType: "frequent_place_time_window",
        title: `Va spesso a ${placeLabel} di ${timeWindow}`,
        description: `GhostMe ha rilevato che ${placeLabel} ricorre spesso nella fascia ${timeWindow}.`,
        placeLabel,
        placeId: timeEvents[0]?.place_id || null,
        triggerConditions: {
          place_label: placeLabel,
          time_window: timeWindow,
        },
        learnedFrom: {
          events: timeEvents.length,
          window_days: 30,
          time_window: timeWindow,
        },
        confidence: timeConfidence,
        occurrences: timeEvents.length,
        firstSeenAt:
          timeEvents[0]?.occurred_at || new Date().toISOString(),
        lastSeenAt:
          timeEvents[timeEvents.length - 1]?.occurred_at ||
          new Date().toISOString(),
      });
    }

    const groupedByWeekday = new Map<string, any[]>();

    for (const event of placeEvents) {
      const weekday = getWeekday(event.occurred_at);
      groupedByWeekday.set(weekday, [
        ...(groupedByWeekday.get(weekday) || []),
        event,
      ]);
    }

    for (const [weekday, weekdayEvents] of groupedByWeekday.entries()) {
      if (weekdayEvents.length < 3) continue;

      const weekdayConfidence = Math.min(weekdayEvents.length * 2, 10);

      await upsertBehaviorPattern({
        userId,
        patternType: "frequent_place_weekday",
        title: `Va spesso a ${placeLabel} di ${weekday}`,
        description: `GhostMe ha rilevato che ${placeLabel} ricorre spesso di ${weekday}.`,
        placeLabel,
        placeId: weekdayEvents[0]?.place_id || null,
        triggerConditions: {
          place_label: placeLabel,
          weekday,
        },
        learnedFrom: {
          events: weekdayEvents.length,
          window_days: 30,
          weekday,
        },
        confidence: weekdayConfidence,
        occurrences: weekdayEvents.length,
        firstSeenAt:
          weekdayEvents[0]?.occurred_at || new Date().toISOString(),
        lastSeenAt:
          weekdayEvents[weekdayEvents.length - 1]?.occurred_at ||
          new Date().toISOString(),
      });
    }
  }

  if (unknownEvents.length >= 3) {
    const confidence = Math.min(unknownEvents.length * 2, 10);

    await upsertBehaviorPattern({
      userId,
      patternType: "unknown_place_repeated",
      title: "Luogo sconosciuto rilevato spesso",
      description:
        "GhostMe ha rilevato più volte un luogo non ancora salvato. Potrebbe valere la pena chiedere all'utente se è un posto significativo.",
      placeLabel: null,
      placeId: null,
      triggerConditions: {
        event_type: "place_unknown_detected",
      },
      learnedFrom: {
        events: unknownEvents.length,
        window_days: 30,
      },
      confidence,
      occurrences: unknownEvents.length,
      firstSeenAt:
        unknownEvents[0]?.occurred_at || new Date().toISOString(),
      lastSeenAt:
        unknownEvents[unknownEvents.length - 1]?.occurred_at ||
        new Date().toISOString(),
    });
  }

  const transitions = new Map<string, any[]>();

  for (const event of events) {
    const from = event.value?.from;
    const to = event.value?.to;

    if (!from || !to) continue;
    if (from === to) continue;

    const key = `${from} → ${to}`;
    transitions.set(key, [...(transitions.get(key) || []), event]);
  }

  for (const [transitionLabel, transitionEvents] of transitions.entries()) {
    if (transitionEvents.length < 3) continue;

    const confidence = Math.min(transitionEvents.length * 2, 10);

    await upsertBehaviorPattern({
      userId,
      patternType: "place_transition_pattern",
      title: `Transito ricorrente: ${transitionLabel}`,
      description: `GhostMe ha rilevato più volte il passaggio ${transitionLabel}.`,
      placeLabel: null,
      placeId: null,
      triggerConditions: {
        transition: transitionLabel,
      },
      learnedFrom: {
        events: transitionEvents.length,
        window_days: 30,
        transition: transitionLabel,
      },
      confidence,
      occurrences: transitionEvents.length,
      firstSeenAt:
        transitionEvents[0]?.occurred_at || new Date().toISOString(),
      lastSeenAt:
        transitionEvents[transitionEvents.length - 1]?.occurred_at ||
        new Date().toISOString(),
    });
  }
}