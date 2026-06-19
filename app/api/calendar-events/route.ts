import { NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";
import {
  CalendarContractError,
  cancelCalendarEvent,
  createCalendarEvent,
  updateCalendarEvent,
} from "@/lib/ghostme/calendar/calendarService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = await getAuthenticatedUserId(req, body.userId);

    const saved = await createCalendarEvent({
      userId,
      type: body.type || "note",
      title: body.title,
      description: body.description || "",
      startAt: body.startAt || null,
      endAt: body.endAt || null,
      remindAt: body.remindAt || null,
      source: "manual",
    });

    if (!saved) {
      return NextResponse.json({ error: "Evento non salvato" }, { status: 500 });
    }

    return NextResponse.json({ event: saved });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof CalendarContractError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.log("CREATE CALENDAR API ERROR:", err);
    return NextResponse.json({ error: "Errore calendario" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }
    const userId = await getAuthenticatedUserId(req, body.userId);

    const data = await updateCalendarEvent({
      userId,
      eventId: body.id,
      changes: {
        type: body.type,
        title: body.title,
        description: body.description,
        startAt: body.startAt,
        endAt: body.endAt,
        remindAt: body.remindAt,
      },
    });

    return NextResponse.json({ event: data });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof CalendarContractError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.log("PATCH CALENDAR API ERROR:", err);
    return NextResponse.json({ error: "Errore modifica calendario" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }
    const userId = await getAuthenticatedUserId(req, body.userId);

    await cancelCalendarEvent(userId, body.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof CalendarContractError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.log("DELETE CALENDAR API ERROR:", err);
    return NextResponse.json({ error: "Errore elimina calendario" }, { status: 500 });
  }
}
