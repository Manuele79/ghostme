export type DetectedTopicLike = {
  topic: string;
  category: string;
  entity_type: string;
  needs_clarification?: boolean;
  confidence?: number;
  reason?: string;
  description?: string;
};

export type AnalyzeChatMessageResult = {
  messageClass: {
    shouldRunHeavyEngines: boolean;
    [key: string]: any;
  };
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
