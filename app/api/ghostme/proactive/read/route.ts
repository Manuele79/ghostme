import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";
import { refreshCalendarMessages } from "@/lib/ghostme/calendar/calendarService";
import {
  HIDDEN_PROACTIVE_STATUSES,
  USER_PROACTIVE_TRANSITIONS,
  VISIBLE_PROACTIVE_STATUSES,
} from "@/lib/ghostme/proactive/proactiveCardLifecycle";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const userId = await getAuthenticatedUserId(req, body.userId);

    const { data: proactiveMessage, error: lookupError } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id, category, logical_key, status")
      .eq("id", body.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    if (!proactiveMessage) {
      return NextResponse.json({ error: "Messaggio non trovato" }, { status: 404 });
    }

    const allowedStatuses = USER_PROACTIVE_TRANSITIONS;

    const nextStatus = allowedStatuses.includes(body.status)
      ? body.status
      : body.dismissed
        ? "dismissed"
        : "read";

    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Transizione proactive non consentita" },
        { status: 400 }
      );
    }

    const terminalStatuses = HIDDEN_PROACTIVE_STATUSES;
    if (terminalStatuses.includes(proactiveMessage.status)) {
      return NextResponse.json({
        ok: true,
        status: proactiveMessage.status,
        unchanged: true,
      });
    }

    if (!VISIBLE_PROACTIVE_STATUSES.includes(proactiveMessage.status)) {
      return NextResponse.json(
        { error: "Stato proactive non valido" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    const payload: Record<string, string> = {
      status: nextStatus,
      read_at: now,
      updated_at: now,
    };

    if (nextStatus === "answered") {
      payload.answered_at = now;
    }

    if (nextStatus === "answered" && proactiveMessage.category === "reminder") {
      const logicalKeyMatch = String(proactiveMessage.logical_key || "").match(
        /^reminder_\d{4}-\d{2}-\d{2}_(.+)$/
      );
      const calendarEventId = logicalKeyMatch?.[1] || null;

      if (!calendarEventId) {
        return NextResponse.json(
          { error: "Promemoria non collegato al calendario" },
          { status: 409 }
        );
      }

      const { data: calendarEvent, error: calendarLookupError } = await supabaseAdmin
        .from("calendar_events")
        .select("id, status")
        .eq("id", calendarEventId)
        .eq("user_id", userId)
        .maybeSingle();

      if (calendarLookupError) {
        return NextResponse.json(
          { error: calendarLookupError.message },
          { status: 500 }
        );
      }

      if (!calendarEvent) {
        return NextResponse.json(
          { error: "Evento calendario non trovato" },
          { status: 404 }
        );
      }

      if (!["active", "completed"].includes(calendarEvent.status)) {
        return NextResponse.json(
          { error: "Evento calendario non completabile" },
          { status: 409 }
        );
      }

      const { error: calendarError } = await supabaseAdmin
        .from("calendar_events")
        .update({ status: "completed", updated_at: now })
        .eq("id", calendarEventId)
        .eq("user_id", userId)
        .eq("status", "active");

      if (calendarError) {
        return NextResponse.json({ error: calendarError.message }, { status: 500 });
      }

    }

    const { data: updatedMessage, error } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .update(payload)
      .eq("id", body.id)
      .eq("user_id", userId)
      .in("status", VISIBLE_PROACTIVE_STATUSES)
      .select("id, status")
      .maybeSingle();

    if (error) {
      console.log("MARK PROACTIVE READ ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedMessage) {
      const { data: currentMessage } = await supabaseAdmin
        .from("ghost_proactive_messages")
        .select("status")
        .eq("id", body.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (currentMessage && terminalStatuses.includes(currentMessage.status)) {
        return NextResponse.json({
          ok: true,
          status: currentMessage.status,
          unchanged: true,
        });
      }

      return NextResponse.json(
        { error: "Card già gestita" },
        { status: 409 }
      );
    }

    if (nextStatus === "answered" && proactiveMessage.category === "reminder") {
      await refreshCalendarMessages(userId);
    }

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.log("MARK PROACTIVE READ API ERROR:", err);
    return NextResponse.json({ error: "Errore API" }, { status: 500 });
  }
}
