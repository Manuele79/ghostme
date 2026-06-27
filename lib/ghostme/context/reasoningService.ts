import {
  buildContextSignals,
  buildGhostBrainSimpleSignals,
  type ContextSignal,
  type GhostBrainSimpleSignals,
} from "@/lib/ghostme/context/contextSignals";
import { loadUserContextGraph } from "@/lib/ghostme/context/userContextGraph";
import { buildHomeReasoning } from "@/lib/ghostme/homeAssistant/homeReasoningBuilder";
import {
  buildGhostSituation,
  type GhostSituation,
} from "@/lib/ghostme/situation/situationEngine";
import {
  buildHouseStateSnapshot,
  formatHouseStateContext,
  type HouseStateSnapshot,
} from "@/lib/ghostme/home/houseStateSnapshot";
import {
  buildHomeLocationConsistency,
  type HomeLocationConsistency,
} from "@/lib/ghostme/home/homeLocationConsistency";
import {
  buildHouseRouteSnapshot,
  type HouseRouteSnapshot,
} from "@/lib/ghostme/home/houseRouteSnapshot";
import {
  buildHomeComfortRiskSnapshot,
  type HomeComfortRiskSnapshot,
} from "@/lib/ghostme/home/homeComfortRiskSnapshot";
import {
  buildPeopleSnapshot,
  type PeopleSnapshot,
} from "@/lib/ghostme/people/peopleSnapshot";
import {
  buildRelationshipMemorySnapshot,
  type RelationshipMemorySnapshot,
} from "@/lib/ghostme/people/relationshipMemorySnapshot";
import {
  buildSocialSuggestionSnapshot,
  type SocialSuggestionSnapshot,
} from "@/lib/ghostme/people/socialSuggestionSnapshot";
import {
  buildMemorySnapshot,
  type MemorySnapshot,
} from "@/lib/ghostme/memory/memorySnapshot";
import {
  buildGoalsSnapshot,
  type GoalsSnapshot,
} from "@/lib/ghostme/goals/goalsSnapshot";
import {
  buildProjectMemorySnapshot,
  type ProjectMemorySnapshot,
} from "@/lib/ghostme/projects/projectMemorySnapshot";
import {
  buildGoalProjectConsistencySnapshot,
  type GoalProjectConsistencySnapshot,
} from "@/lib/ghostme/projects/goalProjectConsistencySnapshot";
import {
  buildProjectAdvisorSnapshot,
  type ProjectAdvisorSnapshot,
} from "@/lib/ghostme/projects/projectAdvisorSnapshot";
import {
  buildCuriositySnapshot,
  type CuriositySnapshot,
} from "@/lib/ghostme/curiosity/curiositySnapshot";
import { buildDecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";
import {
  buildTrueProactiveSnapshot,
  type TrueProactiveSnapshot,
} from "@/lib/ghostme/proactive/trueProactiveSnapshot";
import { canAccessHomeAssistant } from "@/lib/ghostme/homeAssistant/homeAssistantAccess";
import {
  buildRecentPastEvidence,
  filterFutureCalendar,
  filterOpenActions,
} from "@/lib/ghostme/context/temporalPriority";

type DetectedTopicInput = {
  topic: string;
  category?: string;
  entity_type?: string;
};

type ReasoningSnapshotInput = {
  userId: string;
  message?: string;
  detectedTopics?: DetectedTopicInput[];
};

export type GhostBrainSnapshotCore = {
  profile: any | null;
  memory: MemorySnapshot;
  people: PeopleSnapshot & {
    relationshipMemory: RelationshipMemorySnapshot;
    socialSuggestions: SocialSuggestionSnapshot;
  };
  location: {
    current: any | null;
    lastKnown: any | null;
    status: "current" | "stale" | "unknown";
    significantPlaces: any[];
    behaviorPatterns: any[];
    situation: {
      currentPlace: string | null;
      category: string | null;
      address: string | null;
      confidence: number | null;
      lastChangedAt: string | null;
    };
  };
  calendar: {
    upcoming: any[];
    today: any[];
    completed: any[];
  };
  goals: GoalsSnapshot;
  actions: any[];
  completedActions: any[];
  projects: ProjectMemorySnapshot & {
    consistency: GoalProjectConsistencySnapshot;
    advisor: ProjectAdvisorSnapshot;
  };
  curiosity: CuriositySnapshot;
  home: {
    state: HouseStateSnapshot;
    patterns: any[];
    learnedRules: any[];
    automationControls: any[];
    presence: ReturnType<typeof parseHomePresenceSignal>;
    consistency: HomeLocationConsistency;
    routes: HouseRouteSnapshot;
    comfortRisk: HomeComfortRiskSnapshot;
    context: string | null;
  };
  proactive: {
    recent: any[];
    handledRecent: any[];
  };
  currentSituation: {
    summary: string;
    facts: string[];
    currentPlace: string | null;
    placeCategory: string | null;
    peopleAtHome: string[];
    activeMedia: string[];
    activeRooms: string[];
    relevantPatterns: string[];
    confidence: number;
    updatedAt: string;
  };
  signals: {
    simple: GhostBrainSimpleSignals;
    context: ContextSignal[];
  };
  generatedAt: string;
};

export type GhostBrainSnapshot = GhostBrainSnapshotCore & {
  trueProactive: TrueProactiveSnapshot;
};

function clean(value: any) {
  return String(value || "").toLowerCase().trim();
}

function uniqueValues(values: string[], limit: number) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleanValue = String(value || "").trim();
    const key = clean(cleanValue);
    if (!cleanValue || seen.has(key)) continue;

    seen.add(key);
    result.push(cleanValue);
    if (result.length >= limit) break;
  }

  return result;
}

function minutesUntil(value?: string | null) {
  if (!value) return null;

  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return null;

  return Math.round((target - Date.now()) / 60000);
}

function tokenSet(value: any) {
  return new Set(
    String(value || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length >= 4)
  );
}

function overlapScore(a: any, b: any) {
  const left = tokenSet(a);
  const right = tokenSet(b);
  let score = 0;

  for (const token of left) {
    if (right.has(token)) score++;
  }

  return score;
}

function buildFallbackSnapshot(reason = "unavailable") {
  return {
    whereIsUser: {
      status: "unknown",
      place: null,
      category: null,
      confidence: null,
      lastChangedAt: null,
      isFresh: false,
      reason,
    },
    whoIsRelevantNow: [],
    nextCalendarPressure: {
      level: "none",
      event: null,
      minutesUntil: null,
      reason: "no_calendar_pressure",
    },
    activeGoalActionLinks: [],
    homePresenceSignal: {
      status: "unknown",
      signals: [],
      reason: "home_reasoning_unavailable",
    },
    memoryAnchors: [],
    conflicts: [],
    certainty: {
      location: "low",
      calendar: "low",
      home: "low",
      memory: "low",
      overall: "low",
    },
  };
}

function buildWhereIsUser(situation: GhostSituation) {
  const currentPlace = situation.currentPlace || null;
  const lastKnownPlace = situation.lastKnownPlace || null;
  const place = currentPlace || lastKnownPlace;
  const isFresh = Boolean(currentPlace) && situation.locationStatus === "current";

  return {
    status: currentPlace ? "current" : lastKnownPlace ? "last_known" : "unknown",
    place,
    category: currentPlace ? situation.currentPlaceCategory || null : null,
    confidence: currentPlace ? situation.locationConfidence ?? null : null,
    lastChangedAt: situation.lastLocationChange || null,
    isFresh,
    reason: currentPlace
      ? "fresh_location_state"
      : lastKnownPlace
        ? "stale_location_state"
      : "missing_location_state",
  };
}

function buildWhoIsRelevantNow({
  message,
  detectedTopics,
}: {
  message?: string;
  detectedTopics: DetectedTopicInput[];
}) {
  const text = clean(message);
  const candidates = detectedTopics
    .filter(
      (topic) =>
        clean(topic.entity_type) === "person" ||
        clean(topic.category) === "person" ||
        (topic.topic && text.includes(clean(topic.topic)))
    )
    .map((topic) => ({
      name: topic.topic,
      source: "detected_topics",
      relevance: text.includes(clean(topic.topic)) ? "mentioned" : "topic",
    }));

  return candidates.slice(0, 5);
}

function buildNextCalendarPressure(situation: GhostSituation) {
  const events = situation.upcomingEvents || [];
  const event = events[0] || null;
  const minutes = minutesUntil(event?.start_at || event?.remind_at);

  if (!event || minutes === null || minutes < 0) {
    return {
      level: "none",
      event: null,
      minutesUntil: null,
      reason: "no_future_event",
    };
  }

  if (minutes <= 30) {
    return {
      level: "high",
      event: {
        title: event.title || null,
        type: event.type || null,
        when: event.start_at || event.remind_at || null,
      },
      minutesUntil: minutes,
      reason: "event_within_30_minutes",
    };
  }

  if (minutes <= 90) {
    return {
      level: "medium",
      event: {
        title: event.title || null,
        type: event.type || null,
        when: event.start_at || event.remind_at || null,
      },
      minutesUntil: minutes,
      reason: "event_within_90_minutes",
    };
  }

  return {
    level: situation.calendarToday?.length ? "low" : "none",
    event: {
      title: event.title || null,
      type: event.type || null,
      when: event.start_at || event.remind_at || null,
    },
    minutesUntil: minutes,
    reason: situation.calendarToday?.length
      ? "calendar_today"
      : "future_event_not_urgent",
  };
}

function buildActiveGoalActionLinks(situation: GhostSituation) {
  const goals = situation.activeGoals || [];
  const actions = situation.pendingActions || [];
  const links: any[] = [];

  for (const goal of goals) {
    for (const action of actions) {
      const score = overlapScore(
        `${goal.title || ""} ${goal.description || ""} ${goal.category || ""}`,
        `${action.title || ""} ${action.description || ""} ${action.intent_type || ""}`
      );

      if (score <= 0) continue;

      links.push({
        goalTitle: goal.title || null,
        actionTitle: action.title || null,
        score,
        priority: Number(action.priority || 0),
        importance: Number(goal.importance || 0),
      });
    }
  }

  return links
    .sort(
      (a, b) =>
        b.score + b.priority + b.importance - (a.score + a.priority + a.importance)
    )
    .slice(0, 3);
}

function parseHomePresenceSignal(homeContext: string) {
  if (!homeContext) {
    return {
      status: "unknown",
      signals: [],
      reason: "home_reasoning_unavailable",
    };
  }

  const signals = homeContext
    .split("\n")
    .map((line) => line.trim().replace("- ", ""))
    .filter((line) =>
      [
        "house_empty",
        "one_person_home",
        "two_people_home",
        "media_active",
        "lights_active",
        "night_mode",
        "day_mode",
        "relax_mode_possible",
        "home_activity_possible",
      ].some((signal) => line === signal || line.startsWith("active_rooms:"))
    );

  let status = "unknown";
  if (signals.includes("house_empty")) status = "empty";
  else if (signals.includes("two_people_home")) status = "two_people_home";
  else if (signals.includes("one_person_home")) status = "one_person_home";
  else if (signals.some((signal) => signal.startsWith("active_rooms:"))) {
    status = "activity_detected";
  }

  return {
    status,
    signals,
    reason: signals.length ? "home_signals_detected" : "no_home_signal",
  };
}

function buildHomePresenceFromHouseState(houseState: HouseStateSnapshot) {
  if (houseState.occupancyStatus === "not_configured") {
    return {
      status: "not_configured",
      signals: [],
      reason: "home_assistant_not_configured_for_user",
    };
  }

  let status = "unknown";
  if (houseState.occupancyStatus === "empty") status = "empty";
  if (houseState.occupancyStatus === "one_person_home") status = "one_person_home";
  if (houseState.occupancyStatus === "multiple_people_home") {
    status = "two_people_home";
  }
  if (houseState.occupancyStatus === "activity_detected") {
    status = "activity_detected";
  }

  return {
    status,
    signals: houseState.signals,
    reason: houseState.signals.length
      ? "house_state_snapshot"
      : "no_home_signal",
  };
}

function buildCurrentSituationSummary({
  situation,
  houseState,
  homeConsistency,
  behaviorPatterns,
  housePatterns,
  generatedAt,
}: {
  situation: GhostSituation;
  houseState: HouseStateSnapshot;
  homeConsistency: HomeLocationConsistency;
  behaviorPatterns: any[];
  housePatterns: any[];
  generatedAt: string;
}) {
  const currentPlace = situation.currentPlace || null;
  const placeCategory = situation.currentPlaceCategory || null;
  const peopleAtHome = (houseState.people || [])
    .filter((person) => person.presenceKnown && person.isHome)
    .map((person) => person.name);
  const activeMedia = (houseState.media || []).map((media) => media.name);
  const activeRooms = houseState.activeRooms || [];
  const relevantPatterns = [
    ...(behaviorPatterns || []),
    ...(housePatterns || []),
  ]
    .filter((pattern) => ["active", "learning"].includes(String(pattern.status || "")))
    .sort(
      (a, b) =>
        Number(b.confidence || 0) + Number(b.occurrences || 0) -
        (Number(a.confidence || 0) + Number(a.occurrences || 0))
    )
    .slice(0, 5)
    .map((pattern) => pattern.title || pattern.description || pattern.pattern_type)
    .filter(Boolean);

  const facts = [
    currentPlace
      ? `Manuele e a ${currentPlace}.`
      : situation.lastKnownPlace
        ? `Ultimo luogo noto di Manuele: ${situation.lastKnownPlace}.`
        : "Luogo attuale di Manuele sconosciuto.",
    peopleAtHome.length
      ? `${peopleAtHome.join(", ")} ${peopleAtHome.length === 1 ? "e presente" : "sono presenti"} a casa.`
      : houseState.occupancyStatus === "empty"
        ? "La casa risulta vuota."
        : "",
    activeMedia.length ? `${activeMedia.join(", ")} attiva.` : "",
    activeRooms.length ? `Stanze attive: ${activeRooms.join(", ")}.` : "",
    homeConsistency.mismatch
      ? `Segnale incoerente tra posizione e casa: ${homeConsistency.reason}.`
      : "",
    relevantPatterns.length
      ? `Pattern rilevanti: ${relevantPatterns.join("; ")}.`
      : "",
  ].filter(Boolean);

  return {
    summary: facts.join(" "),
    facts,
    currentPlace,
    placeCategory,
    peopleAtHome,
    activeMedia,
    activeRooms,
    relevantPatterns,
    confidence: Math.max(
      Number(situation.locationConfidence || 0),
      Number(houseState.confidence || 0),
      Number(homeConsistency.confidence || 0)
    ),
    updatedAt: generatedAt,
  };
}

function buildMemoryAnchors(situation: GhostSituation, detectedTopics: DetectedTopicInput[]) {
  const detected = detectedTopics.map((topic) => clean(topic.topic));
  const anchors: string[] = [];

  const topics = situation.dominantTopics || [];
  const episodes = situation.recentEpisodes || [];
  const timeline = situation.recentTimelineEvents || [];
  const summaries = situation.recentSummaries || [];
  const links = situation.importantLinks || [];

  anchors.push(
    ...topics
      .filter((topic) => {
        const name = clean(topic.topic);
        return !detected.length || detected.some((item) => name.includes(item));
      })
      .map((topic) => topic.topic)
  );

  anchors.push(
    ...episodes.map((episode) => episode.title || episode.summary || episode.description)
  );
  anchors.push(...timeline.map((event) => event.title || event.summary));
  anchors.push(...summaries.map((summary) => summary.title || summary.summary));
  anchors.push(
    ...links.map((link) => `${link.source_topic} -> ${link.target_topic}`)
  );

  return uniqueValues(anchors, 5);
}

function buildConflicts({
  whereIsUser,
  nextCalendarPressure,
  homePresenceSignal,
}: {
  whereIsUser: any;
  nextCalendarPressure: any;
  homePresenceSignal: any;
}) {
  const conflicts: any[] = [];
  const place = clean(whereIsUser.place);
  const homeStatus = homePresenceSignal.status;

  if (whereIsUser.place && !whereIsUser.isFresh) {
    conflicts.push({
      key: "location_stale",
      severity: "medium",
      reason: "Location is available only as last known place.",
    });
  }

  if (
    nextCalendarPressure.level === "high" &&
    (!whereIsUser.place || whereIsUser.status === "unknown")
  ) {
    conflicts.push({
      key: "event_soon_unknown_location",
      severity: "medium",
      reason: "There is an imminent event but user location is unknown.",
    });
  }

  if (homeStatus === "unknown") {
    conflicts.push({
      key: "home_presence_unknown",
      severity: "low",
      reason: "Home Assistant presence signal is unavailable or unclear.",
    });
  }

  if (
    ["one_person_home", "two_people_home"].includes(homeStatus) &&
    place &&
    place !== "casa" &&
    place !== "home"
  ) {
    conflicts.push({
      key: "home_presence_location_mismatch",
      severity: "medium",
      reason: "Home Assistant sees people home while current user place is not home.",
    });
  }

  return conflicts;
}

function buildCertainty({
  whereIsUser,
  nextCalendarPressure,
  homePresenceSignal,
  memoryAnchors,
  conflicts,
}: {
  whereIsUser: any;
  nextCalendarPressure: any;
  homePresenceSignal: any;
  memoryAnchors: string[];
  conflicts: any[];
}) {
  const location =
    whereIsUser.status === "current"
      ? "high"
      : whereIsUser.status === "last_known"
        ? "medium"
        : "low";

  const calendar = nextCalendarPressure.event ? "high" : "low";
  const home = homePresenceSignal.status === "unknown" ? "low" : "medium";
  const memory = memoryAnchors.length >= 3 ? "medium" : "low";
  const overall = conflicts.some((conflict) => conflict.severity === "medium")
    ? "medium"
    : location === "high" || calendar === "high"
      ? "medium"
      : "low";

  return {
    location,
    calendar,
    home,
    memory,
    overall,
  };
}

export async function buildReasoningSnapshot({
  userId,
  message,
  detectedTopics = [],
}: ReasoningSnapshotInput) {
  if (!userId) return buildFallbackSnapshot("missing_user_id");

  let situation: GhostSituation | null = null;
  let contextSignals: ReturnType<typeof buildContextSignals> = [];
  let homeContext = "";

  try {
    situation = await buildGhostSituation(userId);
    contextSignals = buildContextSignals(situation);
  } catch (err) {
    console.log("REASONING SITUATION ERROR:", err);
    return buildFallbackSnapshot("situation_unavailable");
  }

  if (canAccessHomeAssistant(userId)) {
    try {
      homeContext = await buildHomeReasoning(userId);
    } catch (err) {
      console.log("REASONING HOME ERROR:", err);
      homeContext = "";
    }
  }

  const whereIsUser = buildWhereIsUser(situation);
  const whoIsRelevantNow = buildWhoIsRelevantNow({ message, detectedTopics });
  const nextCalendarPressure = buildNextCalendarPressure(situation);
  const activeGoalActionLinks = buildActiveGoalActionLinks(situation);
  const homePresenceSignal = parseHomePresenceSignal(homeContext);
  const memoryAnchors = buildMemoryAnchors(situation, detectedTopics);
  const conflicts = buildConflicts({
    whereIsUser,
    nextCalendarPressure,
    homePresenceSignal,
  });
  const certainty = buildCertainty({
    whereIsUser,
    nextCalendarPressure,
    homePresenceSignal,
    memoryAnchors,
    conflicts,
  });

  return {
    whereIsUser,
    whoIsRelevantNow,
    nextCalendarPressure,
    activeGoalActionLinks,
    homePresenceSignal,
    memoryAnchors,
    conflicts,
    certainty,
    contextSignals,
  };
}

export async function buildGhostBrainSnapshot(
  userId: string
): Promise<GhostBrainSnapshot> {
  const generatedAt = new Date().toISOString();
  const homeAssistantAccess = canAccessHomeAssistant(userId);

  const [
    { graph },
    situation,
    peopleSnapshot,
    memorySnapshot,
    goalsSnapshot,
  ] = await Promise.all([
    loadUserContextGraph(userId),
    buildGhostSituation(userId),
    buildPeopleSnapshot(userId),
    buildMemorySnapshot(userId),
    buildGoalsSnapshot(userId),
  ]);

  const signalSituation = {
    ...situation,
    activeGoals: goalsSnapshot.activeGoals,
    pendingActions: goalsSnapshot.pendingActions,
  };

  const contextSignals = buildContextSignals(signalSituation);
  const relationshipMemory = buildRelationshipMemorySnapshot({
    people: peopleSnapshot,
    memory: memorySnapshot,
    calendarEvents: [
      ...(graph.calendarUpcoming || []),
      ...(situation.calendarToday || []),
      ...(situation.completedCalendarEvents || []),
    ],
    actions: goalsSnapshot.pendingActions,
  });
  const socialSuggestions = buildSocialSuggestionSnapshot({
    people: peopleSnapshot,
    relationshipMemory,
  });
  const projectMemory = buildProjectMemorySnapshot({
    memory: memorySnapshot,
    goals: goalsSnapshot,
    people: peopleSnapshot,
    calendarEvents: [
      ...(graph.calendarUpcoming || []),
      ...(situation.calendarToday || []),
    ],
  });
  const goalProjectConsistency = buildGoalProjectConsistencySnapshot({
    goals: goalsSnapshot,
    projects: projectMemory,
  });
  const projectAdvisor = buildProjectAdvisorSnapshot({
    projects: projectMemory,
    goals: goalsSnapshot,
    consistency: goalProjectConsistency,
    relationshipMemory,
  });

  let houseState: HouseStateSnapshot | null = null;
  try {
    houseState = await buildHouseStateSnapshot(userId);
  } catch (err) {
    console.log("GHOSTBRAIN HOUSE STATE ERROR:", err);
  }

  if (!houseState) {
    houseState = {
      occupancyStatus: "unknown",
      people: [],
      activeRooms: [],
      media: [],
      signals: [],
      confidence: 0,
      occupancySince: null,
      lastUpdated: null,
    };
  }

  const homeContext = formatHouseStateContext(houseState);
  const homePresence = buildHomePresenceFromHouseState(houseState);
  const homeConsistency = buildHomeLocationConsistency({
    currentPlace: situation.currentPlace || graph.currentLocation?.current_place_label || null,
    currentCategory:
      situation.currentPlaceCategory || graph.currentLocation?.place_category || null,
    houseState,
  });
  let houseRoutes: HouseRouteSnapshot | null = null;
  if (homeAssistantAccess) {
    try {
      houseRoutes = await buildHouseRouteSnapshot({ userId, houseState });
    } catch (err) {
      console.log("GHOSTBRAIN HOUSE ROUTES ERROR:", err);
    }
  }

  if (!houseRoutes) {
    houseRoutes = {
      knownRoutes: [],
      recentRoute: null,
      activeRooms: houseState.activeRooms || [],
      possibleMovement: "no_movement",
      confidence: 0,
      lastUpdated: houseState.lastUpdated,
    };
  }

  let homeComfortRisk: HomeComfortRiskSnapshot | null = null;
  if (homeAssistantAccess) {
    try {
      homeComfortRisk = await buildHomeComfortRiskSnapshot({
        userId,
        houseState,
        routes: houseRoutes,
        learnedRules: graph.houseLearnedRules || [],
        automationControls: graph.houseAutomationControls || [],
      });
    } catch (err) {
      console.log("GHOSTBRAIN HOME COMFORT RISK ERROR:", err);
    }
  }

  if (!homeComfortRisk) {
    homeComfortRisk = {
      comfortSignals: [],
      riskSignals: [],
      automationSignals: [],
      suggestions: [],
      confidence: 0,
      lastUpdated: houseState.lastUpdated,
    };
  }

  const simpleSignals = buildGhostBrainSimpleSignals({
    graph,
    situation,
    homeSignals: homePresence.signals,
    homeMismatch: homeConsistency.mismatch,
    importantPeople: peopleSnapshot.importantPeople,
    mentalState: situation.mentalState,
  });
  const currentSituation = buildCurrentSituationSummary({
    situation,
    houseState,
    homeConsistency,
    behaviorPatterns: graph.behaviorPatterns || [],
    housePatterns: homeAssistantAccess ? graph.housePatterns || [] : [],
    generatedAt,
  });
  const curiosity = buildCuriositySnapshot({
    people: peopleSnapshot,
    relationshipMemory,
    socialSuggestions,
    projects: projectMemory,
    projectAdvisor,
    projectConsistency: goalProjectConsistency,
    goals: goalsSnapshot,
    memory: memorySnapshot,
    routes: houseRoutes,
    comfortRisk: homeComfortRisk,
    calendarEvents: [
      ...(graph.calendarUpcoming || []),
      ...(situation.calendarToday || []),
    ],
    significantPlaces: graph.significantPlaces || [],
    contextSignals,
  });

  const pastEvidence = buildRecentPastEvidence({
    episodes: memorySnapshot.episodicMemories,
    timeline: memorySnapshot.timeline,
    summaries: memorySnapshot.summaries,
    completedCalendar: situation.completedCalendarEvents,
    completedActions: situation.completedActions,
  });
  const futureCalendar = filterFutureCalendar(
    situation.upcomingEvents,
    pastEvidence
  );
  const openActions = filterOpenActions(
    goalsSnapshot.pendingActions,
    pastEvidence
  );

  const coreSnapshot: GhostBrainSnapshotCore = {
    profile: {
      ...(graph.profile || {}),
      mentalState: situation.mentalState || null,
      dynamicProfile: situation.dynamicProfile || [],
    },
    memory: memorySnapshot,
    people: {
      ...peopleSnapshot,
      relationshipMemory,
      socialSuggestions,
    },
    location: {
      current: graph.currentLocation || null,
      lastKnown: graph.lastKnownLocation || null,
      status:
        graph.locationStatus === "current" || graph.locationStatus === "stale"
          ? graph.locationStatus
          : "unknown",
      significantPlaces: graph.significantPlaces || [],
      behaviorPatterns: graph.behaviorPatterns || [],
      situation: {
        currentPlace: situation.currentPlace || null,
        category: situation.currentPlaceCategory || null,
        address: situation.currentPlaceAddress || null,
        confidence: situation.locationConfidence ?? null,
        lastChangedAt: situation.lastLocationChange || null,
      },
    },
    calendar: {
      upcoming: futureCalendar,
      today: filterFutureCalendar(situation.calendarToday, pastEvidence),
      completed: situation.completedCalendarEvents,
    },
    goals: goalsSnapshot,
    actions: openActions,
    completedActions: situation.completedActions,
    projects: {
      ...projectMemory,
      consistency: goalProjectConsistency,
      advisor: projectAdvisor,
    },
    curiosity,
    home: {
      state: houseState,
      patterns: homeAssistantAccess ? graph.housePatterns || [] : [],
      learnedRules: homeAssistantAccess ? graph.houseLearnedRules || [] : [],
      automationControls: homeAssistantAccess
        ? graph.houseAutomationControls || []
        : [],
      presence: homePresence,
      consistency: homeConsistency,
      routes: houseRoutes,
      comfortRisk: homeComfortRisk,
      context: homeContext || null,
    },
    proactive: {
      recent: graph.proactiveRecent || [],
      handledRecent: graph.proactiveHandledRecent || [],
    },
    currentSituation,
    signals: {
      simple: simpleSignals,
      context: contextSignals,
    },
    generatedAt,
  };

  const decision = buildDecisionSnapshot(coreSnapshot);
  const trueProactive = buildTrueProactiveSnapshot({
    snapshot: coreSnapshot,
    decision,
  });

  return {
    ...coreSnapshot,
    trueProactive,
  };
}
