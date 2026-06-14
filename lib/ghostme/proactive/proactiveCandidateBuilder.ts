import { buildCurrentContext } from "@/lib/ghostme/context/contextBuilder";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";
import { buildAgendaMessage } from "@/lib/ghostme/agenda/agendaEngine";
import { decideProactiveMessage } from "@/lib/ghostme/proactive/proactiveDecisionEngine";
import { generateObservationInsight } from "@/lib/ghostme/observation/observationInsightEngine";
import { generatePatternInsight } from "@/lib/ghostme/patterns/patternInsightEngine";
import { applyPatternDecay } from "@/lib/ghostme/patterns/patternDecay";
import { generateCuriosityMessage } from "@/lib/ghostme/curiosity/curiosityEngine";
import { generateButlerMessage } from "@/lib/ghostme/butler/butlerEngine";

export async function buildProactiveCandidatesForUser(user: any) {
  const userId = user.user_id;

  const observationInsight = await generateObservationInsight(userId);
  const patternInsight = await generatePatternInsight(userId);
  const curiosityMessage = await generateCuriosityMessage(userId);

  await applyPatternDecay(userId);

  const situation = await buildGhostSituation(userId);
  const agendaMessage = buildAgendaMessage(situation);
  const currentContext = await buildCurrentContext(userId);
  const butlerMessage = await generateButlerMessage({
    userName: user.full_name,
    currentContext,
  });

  const proactiveDecision = await decideProactiveMessage({
    userName: user.full_name,
    currentContext,
  });

  const proactiveCandidates = [
    proactiveDecision.shouldSpeak && proactiveDecision.message
      ? {
          title: proactiveDecision.title || "Osservazione GhostMe",
          message: proactiveDecision.message,
          category: proactiveDecision.category || "observation",
          priority: proactiveDecision.priority || 2,
          source: "decision",
        }
      : null,

    observationInsight
      ? {
          title: "Osservazione GhostMe",
          message: observationInsight,
          category: "observation",
          priority: 3,
          source: "observation",
        }
      : null,

    patternInsight
      ? {
          title: "Pattern GhostMe",
          message: patternInsight,
          category: "observation",
          priority: 3,
          source: "pattern",
        }
      : null,

    curiosityMessage
      ? {
          title: "CuriositÃƒÂ  GhostMe",
          message: curiosityMessage,
          category: "curiosity",
          priority: 2,
          source: "curiosity",
        }
      : null,

    butlerMessage
    ? {
        title: "Osservazione GhostMe",
        message: butlerMessage,
        category: "observation",
        priority: 2,
        source: "butler",
      }
    : null,


  ].filter(Boolean) as any[];

  return {
    proactiveCandidates,
    agendaMessage,
  };
}
