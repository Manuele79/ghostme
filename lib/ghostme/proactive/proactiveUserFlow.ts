import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import { pickBestProactiveCandidate } from "@/lib/ghostme/proactive/proactiveCandidateRanker";
import { runProactiveMaintenanceFlow } from "@/lib/ghostme/proactive/proactiveMaintenanceFlow";
import { buildProactiveCandidatesForUser } from "@/lib/ghostme/proactive/proactiveCandidateBuilder";
import { buildDailyBriefingMessage } from "@/lib/ghostme/proactive/dailyBriefingBuilder";
import { loadDailyBriefingContext } from "@/lib/ghostme/proactive/dailyBriefingRepository";

export async function runProactiveFlowForUser(user: any): Promise<{
  created: number;
  errors?: string[];
}> {
  let created = 0;
  const userId = user.user_id;

  await runProactiveMaintenanceFlow(userId);

  const { proactiveCandidates, agendaMessage } =
    await buildProactiveCandidatesForUser(user);

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

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: existingDaily } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "daily_briefing")
    .gte("created_at", startOfToday.toISOString())
    .limit(1)
    .maybeSingle();

  if (!existingDaily?.id) {
    await upsertProactiveMessage({
      userId,
      title: "Daily Briefing",
      message: dailyMessage,
      category: "daily_briefing",
      priority: 1,
    });
  }

  return { created };
}
