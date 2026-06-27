import {
  buildDailyProactiveLogicalKey,
  upsertProactiveMessage,
} from "@/lib/ghostme/proactive/proactiveMessageService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  buildProactiveCandidateLogicalKey,
  pickBestProactiveCandidate,
} from "@/lib/ghostme/proactive/proactiveCandidateRanker";
import { runProactiveMaintenanceFlow } from "@/lib/ghostme/proactive/proactiveMaintenanceFlow";
import {
  buildContinuityCandidate,
  buildProactiveCandidatesForUser,
} from "@/lib/ghostme/proactive/proactiveCandidateBuilder";
import { buildDailyBriefingMessage } from "@/lib/ghostme/proactive/dailyBriefingBuilder";
import { loadDailyBriefingContext } from "@/lib/ghostme/proactive/dailyBriefingRepository";
import {
  buildTrueProactiveLogicalKey,
  writeTrueProactiveCards,
} from "@/lib/ghostme/proactive/trueProactiveCardWriter";
import { writeCuriositySnapshotCards } from "@/lib/ghostme/proactive/curiosityCardWriter";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";
import type { GhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";
import { generateHouseSuggestions } from "@/lib/ghostme/homeAssistant/houseSuggestionEngine";
import { generateHouseAutomationSuggestions } from "@/lib/ghostme/homeAssistant/houseAutomationSuggestionEngine";

type ProactiveUser = Record<string, unknown> & {
  user_id: string;
  full_name?: string;
};

function countWrite(result: Awaited<ReturnType<typeof upsertProactiveMessage>>) {
  return result?.action === "inserted" || result?.action === "updated" ? 1 : 0;
}

async function hasTodayDailyBriefing(userId: string) {
  const todayIso = new Date();
  todayIso.setHours(0, 0, 0, 0);
  const dailyLogicalKey = buildDailyProactiveLogicalKey("daily_briefing");

  const { data, error } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("logical_key", dailyLogicalKey)
    .in("status", ["unread", "read", "dismissed", "answered", "expired", "archived"])
    .limit(1)
    .maybeSingle();

  if (error) {
    const message = String(error.message || error.details || "").toLowerCase();
    if (!message.includes("logical_key")) throw error;

    const { data: legacyData, error: legacyError } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id")
      .eq("user_id", userId)
      .eq("category", "daily_briefing")
      .in("status", ["unread", "read", "dismissed", "answered", "expired", "archived"])
      .gte("created_at", todayIso.toISOString())
      .limit(1)
      .maybeSingle();
    if (legacyError) throw legacyError;
    return Boolean(legacyData?.id);
  }

  return Boolean(data?.id);
}

function hasUsefulDailyContext(context: Awaited<ReturnType<typeof loadDailyBriefingContext>>) {
  return Boolean(
    context.calendar.length ||
      context.goals.length ||
      context.actions.length ||
      context.houseSuggestions.length ||
      context.houseEvents.length >= 3
  );
}

async function writeDailyBriefingForUser(
  user: ProactiveUser,
  snapshot?: GhostBrainSnapshot
) {
  const userId = user.user_id;
  const dailyContext = await loadDailyBriefingContext(userId);
  if (!hasUsefulDailyContext(dailyContext)) {
    return { action: "skipped" as const };
  }

  const { dailyMessage } = await buildDailyBriefingMessage({
    user,
    calendar: dailyContext.calendar,
    goals: dailyContext.goals,
    actions: dailyContext.actions,
    mental: dailyContext.mental,
    timeline: dailyContext.timeline,
    topics: dailyContext.topics,
    summaries: dailyContext.summaries,
    places: dailyContext.places,
    behaviorPatterns: dailyContext.behaviorPatterns,
    houseEvents: dailyContext.houseEvents,
    housePatterns: dailyContext.housePatterns,
    houseSuggestions: dailyContext.houseSuggestions,
    currentSituation: snapshot?.currentSituation || null,
  });

  return upsertProactiveMessage({
    userId,
    title: "Daily Briefing",
    message: dailyMessage,
    category: "daily_briefing",
    priority: 1,
    logicalKey: buildDailyProactiveLogicalKey("daily_briefing"),
  });
}

export async function runProactiveFlowForUser(user: ProactiveUser): Promise<{
  created: number;
  errors?: string[];
}> {
  let created = 0;
  const userId = user.user_id;

  await runProactiveMaintenanceFlow(userId);
  const houseSuggestions = await generateHouseSuggestions(userId);
  const houseAutomationSuggestions = await generateHouseAutomationSuggestions(userId);
  created += houseSuggestions.length + houseAutomationSuggestions.length;

  const snapshot = await buildGhostBrainSnapshot(userId);
  const curiositySnapshot = snapshot.curiosity;
  const trueProactiveSelected = snapshot.trueProactive.selected;

  const { proactiveCandidates, agendaMessage } =
    await buildProactiveCandidatesForUser(user, snapshot);
  const bestCandidate = pickBestProactiveCandidate(proactiveCandidates);
  const continuityCandidate =
    bestCandidate?.source === "continuity" ? bestCandidate : null;

  const curiosityResult = continuityCandidate
    ? { processed: 0 }
    : await writeCuriositySnapshotCards({
        userId,
        snapshot: curiositySnapshot,
        preferredLogicalKeys: trueProactiveSelected
          .filter((candidate) => candidate.type === "high_confidence_curiosity")
          .map(buildTrueProactiveLogicalKey),
      });
  created += curiosityResult.processed;

  const trueProactiveResult = await writeTrueProactiveCards({
    userId,
    selected: continuityCandidate
      ? trueProactiveSelected.filter(
          (candidate) =>
            candidate.type === "home_safety" ||
            candidate.type === "imminent_calendar" ||
            candidate.priority >= 9
        )
      : trueProactiveSelected,
  });
  created += trueProactiveResult.processed;

  const legacyCandidates = curiosityResult.processed
    ? proactiveCandidates.filter((candidate) => candidate.source !== "curiosity")
    : proactiveCandidates;
  const selectedCandidate = continuityCandidate || pickBestProactiveCandidate(legacyCandidates);

  if (selectedCandidate) {
    created += countWrite(await upsertProactiveMessage({
      userId,
      title: selectedCandidate.title,
      message: selectedCandidate.message,
      category: selectedCandidate.category,
      priority: selectedCandidate.priority,
      logicalKey: buildProactiveCandidateLogicalKey(selectedCandidate),
      source: selectedCandidate.source || null,
      bypassPriorityLimit: selectedCandidate.source === "continuity",
    }));
  } else {
    console.log("PROACTIVE FLOW: no proactive candidates", userId);
  }

  if (agendaMessage) {
    created += countWrite(await upsertProactiveMessage({
      userId,
      title: "Agenda di oggi",
      message: agendaMessage,
      category: "agenda",
      priority: 5,
      logicalKey: buildDailyProactiveLogicalKey("agenda"),
    }));
  }

  created += countWrite(await writeDailyBriefingForUser(user, snapshot));

  return { created };
}

export async function runAppOpenProactiveLifecycle({
  user,
  snapshot,
}: {
  user: ProactiveUser;
  snapshot?: GhostBrainSnapshot;
}): Promise<{ created: number; skipped: boolean; reason?: string }> {
  const userId = user.user_id;
  if (!userId) return { created: 0, skipped: true, reason: "missing_user" };

  const dailyAlreadyExists = await hasTodayDailyBriefing(userId);
  let created = 0;
  const currentSnapshot = snapshot || (await buildGhostBrainSnapshot(userId));
  const { proactiveCandidates, agendaMessage } =
    await buildProactiveCandidatesForUser(user, currentSnapshot);
  const bestCandidate = pickBestProactiveCandidate(proactiveCandidates);
  const continuityCandidate =
    bestCandidate?.source === "continuity" ? bestCandidate : null;

  const curiosityResult = continuityCandidate
    ? { processed: 0 }
    : await writeCuriositySnapshotCards({
        userId,
        snapshot: currentSnapshot.curiosity,
        preferredLogicalKeys: currentSnapshot.trueProactive.selected
          .filter((candidate) => candidate.type === "high_confidence_curiosity")
          .map(buildTrueProactiveLogicalKey),
      });
  created += curiosityResult.processed;

  const trueProactiveResult = await writeTrueProactiveCards({
    userId,
    selected: continuityCandidate
      ? currentSnapshot.trueProactive.selected.filter(
          (candidate) =>
            candidate.type === "home_safety" ||
            candidate.type === "imminent_calendar" ||
            candidate.priority >= 9
        )
      : currentSnapshot.trueProactive.selected,
  });
  created += trueProactiveResult.processed;

  const legacyCandidates = curiosityResult.processed
    ? proactiveCandidates.filter((candidate) => candidate.source !== "curiosity")
    : proactiveCandidates;
  const selectedCandidate = continuityCandidate || pickBestProactiveCandidate(legacyCandidates);

  if (selectedCandidate) {
    created += countWrite(await upsertProactiveMessage({
      userId,
      title: selectedCandidate.title,
      message: selectedCandidate.message,
      category: selectedCandidate.category,
      priority: selectedCandidate.priority,
      logicalKey: buildProactiveCandidateLogicalKey(selectedCandidate),
      source: selectedCandidate.source || null,
      bypassPriorityLimit: selectedCandidate.source === "continuity",
    }));
  } else {
    console.log("APP OPEN PROACTIVE: no proactive candidates", userId);
  }

  if (agendaMessage) {
    created += countWrite(await upsertProactiveMessage({
      userId,
      title: "Agenda di oggi",
      message: agendaMessage,
      category: "agenda",
      priority: 5,
      logicalKey: buildDailyProactiveLogicalKey("agenda"),
    }));
  }

  if (!dailyAlreadyExists) {
    created += countWrite(await writeDailyBriefingForUser(user, currentSnapshot));
  }

  return { created, skipped: false };
}

export async function runAppOpenContinuityLifecycle({
  user,
  snapshot,
}: {
  user: ProactiveUser;
  snapshot: GhostBrainSnapshot;
}): Promise<{ created: number; skipped: boolean; reason?: string }> {
  const userId = user.user_id;
  if (!userId) return { created: 0, skipped: true, reason: "missing_user" };

  const continuityCandidate = await buildContinuityCandidate(userId, snapshot);
  if (!continuityCandidate) {
    return { created: 0, skipped: true, reason: "no_continuity_candidate" };
  }

  const result = await upsertProactiveMessage({
    userId,
    title: continuityCandidate.title,
    message: continuityCandidate.message,
    category: continuityCandidate.category,
    priority: continuityCandidate.priority,
    logicalKey: buildProactiveCandidateLogicalKey(continuityCandidate),
    source: "continuity",
    bypassPriorityLimit: true,
  });

  return {
    created: countWrite(result),
    skipped: result.action === "skipped" || result.action === "hidden",
    reason: result.action,
  };
}
