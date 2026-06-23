import type { MemorySnapshot } from "@/lib/ghostme/memory/memorySnapshot";
import type { GoalsSnapshot } from "@/lib/ghostme/goals/goalsSnapshot";
import type { PeopleSnapshot } from "@/lib/ghostme/people/peopleSnapshot";
import { isLikelyTestData } from "@/lib/ghostme/context/temporalPriority";

export type ProjectMemoryItem = {
  name: string;
  status: "active" | "paused" | "stalled" | "completed";
  relatedGoals: any[];
  pendingActions: any[];
  relatedPeople: any[];
  recentEvents: any[];
  recentMemories: any[];
  progressSignals: string[];
  confidence: number;
};

export type ProjectMemorySnapshot = {
  projects: ProjectMemoryItem[];
  activeProjects: ProjectMemoryItem[];
  stalledProjects: ProjectMemoryItem[];
  importantProject: ProjectMemoryItem | null;
  openTasks: any[];
  confidence: number;
  lastUpdated: string | null;
};

const PROJECT_HINTS = ["ghostme", "casa pensante", "askdj", "lavoro", "moto"];

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

function normalize(value: any) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

function textFor(row: any) {
  return [
    row.title,
    row.content,
    row.description,
    row.summary,
    row.topic,
    row.category,
    row.entity_type,
    Array.isArray(row.topics) ? row.topics.join(" ") : row.topics,
    Array.isArray(row.related_topics) ? row.related_topics.join(" ") : row.related_topics,
  ].join(" ");
}

function mentionsProject(row: any, projectKey: string) {
  return normalize(textFor(row)).includes(projectKey);
}

function isRecentProjectEvidence(row: any, days = 30) {
  const value = row?.updated_at || row?.created_at || row?.event_date || row?.start_at;
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) && time >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function uniqueByName(values: Array<{ name: string; source?: string }>) {
  const seen = new Set<string>();
  const result: Array<{ name: string; source?: string }> = [];

  for (const value of values) {
    const key = normalize(value.name);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    result.push(value);
  }

  return result;
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function discoverProjects({
  memory,
  goals,
}: {
  memory: MemorySnapshot;
  goals: GoalsSnapshot;
}) {
  const candidates: Array<{ name: string; source?: string }> = [];

  for (const topic of memory.topics || []) {
    if (isLikelyTestData(topic)) continue;
    if (["project", "work", "passion"].includes(clean(topic.entity_type))) {
      candidates.push({ name: topic.topic, source: "topic" });
    }
    if (["project", "work", "passion"].includes(clean(topic.category))) {
      candidates.push({ name: topic.topic, source: "topic" });
    }
  }

  const allRows = [
    ...(goals.activeGoals || []),
    ...(goals.pendingActions || []),
    ...(memory.activeMemories || []),
    ...(memory.episodicMemories || []),
    ...(memory.summaries || []),
    ...(memory.timeline || []),
  ];

  for (const hint of PROJECT_HINTS) {
    if (
      allRows.some(
        (row) => !isLikelyTestData(row) && normalize(textFor(row)).includes(hint)
      )
    ) {
      candidates.push({ name: titleCase(hint), source: "hint" });
    }
  }

  return uniqueByName(candidates).slice(0, 12);
}

function relatedPeopleForProject({
  people,
  projectKey,
}: {
  people: PeopleSnapshot;
  projectKey: string;
}) {
  return (people.items || [])
    .filter((person) => mentionsProject(person, projectKey))
    .slice(0, 5);
}

function progressSignals({
  relatedGoals,
  pendingActions,
  relatedPeople,
  recentEvents,
  recentMemories,
}: {
  relatedGoals: any[];
  pendingActions: any[];
  relatedPeople: any[];
  recentEvents: any[];
  recentMemories: any[];
}) {
  const signals: string[] = [];

  if (recentMemories.length || recentEvents.length) signals.push("recent_activity");
  if (pendingActions.length) signals.push("pending_actions");
  if (recentEvents.length) signals.push("calendar_events");
  if (relatedPeople.length) signals.push("people_involved");
  if (recentMemories.length) signals.push("recent_memories");
  if (relatedGoals.length) signals.push("goals_linked");

  return signals;
}

function statusFor({
  pendingActions,
  recentEvents,
  recentMemories,
  relatedGoals,
}: {
  pendingActions: any[];
  recentEvents: any[];
  recentMemories: any[];
  relatedGoals: any[];
}): ProjectMemoryItem["status"] {
  const allGoalsCompleted =
    relatedGoals.length > 0 &&
    relatedGoals.every((goal) => ["completed", "archived"].includes(clean(goal.status)));

  if (allGoalsCompleted && !pendingActions.length) return "completed";
  if (pendingActions.length || recentEvents.length || recentMemories.length) return "active";
  if (relatedGoals.length) return "paused";

  return "stalled";
}

function confidenceFor(project: Omit<ProjectMemoryItem, "confidence">) {
  return Math.min(
    95,
    project.relatedGoals.length * 15 +
      project.pendingActions.length * 18 +
      project.relatedPeople.length * 8 +
      project.recentEvents.length * 12 +
      project.recentMemories.length * 10 +
      project.progressSignals.length * 5
  );
}

export function buildProjectMemorySnapshot({
  memory,
  goals,
  people,
  calendarEvents = [],
}: {
  memory: MemorySnapshot;
  goals: GoalsSnapshot;
  people: PeopleSnapshot;
  calendarEvents?: any[];
}): ProjectMemorySnapshot {
  const projectCandidates = discoverProjects({ memory, goals });
  const memoryRows = [
    ...(memory.activeMemories || []),
    ...(memory.episodicMemories || []),
    ...(memory.summaries || []),
    ...(memory.timeline || []),
  ];

  const projects = projectCandidates.map((project) => {
    const projectKey = normalize(project.name);
    const relatedGoals = [
      ...(goals.activeGoals || []),
      ...(goals.completedGoals || []),
    ]
      .filter((goal) => mentionsProject(goal, projectKey))
      .slice(0, 6);
    const pendingActions = (goals.pendingActions || [])
      .filter((action) => mentionsProject(action, projectKey))
      .slice(0, 8);
    const relatedPeople = relatedPeopleForProject({ people, projectKey });
    const recentEvents = (calendarEvents || [])
      .filter((event) => mentionsProject(event, projectKey))
      .slice(0, 6);
    const recentMemories = memoryRows
      .filter(
        (row) => mentionsProject(row, projectKey) && isRecentProjectEvidence(row)
      )
      .slice(0, 8);
    const signals = progressSignals({
      relatedGoals,
      pendingActions,
      relatedPeople,
      recentEvents,
      recentMemories,
    });
    const base = {
      name: project.name,
      status: statusFor({
        pendingActions,
        recentEvents,
        recentMemories,
        relatedGoals,
      }),
      relatedGoals,
      pendingActions,
      relatedPeople,
      recentEvents,
      recentMemories,
      progressSignals: signals,
    };

    return {
      ...base,
      confidence: confidenceFor(base),
    };
  });

  const sortedProjects = projects.sort((a, b) => b.confidence - a.confidence);
  const activeProjects = sortedProjects
    .filter((project) => project.status === "active")
    .slice(0, 8);
  const stalledProjects = sortedProjects
    .filter((project) => project.status === "stalled")
    .slice(0, 8);
  const openTasks = sortedProjects
    .flatMap((project) =>
      project.pendingActions.map((action) => ({
        ...action,
        project: project.name,
      }))
    )
    .slice(0, 12);

  return {
    projects: sortedProjects,
    activeProjects,
    stalledProjects,
    importantProject: sortedProjects[0] || null,
    openTasks,
    confidence: Math.min(
      95,
      sortedProjects.reduce((total, project) => total + project.confidence, 0)
    ),
    lastUpdated: latestTimestamp([
      memory.lastUpdated,
      goals.lastUpdated,
      ...calendarEvents.map((event) => event.updated_at || event.start_at || event.remind_at),
    ]),
  };
}
