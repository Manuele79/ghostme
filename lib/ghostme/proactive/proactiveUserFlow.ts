import {
  buildDailyProactiveLogicalKey,
  upsertProactiveMessage,
} from "@/lib/ghostme/proactive/proactiveMessageService";
import { pickBestProactiveCandidate } from "@/lib/ghostme/proactive/proactiveCandidateRanker";
import { runProactiveMaintenanceFlow } from "@/lib/ghostme/proactive/proactiveMaintenanceFlow";
import { buildProactiveCandidatesForUser } from "@/lib/ghostme/proactive/proactiveCandidateBuilder";
import { buildDailyBriefingMessage } from "@/lib/ghostme/proactive/dailyBriefingBuilder";
import { loadDailyBriefingContext } from "@/lib/ghostme/proactive/dailyBriefingRepository";
import { writeTrueProactiveCards } from "@/lib/ghostme/proactive/trueProactiveCardWriter";

export async function runProactiveFlowForUser(user: any): Promise<{
  created: number;
  errors?: string[];
}> {
  let created = 0;
  const userId = user.user_id;

  await runProactiveMaintenanceFlow(userId);

  const { proactiveCandidates, agendaMessage, trueProactiveSelected } =
    await buildProactiveCandidatesForUser(user);

  const trueProactiveResult = await writeTrueProactiveCards({
    userId,
    selected: trueProactiveSelected,
  });
  created += trueProactiveResult.processed;

  const bestCandidate = pickBestProactiveCandidate(proactiveCandidates);

  if (bestCandidate) {
    await upsertProactiveMessage({
      userId,
      title: bestCandidate.title,
      message: bestCandidate.message,
      category: bestCandidate.category,
      priority: bestCandidate.priority,
    });

    created++;
  }

  if (agendaMessage) {
    await upsertProactiveMessage({
      userId,
      title: "Agenda di oggi",
      message: agendaMessage,
      category: "agenda",
      priority: 5,
      logicalKey: buildDailyProactiveLogicalKey("agenda"),
    });
  }

  const dailyContext = await loadDailyBriefingContext(userId);
  const { dailyMessage } = await buildDailyBriefingMessage({
    user,
    calendar: dailyContext.calendar,
    goals: dailyContext.goals,
    actions: dailyContext.actions,
    mental: dailyContext.mental,
    timeline: dailyContext.timeline,
    topics: dailyContext.topics,
  });

  await upsertProactiveMessage({
    userId,
    title: "Daily Briefing",
    message: dailyMessage,
    category: "daily_briefing",
    priority: 1,
    logicalKey: buildDailyProactiveLogicalKey("daily_briefing"),
  });

  return { created };
}
