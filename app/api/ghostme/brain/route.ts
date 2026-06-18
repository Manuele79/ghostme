import { NextResponse } from "next/server";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: "userId mancante" }, { status: 400 });
    }

    const snapshot = await buildGhostBrainSnapshot(userId);
    const proactiveMessages = snapshot.proactive.recent || [];

    return NextResponse.json({
      snapshot,
      profile: snapshot.profile || null,
      traits: null,
      memories: snapshot.memory.memories || [],
      timeline: snapshot.memory.timeline || [],
      goals: snapshot.goals || [],
      mentalState: snapshot.profile?.mentalState || null,
      actions: snapshot.actions || [],
      calendarEvents: snapshot.calendar.upcoming || [],
      proactiveMessage: proactiveMessages[0] || null,
      proactiveMessages,
    });
  } catch (err) {
    console.log("BRAIN API ERROR:", err);
    return NextResponse.json({ error: "Errore brain API" }, { status: 500 });
  }
}
