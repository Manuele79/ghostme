import { NextResponse } from "next/server";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";
import { loadVisibleProactiveMessages } from "@/lib/ghostme/proactive/visibleProactiveMessages";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = await getAuthenticatedUserId(req, body.userId);

    const snapshot = await buildGhostBrainSnapshot(userId);

    const proactiveMessages = await loadVisibleProactiveMessages(userId);
    const excludedGoalStatuses = new Set(["completed", "archived", "cancelled"]);
    const visibleGoals = (snapshot.goals?.activeGoals || []).filter(
      (goal) =>
        !excludedGoalStatuses.has(String(goal.status || "").toLowerCase())
    );

    return NextResponse.json({
      snapshot,
      profile: snapshot.profile || null,
      traits: null,
      memories: snapshot.memory.activeMemories || [],
      timeline: snapshot.memory.timeline || [],
      goals: visibleGoals,
      mentalState: snapshot.profile?.mentalState || null,
      actions: snapshot.actions || [],
      calendarEvents: snapshot.calendar.upcoming || [],
      proactiveMessage: proactiveMessages[0] || null,
      proactiveMessages,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.log("BRAIN API ERROR:", err);
    return NextResponse.json({ error: "Errore brain API" }, { status: 500 });
  }
}
