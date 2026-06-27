export type DetectedTopicLike = {
  topic: string;
  category: string;
  entity_type: string;
  needs_clarification?: boolean;
  confidence?: number;
  reason?: string;
  description?: string;
};

export type CognitiveMessageType =
  | "conversation"
  | "question"
  | "command_to_ghost"
  | "personal_reminder"
  | "correction"
  | "new_preference"
  | "behavior_change"
  | "event"
  | "memory"
  | "project"
  | "relationship"
  | "place"
  | "observation";

export type CognitiveAddressee = "self" | "ghostme" | "third_person";

export type CognitiveRequestedAction =
  | "response"
  | "memory"
  | "behavior"
  | "calendar"
  | "people_graph"
  | "timeline"
  | "goals"
  | "project"
  | "curiosity"
  | "observation"
  | "proactive"
  | "none";

export type CognitivePersistence = "temporary" | "permanent";
export type CognitiveFollowUpNeed = "ask" | "observe" | "wait" | "none";
export type CognitiveMemoryDepth = "recent_only" | "mixed" | "deep_recall";
export type CognitiveTone =
  | "informal"
  | "technical"
  | "emotional"
  | "synthetic"
  | "proactive";

export type CognitiveDecision = {
  messageType: CognitiveMessageType;
  addressee: CognitiveAddressee;
  requestedActions: CognitiveRequestedAction[];
  persistence: CognitivePersistence;
  priority: number;
  followUpNeed: CognitiveFollowUpNeed;
  memoryDepth: CognitiveMemoryDepth;
  tone: CognitiveTone;
  shouldRespond: boolean;
  shouldRunHeavyEngines: boolean;
  reasons: string[];
};

export type AnalyzeChatMessageResult = {
  messageClass: {
    shouldRunHeavyEngines: boolean;
    [key: string]: any;
  };
  cognitiveDecision: CognitiveDecision;
  detectedTopics: DetectedTopicLike[];
  importanceLevel: number;
};

export type ChatPostProcessingPayload = {
  userId: string;
  message: string;
  detectedTopics: DetectedTopicLike[];
  importanceLevel: number;
  loadedLifeTopics: any[];
  shouldRunHeavyEngines: boolean;
  cognitiveDecision: CognitiveDecision;
};

export type ImmediateTextResult = {
  type: "immediate_text";
  immediateTextResponse: string;
};

export type StreamResult = {
  type: "stream";
  readable: ReadableStream<Uint8Array>;
  postProcessingPayload: ChatPostProcessingPayload | null;
};

export type GhostChatFlowResult = ImmediateTextResult | StreamResult;
