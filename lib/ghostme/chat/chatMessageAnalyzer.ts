import {
  buildBaseCognitiveDecision,
  classifyGhostMessage,
  refineCognitiveDecision,
} from "@/lib/ghostme/core/messageClassifier";
import {
  detectTopicsFromMessage,
  detectImportanceLevel,
} from "@/lib/ghostme/topicDetector";
import { extractEntitiesWithAI } from "@/lib/ghostme/entityExtractor";
import { removeGenericRelationshipTopics } from "@/lib/ghostme/relationshipResolver";
import type {
  AnalyzeChatMessageResult,
  DetectedTopicLike,
} from "@/lib/ghostme/chat/chatTypes";

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

export async function analyzeChatMessage({
  message,
}: {
  message: string;
}): Promise<AnalyzeChatMessageResult> {
  const messageClass = classifyGhostMessage(message);
  const baseCognitiveDecision = buildBaseCognitiveDecision(message, messageClass);

  // Detection di base
  const ruleBasedTopics = messageClass.shouldRunHeavyEngines
    ? detectTopicsFromMessage(message)
    : [];
  const profileContextForExtractor = ""; // lâ€™ estrattore non ha bisogno del profilo completo qui

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
  const cognitiveDecision = refineCognitiveDecision({
    decision: baseCognitiveDecision,
    detectedTopics,
    importanceLevel,
  });

  return {
    messageClass,
    cognitiveDecision,
    detectedTopics,
    importanceLevel,
  };
}
