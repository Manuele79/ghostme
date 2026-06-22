const OPEN_ACTION_STATUSES = new Set(["detected", "active", "open", "pending"]);
const CLOSED_STATUSES = new Set([
  "completed",
  "archived",
  "cancelled",
  "dismissed",
  "expired",
]);
const RECENT_PAST_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

const STOP_WORDS = new Set([
  "anche", "avere", "con", "cosa", "dalla", "delle", "dello", "domani",
  "dopo", "essere", "fare", "fatto", "oggi", "per", "prima", "sono",
  "stato", "stata", "un", "una", "uno", "verso",
]);

function clean(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function itemText(item: any) {
  return clean(
    [
      item?.title,
      item?.summary,
      item?.description,
      item?.content,
      item?.intent_type,
      item?.source_message,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function itemTimestamp(item: any) {
  const value =
    item?.completed_at ||
    item?.event_date ||
    item?.occurred_at ||
    item?.created_at ||
    item?.updated_at;
  const timestamp = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(timestamp) ? null : timestamp;
}

function meaningfulWords(item: any) {
  return new Set(
    itemText(item)
      .split(/\s+/)
      .filter((word) => word.length >= 3 && !STOP_WORDS.has(word))
  );
}

function isRecentPast(item: any, now: number) {
  const timestamp = itemTimestamp(item);
  return timestamp === null ||
    (timestamp <= now && now - timestamp <= RECENT_PAST_WINDOW_MS);
}

function explicitlyDescribesPast(item: any) {
  const text = ` ${itemText(item)} `;
  return [
    " gia ",
    " ieri ",
    " avvenuto ",
    " successo ",
    " completato ",
    " completata ",
    " fatto ",
    " fatta ",
    " andato ",
    " andata ",
    " stato ",
    " stata ",
  ].some((marker) => text.includes(marker));
}

function describesSameEvent(futureItem: any, pastItem: any) {
  const futureText = itemText(futureItem);
  const pastText = itemText(pastItem);
  if (!futureText || !pastText) return false;

  if (
    futureText.length >= 8 &&
    pastText.length >= 8 &&
    (futureText.includes(pastText) || pastText.includes(futureText))
  ) {
    return true;
  }

  const futureWords = meaningfulWords(futureItem);
  const pastWords = meaningfulWords(pastItem);
  if (!futureWords.size || !pastWords.size) return false;

  let shared = 0;
  for (const word of futureWords) if (pastWords.has(word)) shared += 1;

  const smallerSetSize = Math.min(futureWords.size, pastWords.size);
  return shared >= 2 && shared / smallerSetSize >= 0.5;
}

export function buildRecentPastEvidence({
  episodes = [],
  timeline = [],
  summaries = [],
  completedCalendar = [],
  completedActions = [],
  now = Date.now(),
}: {
  episodes?: any[];
  timeline?: any[];
  summaries?: any[];
  completedCalendar?: any[];
  completedActions?: any[];
  now?: number;
}) {
  return [
    ...episodes,
    ...timeline,
    ...summaries.filter(explicitlyDescribesPast),
    ...completedCalendar,
    ...completedActions,
  ].filter((item) => isRecentPast(item, now));
}

export function filterFutureCalendar(items: any[], pastEvidence: any[], now = Date.now()) {
  return (items || []).filter((item) => {
    const status = clean(item?.status);
    if (status && (status !== "active" || CLOSED_STATUSES.has(status))) return false;

    const dateValue = item?.start_at || item?.remind_at;
    const timestamp = dateValue ? new Date(dateValue).getTime() : Number.NaN;
    if (!Number.isNaN(timestamp) && timestamp < now) return false;

    return !pastEvidence.some((pastItem) => describesSameEvent(item, pastItem));
  });
}

export function filterOpenActions(items: any[], pastEvidence: any[]) {
  return (items || []).filter((item) => {
    const status = clean(item?.status);
    if (!OPEN_ACTION_STATUSES.has(status) || CLOSED_STATUSES.has(status)) return false;
    return !pastEvidence.some((pastItem) => describesSameEvent(item, pastItem));
  });
}
