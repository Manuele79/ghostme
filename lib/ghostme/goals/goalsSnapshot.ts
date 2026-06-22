import { supabaseAdmin } from "@/lib/supabaseAdmin";

const OPEN_ACTION_STATUSES = ["detected", "active", "open", "pending"];

export type GoalsSnapshot = {
  activeGoals: any[];
  completedGoals: any[];
  importantGoal: any | null;
  pendingActions: any[];
  lastUpdated: string | null;
};

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

export async function buildGoalsSnapshot(
  userId: string
): Promise<GoalsSnapshot> {
  if (!userId) {
    return {
      activeGoals: [],
      completedGoals: [],
      importantGoal: null,
      pendingActions: [],
      lastUpdated: null,
    };
  }

  const [activeGoalsRes, completedGoalsRes, actionsRes] = await Promise.all([
    supabaseAdmin
      .from("goals_desires")
      .select("*")
      .eq("user_id", userId)
      .order("importance", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(100),

    supabaseAdmin
      .from("goals_desires")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("action_intents")
      .select("*")
      .eq("user_id", userId)
      .in("status", OPEN_ACTION_STATUSES)
      .order("priority", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  if (activeGoalsRes.error) {
    console.log("GOALS SNAPSHOT ERROR:", activeGoalsRes.error);
  }

  if (actionsRes.error) {
    console.log("GOALS ACTIONS SNAPSHOT ERROR:", actionsRes.error);
  }

  const excludedGoalStatuses = new Set(["completed", "archived", "cancelled"]);
  const activeGoals = (activeGoalsRes.data || [])
    .filter(
      (goal: any) =>
        !excludedGoalStatuses.has(String(goal.status || "").toLowerCase())
    )
    .slice(0, 20);
  const pendingActions = (actionsRes.data || []).filter((action: any) =>
    OPEN_ACTION_STATUSES.includes(String(action.status || "").toLowerCase())
  );

  return {
    activeGoals,
    completedGoals: completedGoalsRes.data || [],
    importantGoal:
      activeGoals.find((goal: any) => Number(goal.importance || 0) >= 7) ||
      activeGoals[0] ||
      null,
    pendingActions,
    lastUpdated: latestTimestamp([
      ...activeGoals.map((goal: any) => goal.updated_at),
      ...(completedGoalsRes.data || []).map((goal: any) => goal.updated_at),
      ...(completedGoalsRes.data || []).map((goal: any) => goal.completed_at),
      ...pendingActions.map((action: any) => action.updated_at),
    ]),
  };
}
