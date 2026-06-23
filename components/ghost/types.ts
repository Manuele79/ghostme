export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export type GhostMode = "chat-chat" | "voce-chat" | "voce-voce";

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking";

export type BrainData = {
  snapshot: GhostBrainSnapshot | null;
  memories: any[];
  timeline: any[];
  goals: any[];
  mentalState: any | null;
  actions: any[];
  calendarEvents: CalendarEvent[];
  proactiveMessage: ProactiveMessage | null;
  proactiveMessages: ProactiveMessage[];
  people: GhostBrainSnapshot["people"] | null;
  projects: GhostBrainSnapshot["projects"] | null;
  curiosity: GhostBrainSnapshot["curiosity"] | null;
  trueProactive: GhostBrainSnapshot["trueProactive"] | null;
  house: GhostBrainSnapshot["home"] | null;
  homeUi: HomeUiModel | null;
  decisionSnapshot: DecisionSnapshot | null;
};

export type HomeUiModel = {
  statusLabel: string;
  confidenceLabel: string;
  reliable: boolean;
  activeRooms: string[];
  people: Array<{
    key: "manu" | "vale";
    label: "Manu" | "Vale";
    isHome: boolean;
    known: boolean;
    detail: string;
  }>;
};

export const modeLabels: Record<GhostMode, string> = {
  "chat-chat": "Chat → Chat",
  "voce-chat": "Voce → Chat",
  "voce-voce": "Voce → Voce",
};

export type CalendarEvent = {
  id: string;
  user_id: string;
  type: "appointment" | "reminder" | "note" | "voice_note";
  title: string;
  description?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  remind_at?: string | null;
  status: string;
  source?: string | null;
  created_at?: string;
};

export type ProactiveMessage = {
  id: string;
  user_id: string;
  title?: string | null;
  message: string;
  category?: string | null;
  status: string;
  priority?: number | null;
  logical_key?: string | null;
  created_at?: string;
};
import type { GhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";
import type { DecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";
