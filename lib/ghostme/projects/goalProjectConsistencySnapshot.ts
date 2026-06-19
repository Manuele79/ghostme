import type { GoalsSnapshot } from "@/lib/ghostme/goals/goalsSnapshot";
import type {
  ProjectMemoryItem,
  ProjectMemorySnapshot,
} from "@/lib/ghostme/projects/projectMemorySnapshot";

export type GoalProjectConsistencyIssue = {
  type:
    | "goal_without_project"
    | "project_without_goal"
    | "action_without_project"
    | "completed_goal_with_open_tasks"
    | "active_project_without_recent_activity"
    | "too_many_open_tasks"
    | "important_goal_without_actions"
    | "pending_action_for_completed_project";
  goalId: string | null;
  actionId: string | null;
  project: string | null;
  label: string;
};

export type GoalProjectConsistencySnapshot = {
  consistencyIssues: GoalProjectConsistencyIssue[];
  orphanActions: any[];
  orphanGoals: any[];
  stalledProjects: ProjectMemoryItem[];
  overloadedProjects: ProjectMemoryItem[];
  confidence: number;
  lastUpdated: string | null;
};

const PROJECT_TASK_OVERLOAD_THRESHOLD = 6;

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

function rowId(row: any) {
  return row?.id ? String(row.id) : null;
}

function rowLabel(row: any) {
  return String(row?.title || row?.name || row?.description || "").trim();
}

function sameRow(left: any, right: any) {
  const leftId = rowId(left);
  const rightId = rowId(right);

  if (leftId && rightId) return leftId === rightId;
  return Boolean(rowLabel(left) && clean(rowLabel(left)) === clean(rowLabel(right)));
}

function isLinked(row: any, projectRows: any[]) {
  return projectRows.some((projectRow) => sameRow(row, projectRow));
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

function issue(
  type: GoalProjectConsistencyIssue["type"],
  {
    goal,
    action,
    project,
    label,
  }: {
    goal?: any;
    action?: any;
    project?: ProjectMemoryItem;
    label?: string;
  }
): GoalProjectConsistencyIssue {
  return {
    type,
    goalId: rowId(goal),
    actionId: rowId(action),
    project: project?.name || null,
    label: label || rowLabel(goal) || rowLabel(action) || project?.name || type,
  };
}

function hasCompletedGoals(project: ProjectMemoryItem) {
  return (
    project.relatedGoals.length > 0 &&
    project.relatedGoals.every((goal) =>
      ["completed", "archived"].includes(clean(goal.status))
    )
  );
}

export function buildGoalProjectConsistencySnapshot({
  goals,
  projects,
}: {
  goals: GoalsSnapshot;
  projects: ProjectMemorySnapshot;
}): GoalProjectConsistencySnapshot {
  const projectGoals = projects.projects.flatMap((project) => project.relatedGoals || []);
  const projectActions = projects.projects.flatMap(
    (project) => project.pendingActions || []
  );
  const orphanGoals = (goals.activeGoals || []).filter(
    (goal) => !isLinked(goal, projectGoals)
  );
  const orphanActions = (goals.pendingActions || []).filter(
    (action) => !isLinked(action, projectActions)
  );
  const overloadedProjects = projects.projects.filter(
    (project) => project.pendingActions.length >= PROJECT_TASK_OVERLOAD_THRESHOLD
  );
  const consistencyIssues: GoalProjectConsistencyIssue[] = [];

  for (const goal of orphanGoals) {
    consistencyIssues.push(issue("goal_without_project", { goal }));
  }

  for (const action of orphanActions) {
    consistencyIssues.push(issue("action_without_project", { action }));
  }

  for (const project of projects.projects) {
    if (!project.relatedGoals.length) {
      consistencyIssues.push(issue("project_without_goal", { project }));
    }

    if (
      project.status === "active" &&
      !project.progressSignals.includes("recent_activity")
    ) {
      consistencyIssues.push(
        issue("active_project_without_recent_activity", { project })
      );
    }

    if (project.pendingActions.length >= PROJECT_TASK_OVERLOAD_THRESHOLD) {
      consistencyIssues.push(issue("too_many_open_tasks", { project }));
    }

    const completedGoals = project.relatedGoals.filter((goal) =>
      ["completed", "archived"].includes(clean(goal.status))
    );

    if (completedGoals.length && project.pendingActions.length) {
      for (const goal of completedGoals) {
        consistencyIssues.push(
          issue("completed_goal_with_open_tasks", { goal, project })
        );
      }
    }

    if (hasCompletedGoals(project) && project.pendingActions.length) {
      for (const action of project.pendingActions) {
        consistencyIssues.push(
          issue("pending_action_for_completed_project", { action, project })
        );
      }
    }
  }

  const importantGoal = goals.importantGoal;
  if (importantGoal) {
    const relatedProjects = projects.projects.filter((project) =>
      isLinked(importantGoal, project.relatedGoals)
    );
    const hasActions = relatedProjects.some((project) => project.pendingActions.length);

    if (!hasActions) {
      consistencyIssues.push(
        issue("important_goal_without_actions", { goal: importantGoal })
      );
    }
  }

  const totalLinkable =
    goals.activeGoals.length + goals.pendingActions.length + projects.projects.length;
  const linked =
    goals.activeGoals.length - orphanGoals.length +
    (goals.pendingActions.length - orphanActions.length) +
    projects.projects.filter((project) => project.relatedGoals.length).length;

  return {
    consistencyIssues,
    orphanActions,
    orphanGoals,
    stalledProjects: projects.stalledProjects,
    overloadedProjects,
    confidence: totalLinkable ? Math.round((linked / totalLinkable) * 100) : 0,
    lastUpdated: latestTimestamp([
      goals.lastUpdated,
      projects.lastUpdated,
      ...goals.activeGoals.map((goal) => goal.updated_at),
      ...goals.completedGoals.map((goal) => goal.updated_at || goal.completed_at),
      ...goals.pendingActions.map((action) => action.updated_at),
    ]),
  };
}
