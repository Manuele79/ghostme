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
  | "important_goal_without_actions";

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
          `${name} compare nei topic personali ma non ha ancora un profilo relazionale riconosciuto.`,
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

    result.push(
      item(
        "sparse_relationship",
        name,
        `${name} e presente nel grafo persone, ma il contesto relazionale recente e scarso.`,
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
          `${name} compare spesso, ma mancano eventi, memorie recenti o cicli aperti che ne spieghino il contesto attuale.`,
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
        `${name} e una persona importante, ma relazione o descrizione risultano incomplete.`,
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
          `${project.name} risulta fermo, ma i dati disponibili non spiegano chiaramente il blocco.`,
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
        `${issue.project || issue.label} non risulta collegato a un goal esplicito.`,
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
        `${project.name} risulta attivo, ma non e chiaro quale sia il prossimo passo operativo.`,
        "projects",
        8,
        Math.max(55, project.confidence)
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

  for (const topic of memory.topics || []) {
    const title = titleFor(topic);
    const mentions = Number(topic.mention_count || 0);
    const weight = Number(topic.weight || 0);

    if (title && !topic.description && (mentions >= 3 || weight >= 7)) {
      result.push(
        item(
          "repeated_topic_without_explanation",
          title,
          `${title} e un topic ricorrente, ma manca una spiegazione strutturata.`,
          "memory",
          6,
          Math.min(90, 45 + mentions * 6 + weight * 2)
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
          `${title} compare nella memoria come luogo, ma non e associato ai luoghi significativi noti.`,
          "memory",
          6,
          Math.min(85, 45 + mentions * 5)
        )
      );
    }
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
      `${title} e un goal importante, ma non risulta collegato ad azioni aperte.`,
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
    "important_goal_without_actions",
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
