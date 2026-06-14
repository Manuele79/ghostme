import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  recordObservation,
  analyzeLocationPatterns,
} from "@/lib/ghostme/observation/observationEngine";
import { runProactiveTrigger } from "@/lib/ghostme/proactive/proactiveTrigger";

export async function updateCurrentLocationFlow(body: any) {
  const { data: previousState } = await supabaseAdmin
    .from("user_location_state")
    .select("*")
    .eq("user_id", body.userId)
    .maybeSingle();

  const previousPlace = previousState?.current_place_label || null;
  const nextPlace = body.placeLabel || null;

  const { data, error } = await supabaseAdmin
    .from("user_location_state")
    .upsert(
      {
        user_id: body.userId,
        current_place_id: body.placeId || null,
        current_place_label: body.placeLabel || null,
        place_category: body.placeCategory || body.category || null,
        address: body.address || null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        accuracy: body.accuracy ?? null,
        confidence: body.confidence ?? 50,
        source: body.source || "browser",
        last_changed_at:
          previousPlace !== nextPlace ? new Date().toISOString() : previousState?.last_changed_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    console.log("UPDATE CURRENT LOCATION ERROR:", error);
    throw new Error("Luogo attuale non salvato");
  }

  if (previousPlace !== nextPlace) {
    if (previousPlace) {
      await recordObservation({
        userId: body.userId,
        eventType:
          previousPlace.toLowerCase() === "casa"
            ? "home_left"
            : previousPlace.toLowerCase() === "lavoro"
              ? "work_left"
              : "location_exit",
        source: body.source || "browser",
        placeLabel: previousPlace,
        placeId: previousState?.current_place_id || null,
        value: {
          from: previousPlace,
          to: nextPlace,
        },
        context: {
          latitude: body.latitude ?? null,
          longitude: body.longitude ?? null,
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
        source: body.source || "browser",
        placeLabel: nextPlace,
        placeId: body.placeId || null,
        value: {
          from: previousPlace,
          to: nextPlace,
        },
        context: {
          latitude: body.latitude ?? null,
          longitude: body.longitude ?? null,
        },
      });
    }

    if (!nextPlace) {
      await recordObservation({
        userId: body.userId,
        eventType: "place_unknown_detected",
        source: body.source || "browser",
        placeLabel: null,
        placeId: null,
        value: {
          from: previousPlace,
          to: null,
        },
        context: {
          latitude: body.latitude ?? null,
          longitude: body.longitude ?? null,
        },
      });
    }

    await analyzeLocationPatterns(body.userId);

    await runProactiveTrigger({
      userId: body.userId,
      trigger: "location_changed",
    });

  }

  return {
    location: data,
    changed: previousPlace !== nextPlace,
    previousPlace,
    nextPlace,
  };
}
