import { supabase } from "@/lib/supabase";

export async function getAuthenticatedJsonHeaders() {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}
