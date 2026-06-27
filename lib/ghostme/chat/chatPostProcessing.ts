import { OpenAI } from "openai";
import { supabase } from "@/lib/supabase";
import {
  isPossibleEpisode,
  detectEmotionalTone,
  shouldSaveActiveMemory,
  detectMemoryCategory,
} from "@/lib/ghostme/topicDetector";
import { saveTopicLinks } from "@/lib/ghostme/topicLinks";
import { detectAndSaveContradictions } from "@/lib/ghostme/contradictions";
import { updateMentalState } from "@/lib/ghostme/mentalState";
import { detectAndSaveBehaviorRule } from "@/lib/ghostme/behavior/behaviorRulesEngine";
import { detectAndSaveGoalsDesires } from "@/lib/ghostme/goalsDesires";
import { detectAndSaveTimelineEvent } from "@/lib/ghostme/timeline";
import { updateDynamicSelfProfile } from "@/lib/ghostme/dynamicSelfProfile";
import {
  detectAndSaveActionIntent,
  detectAndCompleteActionIntent,
} from "@/lib/ghostme/actionLayer";
import { linkOpenOrphanActionsToGoal } from "@/lib/ghostme/goals/goalsActionsLifecycle";
import { syncPeopleGraphFromTopics } from "@/lib/ghostme/people/peopleGraphService";
import { syncPeopleGraphLinks } from "@/lib/ghostme/people/peopleGraphLinkService";
import type {
  ChatPostProcessingPayload,
  DetectedTopicLike,
} from "@/lib/ghostme/chat/chatTypes";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEBUG = process.env.NODE_ENV !== "production";

function log(...args: any[]) {
  if (DEBUG) console.log(...args);
}

async function saveActiveMemory({
  userId,
  message,
  memoryCategory,
}: {
  userId: string;
  message: string;
  memoryCategory: string;
}) {
  const { data: existingMemories } = await supabase
    .from("memories_active")
    .select("id, content")
    .eq("user_id", userId)
    .ilike("content", `%${message.slice(0, 40)}%`)
    .limit(1);

  if (existingMemories && existingMemories.length > 0) {
    const existing = existingMemories[0];
    await supabase
      .from("memories_active")
      .update({
        importance: 8,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    log("MEMORY CONSOLIDATED:", existing.id);
    return;
  }

  const { data, error } = await supabase
    .from("memories_active")
    .insert([
      {
        user_id: userId,
        title: "Memoria automatica",
        content: message,
        category: memoryCategory,
        importance: 6,
      },
    ])
    .select();

  log("MEMORY DATA:", data);
  log("MEMORY ERROR:", error);
}

async function saveLifeTopics({
  userId,
  detectedTopics,
  message,
  importanceLevel,
}: {
  userId: string;
  detectedTopics: DetectedTopicLike[];
  message: string;
  importanceLevel: number;
}) {
  let clarificationQuestion = "";

  for (const item of detectedTopics) {
    log("SAVING LIFE TOPIC:", item);

    const { data: existingTopic } = await supabase
      .from("life_topics")
      .select("*")
      .eq("user_id", userId)
      .eq("topic", item.topic)
      .maybeSingle();

    if (existingTopic) {
      const nextMentionCount = (existingTopic.mention_count || 0) + 1;
      const confidenceBoost = (item.confidence || 0) >= 90 ? 2 : 1;
      const relationBoost = detectedTopics.length >= 2 ? 1 : 0;

      const nextWeight = Math.min(
        (existingTopic.weight || 1) + importanceLevel,
        10
      );

      const nextRelationshipStrength = Math.min(
        (existingTopic.relationship_strength || 1) +
          confidenceBoost +
          relationBoost,
        10
      );

      const shouldAskClarification =
        nextMentionCount >= 3 &&
        !existingTopic.description &&
        existingTopic.entity_type === "unknown" &&
        !existingTopic.clarification_asked;

      if (shouldAskClarification) {
        clarificationQuestion = `

Ti sento nominare spesso ${item.topic}. Chi è o cos'è per te?`;
      }

      const nextCategory =
        existingTopic.category === "unknown" ? item.category : existingTopic.category;

      const nextEntityType =
        existingTopic.entity_type === "unknown"
          ? item.entity_type
          : existingTopic.entity_type;

      const nextDescription =
        existingTopic.description || item.description || null;

      const nextStatus = shouldAskClarification
        ? "needs_clarification"
        : nextDescription
          ? "known"
          : "active";

      await supabase
        .from("life_topics")
        .update({
          weight: nextWeight,
          mention_count: nextMentionCount,
          relationship_strength: nextRelationshipStrength,
          category: nextCategory,
          entity_type: nextEntityType,
          description: nextDescription,
          status: nextStatus,
          needs_clarification: shouldAskClarification,
          clarification_asked: shouldAskClarification
            ? true
            : existingTopic.clarification_asked,
          last_mentioned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTopic.id);

      continue;
    }

    const hasDescription = !!item.description;

    const { data, error } = await supabase
      .from("life_topics")
      .insert([
        {
          user_id: userId,
          topic: item.topic,
          category: item.category,
          entity_type: item.entity_type,
          description: item.description || null,
          weight: Math.min(importanceLevel, 10),
          status: hasDescription
            ? "known"
            : item.needs_clarification
              ? "unknown"
              : "active",
          mention_count: 1,
          needs_clarification: item.needs_clarification || false,
          clarification_asked: false,
          notes: message,
          relationship_strength: Math.min(
            1 + ((item.confidence || 0) >= 90 ? 1 : 0),
            10
          ),
          last_mentioned_at: new Date().toISOString(),
        },
      ])
      .select();

    log("INSERTED LIFE TOPIC:", data);
    log("INSERT LIFE TOPIC ERROR:", error);
  }

  return clarificationQuestion;
}

async function saveEpisodicMemory({
  userId,
  message,
  emotionalTone,
  detectedTopics,
  loadedLifeTopics,
}: {
  userId: string;
  message: string;
  emotionalTone: string;
  detectedTopics: DetectedTopicLike[];
  loadedLifeTopics: any[];
}) {
  const lowerMessage = message.toLowerCase();

  const detectedTopicNames = detectedTopics.map((t) => t.topic);

  const knownTopicNames = loadedLifeTopics
    .filter((t) => lowerMessage.includes(String(t.topic).toLowerCase()))
    .map((t) => t.topic);

  const relatedTopics = Array.from(
    new Set([...detectedTopicNames, ...knownTopicNames])
  );

  const { data, error } = await supabase
    .from("episodic_memories")
    .insert([
      {
        user_id: userId,
        summary: message,
        emotional_tone: emotionalTone,
        importance: Math.min(relatedTopics.length + 1, 10),
        related_topics: relatedTopics,
      },
    ])
    .select();

  log("EPISODIC DATA:", data);
  log("EPISODIC ERROR:", error);

  for (const topic of relatedTopics) {
    const { data: existingTopic } = await supabase
      .from("life_topics")
      .select("*")
      .eq("user_id", userId)
      .eq("topic", topic)
      .maybeSingle();

    if (!existingTopic) continue;

    await supabase
      .from("life_topics")
      .update({
        positive_count:
          (existingTopic.positive_count || 0) +
          (emotionalTone === "positive" ? 1 : 0),
        negative_count:
          (existingTopic.negative_count || 0) +
          (emotionalTone === "negative" ? 1 : 0),
        neutral_count:
          (existingTopic.neutral_count || 0) +
          (emotionalTone === "neutral" ? 1 : 0),
        relationship_strength: Math.min(
          (existingTopic.relationship_strength || 1) + 1,
          10
        ),
        last_emotional_tone: emotionalTone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingTopic.id);
  }

  if (relatedTopics.length >= 2) {
    await saveTopicLinks({
      userId,
      topics: relatedTopics.map((topic) => ({
        topic,
        category: "general",
        entity_type: "unknown",
      })),
    });
  }
}

async function classifyClarificationIfNeeded({
  userId,
  message,
  detectedTopics,
}: {
  userId: string;
  message: string;
  detectedTopics: DetectedTopicLike[];
}) {
  const lowerMessage = message.toLowerCase();

  const { data: topicToClarify } = await supabase
    .from("life_topics")
    .select("*")
    .eq("user_id", userId)
    .eq("needs_clarification", true)
    .eq("clarification_asked", true)
    .is("description", null)
    .order("mention_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  const directTopicToClassify =
    topicToClarify ||
    detectedTopics.find((item) => {
      const topicLower = item.topic.toLowerCase();

      return (
        lowerMessage.includes(topicLower) &&
        (
          lowerMessage.includes("amica") ||
          lowerMessage.includes("amico") ||
          lowerMessage.includes("collega") ||
          lowerMessage.includes("moglie") ||
          lowerMessage.includes("marito") ||
          lowerMessage.includes("figlio") ||
          lowerMessage.includes("figlia") ||
          lowerMessage.includes("cane") ||
          lowerMessage.includes("gatto") ||
          lowerMessage.includes("cliente") ||
          lowerMessage.includes("capo") ||
          lowerMessage.includes("fratello") ||
          lowerMessage.includes("sorella")
        )
      );
    });

  if (!directTopicToClassify) return;

  const topicName = directTopicToClassify.topic;

  const classification = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: `
Devi classificare una risposta dell'utente che spiega chi o cosa è un topic.

Rispondi SOLO con JSON valido.

Campi:
{
  "understood": true/false,
  "entity_type": "person" | "animal" | "project" | "place" | "habit" | "object" | "unknown",
  "category": "family" | "work" | "friend" | "home" | "project" | "passion" | "health" | "general",
  "description": "frase breve e chiara"
}
        `,
      },
      {
        role: "user",
        content: `
Topic: ${topicName}

Risposta utente:
${message}
        `,
      },
    ],
  });

  const rawClassification = classification.choices[0]?.message?.content || "{}";

  let parsedClassification: any = null;

  try {
    parsedClassification = JSON.parse(rawClassification);
  } catch (err) {
    log("CLASSIFICATION PARSE ERROR:", err);
    log("RAW CLASSIFICATION:", rawClassification);
    return;
  }

  if (!parsedClassification?.understood) return;

  await supabase
    .from("life_topics")
    .update({
      entity_type: parsedClassification.entity_type || "unknown",
      category: parsedClassification.category || "general",
      description: parsedClassification.description || message,
      needs_clarification: false,
      clarification_asked: true,
      status: "known",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("topic", topicName);

  const memoryContent = parsedClassification.description || message;

  const { data: existingTopicMemory } = await supabase
    .from("memories_active")
    .select("id")
    .eq("user_id", userId)
    .eq("title", `Info su ${topicName}`)
    .limit(1);

  if (existingTopicMemory && existingTopicMemory.length > 0) {
    await supabase
      .from("memories_active")
      .update({
        content: memoryContent,
        category: parsedClassification.category || "general",
        importance: 9,
        pinned: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingTopicMemory[0].id);
    return;
  }

  await supabase.from("memories_active").insert([
    {
      user_id: userId,
      title: `Info su ${topicName}`,
      content: memoryContent,
      category: parsedClassification.category || "general",
      importance: 9,
      pinned: true,
    },
  ]);
}

export async function runChatPostProcessing({
  userId,
  message,
  detectedTopics,
  importanceLevel,
  loadedLifeTopics,
  shouldRunHeavyEngines,
  cognitiveDecision,
}: ChatPostProcessingPayload) {
  try {
    const possibleEpisode = isPossibleEpisode(message);
    const emotionalTone = detectEmotionalTone(message);
    const shouldSaveMemoryFlag = shouldSaveActiveMemory(message);
    const memoryCategory = detectMemoryCategory(message);
    const requestedActions = new Set(cognitiveDecision.requestedActions);

    const jobs: Promise<any>[] = [];

    if (!shouldRunHeavyEngines && !cognitiveDecision.shouldRunHeavyEngines) {
        return;
      }

    if (shouldSaveMemoryFlag || requestedActions.has("memory"))
      jobs.push(saveActiveMemory({ userId, message, memoryCategory }));

    if (detectedTopics.length > 0)
      jobs.push(saveLifeTopics({ userId, detectedTopics, message, importanceLevel }));

    if (detectedTopics.length >= 2)
      jobs.push(saveTopicLinks({ userId, topics: detectedTopics }));

    if (possibleEpisode || requestedActions.has("timeline"))
      jobs.push(saveEpisodicMemory({ userId, message, emotionalTone, detectedTopics, loadedLifeTopics }));

    jobs.push(classifyClarificationIfNeeded({ userId, message, detectedTopics }));
    jobs.push(detectAndSaveContradictions({ userId, message }));

    jobs.push(updateMentalState({ userId, message }));

    jobs.push(detectAndSaveTimelineEvent({ userId, message, detectedTopics }));

    jobs.push(updateDynamicSelfProfile({ userId, message }));

    if (
      cognitiveDecision.shouldRunHeavyEngines ||
      requestedActions.has("goals") ||
      requestedActions.has("project") ||
      requestedActions.has("calendar") ||
      requestedActions.has("memory")
    ) {
      jobs.push(
        (async () => {
          await detectAndCompleteActionIntent({ userId, message });

          const savedGoals = await detectAndSaveGoalsDesires({
            userId,
            message,
            detectedTopics,
          });
          const goal = Array.isArray(savedGoals) ? savedGoals[0] : null;

          if (goal?.id) {
            await linkOpenOrphanActionsToGoal({ userId, goal });
          }

          await detectAndSaveActionIntent({
            userId,
            message,
            detectedTopics,
            preferredGoalId: goal?.id || null,
          });
        })()
      );
    }

    jobs.push(detectAndSaveBehaviorRule({ userId, message }));

    await Promise.allSettled(jobs);

    // Link only persisted evidence. This runs after every writer above has settled;
    // no model output is used by the graph layer itself.
    await syncPeopleGraphFromTopics(userId);
    await syncPeopleGraphLinks(userId);
  } catch (err) {
    log("AFTER JOBS ERROR:", err);
  }
}
