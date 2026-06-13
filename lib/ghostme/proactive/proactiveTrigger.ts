import { refreshAgendaMessage } from "@/lib/ghostme/calendar/calendarService";
import { buildCurrentContext } from "@/lib/ghostme/context/contextBuilder";
import { decideProactiveMessage } from "@/lib/ghostme/proactive/proactiveDecisionEngine";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function hasRecentProactiveMessage({
  userId,
  category,
  minutes = 60,
}: {
  userId: string;
  category: string;
  minutes?: number;
}) {
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();

  const { data } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", category)
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();

  return !!data?.id;
}

async function runDecisionForTrigger(userId: string, trigger: string) {
  const currentContext = await buildCurrentContext(userId);

  const decision = await decideProactiveMessage({
    currentContext,
  });

  if (!decision.shouldSpeak || !decision.message) return;

  const category = decision.category || "observation";

  const recent = await hasRecentProactiveMessage({
    userId,
    category,
    minutes: trigger === "location_changed" ? 45 : 90,
  });

  if (recent) return;

  await upsertProactiveMessage({
    userId,
    title: decision.title || "Osservazione GhostMe",
    message: decision.message,
    category,
    priority: decision.priority || 2,
  });
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
    case "location_changed":
    case "memory_gap":
    case "conversation_insight":
      await runDecisionForTrigger(userId, trigger);
      break;
  }
}