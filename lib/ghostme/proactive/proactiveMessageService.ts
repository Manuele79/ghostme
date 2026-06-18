import { supabaseAdmin } from "@/lib/supabaseAdmin";



export async function upsertProactiveMessage({
  userId,
  title,
  message,
  category,
  priority,
}: {
  userId: string;
  title: string;
  message: string;
  category: string;
  priority: number;
}) {
  if (!userId || !message?.trim()) return;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const onePerDayCategories = new Set(["agenda", "daily_briefing", "reminder"]);
  const shouldKeepOnePerDay = onePerDayCategories.has(category);

  let existingQuery = supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id, message, status")
    .eq("user_id", userId)
    .eq("category", category)
    .in("status", ["unread", "read"]);

  if (shouldKeepOnePerDay) {
    existingQuery = existingQuery.gte("created_at", startOfToday.toISOString());
  }

  const { data: existing } = await existingQuery
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const messageChanged = existing.message !== message;

    // Se il messaggio è uguale, aggiorna solo priorità/timestamp.
    if (!messageChanged) {
      await supabaseAdmin
        .from("ghost_proactive_messages")
        .update({
          title,
          priority,
          scheduled_for: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      return;
    }

    // Se era unread, o Ã¨ una card giornaliera, aggiorna lo stesso record.
    if (existing.status === "unread" || shouldKeepOnePerDay) {
      await supabaseAdmin
        .from("ghost_proactive_messages")
        .update({
          title,
          message,
          priority,
          status: "unread",
          read_at: null,
          scheduled_for: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      return;
    }
  }

  // Se non esiste, o l'ultimo era già read con contenuto diverso,
  // crea un nuovo messaggio.
  await supabaseAdmin.from("ghost_proactive_messages").insert({
    user_id: userId,
    title,
    message,
    category,
    status: "unread",
    priority,
    scheduled_for: new Date().toISOString(),
  });
}
