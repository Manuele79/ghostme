import { OpenAI } from "openai";
import { NextResponse, after } from "next/server";
import { classifyGhostMessage } from "@/lib/ghostme/core/messageClassifier";
import {
  detectTopicsFromMessage,
  detectImportanceLevel,
} from "@/lib/ghostme/topicDetector";

import { parseCalendarIntent } from "@/lib/ghostme/calendar/calendarIntent";
import { createCalendarEvent } from "@/lib/ghostme/calendar/calendarService";

import { extractEntitiesWithAI } from "@/lib/ghostme/entityExtractor";
import { applyMemoryDecay } from "@/lib/ghostme/memoryDecay";

import {
  removeGenericRelationshipTopics,
  resolveNamedRelationship,
} from "@/lib/ghostme/relationshipResolver";

import { buildSystemPrompt } from "@/lib/ghostme/chat/chatPromptBuilder";
import { buildChatContext } from "@/lib/ghostme/chat/chatContextBuilder";
import { runChatPostProcessing } from "@/lib/ghostme/chat/chatPostProcessing";
import { resolveChatExternalService } from "@/lib/ghostme/chat/chatExternalServices";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type DetectedTopicLike = {
  topic: string;
  category: string;
  entity_type: string;
  needs_clarification?: boolean;
  confidence?: number;
  reason?: string;
  description?: string;
};

function uniqueTopics(topics: DetectedTopicLike[]) {
  const map = new Map<string, DetectedTopicLike>();
  for (const topic of topics) {
    if (!topic?.topic) continue;
    const key = topic.topic.toLowerCase().trim();
    const existing = map.get(key);
    if (!existing || (topic.confidence || 0) > (existing.confidence || 0)) {
      map.set(key, topic);
    }
  }
  return Array.from(map.values()).slice(0, 8);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message as string;
    const messageClass = classifyGhostMessage(message);
    const traits = body.traits;
    const messages = body.messages || [];
    const userId = body.userId as string | undefined;

    // Detection di base
    const ruleBasedTopics = messageClass.shouldRunHeavyEngines
  ? detectTopicsFromMessage(message)
  : [];
    const profileContextForExtractor = ""; // l’estrattore non ha bisogno del profilo completo qui

    const aiTopics = messageClass.shouldRunHeavyEngines
      ? await extractEntitiesWithAI({
          message,
          profileContext: profileContextForExtractor,
        })
      : [];

    const detectedTopics = removeGenericRelationshipTopics(
      uniqueTopics(aiTopics.length > 0 ? [...ruleBasedTopics, ...aiTopics] : ruleBasedTopics)
    );

    const importanceLevel = detectImportanceLevel(message);

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
    let calendarCreatedText = "";
    if (userId) {
      try {
        const calendarIntent = await parseCalendarIntent({
          message,
          nowIso: new Date().toLocaleString("sv-SE", {
            timeZone: "Europe/Rome",
          }).replace(" ", "T"),
          location: userLocation,
        });

        const calendarTitle = calendarIntent.title?.trim();
        if (calendarIntent.has_calendar_intent && calendarTitle) {
          const savedEvent = await createCalendarEvent({
            userId,
            type: calendarIntent.type || "appointment",
            title: calendarTitle,
            description: calendarIntent.description || "",
            startAt: calendarIntent.start_at || null,
            endAt: calendarIntent.end_at || null,
            remindAt: calendarIntent.remind_at || null,
            source: "ghostme",
          });
        if (savedEvent) {
          calendarCreatedText =
            `✅ Fatto. Ho aggiunto "${calendarTitle}" al calendario.` +
            (savedEvent.start_at
              ? `\n📅 ${new Date(savedEvent.start_at).toLocaleString("it-IT", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "Europe/Rome",
                })}`
              : "") +
            (savedEvent.remind_at
              ? `\n🔔 Promemoria impostato`
              : "");
        }
        }
      } catch (err) {
        console.log("CALENDAR CREATE FLOW ERROR:", err);
      }
    }

    if (calendarCreatedText) {
      const encoder = new TextEncoder();

      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(calendarCreatedText)
            );
            controller.close();
          },
        }),
        {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        }
      );
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
        ...messages,
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

    // Salvataggi dopo la risposta (after)
    if (userId) {
      after(async () => {
        await runChatPostProcessing({
          userId,
          message,
          detectedTopics,
          importanceLevel,
          loadedLifeTopics,
          shouldRunHeavyEngines: messageClass.shouldRunHeavyEngines,
        });
      });
    }

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Errore GhostMe AI" }, { status: 500 });
  }
}
