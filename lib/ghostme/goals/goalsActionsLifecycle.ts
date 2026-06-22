import { supabaseAdmin } from "@/lib/supabaseAdmin";

const OPEN_ACTION_STATUSES = ["detected", "active", "open", "pending"];
const LINKABLE_GOAL_STATUSES = ["active", "learning"];
const STOP_WORDS = new Set([
  "alla", "allo", "anche", "avere", "come", "con", "dalla", "delle",
  "dello", "fare", "il", "la", "le", "nel", "nella", "per", "piu",
  "questo", "questa", "sono", "sul", "una", "uno", "voglio",
]);

type GoalCandidate = {
  id: string;
  title?: string | null;
  description?: string | null;
  source_message?: string | null;
  related_topics?: unknown;
};

type ActionLinkInput = {
  title?: string | null;
  description?: string | null;
  sourceMessage?: string | null;
  relatedTopics?: unknown;
};

function normalize(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function words(value: unknown) {
  return new Set(
    normalize(value)
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !STOP_WORDS.has(word))
  );
}

function topics(value: unknown) {
  if (!Array.isArray(value)) return new Set<string>();
  return new Set(value.map(normalize).filter(Boolean));
}

function intersectionSize(left: Set<string>, right: Set<string>) {
  let count = 0;
  for (const value of left) if (right.has(value)) count++;
  return count;
}

function associationScore(goal: GoalCandidate, action: ActionLinkInput) {
  const actionText = normalize(
    `${action.title || ""} ${action.description || ""} ${action.sourceMessage || ""}`
  );
  const goalTitle = normalize(goal.title);
  const sameSource =
    normalize(goal.source_message) &&
    normalize(goal.source_message) === normalize(action.sourceMessage);
  const sharedTopics = intersectionSize(
    topics(goal.related_topics),
    topics(action.relatedTopics)
  );
  const sharedWords = intersectionSize(
    words(`${goal.title || ""} ${goal.description || ""}`),
    words(actionText)
  );

  let score = 0;
  if (sameSource) score += 10;
  if (goalTitle.length >= 6 && actionText.includes(goalTitle)) score += 7;
  score += Math.min(sharedTopics, 3) * 3;
  score += Math.min(sharedWords, 3) * 2;
  return score;
}

function hasStrongAssociation(goal: GoalCandidate, action: ActionLinkInput) {
  const actionText = normalize(
    `${action.title || ""} ${action.description || ""} ${action.sourceMessage || ""}`
  );
  const goalTitle = normalize(goal.title);
  const sameSource =
    Boolean(normalize(goal.source_message)) &&
    normalize(goal.source_message) === normalize(action.sourceMessage);
  const sharedTopics = intersectionSize(
    topics(goal.related_topics),
    topics(action.relatedTopics)
  );
  const sharedWords = intersectionSize(
    words(`${goal.title || ""} ${goal.description || ""}`),
    words(actionText)
  );

  return (
    sameSource ||
    (goalTitle.length >= 6 && actionText.includes(goalTitle)) ||
    (sharedTopics >= 2 && sharedWords >= 1) ||
    (sharedTopics >= 1 && sharedWords >= 2)
  );
}

async function loadLinkableGoal(
  userId: string,
  preferredGoalId?: string | null
) {
  if (!preferredGoalId) return null;

  const { data } = await supabaseAdmin
    .from("goals_desires")
    .select("id")
    .eq("id", preferredGoalId)
    .eq("user_id", userId)
    .in("status", LINKABLE_GOAL_STATUSES)
    .maybeSingle();

  return data?.id || null;
}

export async function findGoalIdForAction({
  userId,
  preferredGoalId,
  action,
}: {
  userId: string;
  preferredGoalId?: string | null;
  action: ActionLinkInput;
}) {
  const preferred = await loadLinkableGoal(userId, preferredGoalId);
  if (preferred) return preferred;

  const { data: goals } = await supabaseAdmin
    .from("goals_desires")
    .select("id, title, description, source_message, related_topics")
    .eq("user_id", userId)
    .in("status", LINKABLE_GOAL_STATUSES)
    .order("importance", { ascending: false })
    .limit(20);

  const ranked = (goals || [])
    .filter((goal) => hasStrongAssociation(goal, action))
    .map((goal) => ({ id: goal.id, score: associationScore(goal, action) }))
    .filter((candidate) => candidate.score >= 7)
    .sort((left, right) => right.score - left.score);

  if (!ranked.length) return null;
  if (ranked[1] && ranked[0].score - ranked[1].score < 2) return null;
  return ranked[0].id;
}

export async function clearGoalReviewForOpenAction(
  userId: string,
  goalId?: string | null
) {
  if (!userId || !goalId) return;

  await supabaseAdmin
    .from("goals_desires")
    .update({
      needs_review: false,
      review_requested_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("user_id", userId)
    .in("status", LINKABLE_GOAL_STATUSES);
}

export async function linkOpenOrphanActionsToGoal({
  userId,
  goal,
}: {
  userId: string;
  goal: GoalCandidate;
}) {
  const { data: actions } = await supabaseAdmin
    .from("action_intents")
    .select("id, title, description, source_message, related_topics")
    .eq("user_id", userId)
    .is("goal_id", null)
    .in("status", OPEN_ACTION_STATUSES)
    .limit(30);

  const linkedIds = (actions || [])
    .filter(
      (action) =>
        hasStrongAssociation(goal, {
          title: action.title,
          description: action.description,
          sourceMessage: action.source_message,
          relatedTopics: action.related_topics,
        }) &&
        associationScore(goal, {
          title: action.title,
          description: action.description,
          sourceMessage: action.source_message,
          relatedTopics: action.related_topics,
        }) >= 9
    )
    .map((action) => action.id);

  if (!linkedIds.length) return 0;

  const { error } = await supabaseAdmin
    .from("action_intents")
    .update({ goal_id: goal.id, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .in("id", linkedIds)
    .is("goal_id", null);

  if (error) {
    console.log("GOAL ACTION BACKLINK ERROR:", error);
    return 0;
  }

  await clearGoalReviewForOpenAction(userId, goal.id);

  return linkedIds.length;
}

async function requestGoalReviewIfReady(userId: string, goalId: string) {
  const { count, error } = await supabaseAdmin
    .from("action_intents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("goal_id", goalId)
    .in("status", OPEN_ACTION_STATUSES);

  if (error || (count || 0) > 0) return false;

  const now = new Date().toISOString();
  const { error: goalError } = await supabaseAdmin
    .from("goals_desires")
    .update({
      needs_review: true,
      review_requested_at: now,
      updated_at: now,
    })
    .eq("id", goalId)
    .eq("user_id", userId)
    .in("status", LINKABLE_GOAL_STATUSES);

  return !goalError;
}

export async function completeActionIntentById({
  userId,
  actionId,
}: {
  userId: string;
  actionId: string;
}) {
  const { data: action, error: lookupError } = await supabaseAdmin
    .from("action_intents")
    .select("id, status, goal_id, completed_at, updated_at")
    .eq("id", actionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError || !action) {
    return { action: null, error: lookupError, notFound: !action };
  }

  if (action.status === "completed") {
    return { action, error: null, alreadyCompleted: true, reviewRequested: false };
  }

  if (!OPEN_ACTION_STATUSES.includes(action.status)) {
    return { action, error: null, invalidTransition: true };
  }

  const now = new Date().toISOString();
  const { data: completed, error } = await supabaseAdmin
    .from("action_intents")
    .update({ status: "completed", completed_at: now, updated_at: now })
    .eq("id", actionId)
    .eq("user_id", userId)
    .in("status", OPEN_ACTION_STATUSES)
    .select("id, status, goal_id, completed_at, updated_at")
    .maybeSingle();

  if (error || !completed) {
    return { action: null, error, notFound: !completed };
  }

  const reviewRequested = completed.goal_id
    ? await requestGoalReviewIfReady(userId, completed.goal_id)
    : false;

  return {
    action: completed,
    error: null,
    alreadyCompleted: false,
    reviewRequested,
  };
}
