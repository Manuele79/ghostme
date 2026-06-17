import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function deleteLocationPlaceFlow(id: string) {
  return supabaseAdmin
    .from("significant_places")
    .delete()
    .eq("id", id);
}
