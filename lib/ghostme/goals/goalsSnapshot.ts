import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
      .not("status", "in", "(completed,archived)")
      .order("importance", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(20),

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
      .in("status", ["detected", "pending"])
      .order("priority", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const activeGoals = (activeGoalsRes.data || [])
    .filter((goal: any) => !["completed", "archived"].includes(goal.status))
    .slice(0, 10);
  const pendingActions = actionsRes.data || [];

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
