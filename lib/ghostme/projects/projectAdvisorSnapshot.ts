import type { GoalsSnapshot } from "@/lib/ghostme/goals/goalsSnapshot";
import type { RelationshipMemorySnapshot } from "@/lib/ghostme/people/relationshipMemorySnapshot";
import type { GoalProjectConsistencySnapshot } from "@/lib/ghostme/projects/goalProjectConsistencySnapshot";
import type {
  ProjectMemoryItem,
  ProjectMemorySnapshot,
} from "@/lib/ghostme/projects/projectMemorySnapshot";

export type ProjectAdvisorArea = {
  project: string | null;
  title: string;
  source: "project" | "goal" | "action" | "calendar" | "relationship" | "consistency";
  reason: string;
};

export type ProjectAdvisorFocus = {
  project: string;
  status: ProjectMemoryItem["status"];
  goal: string | null;
  nextAction: string | null;
  lastActivity: string | null;
  reason: string;
};

export type ProjectAdvisorSnapshot = {
  currentFocus: ProjectAdvisorFocus | null;
  blockedAreas: ProjectAdvisorArea[];
  stableAreas: ProjectAdvisorArea[];
  suggestedNextSteps: ProjectAdvisorArea[];
  overloadedProjects: ProjectMemoryItem[];
  stalledProjects: ProjectMemoryItem[];
  confidence: number;
  lastUpdated: string | null;
};

const BLOCKED_TERMS = [
  "blocc",
  "blocked",
  "errore",
  "error",
  "bug",
  "problema",
  "non funziona",
  "manca",
  "missing",
];

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

function normalize(value: any) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function titleFor(row: any) {
  return String(
    row?.title || row?.summary || row?.description || row?.content || row?.name || ""
  ).trim();
}

function timestampFor(row: any) {
  return (
    row?.updated_at ||
    row?.completed_at ||
    row?.created_at ||
    row?.start_at ||
    row?.remind_at ||
    null
  );
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

function uniqueAreas(values: ProjectAdvisorArea[], limit = 12) {
  const seen = new Set<string>();
  const result: ProjectAdvisorArea[] = [];

  for (const value of values) {
    const key = `${normalize(value.project)}|${normalize(value.title)}|${value.reason}`;
    if (!value.title || seen.has(key)) continue;

    seen.add(key);
    result.push(value);
    if (result.length >= limit) break;
  }

  return result;
}

function hasBlockedLanguage(row: any) {
  const text = normalize(`${titleFor(row)} ${row?.description || ""}`);
  return BLOCKED_TERMS.some((term) => text.includes(term));
}

function completedGoals(project: ProjectMemoryItem) {
  return project.relatedGoals.filter((goal) =>
    ["completed", "archived"].includes(clean(goal.status))
  );
}

function latestProjectActivity(project: ProjectMemoryItem) {
  const rows = [
    ...project.pendingActions,
    ...project.recentEvents,
    ...project.recentMemories,
    ...project.relatedGoals,
  ];

  return rows
    .map((row) => ({ title: titleFor(row), at: timestampFor(row) }))
    .filter((row) => row.title)
    .sort((left, right) => {
      const leftTime = new Date(left.at || 0).getTime();
      const rightTime = new Date(right.at || 0).getTime();
      return rightTime - leftTime;
    })[0]?.title || null;
}

function buildCurrentFocus(project: ProjectMemoryItem | null): ProjectAdvisorFocus | null {
  if (!project) return null;

  const goal = project.relatedGoals.find(
    (item) => !["completed", "archived"].includes(clean(item.status))
  );
  const nextAction = [...project.pendingActions].sort(
    (left, right) => Number(right.priority || 0) - Number(left.priority || 0)
  )[0];

  return {
    project: project.name,
    status: project.status,
    goal: titleFor(goal) || null,
    nextAction: titleFor(nextAction) || null,
    lastActivity: latestProjectActivity(project),
    reason: project.pendingActions.length
      ? "important_project_with_open_actions"
      : project.progressSignals.includes("recent_activity")
        ? "important_project_with_recent_activity"
        : "highest_confidence_project",
  };
}

export function buildProjectAdvisorSnapshot({
  projects,
  goals,
  consistency,
  relationshipMemory,
}: {
  projects: ProjectMemorySnapshot;
  goals: GoalsSnapshot;
  consistency: GoalProjectConsistencySnapshot;
  relationshipMemory: RelationshipMemorySnapshot;
}): ProjectAdvisorSnapshot {
  const blockedAreas: ProjectAdvisorArea[] = [];
  const stableAreas: ProjectAdvisorArea[] = [];
  const suggestedNextSteps: ProjectAdvisorArea[] = [];

  for (const project of projects.projects) {
    const projectIssues = consistency.consistencyIssues.filter(
      (item) => normalize(item.project) === normalize(project.name)
    );
    const overloaded = consistency.overloadedProjects.some(
      (item) => normalize(item.name) === normalize(project.name)
    );

    if (project.status === "stalled") {
      blockedAreas.push({
        project: project.name,
        title: project.name,
        source: "project",
        reason: "project_stalled",
      });
      suggestedNextSteps.push({
        project: project.name,
        title: project.name,
        source: "project",
        reason: "revive_project",
      });
    }

    if (overloaded) {
      blockedAreas.push({
        project: project.name,
        title: project.name,
        source: "project",
        reason: "project_overloaded",
      });
      suggestedNextSteps.push({
        project: project.name,
        title: project.name,
        source: "project",
        reason: "reduce_project_load",
      });
    }

    for (const item of projectIssues) {
      blockedAreas.push({
        project: project.name,
        title: item.label || project.name,
        source: "consistency",
        reason: item.type,
      });
    }

    for (const action of project.pendingActions.filter(hasBlockedLanguage)) {
      blockedAreas.push({
        project: project.name,
        title: titleFor(action),
        source: "action",
        reason: "blocked_action_intent",
      });
    }

    if (
      project.status === "active" &&
      project.progressSignals.includes("recent_activity") &&
      !overloaded &&
      !projectIssues.length
    ) {
      stableAreas.push({
        project: project.name,
        title: project.name,
        source: "project",
        reason: "active_with_recent_activity",
      });
    }

    for (const goal of completedGoals(project)) {
      stableAreas.push({
        project: project.name,
        title: titleFor(goal),
        source: "goal",
        reason: "completed_goal",
      });
    }

    for (const action of [...project.pendingActions]
      .sort((left, right) => Number(right.priority || 0) - Number(left.priority || 0))
      .slice(0, 3)) {
      suggestedNextSteps.push({
        project: project.name,
        title: titleFor(action),
        source: "action",
        reason: "pending_action",
      });
    }

    for (const event of project.recentEvents.filter((item) => {
      const time = new Date(item.start_at || item.remind_at || "").getTime();
      return !Number.isNaN(time) && time >= Date.now();
    })) {
      suggestedNextSteps.push({
        project: project.name,
        title: titleFor(event),
        source: "calendar",
        reason: "upcoming_project_event",
      });
    }
  }

  for (const action of consistency.orphanActions) {
    suggestedNextSteps.push({
      project: null,
      title: titleFor(action),
      source: "consistency",
      reason: "connect_orphan_action",
    });
  }

  for (const goal of consistency.orphanGoals) {
    suggestedNextSteps.push({
      project: null,
      title: titleFor(goal),
      source: "consistency",
      reason: "connect_orphan_goal",
    });
  }

  for (const loop of relationshipMemory.openLoops || []) {
    const linkedProject = projects.projects.find((project) =>
      normalize(titleFor(loop)).includes(normalize(project.name))
    );
    if (!linkedProject) continue;

    suggestedNextSteps.push({
      project: linkedProject.name,
      title: titleFor(loop),
      source: "relationship",
      reason: "relationship_open_loop",
    });
  }

  const confidenceSources = [projects.confidence, consistency.confidence].filter(
    (value) => Number(value) > 0
  );

  return {
    currentFocus: buildCurrentFocus(projects.importantProject),
    blockedAreas: uniqueAreas(blockedAreas),
    stableAreas: uniqueAreas(stableAreas),
    suggestedNextSteps: uniqueAreas(suggestedNextSteps),
    overloadedProjects: consistency.overloadedProjects,
    stalledProjects: consistency.stalledProjects,
    confidence: confidenceSources.length
      ? Math.round(
          confidenceSources.reduce((total, value) => total + Number(value), 0) /
            confidenceSources.length
        )
      : 0,
    lastUpdated: latestTimestamp([
      projects.lastUpdated,
      goals.lastUpdated,
      consistency.lastUpdated,
      relationshipMemory.lastUpdated,
    ]),
  };
}
