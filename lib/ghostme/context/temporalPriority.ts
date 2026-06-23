const OPEN_ACTION_STATUSES = new Set(["detected", "active", "open", "pending"]);
const CLOSED_STATUSES = new Set([
  "completed",
  "archived",
  "cancelled",
  "dismissed",
  "expired",
]);
const RECENT_PAST_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const RAW_CHAT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_CHAT_CONTEXT_MESSAGES = 16;

function clean(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isLikelyTestData(item: any) {
  const metadata = clean(`${item?.status || ""} ${item?.category || ""} ${item?.source || ""}`);
  const text = clean(`${item?.title || ""} ${item?.summary || ""} ${item?.content || ""}`);
  return (
    metadata.split(" ").includes("test") ||
    text.includes("dato di test") ||
    text.includes("dati di test") ||
    text.includes("test ghostme") ||
    text.includes("dummy data")
  );
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

function isRecentPast(item: any, now: number) {
  const timestamp = itemTimestamp(item);
  return timestamp !== null &&
    timestamp <= now && now - timestamp <= RECENT_PAST_WINDOW_MS;
}

export function temporalMemoryLabel(item: any, now = Date.now()) {
  if (isLikelyTestData(item)) return "STORICO/TEST — NON OPERATIVO";
  const status = clean(item?.status);
  if (status === "completed") return "COMPLETATO — STORICO, NON OPERATIVO";
  if (status === "cancelled") return "CANCELLATO — STORICO, NON OPERATIVO";
  if (["archived", "dismissed", "expired", "answered"].includes(status)) {
    return "ARCHIVIATO — STORICO, NON OPERATIVO";
  }

  const timestamp = itemTimestamp(item);
  if (
    timestamp !== null &&
    timestamp <= now &&
    now - timestamp <= RECENT_PAST_WINDOW_MS
  ) {
    return "RECENTE — FATTO PASSATO, NON IMPEGNO FUTURO";
  }
  return "STORICO — MEMORIA AUTOBIOGRAFICA, NON STATO ATTUALE";
}

export function annotateHistoricalRows(items: any[]) {
  return (items || []).map((item) => ({
    ...item,
    temporal_label: temporalMemoryLabel(item),
  }));
}

export function prepareChatHistory(messages: any[], now = Date.now()) {
  return (messages || [])
    .slice(-MAX_CHAT_CONTEXT_MESSAGES)
    .map((message) => {
      const timestamp = message?.created_at
        ? new Date(message.created_at).getTime()
        : null;
      if (
        timestamp !== null &&
        (!Number.isFinite(timestamp) || now - timestamp > RAW_CHAT_MAX_AGE_MS)
      ) {
        return null;
      }
      const role = message?.role === "assistant" ? "assistant" : "user";
      const content = String(message?.content || "").trim();
      return content ? { role, content } : null;
    })
    .filter(Boolean) as Array<{ role: "user" | "assistant"; content: string }>;
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
  void pastEvidence;
  return (items || []).filter((item) => {
    if (isLikelyTestData(item)) return false;
    const status = clean(item?.status);
    if (status && (status !== "active" || CLOSED_STATUSES.has(status))) return false;

    const timestamps = [item?.start_at, item?.remind_at]
      .filter(Boolean)
      .map((value) => new Date(value).getTime())
      .filter(Number.isFinite);
    if (!timestamps.some((timestamp) => timestamp >= now)) return false;

    return true;
  });
}

export function filterOpenActions(items: any[], pastEvidence: any[]) {
  void pastEvidence;
  return (items || []).filter((item) => {
    if (isLikelyTestData(item)) return false;
    const status = clean(item?.status);
    if (!OPEN_ACTION_STATUSES.has(status) || CLOSED_STATUSES.has(status)) return false;
    return true;
  });
}

export function filterActiveGoals(items: any[]) {
  return (items || []).filter((item) => {
    const status = clean(item?.status);
    return ["active", "learning"].includes(status) && !isLikelyTestData(item);
  });
}
