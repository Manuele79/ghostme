import { refreshAgendaMessage } from "@/lib/ghostme/calendar/calendarService";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";
import { buildCurrentContext } from "@/lib/ghostme/context/contextBuilder";
import { decideProactiveMessage } from "@/lib/ghostme/proactive/proactiveDecisionEngine";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";

async function runDecisionForTrigger(userId: string) {
  const currentContext = await buildCurrentContext(userId);

  const decision = await decideProactiveMessage({
    currentContext,
  });

  if (decision.shouldSpeak && decision.message) {
    await upsertProactiveMessage({
      userId,
      title: decision.title || "Osservazione GhostMe",
      message: decision.message,
      category: decision.category || "observation",
      priority: decision.priority || 2,
    });
  }
}

export async function runProactiveTrigger({
  userId,
  trigger,
}: {
  userId: string;
  trigger:
    | "calendar_changed"
    | "daily"
    | "location_changed"
    | "memory_gap"
    | "conversation_insight";
}) {
  switch (trigger) {
    case "calendar_changed":
      await refreshAgendaMessage(userId);
      break;

    case "daily":
      await runDecisionForTrigger(userId);
      break;

    case "location_changed":
      await runDecisionForTrigger(userId);
      break;

    case "memory_gap":
      await runDecisionForTrigger(userId);
      break;

    case "conversation_insight":
      await runDecisionForTrigger(userId);
      break;
  }
}