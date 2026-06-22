import {
  buildDailyProactiveLogicalKey,
  upsertProactiveMessage,
} from "@/lib/ghostme/proactive/proactiveMessageService";
import {
  buildProactiveCandidateLogicalKey,
  pickBestProactiveCandidate,
} from "@/lib/ghostme/proactive/proactiveCandidateRanker";
import { runProactiveMaintenanceFlow } from "@/lib/ghostme/proactive/proactiveMaintenanceFlow";
import { buildProactiveCandidatesForUser } from "@/lib/ghostme/proactive/proactiveCandidateBuilder";
import { buildDailyBriefingMessage } from "@/lib/ghostme/proactive/dailyBriefingBuilder";
import { loadDailyBriefingContext } from "@/lib/ghostme/proactive/dailyBriefingRepository";
import {
  buildTrueProactiveLogicalKey,
  writeTrueProactiveCards,
} from "@/lib/ghostme/proactive/trueProactiveCardWriter";
import { writeCuriositySnapshotCards } from "@/lib/ghostme/proactive/curiosityCardWriter";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";

export async function runProactiveFlowForUser(user: any): Promise<{
  created: number;
  errors?: string[];
}> {
  let created = 0;
  const userId = user.user_id;

  await runProactiveMaintenanceFlow(userId);

  const snapshot = await buildGhostBrainSnapshot(userId);
  const curiositySnapshot = snapshot.curiosity;
  const trueProactiveSelected = snapshot.trueProactive.selected;

  const curiosityResult = await writeCuriositySnapshotCards({
    userId,
    snapshot: curiositySnapshot,
    preferredLogicalKeys: trueProactiveSelected
      .filter((candidate) => candidate.type === "high_confidence_curiosity")
      .map(buildTrueProactiveLogicalKey),
  });
  created += curiosityResult.processed;

  const trueProactiveResult = await writeTrueProactiveCards({
    userId,
    selected: trueProactiveSelected,
  });
  created += trueProactiveResult.processed;

  const { proactiveCandidates, agendaMessage } =
    await buildProactiveCandidatesForUser(user, snapshot);

  const legacyCandidates = curiosityResult.processed
    ? proactiveCandidates.filter((candidate) => candidate.source !== "curiosity")
    : proactiveCandidates;
  const bestCandidate = pickBestProactiveCandidate(legacyCandidates);

  if (bestCandidate) {
    await upsertProactiveMessage({
      userId,
      title: bestCandidate.title,
      message: bestCandidate.message,
      category: bestCandidate.category,
      priority: bestCandidate.priority,
      logicalKey: buildProactiveCandidateLogicalKey(bestCandidate),
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
