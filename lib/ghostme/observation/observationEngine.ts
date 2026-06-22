import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ObservationEventType =
  | "location_enter"
  | "location_exit"
  | "home_arrived"
  | "home_left"
  | "work_arrived"
  | "work_left"
  | "place_unknown_detected";

export type UnknownPlaceCandidate = {
  id: string;
  latitude: number;
  longitude: number;
  confidence: number;
  occurrences: number;
  averageAccuracy: number | null;
  firstSeenAt: string;
  lastSeenAt: string;
  suggestedCategory: string | null;
};

const UNKNOWN_PLACE_RADIUS_METERS = 120;
const UNKNOWN_PLACE_MIN_VISITS = 3;
const UNKNOWN_PLACE_MIN_CONFIDENCE = 7;
const DISTINCT_VISIT_WINDOW_MS = 2 * 60 * 60 * 1000;

function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function coordinatesFor(event: any) {
  const latitude = Number(event?.context?.latitude);
  const longitude = Number(event?.context?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

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

async function upsertUnknownPlaceCandidate({
  userId,
  events,
}: {
  userId: string;
  events: any[];
}): Promise<UnknownPlaceCandidate | null> {
  const distinctEvents: any[] = [];
  for (const event of events) {
    const occurredAt = new Date(event?.occurred_at || 0).getTime();
    const previousAt = new Date(
      distinctEvents[distinctEvents.length - 1]?.occurred_at || 0
    ).getTime();
    if (
      distinctEvents.length &&
      Number.isFinite(occurredAt) &&
      Number.isFinite(previousAt) &&
      occurredAt - previousAt < DISTINCT_VISIT_WINDOW_MS
    ) {
      continue;
    }
    distinctEvents.push(event);
  }

  const points = distinctEvents.map(coordinatesFor).filter(Boolean) as Array<{
    latitude: number;
    longitude: number;
  }>;
  if (points.length < UNKNOWN_PLACE_MIN_VISITS) return null;

  const latitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  const longitude = points.reduce((sum, point) => sum + point.longitude, 0) / points.length;
  const { data: knownPlaces } = await supabaseAdmin
    .from("significant_places")
    .select("latitude, longitude, radius_meters")
    .eq("user_id", userId)
    .neq("status", "archived");
  const alreadyKnown = (knownPlaces || []).some((place) =>
    distanceMeters(
      latitude,
      longitude,
      Number(place.latitude),
      Number(place.longitude)
    ) <= Number(place.radius_meters || UNKNOWN_PLACE_RADIUS_METERS)
  );
  if (alreadyKnown) return null;

  const accuracies = distinctEvents
    .map((event) => Number(event?.context?.accuracy))
    .filter((accuracy) => Number.isFinite(accuracy) && accuracy > 0);
  const averageAccuracy = accuracies.length
    ? accuracies.reduce((sum, accuracy) => sum + accuracy, 0) / accuracies.length
    : null;
  const accuracyScore =
    averageAccuracy === null ? 1 : averageAccuracy <= 50 ? 2 : averageAccuracy <= 100 ? 1 : 0;
  const confidence = Math.min(10, points.length * 2 + accuracyScore);
  if (confidence < UNKNOWN_PLACE_MIN_CONFIDENCE) return null;
  const suggestedCategory =
    distinctEvents
      .map((event) =>
        String(
          event?.context?.suggested_category ||
            event?.context?.external_category ||
            ""
        ).trim()
      )
      .find(Boolean) || null;

  const { data: existingPatterns } = await supabaseAdmin
    .from("behavior_patterns")
    .select("id, trigger_conditions")
    .eq("user_id", userId)
    .eq("pattern_type", "unknown_place_candidate")
    .in("status", ["learning", "active"]);
  const existing = (existingPatterns || []).find((pattern) => {
    const candidateLatitude = Number(pattern.trigger_conditions?.latitude);
    const candidateLongitude = Number(pattern.trigger_conditions?.longitude);
    return (
      Number.isFinite(candidateLatitude) &&
      Number.isFinite(candidateLongitude) &&
      distanceMeters(latitude, longitude, candidateLatitude, candidateLongitude) <=
        UNKNOWN_PLACE_RADIUS_METERS
    );
  });

  const payload = {
    pattern_type: "unknown_place_candidate",
    title: "Luogo sconosciuto visitato più volte",
    description: "Luogo ricorrente ancora senza nome.",
    place_label: null,
    place_id: null,
    trigger_conditions: {
      latitude,
      longitude,
      radius_meters: UNKNOWN_PLACE_RADIUS_METERS,
      suggested_category: suggestedCategory,
    },
    learned_from: {
      events: points.length,
      window_days: 30,
      average_accuracy: averageAccuracy,
    },
    confidence,
    occurrences: points.length,
    status: "active",
    first_seen_at: distinctEvents[0]?.occurred_at || new Date().toISOString(),
    last_seen_at:
      distinctEvents[distinctEvents.length - 1]?.occurred_at ||
      new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const query = existing?.id
    ? supabaseAdmin
        .from("behavior_patterns")
        .update(payload)
        .eq("id", existing.id)
        .eq("user_id", userId)
    : supabaseAdmin.from("behavior_patterns").insert({ user_id: userId, ...payload });
  const { data, error } = await query.select("id").single();
  if (error || !data?.id) {
    console.log("UNKNOWN PLACE CANDIDATE ERROR:", error);
    return null;
  }

  return {
    id: data.id,
    latitude,
    longitude,
    confidence,
    occurrences: points.length,
    averageAccuracy,
    firstSeenAt: payload.first_seen_at,
    lastSeenAt: payload.last_seen_at,
    suggestedCategory,
  };
}

export async function analyzeLocationPatterns(userId: string) {
  if (!userId) return [] as UnknownPlaceCandidate[];

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
    return [] as UnknownPlaceCandidate[];
  }

  if (!events?.length) return [] as UnknownPlaceCandidate[];

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

  if (
    unknownEvents.length >= 3 &&
    unknownEvents.every((event) => !coordinatesFor(event))
  ) {
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

  const unknownClusters: any[][] = [];
  for (const event of unknownEvents) {
    const coordinates = coordinatesFor(event);
    if (!coordinates) continue;
    const cluster = unknownClusters.find((items) => {
      const anchor = coordinatesFor(items[0]);
      return (
        anchor &&
        distanceMeters(
          coordinates.latitude,
          coordinates.longitude,
          anchor.latitude,
          anchor.longitude
        ) <= UNKNOWN_PLACE_RADIUS_METERS
      );
    });
    if (cluster) cluster.push(event);
    else unknownClusters.push([event]);
  }

  const unknownPlaceCandidates = (
    await Promise.all(
      unknownClusters.map((cluster) =>
        upsertUnknownPlaceCandidate({ userId, events: cluster })
      )
    )
  ).filter(Boolean) as UnknownPlaceCandidate[];

  if (unknownPlaceCandidates.length) {
    await supabaseAdmin
      .from("behavior_patterns")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("pattern_type", "unknown_place_repeated")
      .in("status", ["learning", "active"]);
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

  return unknownPlaceCandidates;
}
