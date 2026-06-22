import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { classifyLocationState } from "@/lib/ghostme/location/locationStateFreshness";

export async function getLocationCurrentStateFlow(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_location_state")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return { data, error, freshness: classifyLocationState(data) };
}
