import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";
import { buildAgendaMessage } from "@/lib/ghostme/agenda/agendaEngine";
import { refreshReminderMessage } from "@/lib/ghostme/agenda/reminderEngine";
import { runProactiveTrigger } from "@/lib/ghostme/proactive/proactiveTrigger";

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

  let finalEndAt = endAt || null;

  if (type === "appointment" && startAt && !finalEndAt) {
    const endDate = new Date(startAt);
    endDate.setHours(endDate.getHours() + 1);
    finalEndAt = endDate.toISOString();
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
        end_at: finalEndAt,
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

    await runProactiveTrigger({
    userId,
    trigger: "calendar_changed",
  });

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

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: existingAgendaMessages } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id, message, created_at")
    .eq("user_id", userId)
    .eq("category", "agenda")
    .in("status", ["unread", "read"])
    .gte("created_at", startOfToday.toISOString())
    .order("created_at", { ascending: false })
    .limit(20);

  const existing = existingAgendaMessages?.[0] || null;

  async function dismissDuplicateAgendaMessages(keepId?: string | null) {
    const duplicateIds = (existingAgendaMessages || [])
      .map((message) => message.id)
      .filter((id) => id && id !== keepId);

    if (!duplicateIds.length) return;

    await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({
        status: "dismissed",
        updated_at: new Date().toISOString(),
      })
      .in("id", duplicateIds);
  }

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
    await dismissDuplicateAgendaMessages(existing?.id || null);
    return;
  }

  if (existing?.id) {
    await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({
        title: "Agenda di oggi",
        message: agendaMessage,
        status: "unread",
        read_at: null,
        priority: 5,
        scheduled_for: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    await dismissDuplicateAgendaMessages(existing.id);
    return;
  }

  const { data: inserted } = await supabaseAdmin.from("ghost_proactive_messages").insert({
    user_id: userId,
    title: "Agenda di oggi",
    message: agendaMessage,
    category: "agenda",
    status: "unread",
    priority: 5,
    scheduled_for: new Date().toISOString(),
  }).select("id").single();

  await dismissDuplicateAgendaMessages(inserted?.id || null);
}

export async function cleanupExpiredEvents(userId: string) {
  if (!userId) return;

  const now = new Date().toISOString();

  // Appuntamenti con end_at passato
  await supabaseAdmin
    .from("calendar_events")
    .update({
      status: "completed",
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("status", "active")
    .not("end_at", "is", null)
    .lt("end_at", now);

  // Eventi senza end_at ma con start_at passato
  await supabaseAdmin
    .from("calendar_events")
    .update({
      status: "completed",
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("status", "active")
    .is("end_at", null)
    .not("start_at", "is", null)
    .lt("start_at", now);

  // Promemoria senza start_at/end_at ma remind_at passato
  await supabaseAdmin
    .from("calendar_events")
    .update({
      status: "completed",
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("status", "active")
    .is("start_at", null)
    .is("end_at", null)
    .not("remind_at", "is", null)
    .lt("remind_at", now);
}
