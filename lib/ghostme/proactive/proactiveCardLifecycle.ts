export const VISIBLE_PROACTIVE_STATUSES = ["unread", "read"];
export const HIDDEN_PROACTIVE_STATUSES = [
  "dismissed",
  "answered",
  "expired",
  "archived",
];
export const ALL_PROACTIVE_STATUSES = [
  ...VISIBLE_PROACTIVE_STATUSES,
  ...HIDDEN_PROACTIVE_STATUSES,
];
export const USER_PROACTIVE_TRANSITIONS = [
  "read",
  "dismissed",
  "answered",
];
export const VISIBLE_PROACTIVE_CATEGORIES = [
  "agenda",
  "reminder",
  "daily_briefing",
  "observation",
  "curiosity",
  "home_question",
  "suggestion",
  "project",
  "social",
];
