import { supabaseAdmin } from "@/lib/supabaseAdmin";

function daysBetween(date?: string | null) {
  if (!date) return 999;

  const last = new Date(date).getTime();

  return Math.floor(
    (Date.now() - last) /
      (1000 * 60 * 60 * 24)
  );
}

export async function applyPatternDecay(userId: string) {
  if (!userId) return;

  const { data: patterns } = await supabaseAdmin
    .from("behavior_patterns")
    .select("*")
    .eq("user_id", userId);

  if (!patterns?.length) return;

  for (const pattern of patterns) {
    const daysOld = daysBetween(pattern.last_seen_at);

    let confidence = pattern.confidence || 1;
    let status = pattern.status || "active";

    if (daysOld > 30) {
      confidence = Math.max(confidence - 1, 1);
    }

    if (daysOld > 60) {
      status = "fading";
    }

    if (daysOld > 120 && confidence <= 3) {
      status = "archived";
    }

    await supabaseAdmin
      .from("behavior_patterns")
      .update({
        confidence,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pattern.id);
  }
}