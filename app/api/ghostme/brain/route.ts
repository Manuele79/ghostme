import { NextResponse } from "next/server";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";

function dedupeProactiveMessages(messages: any[]) {
  const seen = new Set<string>();
  const result: any[] = [];

  for (const message of messages || []) {
    const key = [
      message.category || "",
      message.title || "",
      message.message || "",
    ].join("|");

    if (seen.has(key)) continue;
    seen.add(key);
    result.push(message);
  }

  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: "userId mancante" }, { status: 400 });
    }

    const snapshot = await buildGhostBrainSnapshot(userId);
    const proactiveMessages = dedupeProactiveMessages(
      (snapshot.proactive.recent || []).filter((message: any) =>
        ["unread", "read"].includes(message.status)
      )
    );

    return NextResponse.json({
      snapshot,
      profile: snapshot.profile || null,
      traits: null,
      memories: snapshot.memory.activeMemories || [],
      timeline: snapshot.memory.timeline || [],
      goals: snapshot.goals.activeGoals || [],
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
