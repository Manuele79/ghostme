import { supabaseAdmin } from "@/lib/supabaseAdmin";
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

type CalendarSource = "manual" | "voice" | "ghostme" | "imported";

type CalendarEventInput = {
  type: GhostCalendarEventType;
  title: string;
  description?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  remindAt?: string | null;
};

const GENERIC_TITLES = new Set(["appuntamento", "promemoria", "nota"]);
const ALLOWED_TYPES = new Set<GhostCalendarEventType>([
  "appointment",
  "reminder",
  "note",
  "voice_note",
]);
const ONE_HOUR_MS = 60 * 60 * 1000;

export class CalendarContractError extends Error {
  status: 400 | 404 | 409;

  constructor(message: string, status: 400 | 404 | 409 = 400) {
    super(message);
    this.name = "CalendarContractError";
    this.status = status;
  }
}

function cleanText(value: unknown) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeCalendarTitle(input: CalendarEventInput) {
  const cleanTitle = cleanText(input.title);
  const cleanDescription = cleanText(input.description);

  if (!GENERIC_TITLES.has(cleanTitle.toLowerCase())) return cleanTitle;
  if (!cleanDescription) return cleanTitle;
  return input.type === "appointment"
    ? `Appuntamento: ${cleanDescription}`
    : cleanDescription;
}

function validIsoOrNull(value: string | null | undefined, field: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new CalendarContractError(`${field} non valido`);
  }
  return parsed.toISOString();
}

function defaultAppointmentReminder(startAt: string) {
  const startTime = new Date(startAt).getTime();
  const reminderTime =
    startTime - Date.now() > ONE_HOUR_MS ? startTime - ONE_HOUR_MS : startTime;

  return new Date(reminderTime).toISOString();
}

function normalizeCalendarEvent(input: CalendarEventInput) {
  if (!ALLOWED_TYPES.has(input.type)) {
    throw new CalendarContractError("Tipo calendario non valido");
  }

  const title = normalizeCalendarTitle(input);
  if (!title) throw new CalendarContractError("Titolo mancante");

  let startAt = validIsoOrNull(input.startAt, "start_at");
  let remindAt = validIsoOrNull(input.remindAt, "remind_at");
  let endAt = validIsoOrNull(input.endAt, "end_at");

  if (input.type === "appointment") {
    if (!startAt) {
      throw new CalendarContractError(
        "start_at obbligatorio per un appuntamento"
      );
    }
    if (!endAt) {
      endAt = new Date(new Date(startAt).getTime() + 60 * 60 * 1000).toISOString();
    }
    if (!remindAt) remindAt = defaultAppointmentReminder(startAt);
  }

  if (input.type === "reminder") {
    if (!remindAt) {
      throw new CalendarContractError(
        "remind_at obbligatorio per un promemoria"
      );
    }
    if (!startAt) startAt = remindAt;
    endAt = null;
  }

  if (["note", "voice_note"].includes(input.type)) endAt = null;

  if (endAt && startAt && new Date(endAt) < new Date(startAt)) {
    throw new CalendarContractError("end_at precedente a start_at");
  }

  return {
    type: input.type,
    title,
    description: cleanText(input.description),
    start_at: startAt,
    end_at: endAt,
    remind_at: remindAt,
  };
}

function zoneOffsetMs(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );
  return asUtc - date.getTime();
}

function romeMidnightUtc(year: number, month: number, day: number) {
  const localAsUtc = Date.UTC(year, month - 1, day);
  let result = new Date(localAsUtc - zoneOffsetMs(new Date(localAsUtc)));
  result = new Date(localAsUtc - zoneOffsetMs(result));
  return result;
}

function romeTodayBounds() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));

  return {
    start: romeMidnightUtc(year, month, day).toISOString(),
    end: romeMidnightUtc(
      nextDate.getUTCFullYear(),
      nextDate.getUTCMonth() + 1,
      nextDate.getUTCDate()
    ).toISOString(),
  };
}

export async function refreshAgendaMessage(userId: string) {
  if (!userId) return;

  const { start, end } = romeTodayBounds();
  const logicalKey = buildDailyProactiveLogicalKey("agenda");
  const { data: events, error } = await supabaseAdmin
    .from("calendar_events")
    .select("id, type, title, description, start_at, end_at, remind_at, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .or(
      `and(start_at.gte.${start},start_at.lt.${end}),and(start_at.is.null,remind_at.gte.${start},remind_at.lt.${end})`
    )
    .order("start_at", { ascending: true });

  if (error) throw error;

  const agendaMessage = buildAgendaMessage(events || []);
  if (agendaMessage) {
    await upsertProactiveMessage({
      userId,
      title: "Agenda di oggi",
      message: agendaMessage,
      category: "agenda",
      priority: 5,
      logicalKey,
      reactivateHiddenOnChange: true,
    });
  }

  const { data: visibleAgenda } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id, logical_key, created_at")
    .eq("user_id", userId)
    .eq("category", "agenda")
    .in("status", ["unread", "read"])
    .order("created_at", { ascending: false });

  const keepId = agendaMessage
    ? visibleAgenda?.find((message) => message.logical_key === logicalKey)?.id
    : null;
  const staleIds = (visibleAgenda || [])
    .filter((message) => message.id !== keepId)
    .map((message) => message.id);

  if (staleIds.length) {
    await supabaseAdmin
      .from("ghost_proactive_messages")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .in("id", staleIds);
  }
}

export async function refreshCalendarMessages(userId: string) {
  await refreshAgendaMessage(userId);
  await refreshReminderMessage(userId);
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
}: CalendarEventInput & { userId: string; source?: CalendarSource }) {
  if (!userId) throw new CalendarContractError("Utente mancante");
  const payload = normalizeCalendarEvent({
    type,
    title,
    description,
    startAt,
    endAt,
    remindAt,
  });

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .insert({ user_id: userId, ...payload, source, status: "active" })
    .select()
    .single();

  if (error) throw error;
  await refreshCalendarMessages(userId);
  return data;
}

export async function updateCalendarEvent({
  userId,
  eventId,
  changes,
}: {
  userId: string;
  eventId: string;
  changes: Partial<CalendarEventInput>;
}) {
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("calendar_events")
    .select("*")
    .eq("id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (!existing) throw new CalendarContractError("Evento non trovato", 404);
  if (existing.status !== "active") {
    throw new CalendarContractError("Evento non più modificabile", 409);
  }

  const payload = normalizeCalendarEvent({
    type: changes.type ?? existing.type,
    title: changes.title ?? existing.title,
    description: changes.description ?? existing.description,
    startAt: changes.startAt !== undefined ? changes.startAt : existing.start_at,
    endAt: changes.endAt !== undefined ? changes.endAt : existing.end_at,
    remindAt:
      changes.remindAt !== undefined ? changes.remindAt : existing.remind_at,
  });

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("user_id", userId)
    .eq("status", "active")
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new CalendarContractError("Evento non modificato", 409);
  await refreshCalendarMessages(userId);
  return data;
}

export async function cancelCalendarEvent(userId: string, eventId: string) {
  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("user_id", userId)
    .eq("status", "active")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new CalendarContractError("Evento non trovato o già chiuso", 404);
  }
  await refreshCalendarMessages(userId);
}

export async function getUpcomingCalendarEvents(userId: string) {
  if (!userId) return [];
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .or(
      `start_at.gte.${now},and(start_at.is.null,remind_at.gte.${now})`
    )
    .order("start_at", { ascending: true })
    .order("remind_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function cleanupExpiredEvents(userId: string) {
  if (!userId) return;
  const now = new Date().toISOString();
  const graceDate = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data } = await supabaseAdmin
    .from("calendar_events")
    .update({ status: "completed", updated_at: now })
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("type", "appointment")
    .not("end_at", "is", null)
    .lt("end_at", now)
    .lt("created_at", graceDate)
    .or(`updated_at.is.null,updated_at.lt.${graceDate}`)
    .select("id");

  if (data?.length) await refreshCalendarMessages(userId);
}
