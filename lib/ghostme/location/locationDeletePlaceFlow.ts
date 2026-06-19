import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function deleteLocationPlaceFlow(id: string, userId: string) {
  return supabaseAdmin
    .from("significant_places")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}
