import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildBehaviorPrompt } from "@/lib/ghostme/behavior/behaviorRulesEngine";
import { getActionIntentContext } from "@/lib/ghostme/actionLayer";
import { getDynamicSelfProfileContext } from "@/lib/ghostme/dynamicSelfProfile";
import { getGoalsDesiresContext } from "@/lib/ghostme/goalsDesires";
import { buildHouseAutomationContext } from "@/lib/ghostme/homeAssistant/houseAutomationContext";
import { buildCognitiveHouse } from "@/lib/ghostme/homeAssistant/cognitiveHouseBuilder";
import { buildHouseLearnedRulesContext } from "@/lib/ghostme/homeAssistant/houseLearnedRulesContext";
import { buildContextualMemory } from "@/lib/ghostme/retrieval";
import { loadUserContextGraph } from "@/lib/ghostme/context/userContextGraph";
import { getTimelineContext } from "@/lib/ghostme/timeline";
import { trimBlock } from "@/lib/ghostme/chat/chatPromptBuilder";
import type { DetectedTopicLike } from "@/lib/ghostme/chat/chatTypes";

export type ChatContext = {
  profileContext: string;
  memoryContext: string;
  cognitiveContext: string;
  lifeTopicsContext: string;
  episodicContext: string;
  summaryContext: string;
  linkedTopicsContext: string;
  mentalStateContext: string;
  goalsContext: string;
  timelineContext: string;
  dynamicSelfProfileContext: string;
  actionIntentContext: string;
  loadedLifeTopics: any[];
  calendarContext: string;
  userLocation: string;
  currentPlaceContext: string;
  homeContext: string;
  houseLearnedRulesContext: string;
  houseAutomationContext: string;
  behaviorRulesContext: string;
};

export function createEmptyChatContext(): ChatContext {
  return {
    profileContext: "",
    memoryContext: "",
    cognitiveContext: "",
    lifeTopicsContext: "",
    episodicContext: "",
    summaryContext: "",
    linkedTopicsContext: "",
    mentalStateContext: "",
    goalsContext: "",
    timelineContext: "",
    dynamicSelfProfileContext: "",
    actionIntentContext: "",
    loadedLifeTopics: [],
    calendarContext: "",
    userLocation: "",
    currentPlaceContext: "",
    homeContext: "",
    houseLearnedRulesContext: "",
    houseAutomationContext: "",
    behaviorRulesContext: "",
  };
}

function buildProfileContext(userProfile: any) {
  if (!userProfile) return "";
  return `
Nome: ${userProfile.full_name || ""}
EtÃ : ${userProfile.age || ""}
Genere: ${userProfile.gender || ""}
Lavoro: ${userProfile.job || ""}
Hobby: ${userProfile.hobbies || ""}
LocalitÃ : ${userProfile.location || ""}
Sport: ${userProfile.sports || ""}
Relazione: ${userProfile.relationship_status || ""}
Figli: ${userProfile.children_info || ""}
Interessi: ${userProfile.interests || ""}
Tipo di persona: ${userProfile.communication_style || ""}
Bio: ${userProfile.short_bio || ""}
`;
}

async function getMentalStateContext(userId: string) {
  if (!userId) return "";
  const { data } = await supabaseAdmin
    .from("mental_states")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return "";
  return `
stress: ${data.stress ?? 0}
entusiasmo: ${data.entusiasmo ?? 0}
stanchezza: ${data.stanchezza ?? 0}
controllo: ${data.controllo ?? 0}
nostalgia: ${data.nostalgia ?? 0}
frustrazione: ${data.frustrazione ?? 0}
focus: ${data.focus ?? 0}
socialita: ${data.socialita ?? 0}
note: ${data.notes || ""}
ultimo trigger: ${data.last_trigger || ""}
`;
}

function formatRomeDateTime(value?: string | null) {
  if (!value) return "orario non specificato";

  return new Date(value).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function buildChatContext({
  userId,
  detectedTopics,
}: {
  userId?: string;
  detectedTopics: DetectedTopicLike[];
}): Promise<ChatContext> {
  const context = createEmptyChatContext();

  if (!userId) return context;

  const [
    userProfileRes,
    mentalRes,
    goalsRes,
    timelineRes,
    dynProfileRes,
    actionIntentRes,
    calendarRes,
    currentLocationRes,
    existingTopicsRes,
    userContextGraph,
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    getMentalStateContext(userId),
    getGoalsDesiresContext(userId),
    getTimelineContext(userId),
    getDynamicSelfProfileContext(userId),
    getActionIntentContext(userId),

    supabaseAdmin
      .from("calendar_events")
      .select("type, title, description, start_at, remind_at, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`start_at.gte.${new Date().toISOString()},remind_at.gte.${new Date().toISOString()}`)
      .order("start_at", { ascending: true })
      .limit(30),

    supabaseAdmin
      .from("user_location_state")
      .select("current_place_label, latitude, longitude, source, updated_at")
      .eq("user_id", userId)
      .maybeSingle(),

    supabase.from("life_topics").select("*").eq("user_id", userId),

    loadUserContextGraph(userId),
  ]);

  const userProfile = userProfileRes.data;
  context.profileContext = buildProfileContext(userProfile);
  context.userLocation = userProfile?.location || "";

  const calendarEvents = calendarRes.data || [];
  const currentLocation = currentLocationRes.data;

  const contextualData = await buildContextualMemory({
    userId,
    detectedTopics,
    searchHints: userContextGraph.searchHints,
  });

  context.memoryContext = trimBlock(contextualData.memoryContext, 1100);
  context.episodicContext = trimBlock(contextualData.episodicContext, 800);
  context.lifeTopicsContext = trimBlock(contextualData.lifeTopicsContext, 1000);
  context.summaryContext = trimBlock(contextualData.summaryContext, 800);
  context.linkedTopicsContext = trimBlock(contextualData.linkedTopicsContext, 800);

  context.linkedTopicsContext = trimBlock(
    `${context.linkedTopicsContext}

      ${contextualData.relatedTopicContext || ""}`,
    1200
  );

  context.cognitiveContext = trimBlock(
    contextualData.cognitiveContext || "",
    2200
  );

  mentalRes && (context.mentalStateContext = trimBlock(mentalRes, 600));
  goalsRes && (context.goalsContext = trimBlock(goalsRes, 800));
  timelineRes && (context.timelineContext = trimBlock(timelineRes, 800));
  dynProfileRes && (context.dynamicSelfProfileContext = trimBlock(dynProfileRes, 800));
  actionIntentRes && (context.actionIntentContext = trimBlock(actionIntentRes, 600));
  context.houseAutomationContext = trimBlock(
  await buildHouseAutomationContext(userId),
  1200
);

  context.calendarContext =
    calendarEvents
      .map((event) => {
        const date = formatRomeDateTime(event.start_at || event.remind_at);
        return `${event.type} | ${event.title} | ${date} | ${event.description || ""}`;
      })
      .join("\n") || "";

context.currentPlaceContext = currentLocation?.current_place_label
  ? `Luogo attuale rilevato: ${currentLocation.current_place_label}`
  : "Luogo attuale rilevato: sconosciuto";

  context.homeContext = trimBlock(await buildCognitiveHouse(), 1400);
  context.houseLearnedRulesContext = trimBlock(
    await buildHouseLearnedRulesContext(userId),
    1200
  );
  console.log("CURRENT PLACE CONTEXT:", context.currentPlaceContext);
  console.log("LOCATION RAW:", currentLocation);
  console.log("LOCATION LABEL:", currentLocation?.current_place_label);

  context.loadedLifeTopics = existingTopicsRes.data || [];
  context.behaviorRulesContext = await buildBehaviorPrompt(userId);

  return context;
}
