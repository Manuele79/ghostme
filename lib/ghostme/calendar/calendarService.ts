import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";
import { buildAgendaMessage } from "@/lib/ghostme/agenda/agendaEngine";
import { refreshReminderMessage } from "@/lib/ghostme/agenda/reminderEngine";

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

  let finalRemindAt = remindAt || null;

  if (type === "appointment" && startAt && !finalRemindAt) {
    const reminderDate = new Date(startAt);
    reminderDate.setHours(reminderDate.getHours() - 1);
    finalRemindAt = reminderDate.toISOString();
  }

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
        remind_at: finalRemindAt,
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

  await cleanupExpiredEvents(userId);
  await refreshReminderMessage(userId);

  const situation = await buildGhostSituation(userId);
  const agendaMessage = buildAgendaMessage(situation);

  const { data: existing } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "agenda")
    .eq("status", "unread")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!agendaMessage) {
    if (existing?.id) {
      await supabaseAdmin
        .from("ghost_proactive_messages")
        .update({
          status: "read",
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
    return;
  }

  if (existing?.id) {
    await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({
        title: "Agenda di oggi",
        message: agendaMessage,
        priority: 5,
        scheduled_for: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return;
  }

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

export async function cleanupExpiredEvents(userId: string) {
  if (!userId) return;

  const now = new Date().toISOString();

  await supabaseAdmin
    .from("calendar_events")
    .update({
      status: "completed",
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("status", "active")
    .lt("start_at", now);
}