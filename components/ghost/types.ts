export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type GhostMode = "chat-chat" | "voce-chat" | "voce-voce";

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking";

export type BrainData = {
  memories: any[];
  timeline: any[];
  goals: any[];
  mentalState: any | null;
  actions: any[];
};

export const modeLabels: Record<GhostMode, string> = {
  "chat-chat": "Chat → Chat",
  "voce-chat": "Voce → Chat",
  "voce-voce": "Voce → Voce",
};