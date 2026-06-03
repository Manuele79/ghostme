import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function saveSignificantPlace({
  userId,
  label,
  category,
  latitude,
  longitude,
  radiusMeters = 100,
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