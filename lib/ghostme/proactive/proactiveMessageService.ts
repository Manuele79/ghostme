import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ONE_PER_DAY_CATEGORIES = new Set(["agenda", "daily_briefing", "reminder"]);
const ALL_LIFECYCLE_STATUSES = [
  "unread",
  "read",
  "dismissed",
  "answered",
  "expired",
];
const HANDLED_STATUSES = ["dismissed", "answered", "expired"];

function startOfTodayIso() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return startOfToday.toISOString();
}

export function buildDailyProactiveLogicalKey(category: string, date = new Date()) {
  const day = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return `${category}_${day}`;
}

function isMissingLogicalKeyColumn(error: any) {
  const message = String(error?.message || error?.details || "");
  return message.toLowerCase().includes("logical_key");
}

export async function upsertProactiveMessage({
  userId,
  title,
  message,
  category,
  priority,
  logicalKey,
}: {
  userId: string;
  title: string;
  message: string;
  category: string;
  priority: number;
  logicalKey?: string | null;
}) {
  if (!userId || !message?.trim()) return;

  const todayIso = startOfTodayIso();
  const shouldKeepOnePerDay = ONE_PER_DAY_CATEGORIES.has(category);
  const stableLogicalKey =
    logicalKey ||
    (shouldKeepOnePerDay ? buildDailyProactiveLogicalKey(category) : null);
  let supportsLogicalKey = true;
  let existing: any = null;

  if (stableLogicalKey) {
    const { data, error } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id, message, status")
      .eq("user_id", userId)
      .eq("category", category)
      .eq("logical_key", stableLogicalKey)
      .in("status", ALL_LIFECYCLE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && isMissingLogicalKeyColumn(error)) {
      supportsLogicalKey = false;
    } else {
      existing = data || null;
    }
  }

  if (!existing) {
    let legacyQuery = supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id, message, status")
      .eq("user_id", userId)
      .eq("category", category)
      .in("status", ALL_LIFECYCLE_STATUSES);

    if (shouldKeepOnePerDay) {
      legacyQuery = legacyQuery.gte("created_at", todayIso);
    } else {
      legacyQuery = legacyQuery.eq("title", title).eq("message", message);
    }

    const { data } = await legacyQuery
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    existing = data || null;
  }

  if (existing?.id) {
    const messageChanged = existing.message !== message;
    const keepHandledHidden =
      HANDLED_STATUSES.includes(existing.status) && !messageChanged;

    const updatePayload: any = {
      title,
      priority,
      scheduled_for: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (messageChanged) {
      updatePayload.message = message;
      updatePayload.status = "unread";
      updatePayload.read_at = null;
      updatePayload.answered_at = null;
    } else if (!keepHandledHidden && ["unread", "read"].includes(existing.status)) {
      updatePayload.status = "unread";
      updatePayload.read_at = null;
    }

    if (stableLogicalKey && supportsLogicalKey) {
      updatePayload.logical_key = stableLogicalKey;
    }

    const { error } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .update(updatePayload)
      .eq("id", existing.id);

    if (error && isMissingLogicalKeyColumn(error) && updatePayload.logical_key) {
      delete updatePayload.logical_key;
      await supabaseAdmin
        .from("ghost_proactive_messages")
        .update(updatePayload)
        .eq("id", existing.id);
    }

    return;
  }

  const insertPayload: any = {
    user_id: userId,
    title,
    message,
    category,
    status: "unread",
    priority,
    scheduled_for: new Date().toISOString(),
  };

  if (stableLogicalKey && supportsLogicalKey) {
    insertPayload.logical_key = stableLogicalKey;
  }

  const { error } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .insert(insertPayload);

  if (error && isMissingLogicalKeyColumn(error) && insertPayload.logical_key) {
    delete insertPayload.logical_key;
    await supabaseAdmin.from("ghost_proactive_messages").insert(insertPayload);
  }
}
