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

  const { data: existing } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id, message, status")
    .eq("user_id", userId)
    .eq("category", category)
    .in("status", ["unread", "read"])
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

    // Se era unread, aggiorna lo stesso record.
    if (existing.status === "unread") {
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