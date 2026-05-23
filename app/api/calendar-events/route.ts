import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createCalendarEvent } from "@/lib/ghostme/calendar/calendarService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const saved = await createCalendarEvent({
      userId: body.userId,
      type: body.type || "note",
      title: body.title,
      description: body.description || "",
      startAt: body.startAt || null,
      endAt: null,
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
      .update({
        type: body.type,
        title: body.title,
        description: body.description || "",
        start_at: body.startAt || null,
        remind_at: body.remindAt || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .eq("user_id", body.userId)
      .select()
      .single();

    if (error) {
      console.log("UPDATE CALENDAR ERROR:", error);
      return NextResponse.json({ error: "Evento non modificato" }, { status: 500 });
    }

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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.log("DELETE CALENDAR API ERROR:", err);
    return NextResponse.json({ error: "Errore elimina calendario" }, { status: 500 });
  }
}