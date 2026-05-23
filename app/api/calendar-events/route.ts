import { NextResponse } from "next/server";
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