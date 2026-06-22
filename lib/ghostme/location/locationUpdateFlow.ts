import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  recordObservation,
  analyzeLocationPatterns,
} from "@/lib/ghostme/observation/observationEngine";
import { runProactiveTrigger } from "@/lib/ghostme/proactive/proactiveTrigger";
import { writeLocationCandidateCard } from "@/lib/ghostme/location/locationLearningFlow";
import {
  detectCurrentPlace,
  distanceMeters,
  markSignificantPlaceSeen,
} from "@/lib/ghostme/location/placeService";

function normalizeGpsSource(source: unknown) {
  const value = String(source || "").toLowerCase();
  return value.includes("phone") || value.includes("mobile")
    ? "phone_gps"
    : "browser_gps";
}

function validCoordinate(value: unknown, minimum: number, maximum: number) {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum && number <= maximum
    ? number
    : null;
}

export async function updateCurrentLocationFlow(body: any) {
  const latitude = validCoordinate(body.latitude, -90, 90);
  const longitude = validCoordinate(body.longitude, -180, 180);
  if (latitude === null || longitude === null) {
    throw new Error("Coordinate GPS non valide");
  }

  const { data: previousState } = await supabaseAdmin
    .from("user_location_state")
    .select("*")
    .eq("user_id", body.userId)
    .maybeSingle();

  const matchedPlace = await detectCurrentPlace({
    userId: body.userId,
    latitude,
    longitude,
    markSeen: false,
  });
  const source = normalizeGpsSource(body.source);
  const previousPlace = previousState?.current_place_label || null;
  const nextPlace = matchedPlace?.label || null;
  const movedWhileUnknown =
    !previousPlace &&
    !nextPlace &&
    Number.isFinite(Number(previousState?.latitude)) &&
    Number.isFinite(Number(previousState?.longitude)) &&
    distanceMeters(
      Number(previousState.latitude),
      Number(previousState.longitude),
      latitude,
      longitude
    ) > 120;
  const placeChanged =
    previousState?.current_place_id !== (matchedPlace?.id || null) ||
    previousPlace !== nextPlace ||
    movedWhileUnknown;
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("user_location_state")
    .upsert(
      {
        user_id: body.userId,
        current_place_id: matchedPlace?.id || null,
        current_place_label: nextPlace,
        place_category: matchedPlace?.category || "unknown_location",
        address: matchedPlace?.address || null,
        latitude,
        longitude,
        accuracy: body.accuracy ?? null,
        confidence: body.confidence ?? 50,
        source,
        last_changed_at:
          placeChanged ? now : previousState?.last_changed_at || now,
        updated_at: now,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    console.log("UPDATE CURRENT LOCATION ERROR:", error);
    throw new Error("Luogo attuale non salvato");
  }

  if (matchedPlace && placeChanged) {
    await markSignificantPlaceSeen(matchedPlace);
  }

  if (placeChanged) {
    if (previousPlace) {
      await recordObservation({
        userId: body.userId,
        eventType:
          previousPlace.toLowerCase() === "casa"
            ? "home_left"
            : previousPlace.toLowerCase() === "lavoro"
              ? "work_left"
              : "location_exit",
        source: source === "phone_gps" ? "phone" : "browser",
        placeLabel: previousPlace,
        placeId: previousState?.current_place_id || null,
        value: {
          from: previousPlace,
          to: nextPlace,
        },
        context: {
          latitude,
          longitude,
          accuracy: body.accuracy ?? null,
        },
      });
    }

    if (nextPlace) {
      await recordObservation({
        userId: body.userId,
        eventType:
          nextPlace.toLowerCase() === "casa"
            ? "home_arrived"
            : nextPlace.toLowerCase() === "lavoro"
              ? "work_arrived"
              : "location_enter",
        source: source === "phone_gps" ? "phone" : "browser",
        placeLabel: nextPlace,
        placeId: matchedPlace?.id || null,
        value: {
          from: previousPlace,
          to: nextPlace,
        },
        context: {
          latitude,
          longitude,
          accuracy: body.accuracy ?? null,
        },
      });
    }

    if (!nextPlace) {
      await recordObservation({
        userId: body.userId,
        eventType: "place_unknown_detected",
        source: source === "phone_gps" ? "phone" : "browser",
        placeLabel: null,
        placeId: null,
        value: {
          from: previousPlace,
          to: null,
        },
        context: {
          latitude,
          longitude,
          accuracy: body.accuracy ?? null,
        },
      });
    }

    if (nextPlace) {
      await analyzeLocationPatterns(body.userId);
      await runProactiveTrigger({
        userId: body.userId,
        trigger: "location_changed",
      });
    }

  }

  if (
    !nextPlace &&
    body.latitude != null &&
    body.longitude != null
  ) {
    if (!placeChanged) {
      await recordObservation({
        userId: body.userId,
        eventType: "place_unknown_detected",
        source: source === "phone_gps" ? "phone" : "browser",
        placeLabel: null,
        placeId: null,
        value: { from: previousPlace, to: null },
        context: {
          latitude,
          longitude,
          accuracy: body.accuracy ?? null,
        },
      });
    }

    const candidates = await analyzeLocationPatterns(body.userId);
    for (const candidate of candidates) {
      await writeLocationCandidateCard({ userId: body.userId, candidate });
    }
  }

  return {
    location: data,
    changed: placeChanged,
    previousPlace,
    nextPlace,
    matchedPlace,
  };
}
