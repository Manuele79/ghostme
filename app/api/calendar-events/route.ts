import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  createCalendarEvent,
  refreshAgendaMessage,
} from "@/lib/ghostme/calendar/calendarService";

const GENERIC_TITLES = new Set(["appuntamento", "promemoria", "nota"]);

function cleanText(value: any) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeTitle(title: any, type: any, description: any) {
  const cleanTitle = cleanText(title);
  const cleanDescription = cleanText(description);

  if (!GENERIC_TITLES.has(cleanTitle.toLowerCase())) return cleanTitle;
  if (!cleanDescription) return cleanTitle;

  return type === "appointment"
    ? `Appuntamento: ${cleanDescription}`
    : cleanDescription;
}

function buildCalendarPatchPayload(body: any) {
  const type = body.type || "note";
  const remindAtInput = body.remindAt || null;
  const startAt =
    body.startAt || (type === "reminder" ? remindAtInput : null);
  let endAt = body.endAt || null;
  let remindAt = remindAtInput;

  if (type === "appointment" && startAt && !endAt) {
    const endDate = new Date(startAt);
    endDate.setHours(endDate.getHours() + 1);
    endAt = endDate.toISOString();
  }

  if (type === "appointment" && startAt && !remindAt) {
    const remindDate = new Date(startAt);
    remindDate.setHours(remindDate.getHours() - 1);
    remindAt = remindDate.toISOString();
  }

  return {
    type,
    title: normalizeTitle(body.title, type, body.description),
    description: body.description || "",
    start_at: startAt,
    end_at: endAt,
    remind_at: remindAt,
    status: "active",
    updated_at: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const saved = await createCalendarEvent({
      userId: body.userId,
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
    console.log("CREATE CALENDAR API ERROR:", err);
    return NextResponse.json({ error: "Errore calendario" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (!body.id || !body.userId) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("calendar_events")
      .update(buildCalendarPatchPayload(body))
      .eq("id", body.id)
      .eq("user_id", body.userId)
      .select()
      .single();

    if (error) {
      console.log("UPDATE CALENDAR ERROR:", error);
      return NextResponse.json({ error: "Evento non modificato" }, { status: 500 });
    }

     await refreshAgendaMessage(body.userId);

    return NextResponse.json({ event: data });
  } catch (err) {
    console.log("PATCH CALENDAR API ERROR:", err);
    return NextResponse.json({ error: "Errore modifica calendario" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    if (!body.id || !body.userId) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("calendar_events")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .eq("user_id", body.userId);

    if (error) {
      console.log("DELETE CALENDAR ERROR:", error);
      return NextResponse.json({ error: "Evento non eliminato" }, { status: 500 });
    }

    await refreshAgendaMessage(body.userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.log("DELETE CALENDAR API ERROR:", err);
    return NextResponse.json({ error: "Errore elimina calendario" }, { status: 500 });
  }
}
