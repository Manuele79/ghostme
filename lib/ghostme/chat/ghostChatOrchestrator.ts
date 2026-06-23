import { OpenAI } from "openai";
import { applyMemoryDecay } from "@/lib/ghostme/memoryDecay";
import { resolveNamedRelationship } from "@/lib/ghostme/relationshipResolver";
import { buildSystemPrompt } from "@/lib/ghostme/chat/chatPromptBuilder";
import { buildChatContext } from "@/lib/ghostme/chat/chatContextBuilder";
import { resolveChatExternalService } from "@/lib/ghostme/chat/chatExternalServices";
import { handleChatCalendarFlow } from "@/lib/ghostme/chat/chatCalendarFlow";
import { analyzeChatMessage } from "@/lib/ghostme/chat/chatMessageAnalyzer";
import type { GhostChatFlowResult } from "@/lib/ghostme/chat/chatTypes";
import { prepareChatHistory } from "@/lib/ghostme/context/temporalPriority";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runGhostChatFlow({
  message,
  traits,
  messages,
  userId,
}: {
  message: string;
  traits: any;
  messages: any[];
  userId?: string;
}): Promise<GhostChatFlowResult> {
  const { messageClass, detectedTopics, importanceLevel } =
    await analyzeChatMessage({ message });

  if (userId) {
    await applyMemoryDecay(userId);
    await resolveNamedRelationship({ userId, message });
  }

  const chatContext = await buildChatContext({ userId, detectedTopics });
  const {
    profileContext,
    memoryContext,
    cognitiveContext,
    lifeTopicsContext,
    episodicContext,
    summaryContext,
    linkedTopicsContext,
    mentalStateContext,
    goalsContext,
    timelineContext,
    dynamicSelfProfileContext,
    actionIntentContext,
    loadedLifeTopics,
    calendarContext,
    userLocation,
    currentPlaceContext,
    homeContext,
    houseLearnedRulesContext,
    houseAutomationContext,
    behaviorRulesContext,
  } = chatContext;
  const serviceContext = await resolveChatExternalService({
    message,
    userLocation,
  });
  // Calendario (non bloccare la risposta se possibile)
  const calendarCreatedText = await handleChatCalendarFlow({
    userId,
    message,
    userLocation,
  });
  if (calendarCreatedText) {
    return {
      type: "immediate_text",
      immediateTextResponse: calendarCreatedText,
    };
  }

  const systemPrompt = buildSystemPrompt({
    traits,
    profileContext,
    lifeTopicsContext,
    linkedTopicsContext,
    episodicContext,
    summaryContext,
    memoryContext,
    mentalStateContext,
    goalsContext,
    timelineContext,
    dynamicSelfProfileContext,
    actionIntentContext,
    calendarContext,
    currentPlaceContext,
    serviceContext,
    cognitiveContext,
    behaviorRulesContext,
    homeContext,
    houseLearnedRulesContext,
    houseAutomationContext,
  });

  // Streaming della risposta
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.9,
    max_tokens: 300,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...prepareChatHistory(messages),
      { role: "user", content: message },
    ],
  });

  const encoder = new TextEncoder();
  let builtReply = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of stream) {
          const delta = part?.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            builtReply += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
      } catch (e) {
        controller.enqueue(encoder.encode("\n[Errore risposta]"));
      } finally {
        controller.close();
      }
    },
  });

  return {
    type: "stream",
    readable,
    postProcessingPayload: userId
      ? {
          userId,
          message,
          detectedTopics,
          importanceLevel,
          loadedLifeTopics,
          shouldRunHeavyEngines: messageClass.shouldRunHeavyEngines,
        }
      : null,
  };
}
