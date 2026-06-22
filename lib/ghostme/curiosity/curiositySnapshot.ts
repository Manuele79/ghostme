import type { ContextSignal } from "@/lib/ghostme/context/contextSignals";
import type { GoalsSnapshot } from "@/lib/ghostme/goals/goalsSnapshot";
import type { HomeComfortRiskSnapshot } from "@/lib/ghostme/home/homeComfortRiskSnapshot";
import type { HouseRouteSnapshot } from "@/lib/ghostme/home/houseRouteSnapshot";
import type { MemorySnapshot } from "@/lib/ghostme/memory/memorySnapshot";
import type { PeopleSnapshot } from "@/lib/ghostme/people/peopleSnapshot";
import type { RelationshipMemorySnapshot } from "@/lib/ghostme/people/relationshipMemorySnapshot";
import type { SocialSuggestionSnapshot } from "@/lib/ghostme/people/socialSuggestionSnapshot";
import type { GoalProjectConsistencySnapshot } from "@/lib/ghostme/projects/goalProjectConsistencySnapshot";
import type { ProjectAdvisorSnapshot } from "@/lib/ghostme/projects/projectAdvisorSnapshot";
import type { ProjectMemorySnapshot } from "@/lib/ghostme/projects/projectMemorySnapshot";

export type CuriosityType =
  | "unknown_person"
  | "sparse_relationship"
  | "repeated_person_without_context"
  | "important_person_missing_details"
  | "stalled_project_reason_unknown"
  | "project_without_goal"
  | "active_project_without_actions"
  | "repeated_route_unknown"
  | "room_usage_pattern_unclear"
  | "unexplained_automation_pattern"
  | "repeated_event_without_context"
  | "repeated_topic_without_explanation"
  | "missing_place_association"
  | "uncategorized_place"
  | "important_goal_without_actions"
  | "project_priority_unclear"
  | "past_event_completion_unclear"
  | "routine_missing_context"
  | "preference_missing_detail";

export const HIGH_VALUE_CURIOSITY_TYPES = new Set<CuriosityType>([
  "unknown_person",
  "important_person_missing_details",
  "repeated_person_without_context",
  "uncategorized_place",
  "missing_place_association",
  "stalled_project_reason_unknown",
  "project_priority_unclear",
  "project_without_goal",
  "active_project_without_actions",
  "important_goal_without_actions",
  "past_event_completion_unclear",
  "routine_missing_context",
  "preference_missing_detail",
]);

export type CuriosityItem = {
  type: CuriosityType;
  title: string;
  description: string;
  category: "people" | "projects" | "house" | "calendar" | "memory" | "goals";
  priority: number;
  confidence: number;
};

export type CuriositySnapshot = {
  curiosities: CuriosityItem[];
  missingInformation: CuriosityItem[];
  weakPatterns: CuriosityItem[];
  unexplainedBehaviors: CuriosityItem[];
  confidence: number;
  memoryCompleteness: number;
  highValueGaps: number;
  lastUpdated: string | null;
};

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

function normalize(value: any) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function titleFor(row: any) {
  return String(row?.title || row?.topic || row?.name || row?.description || "").trim();
}

function latestTimestamp(values: Array<string | null | undefined>) {
  let latest: string | null = null;
  let latestTime = 0;

  for (const value of values) {
    if (!value) continue;

    const time = new Date(value).getTime();
    if (Number.isNaN(time) || time <= latestTime) continue;

    latest = value;
    latestTime = time;
  }

  return latest;
}

function uniqueItems(values: CuriosityItem[]) {
  const seen = new Set<string>();
  const result: CuriosityItem[] = [];

  for (const value of values) {
    const key = `${value.type}|${normalize(value.title)}`;
    if (!value.title || seen.has(key)) continue;

    seen.add(key);
    result.push(value);
  }

  return result.sort(
    (left, right) =>
      right.priority + right.confidence / 100 -
      (left.priority + left.confidence / 100)
  );
}

function item(
  type: CuriosityType,
  title: string,
  description: string,
  category: CuriosityItem["category"],
  priority: number,
  confidence: number
): CuriosityItem {
  return {
    type,
    title,
    description,
    category,
    priority: Math.min(10, Math.max(1, priority)),
    confidence: Math.min(100, Math.max(0, confidence)),
  };
}

function personCuriosities({
  people,
  memory,
  relationshipMemory,
  socialSuggestions,
}: {
  people: PeopleSnapshot;
  memory: MemorySnapshot;
  relationshipMemory: RelationshipMemorySnapshot;
  socialSuggestions: SocialSuggestionSnapshot;
}) {
  const result: CuriosityItem[] = [];
  const knownNames = new Set((people.items || []).map((person) => normalize(person.name)));

  for (const topic of memory.topics || []) {
    const name = titleFor(topic);
    const isPerson =
      clean(topic.entity_type) === "person" ||
      ["person", "family", "friend", "relationship"].includes(clean(topic.category));

    if (isPerson && name && !knownNames.has(normalize(name))) {
      result.push(
        item(
          "unknown_person",
          name,
          `${name} è un amico stretto, un conoscente, un collega o altro?`,
          "people",
          7,
          Math.min(85, 45 + Number(topic.mention_count || 0) * 8)
        )
      );
    }
  }

  for (const relationship of socialSuggestions.sparseRelationships || []) {
    const name = titleFor(relationship);
    if (!name) continue;
    const missingRelationship = !relationship.relationship_type;
    const missingDescription = !relationship.description;
    if (!missingRelationship && !missingDescription) continue;

    result.push(
      item(
        "sparse_relationship",
        name,
        missingRelationship
          ? `${name} è un amico stretto, un conoscente, un collega o altro?`
          : `Qual è il contesto più utile da ricordare sul tuo rapporto con ${name}?`,
        "people",
        6,
        Math.max(45, Number(relationship.importance || 0) * 8)
      )
    );

    if (Number(relationship.mention_count || 0) >= 3) {
      result.push(
        item(
          "repeated_person_without_context",
          name,
          `Quando nomini ${name}, qual è la relazione o il contesto che dovrei ricordare?`,
          "people",
          8,
          Math.min(90, 55 + Number(relationship.mention_count || 0) * 5)
        )
      );
    }
  }

  for (const person of people.importantPeople || []) {
    const name = titleFor(person);
    if (!name || (person.relationship_type && person.description)) continue;

    result.push(
      item(
        "important_person_missing_details",
        name,
        !person.relationship_type
          ? `${name} è un amico stretto, un conoscente, un collega o altro?`
          : `Cosa è importante che ricordi del tuo rapporto con ${name}?`,
        "people",
        8,
        Math.max(55, Math.min(90, Number(person.importance || 0) * 9))
      )
    );
  }

  if (!relationshipMemory.relationships.length && people.items.length) {
    result.push(
      item(
        "sparse_relationship",
        "Contesto relazionale",
        "Sono note alcune persone, ma non emerge ancora una relazione sufficientemente contestualizzata.",
        "people",
        5,
        45
      )
    );
  }

  return result;
}

function projectCuriosities({
  projects,
  consistency,
  advisor,
}: {
  projects: ProjectMemorySnapshot;
  consistency: GoalProjectConsistencySnapshot;
  advisor: ProjectAdvisorSnapshot;
}) {
  const result: CuriosityItem[] = [];

  for (const project of projects.stalledProjects || []) {
    const explained = advisor.blockedAreas.some(
      (area) =>
        normalize(area.project) === normalize(project.name) &&
        !["project_stalled", "project_without_goal"].includes(area.reason)
    );

    if (!explained) {
      result.push(
        item(
          "stalled_project_reason_unknown",
          project.name,
          `${project.name} è ancora attivo, è in pausa o lo consideri concluso?`,
          "projects",
          8,
          Math.max(45, project.confidence)
        )
      );
    }
  }

  for (const issue of consistency.consistencyIssues) {
    if (issue.type !== "project_without_goal") continue;

    result.push(
      item(
        "project_without_goal",
        issue.project || issue.label,
        `A quale obiettivo vuoi collegare ${issue.project || issue.label}?`,
        "projects",
        7,
        Math.max(50, consistency.confidence)
      )
    );
  }

  for (const project of projects.activeProjects || []) {
    if (project.pendingActions.length) continue;

    result.push(
      item(
        "active_project_without_actions",
        project.name,
        `Qual è la prossima azione concreta per ${project.name}?`,
        "projects",
        8,
        Math.max(55, project.confidence)
      )
    );
  }

  if (projects.importantProject && projects.activeProjects.length >= 2) {
    result.push(
      item(
        "project_priority_unclear",
        projects.importantProject.name,
        `${projects.importantProject.name} è ancora il progetto principale su cui vuoi concentrarti?`,
        "projects",
        8,
        Math.max(60, projects.importantProject.confidence)
      )
    );
  }

  return result;
}

function houseCuriosities({
  routes,
  comfortRisk,
}: {
  routes: HouseRouteSnapshot;
  comfortRisk: HomeComfortRiskSnapshot;
}) {
  const result: CuriosityItem[] = [];

  for (const route of routes.knownRoutes.filter(
    (item) =>
      item.source === "learned" &&
      (clean(item.status) === "learning" || item.confidence < 70)
  )) {
    result.push(
      item(
        "repeated_route_unknown",
        route.path,
        `Il percorso ricorrente ${route.path} e stato appreso, ma non e ancora spiegato con sufficiente certezza.`,
        "house",
        6,
        route.confidence
      )
    );
  }

  if (routes.activeRooms.length > 1 && routes.possibleMovement === "uncertain_movement") {
    result.push(
      item(
        "room_usage_pattern_unclear",
        routes.activeRooms.join(" -> "),
        "Piu stanze risultano attive, ma il movimento o l'uso delle stanze non e ancora chiaro.",
        "house",
        6,
        routes.confidence
      )
    );
  }

  if (
    comfortRisk.automationSignals.some((signal) =>
      ["known_automation_active", "routine_detected"].includes(signal)
    ) &&
    !comfortRisk.automationSignals.includes("learned_rule_relevant")
  ) {
    result.push(
      item(
        "unexplained_automation_pattern",
        "Routine casa",
        "E presente un pattern di automazione o routine che non e ancora collegato a una regola appresa.",
        "house",
        7,
        comfortRisk.confidence
      )
    );
  }

  return result;
}

function calendarCuriosities({
  calendarEvents,
  projects,
  relationshipMemory,
}: {
  calendarEvents: any[];
  projects: ProjectMemorySnapshot;
  relationshipMemory: RelationshipMemorySnapshot;
}) {
  const result: CuriosityItem[] = [];
  const grouped = new Map<string, any[]>();

  for (const event of calendarEvents) {
    const title = titleFor(event);
    const key = normalize(title);
    if (!key) continue;
    grouped.set(key, [...(grouped.get(key) || []), event]);
  }

  for (const events of grouped.values()) {
    if (events.length < 2) continue;

    const title = titleFor(events[0]);
    const linkedToProject = projects.projects.some((project) =>
      normalize(title).includes(normalize(project.name))
    );
    const linkedToPerson = relationshipMemory.sharedEvents.some(
      (event) => normalize(event.title) === normalize(title)
    );

    if (linkedToProject || linkedToPerson) continue;

    result.push(
      item(
        "repeated_event_without_context",
        title,
        `${title} compare piu volte nel calendario senza un progetto o una relazione associata.`,
        "calendar",
        5,
        Math.min(85, 45 + events.length * 10)
      )
    );
  }

  return result;
}

function memoryCuriosities({
  memory,
  significantPlaces,
}: {
  memory: MemorySnapshot;
  significantPlaces: any[];
}) {
  const result: CuriosityItem[] = [];
  const placeLabels = (significantPlaces || []).map((place) =>
    normalize(place.label || place.current_place_label)
  );

  for (const place of significantPlaces || []) {
    const label = titleFor(place);
    const category = clean(place.category || place.place_category);
    if (!label || (category && category !== "unknown")) continue;

    result.push(
      item(
        "uncategorized_place",
        label,
        `Il posto ${label} è un supermercato, lavoro, palestra o altro?`,
        "memory",
        9,
        Math.max(65, Number(place.confidence || 0))
      )
    );
  }

  for (const topic of memory.topics || []) {
    const title = titleFor(topic);
    const mentions = Number(topic.mention_count || 0);
    const weight = Number(topic.weight || 0);

    const category = clean(topic.category || topic.entity_type);
    const isPreference = [
      "preference",
      "preferenza",
      "hobby",
      "food",
      "sport",
      "passion",
    ].includes(category);
    const isRoutine = ["routine", "habit", "abitudine"].includes(category);

    if (
      title &&
      !topic.description &&
      (mentions >= 3 || weight >= 7) &&
      !isPreference &&
      !isRoutine
    ) {
      result.push(
        item(
          "repeated_topic_without_explanation",
          title,
          `Quando parli di ${title}, qual è il dettaglio più utile che dovrei ricordare?`,
          "memory",
          6,
          Math.min(90, 45 + mentions * 6 + weight * 2)
        )
      );
    }

    if (title && !topic.description && isPreference && (mentions >= 2 || weight >= 6)) {
      result.push(
        item(
          "preference_missing_detail",
          title,
          `Qual è la tua preferenza concreta riguardo ${title}?`,
          "memory",
          8,
          Math.min(90, 50 + mentions * 7 + weight * 2)
        )
      );
    }

    if (title && !topic.description && isRoutine && (mentions >= 2 || weight >= 6)) {
      result.push(
        item(
          "routine_missing_context",
          title,
          `${title} è una routine stabile o capita solo in alcune situazioni?`,
          "memory",
          8,
          Math.min(90, 50 + mentions * 7 + weight * 2)
        )
      );
    }

    const isPlace =
      clean(topic.entity_type) === "place" ||
      ["place", "location", "luogo"].includes(clean(topic.category));
    const placeKnown = placeLabels.some(
      (label) => label && (normalize(title).includes(label) || label.includes(normalize(title)))
    );

    if (isPlace && title && !placeKnown) {
      result.push(
        item(
          "missing_place_association",
          title,
          `${title} che tipo di posto è per te: lavoro, negozio, palestra o altro?`,
          "memory",
          6,
          Math.min(85, 45 + mentions * 5)
        )
      );
    }
  }

  return result;
}

function pastEventCuriosities(memory: MemorySnapshot) {
  const result: CuriosityItem[] = [];
  const staleFutureThreshold = Date.now() - 24 * 60 * 60 * 1000;

  for (const event of memory.timeline || []) {
    const period = normalize(event.period_label);
    const recordedAt = new Date(event.event_date || event.created_at || 0).getTime();
    if (!period.includes("futur") || !Number.isFinite(recordedAt)) continue;
    if (recordedAt > staleFutureThreshold) continue;

    const title = titleFor(event);
    if (!title) continue;
    result.push(
      item(
        "past_event_completion_unclear",
        title,
        `${title} è poi successo oppure è ancora in programma?`,
        "memory",
        9,
        Math.max(65, Number(event.importance || 0) * 9)
      )
    );
  }

  return result;
}

function goalCuriosities({
  goals,
  consistency,
}: {
  goals: GoalsSnapshot;
  consistency: GoalProjectConsistencySnapshot;
}) {
  if (
    !goals.importantGoal ||
    !consistency.consistencyIssues.some(
      (issue) => issue.type === "important_goal_without_actions"
    )
  ) {
    return [];
  }

  const title = titleFor(goals.importantGoal);
  return [
    item(
      "important_goal_without_actions",
      title,
      `Qual è la prossima azione concreta da collegare al goal ${title}?`,
      "goals",
      9,
      Math.max(60, Number(goals.importantGoal.importance || 0) * 9)
    ),
  ];
}

function signalCuriosities(contextSignals: ContextSignal[]) {
  // Location learning writes a candidate-linked card directly. A generic
  // duplicate would lose the candidate id required to save the answer.
  void contextSignals;
  return [];
}

function memoryCompleteness({
  people,
  relationshipMemory,
  projects,
  goals,
  memory,
  significantPlaces,
}: {
  people: PeopleSnapshot;
  relationshipMemory: RelationshipMemorySnapshot;
  projects: ProjectMemorySnapshot;
  goals: GoalsSnapshot;
  memory: MemorySnapshot;
  significantPlaces: any[];
}) {
  const peopleItems = people.items || [];
  const peopleScore = peopleItems.length
    ? (peopleItems.filter((person) => person.relationship_type && person.description)
        .length /
        peopleItems.length) * 100
    : 25;
  const places = significantPlaces || [];
  const placesScore = places.length
    ? (places.filter(
        (place) =>
          place.label &&
          clean(place.category || place.place_category) !== "unknown"
      ).length /
        places.length) * 100
    : 25;
  const projectItems = projects.projects || [];
  const projectsScore = projectItems.length
    ? (projectItems.filter(
        (project) => project.relatedGoals.length || project.pendingActions.length
      ).length /
        projectItems.length) * 100
    : 30;
  const topics = memory.topics || [];
  const memoryScore = topics.length
    ? (topics.filter((topic) => topic.description).length / topics.length) * 100
    : 25;
  const goalScore = goals.activeGoals.length
    ? Math.min(100, (goals.pendingActions.length / goals.activeGoals.length) * 100)
    : 50;

  return Math.round(
    (peopleScore +
      placesScore +
      projectsScore +
      memoryScore +
      goalScore +
      relationshipMemory.confidence) /
      6
  );
}

export function buildCuriositySnapshot({
  people,
  relationshipMemory,
  socialSuggestions,
  projects,
  projectAdvisor,
  projectConsistency,
  goals,
  memory,
  routes,
  comfortRisk,
  calendarEvents = [],
  significantPlaces = [],
  contextSignals = [],
}: {
  people: PeopleSnapshot;
  relationshipMemory: RelationshipMemorySnapshot;
  socialSuggestions: SocialSuggestionSnapshot;
  projects: ProjectMemorySnapshot;
  projectAdvisor: ProjectAdvisorSnapshot;
  projectConsistency: GoalProjectConsistencySnapshot;
  goals: GoalsSnapshot;
  memory: MemorySnapshot;
  routes: HouseRouteSnapshot;
  comfortRisk: HomeComfortRiskSnapshot;
  calendarEvents?: any[];
  significantPlaces?: any[];
  contextSignals?: ContextSignal[];
}): CuriositySnapshot {
  const curiosities = uniqueItems([
    ...personCuriosities({ people, memory, relationshipMemory, socialSuggestions }),
    ...projectCuriosities({
      projects,
      consistency: projectConsistency,
      advisor: projectAdvisor,
    }),
    ...houseCuriosities({ routes, comfortRisk }),
    ...calendarCuriosities({ calendarEvents, projects, relationshipMemory }),
    ...memoryCuriosities({ memory, significantPlaces }),
    ...pastEventCuriosities(memory),
    ...goalCuriosities({ goals, consistency: projectConsistency }),
    ...signalCuriosities(contextSignals),
  ]).slice(0, 20);

  const missingTypes: CuriosityType[] = [
    "unknown_person",
    "sparse_relationship",
    "important_person_missing_details",
    "project_without_goal",
    "active_project_without_actions",
    "missing_place_association",
    "uncategorized_place",
    "important_goal_without_actions",
    "project_priority_unclear",
    "past_event_completion_unclear",
    "routine_missing_context",
    "preference_missing_detail",
  ];
  const weakPatternTypes: CuriosityType[] = [
    "repeated_person_without_context",
    "repeated_route_unknown",
    "room_usage_pattern_unclear",
    "repeated_event_without_context",
    "repeated_topic_without_explanation",
  ];
  const behaviorTypes: CuriosityType[] = [
    "stalled_project_reason_unknown",
    "repeated_route_unknown",
    "room_usage_pattern_unclear",
    "unexplained_automation_pattern",
  ];
  const confidence = curiosities.length
    ? Math.round(
        curiosities.reduce((total, curiosity) => total + curiosity.confidence, 0) /
          curiosities.length
      )
    : 0;
  const completeness = memoryCompleteness({
    people,
    relationshipMemory,
    projects,
    goals,
    memory,
    significantPlaces,
  });

  return {
    curiosities,
    missingInformation: curiosities.filter((curiosity) =>
      missingTypes.includes(curiosity.type)
    ),
    weakPatterns: curiosities.filter((curiosity) =>
      weakPatternTypes.includes(curiosity.type)
    ),
    unexplainedBehaviors: curiosities.filter((curiosity) =>
      behaviorTypes.includes(curiosity.type)
    ),
    confidence,
    memoryCompleteness: completeness,
    highValueGaps: curiosities.filter((curiosity) =>
      HIGH_VALUE_CURIOSITY_TYPES.has(curiosity.type)
    ).length,
    lastUpdated: latestTimestamp([
      people.lastUpdated,
      relationshipMemory.lastUpdated,
      socialSuggestions.lastUpdated,
      projects.lastUpdated,
      projectAdvisor.lastUpdated,
      projectConsistency.lastUpdated,
      goals.lastUpdated,
      memory.lastUpdated,
      routes.lastUpdated,
      comfortRisk.lastUpdated,
      ...calendarEvents.map((event) => event.updated_at || event.start_at),
    ]),
  };
}
