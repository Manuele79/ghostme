import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  recordObservation,
  analyzeLocationPatterns,
} from "@/lib/ghostme/observation/observationEngine";
import { runProactiveTrigger } from "@/lib/ghostme/proactive/proactiveTrigger";
import { writeLocationCandidateCard } from "@/lib/ghostme/location/locationLearningFlow";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import { resolvePlaceFromCoordinates } from "@/lib/ghostme/location/placeResolver";
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

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return null;
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function poiResolutionContext(resolution: any) {
  if (!resolution) return null;
  return {
    status: resolution.status,
    confidence: resolution.confidence,
    source: resolution.source,
    coordinate_bucket: resolution.coordinateBucket,
    name: resolution.metadata?.name || null,
    category: resolution.metadata?.category || null,
    address: resolution.metadata?.address || null,
    question: resolution.question || null,
  };
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

  let matchedPlace = await detectCurrentPlace({
    userId: body.userId,
    latitude,
    longitude,
    markSeen: false,
  });
  const source = normalizeGpsSource(body.source);
  const deviceId = firstText(body.deviceId, body.device_id, body.sourceDeviceId);
  const placeResolution = !matchedPlace
    ? await resolvePlaceFromCoordinates({
        userId: body.userId,
        latitude,
        longitude,
        accuracy: firstNumber(body.accuracy),
        source,
        deviceId,
        externalName: firstText(
          body.externalName,
          body.external_name,
          body.placeName,
          body.place_name,
          body.poiName,
          body.poi_name
        ),
        externalCategory: firstText(
          body.externalCategory,
          body.external_category,
          body.placeCategory,
          body.place_category,
          body.poiCategory,
          body.poi_category
        ),
        address: firstText(body.address, body.formattedAddress, body.formatted_address),
        confidence: firstNumber(body.poiConfidence, body.poi_confidence, body.confidence),
      })
    : null;

  if (placeResolution?.place) {
    matchedPlace = placeResolution.place;
  }

  const resolutionContext = poiResolutionContext(placeResolution);
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
          device_id: deviceId,
          source,
          coordinate_bucket: placeResolution?.coordinateBucket || null,
          poi_resolution: resolutionContext,
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
          device_id: deviceId,
          source,
          coordinate_bucket: placeResolution?.coordinateBucket || null,
          poi_resolution: resolutionContext,
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
          device_id: deviceId,
          source,
          coordinate_bucket: placeResolution?.coordinateBucket || null,
          poi_resolution: resolutionContext,
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
          device_id: deviceId,
          source,
          coordinate_bucket: placeResolution?.coordinateBucket || null,
          poi_resolution: resolutionContext,
        },
      });
    }

    if (placeResolution?.status === "needs_confirmation" && placeResolution.question) {
      await upsertProactiveMessage({
        userId: body.userId,
        title: "Conferma luogo",
        message: `${placeResolution.question} Se era legato a qualcosa, posso ricordarlo meglio la prossima volta.`,
        category: "observation",
        priority: 7,
        logicalKey: `poi_confirm_${placeResolution.coordinateBucket}_${dayKey()}`,
        source: "poi_resolution",
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
    placeResolution,
  };
}
