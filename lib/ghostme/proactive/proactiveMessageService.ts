import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  normalizeProactiveText,
  proactiveMessageIdentity,
} from "@/lib/ghostme/proactive/proactiveMessageDedupe";
import {
  ALL_PROACTIVE_STATUSES,
  HIDDEN_PROACTIVE_STATUSES,
  VISIBLE_PROACTIVE_STATUSES,
} from "@/lib/ghostme/proactive/proactiveCardLifecycle";

const ONE_PER_DAY_CATEGORIES = new Set(["agenda", "daily_briefing"]);
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
  reactivateHiddenOnChange = false,
}: {
  userId: string;
  title: string;
  message: string;
  category: string;
  priority: number;
  logicalKey?: string | null;
  reactivateHiddenOnChange?: boolean;
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
      .select("id, logical_key, category, title, message, status")
      .eq("user_id", userId)
      .eq("logical_key", stableLogicalKey)
      .in("status", ALL_PROACTIVE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && isMissingLogicalKeyColumn(error)) {
      supportsLogicalKey = false;
    } else {
      existing = data || null;
    }
  }

  if (!existing && (!stableLogicalKey || !supportsLogicalKey)) {
    const { data: legacyRows } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id, category, title, message, status")
      .eq("user_id", userId)
      .eq("category", category)
      .in("status", ALL_PROACTIVE_STATUSES)
      .gte("created_at", shouldKeepOnePerDay ? todayIso : "1970-01-01T00:00:00.000Z")
      .order("created_at", { ascending: false })
      .limit(100);

    const targetIdentity = proactiveMessageIdentity({ category, title, message });
    existing =
      (legacyRows || []).find(
        (row) => proactiveMessageIdentity(row) === targetIdentity
      ) || null;
  }

  if (existing?.id) {
    const contentChanged =
      normalizeProactiveText(existing.title) !== normalizeProactiveText(title) ||
      normalizeProactiveText(existing.message) !== normalizeProactiveText(message);

    if (
      HIDDEN_PROACTIVE_STATUSES.includes(existing.status) &&
      (!reactivateHiddenOnChange || !contentChanged)
    ) {
      return;
    }

    if (!contentChanged) return;

    const updatePayload: any = {
      title,
      message,
      priority,
      scheduled_for: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "unread",
      read_at: null,
      answered_at: null,
    };

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

  const priorityLimit =
    category === "agenda"
      ? null
      : priority >= 9
      ? { minimum: 9, maximum: 10, limit: 1 }
      : priority >= 7
        ? { minimum: 7, maximum: 8, limit: 2 }
        : priority >= 4
          ? { minimum: 4, maximum: 6, limit: 3 }
          : null;
  if (priorityLimit) {
    const { count, error: priorityError } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", VISIBLE_PROACTIVE_STATUSES)
      .gte("priority", priorityLimit.minimum)
      .lte("priority", priorityLimit.maximum);
    if (priorityError) throw priorityError;
    if ((count || 0) >= priorityLimit.limit) return;
  }

  if (category === "curiosity") {
    const { count, error: countError } = await supabaseAdmin
      .from("ghost_proactive_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", "curiosity")
      .gte("created_at", todayIso);
    if (countError) throw countError;
    if ((count || 0) >= 4) return;
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
