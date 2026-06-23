import { buildBehaviorPrompt } from "@/lib/ghostme/behavior/behaviorRulesEngine";
import { buildContextualMemory } from "@/lib/ghostme/retrieval";
import {
  buildGhostBrainSnapshot,
  type GhostBrainSnapshot,
} from "@/lib/ghostme/context/reasoningService";
import { trimBlock } from "@/lib/ghostme/chat/chatPromptBuilder";
import type { DetectedTopicLike } from "@/lib/ghostme/chat/chatTypes";
import { isFreshLocationState } from "@/lib/ghostme/location/locationStateFreshness";
import { temporalMemoryLabel } from "@/lib/ghostme/context/temporalPriority";
import { isDeepRecallRequest } from "@/lib/ghostme/chat/chatRecallPolicy";

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
  peopleContext: string;
  relationshipContext: string;
  placesContext: string;
  deepRecallRequested: boolean;
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
    peopleContext: "",
    relationshipContext: "",
    placesContext: "",
    deepRecallRequested: false,
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

function buildMentalStateContext(data: any) {
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

function buildGoalsContext(goals: any[]) {
  if (!goals?.length) return "";

  return goals
    .map(
      (goal) =>
        `- [ATTUALE — GOAL ATTIVO] ${goal.title || "Goal"} | ${goal.category || ""} | importanza ${
          goal.importance ?? ""
        }\n${goal.description || ""}`
    )
    .join("\n");
}

function buildTimelineContext(snapshot: GhostBrainSnapshot) {
  const history = [
    ...(snapshot.memory.episodicMemories || []).map((item) => ({
      ...item,
      temporal_source: "episodio recente",
    })),
    ...(snapshot.memory.timeline || []).map((item) => ({
      ...item,
      temporal_source: "timeline",
    })),
    ...(snapshot.memory.summaries || []).map((item) => ({
      ...item,
      temporal_source: "conversazione recente",
    })),
    ...(snapshot.calendar.completed || []).map((item) => ({
      ...item,
      temporal_source: "calendario completato",
    })),
    ...(snapshot.completedActions || []).map((item) => ({
      ...item,
      temporal_source: "azione completata",
    })),
  ];
  if (!history.length) return "";

  return history
    .map(
      (event) =>
        `- [${event.temporal_label || temporalMemoryLabel(event)}] [${event.temporal_source}] ${event.title || event.summary || "Evento"} | ${
          event.event_date || event.created_at || ""
        }\n${event.summary || event.description || ""}`
    )
    .join("\n");
}

function buildDynamicSelfProfileContext(items: any[]) {
  if (!items?.length) return "";

  return items
    .map(
      (item) =>
        `- ${item.trait || "tratto"} | confidenza ${item.confidence ?? ""}\n${
          item.description || ""
        }`
    )
    .join("\n");
}

function buildActionIntentContext(actions: any[]) {
  if (!actions?.length) return "";

  return actions
    .map(
      (action) =>
        `- [ATTUALE — AZIONE APERTA] ${action.intent_type || "azione"}: ${action.title || ""} | priorita ${
          action.priority ?? ""
        }\n${action.description || ""}`
    )
    .join("\n");
}

function buildHouseLearnedRulesContext(rules: any[]) {
  if (!rules?.length) return "";

  return rules
    .map(
      (rule) =>
        `- ${rule.title || rule.rule_key || "Regola casa"} | stato ${
          rule.status || ""
        } | confidenza ${rule.confidence ?? ""}\n${rule.description || ""}`
    )
    .join("\n");
}

function buildHouseAutomationControlsContext(controls: any[]) {
  if (!controls?.length) return "";

  return controls
    .map(
      (control) =>
        `- ${control.automation_name || control.automation_key || "Automazione"} | ${
          control.room_key || ""
        } | ${control.control_type || ""} | stato ${control.status || ""} | ${
          control.last_reason || ""
        }`
    )
    .join("\n");
}

function buildPeopleContext(snapshot: GhostBrainSnapshot, deepRecall: boolean) {
  const people = snapshot.people.items || [];
  if (!people.length) return "";
  const selected = deepRecall
    ? people.slice(0, 20)
    : (snapshot.people.importantPeople?.length
        ? snapshot.people.importantPeople
        : people
      ).slice(0, 12);
  const namesById = new Map(
    people.filter((person) => person.id).map((person) => [person.id, person.name])
  );

  const directory = selected.map(
    (person) =>
      `- ${person.name} | relazione ${person.relationship_type || "non specificata"} | importanza ${person.importance || 0} | menzioni ${person.mention_count || 0}${person.description ? ` | ${String(person.description).slice(0, 120)}` : ""}`
  );
  const connections = selected.flatMap((person) =>
    (snapshot.people.links || [])
        .filter(
          (link) =>
            link.person_id === person.id ||
            (link.target_type === "person" && link.target_id === person.id)
        )
        .slice(0, deepRecall ? 2 : 1)
        .map((link) => {
          const label =
            link.target_type === "person" && link.target_id === person.id
              ? namesById.get(link.person_id) || link.person_id
              : link.target_label || link.target_key;
          return `- ${person.name} ↔ ${link.target_type}: ${String(label).slice(0, 100)}`;
        })
  );
  return [...directory, ...(connections.length ? ["COLLEGAMENTI:", ...connections] : [])].join("\n");
}

function buildRelationshipContext(snapshot: GhostBrainSnapshot) {
  const relationship = snapshot.people.relationshipMemory;
  const mentions = (relationship.recentMentions || [])
    .slice(0, 8)
    .map((item) => `${(item.people || []).join(", ")}: ${item.title || item.source || "ricordo"}`);
  const events = (relationship.sharedEvents || [])
    .slice(0, 8)
    .map((item) => `${(item.people || []).join(", ")}: ${item.title || "evento"}`);
  const places = (relationship.relatedPlaces || [])
    .slice(0, 8)
    .map((item) => `${(item.people || []).join(", ")}: ${item.place}`);
  const social = (snapshot.people.socialSuggestions?.relationshipAttention || [])
    .slice(0, 6)
    .map((item) => `${item.person}: ${item.reason}`);
  return [...mentions, ...events, ...places, ...social]
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n");
}

function buildPlacesContext(snapshot: GhostBrainSnapshot) {
  return (snapshot.location.significantPlaces || [])
    .slice(0, 12)
    .map(
      (place) =>
        `- ${place.label || place.external_name || "Luogo"} | ${place.category || place.external_category || "categoria non specificata"} | visite ${place.visit_count || 0}${place.address ? ` | ${place.address}` : ""}`
    )
    .join("\n");
}

export async function buildChatContext({
  userId,
  detectedTopics,
  message = "",
}: {
  userId?: string;
  detectedTopics: DetectedTopicLike[];
  message?: string;
}): Promise<ChatContext> {
  const context = createEmptyChatContext();

  if (!userId) return context;

  const snapshot = await buildGhostBrainSnapshot(userId);
  const deepRecall = isDeepRecallRequest(message, detectedTopics);
  context.deepRecallRequested = deepRecall;
  const userProfile = snapshot.profile;
  context.profileContext = buildProfileContext(userProfile);
  context.userLocation = userProfile?.location || "";

  const calendarEvents = snapshot.calendar.upcoming || [];
  const currentLocation = snapshot.location.current;
  const lastKnownLocation = snapshot.location.lastKnown;

  const contextualData = await buildContextualMemory({
    userId,
    detectedTopics,
    deepRecall,
    searchHints: [
      isFreshLocationState(currentLocation)
        ? currentLocation?.current_place_label
        : null,
      ...calendarEvents.map((event: any) => event.title),
      ...snapshot.goals.activeGoals.map((goal: any) => goal.title),
      ...snapshot.actions.map((action: any) => action.title),
      ...snapshot.people.items.map((person: any) => person.name),
      ...snapshot.memory.topics.map((topic: any) => topic.topic),
    ],
  });

  context.memoryContext = trimBlock(
    contextualData.memoryContext,
    deepRecall ? 2200 : 1100
  );
  context.episodicContext = trimBlock(
    contextualData.episodicContext,
    deepRecall ? 1600 : 800
  );
  context.lifeTopicsContext = trimBlock(
    contextualData.lifeTopicsContext,
    deepRecall ? 1800 : 1000
  );
  context.summaryContext = trimBlock(
    contextualData.summaryContext,
    deepRecall ? 1400 : 800
  );
  context.linkedTopicsContext = trimBlock(
    contextualData.linkedTopicsContext,
    deepRecall ? 1400 : 800
  );

  context.linkedTopicsContext = trimBlock(
    `${context.linkedTopicsContext}

      ${contextualData.relatedTopicContext || ""}`,
    deepRecall ? 1800 : 1200
  );

  context.cognitiveContext = trimBlock(
    contextualData.cognitiveContext || "",
    2200
  );

  context.mentalStateContext = trimBlock(
    buildMentalStateContext(snapshot.profile?.mentalState),
    600
  );
  context.goalsContext = trimBlock(
    buildGoalsContext(snapshot.goals.activeGoals),
    800
  );
  context.timelineContext = trimBlock(
    `${buildTimelineContext(snapshot)}\n${contextualData.timelineContext || ""}`,
    deepRecall ? 3600 : 1800
  );
  context.dynamicSelfProfileContext = trimBlock(
    buildDynamicSelfProfileContext(snapshot.profile?.dynamicProfile || []),
    800
  );
  context.actionIntentContext = trimBlock(
    buildActionIntentContext(snapshot.actions),
    600
  );
  context.houseAutomationContext = trimBlock(
    buildHouseAutomationControlsContext(snapshot.home.automationControls),
    1200
  );
  context.peopleContext = trimBlock(
    buildPeopleContext(snapshot, deepRecall),
    deepRecall ? 3200 : 1800
  );
  context.relationshipContext = trimBlock(
    buildRelationshipContext(snapshot),
    deepRecall ? 1800 : 1000
  );
  context.placesContext = trimBlock(
    buildPlacesContext(snapshot),
    deepRecall ? 1400 : 800
  );

  context.calendarContext =
    calendarEvents
      .map((event) => {
        const date = formatRomeDateTime(event.start_at || event.remind_at);
        return `[FUTURO VERIFICATO — CALENDARIO ACTIVE] ${event.type} | ${event.title} | ${date} | ${event.description || ""}`;
      })
      .join("\n") || "";

  if (currentLocation?.current_place_label && isFreshLocationState(currentLocation)) {
    context.currentPlaceContext = `Luogo attuale rilevato: ${currentLocation.current_place_label}`;
  } else if (lastKnownLocation?.current_place_label) {
    context.currentPlaceContext = `Ultimo luogo noto: ${lastKnownLocation.current_place_label}. Non trattarlo come posizione corrente.`;
  } else {
    context.currentPlaceContext = "Luogo attuale rilevato: sconosciuto";
  }

  context.homeContext = trimBlock(snapshot.home.context || "", 1400);
  context.houseLearnedRulesContext = trimBlock(
    buildHouseLearnedRulesContext(snapshot.home.learnedRules),
    1200
  );
  console.log("CURRENT PLACE CONTEXT:", context.currentPlaceContext);
  console.log("LOCATION RAW:", currentLocation || lastKnownLocation);
  console.log("LOCATION LABEL:", currentLocation?.current_place_label);

  context.loadedLifeTopics = snapshot.memory.topics || [];
  context.behaviorRulesContext = await buildBehaviorPrompt(userId);

  return context;
}
