import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";
import { buildAgendaMessage } from "@/lib/ghostme/agenda/agendaEngine";
import { refreshReminderMessage } from "@/lib/ghostme/agenda/reminderEngine";
import {
  buildDailyProactiveLogicalKey,
  upsertProactiveMessage,
} from "@/lib/ghostme/proactive/proactiveMessageService";

export type GhostCalendarEventType =
  | "appointment"
  | "reminder"
  | "note"
  | "voice_note";

const GENERIC_TITLES = new Set(["appuntamento", "promemoria", "nota"]);

function cleanText(value: any) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeCalendarTitle({
  title,
  type,
  description,
}: {
  title: string;
  type: GhostCalendarEventType;
  description?: string | null;
}) {
  const cleanTitle = cleanText(title);
  const cleanDescription = cleanText(description);

  if (!GENERIC_TITLES.has(cleanTitle.toLowerCase())) return cleanTitle;
  if (!cleanDescription) return cleanTitle;

  return type === "appointment"
    ? `Appuntamento: ${cleanDescription}`
    : cleanDescription;
}

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

  const finalTitle = normalizeCalendarTitle({ title, type, description });
  let finalRemindAt = remindAt || null;

  if (type === "appointment" && startAt && !finalRemindAt) {
    const reminderDate = new Date(startAt);
    reminderDate.setHours(reminderDate.getHours() - 1);
    finalRemindAt = reminderDate.toISOString();
  }

  const finalStartAt =
    startAt || (type === "reminder" ? finalRemindAt : null);

  let finalEndAt = endAt || null;

  if (type === "appointment" && finalStartAt && !finalEndAt) {
    const endDate = new Date(finalStartAt);
    endDate.setHours(endDate.getHours() + 1);
    finalEndAt = endDate.toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .insert([
      {
        user_id: userId,
        type,
        title: finalTitle,
        description,
        start_at: finalStartAt,
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

  await refreshReminderMessage(userId);

  const situation = await buildGhostSituation(userId);
  const agendaMessage = buildAgendaMessage(situation);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  async function loadVisibleAgendaMessages() {
    const { data } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id, message, created_at")
      .eq("user_id", userId)
      .eq("category", "agenda")
      .in("status", ["unread", "read"])
      .gte("created_at", startOfToday.toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    return data || [];
  }

  async function dismissDuplicateAgendaMessages(keepId?: string | null) {
    const visibleAgendaMessages = await loadVisibleAgendaMessages();
    const duplicateIds = visibleAgendaMessages
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
    await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("category", "agenda")
      .in("status", ["unread", "read"])
      .gte("created_at", startOfToday.toISOString());
    return;
  }

  await upsertProactiveMessage({
    userId,
    title: "Agenda di oggi",
    message: agendaMessage,
    category: "agenda",
    priority: 5,
    logicalKey: buildDailyProactiveLogicalKey("agenda"),
  });

  const visibleAgendaMessages = await loadVisibleAgendaMessages();
  const keepId = visibleAgendaMessages[0]?.id || null;

  await dismissDuplicateAgendaMessages(keepId);
}

export async function cleanupExpiredEvents(userId: string) {
  if (!userId) return;

  const now = new Date().toISOString();
  const graceDate = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  function applyFreshnessGuard(query: any) {
    return query
      .lt("created_at", graceDate)
      .or(`updated_at.is.null,updated_at.lt.${graceDate}`);
  }

  // Appuntamenti con end_at passato
  await applyFreshnessGuard(
    supabaseAdmin
    .from("calendar_events")
    .update({
      status: "completed",
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("type", "appointment")
    .not("end_at", "is", null)
    .lt("end_at", now)
  );

  // Note/eventi non appointment senza end_at ma con start_at passato
  await applyFreshnessGuard(
    supabaseAdmin
    .from("calendar_events")
    .update({
      status: "completed",
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("status", "active")
    .is("end_at", null)
    .not("start_at", "is", null)
    .neq("type", "appointment")
    .lt("start_at", now)
  );

  // Promemoria senza start_at/end_at ma remind_at passato
  await applyFreshnessGuard(
    supabaseAdmin
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
    .lt("remind_at", now)
  );
}
