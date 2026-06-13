import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type SaveSignificantPlaceInput = {
  userId: string;
  label: string;
  category: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  externalName?: string | null;
  externalCategory?: string | null;
  address?: string | null;
  confidence?: number;
  source?: string;
};

function clampConfidence(value?: number) {
  return Math.min(Math.max(Number(value || 50), 0), 100);
}

function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function saveSignificantPlace({
  userId,
  label,
  category,
  latitude,
  longitude,
  radiusMeters = 100,
  externalName = null,
  externalCategory = null,
  address = null,
  confidence = 70,
  source = "manual",
}: SaveSignificantPlaceInput) {
  if (!userId || !label?.trim()) return null;

  const { data, error } = await supabaseAdmin
    .from("significant_places")
    .insert({
      user_id: userId,
      label: label.trim(),
      category: category || "unknown",
      latitude,
      longitude,
      radius_meters: radiusMeters,
      external_name: externalName,
      external_category: externalCategory,
      address,
      confidence: clampConfidence(confidence),
      source,
      status: "active",
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.log("SAVE PLACE ERROR:", error);
    return null;
  }

  return data;
}

export async function getSignificantPlaces(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("significant_places")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "archived")
    .order("last_seen_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.log("GET PLACES ERROR:", error);
    return [];
  }

  return data || [];
}

async function markPlaceSeen(place: any) {
  if (!place?.id) return;

  const { error } = await supabaseAdmin
    .from("significant_places")
    .update({
      visit_count: Number(place.visit_count || 0) + 1,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", place.id);

  if (error) {
    console.log("MARK PLACE SEEN ERROR:", error);
  }
}

export async function detectCurrentPlace({
  userId,
  latitude,
  longitude,
}: {
  userId: string;
  latitude: number;
  longitude: number;
}) {
  const places = await getSignificantPlaces(userId);

  let bestMatch: any = null;
  let bestDistance = Infinity;

  for (const place of places) {
    const distance = distanceMeters(
      latitude,
      longitude,
      place.latitude,
      place.longitude
    );

    if (distance <= place.radius_meters && distance < bestDistance) {
      bestMatch = place;
      bestDistance = distance;
    }
  }

  if (bestMatch) {
    await markPlaceSeen(bestMatch);

    return {
      ...bestMatch,
      distance_meters: Math.round(bestDistance),
    };
  }

  return null;
}

export async function getLastKnownPlace(userId: string) {
  const places = await getSignificantPlaces(userId);
  if (!places.length) return null;
  return places[0]?.label || null;
}

export async function getCurrentLocationState(userId: string) {
  if (!userId) return null;

  const { data, error } = await supabaseAdmin
    .from("user_location_state")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.log("GET CURRENT LOCATION STATE ERROR:", error);
    return null;
  }

  return data;
}