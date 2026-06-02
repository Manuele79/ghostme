import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";
import { buildAgendaMessage } from "@/lib/ghostme/agenda/agendaEngine";

export type GhostCalendarEventType =
  | "appointment"
  | "reminder"
  | "note"
  | "voice_note";

export async function createCalendarEvent({
  userId,
  type = "appointment",
  title,
  description = "",
  startAt,
  endAt,
  remindAt,
  source = "ghostme",
}: {
  userId: string;
  type?: GhostCalendarEventType;
  title: string;
  description?: string;
  startAt?: string | null;
  endAt?: string | null;
  remindAt?: string | null;
  source?: "manual" | "voice" | "ghostme" | "imported";
}) {
  if (!userId || !title?.trim()) return null;

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .insert([
      {
        user_id: userId,
        type,
        title,
        description,
        start_at: startAt || null,
        end_at: endAt || null,
        remind_at: remindAt || null,
        source,
        status: "active",
      },
    ])
    .select()
    .single();

  if (error) {
    console.log("CREATE CALENDAR EVENT ERROR:", error);
    return null;
  }

  await refreshAgendaMessage(userId);

  return data;
}

export async function getUpcomingCalendarEvents(userId: string) {
  if (!userId) return [];

  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(10);

  if (error) {
    console.log("GET UPCOMING CALENDAR ERROR:", error);
    return [];
  }

  return data || [];
}

export async function refreshAgendaMessage(userId: string) {
  if (!userId) return;

  const situation = await buildGhostSituation(userId);
  const agendaMessage = buildAgendaMessage(situation);

  await supabaseAdmin
    .from("ghost_proactive_messages")
    .update({
      status: "read",
      read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("category", "agenda")
    .eq("status", "unread");

  if (!agendaMessage) return;

  await supabaseAdmin.from("ghost_proactive_messages").insert({
    user_id: userId,
    title: "Agenda di oggi",
    message: agendaMessage,
    category: "agenda",
    status: "unread",
    priority: 5,
    scheduled_for: new Date().toISOString(),
  });
}