import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function saveSignificantPlace({
  userId,
  label,
  category,
  latitude,
  longitude,
  radiusMeters = 30,
}: {
  userId: string;
  label: string;
  category: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}) {
  const { data, error } = await supabaseAdmin
    .from("significant_places")
    .insert({
      user_id: userId,
      label,
      category,
      latitude,
      longitude,
      radius_meters: radiusMeters,
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
    .eq("user_id", userId);

  if (error) {
    console.log("GET PLACES ERROR:", error);
    return [];
  }

  return data || [];
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

  for (const place of places) {
    const distance = distanceMeters(
      latitude,
      longitude,
      place.latitude,
      place.longitude
    );

    if (distance <= place.radius_meters) {
      return place;
    }
  }

  return null;
}