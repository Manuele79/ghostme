import { NextResponse } from "next/server";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";
import { loadVisibleProactiveMessages } from "@/lib/ghostme/proactive/visibleProactiveMessages";
import { buildDecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";
import { toPublicLocationState } from "@/lib/ghostme/location/locationStateFreshness";
import { getUpcomingCalendarEvents } from "@/lib/ghostme/calendar/calendarService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = await getAuthenticatedUserId(req, body.userId);

    const [snapshot, calendarEvents] = await Promise.all([
      buildGhostBrainSnapshot(userId),
      getUpcomingCalendarEvents(userId),
    ]);
    const decisionSnapshot = buildDecisionSnapshot(snapshot);

    const proactiveMessages = await loadVisibleProactiveMessages(userId);
    const publicSnapshot = {
      ...snapshot,
      location: {
        ...snapshot.location,
        current: toPublicLocationState(snapshot.location.current),
        lastKnown: toPublicLocationState(snapshot.location.lastKnown),
      },
    };
    const excludedGoalStatuses = new Set(["completed", "archived", "cancelled"]);
    const visibleGoals = (snapshot.goals?.activeGoals || []).filter(
      (goal) =>
        !excludedGoalStatuses.has(String(goal.status || "").toLowerCase())
    );

    return NextResponse.json({
      snapshot: publicSnapshot,
      profile: snapshot.profile || null,
      traits: null,
      memories: snapshot.memory.activeMemories || [],
      timeline: snapshot.memory.timeline || [],
      goals: visibleGoals,
      mentalState: snapshot.profile?.mentalState || null,
      actions: snapshot.actions || snapshot.goals?.pendingActions || [],
      calendarEvents,
      proactiveMessage: proactiveMessages[0] || null,
      proactiveMessages,
      decisionSnapshot,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.log("BRAIN API ERROR:", err);
    return NextResponse.json({ error: "Errore brain API" }, { status: 500 });
  }
}
