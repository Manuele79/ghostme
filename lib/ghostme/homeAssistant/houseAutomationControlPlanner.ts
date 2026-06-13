import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function recentControlExists(
  userId: string,
  automationKey: string,
  controlType: string
) {
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data } = await supabaseAdmin
    .from("house_automation_controls")
    .select("id")
    .eq("user_id", userId)
    .eq("automation_key", automationKey)
    .eq("control_type", controlType)
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();

  return !!data?.id;
}

async function createControlPlan({
  userId,
  automationKey,
  automationName,
  roomKey,
  controlType,
  reason,
  confidence = 5,
}: {
  userId: string;
  automationKey: string;
  automationName: string;
  roomKey?: string | null;
  controlType: string;
  reason: string;
  confidence?: number;
}) {
  if (await recentControlExists(userId, automationKey, controlType)) return null;

  const payload = {
    user_id: userId,
    automation_key: automationKey,
    automation_name: automationName,
    room_key: roomKey || null,
    control_type: controlType,
    status: "pending_confirmation",
    last_action: "planned",
    last_reason: `${reason} | confidenza ${confidence}/10`,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("house_automation_controls")
    .upsert(payload, {
      onConflict: "user_id,automation_key",
    })
    .select()
    .single();

  if (error) {
    console.log("HOUSE AUTOMATION CONTROL PLAN ERROR:", error);
    return null;
  }

  await supabaseAdmin.from("ghost_proactive_messages").insert({
    user_id: userId,
    title: "Controllo automazione suggerito",
    message: `${reason}\n\nVuoi che GhostMe prepari questa azione come regola confermata?`,
    category: "home_question",
    status: "unread",
    priority: 5,
    scheduled_for: new Date().toISOString(),
  });

  return data;
}

export async function planHouseAutomationControls(userId: string) {
  if (!userId) return [];

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: rules } = await supabaseAdmin
    .from("house_learned_rules")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["learning", "active"]);

  const { data: events } = await supabaseAdmin
    .from("house_events")
    .select("entity_id, entity_name, entity_type, room_key, event_type, new_state, occurred_at")
    .eq("user_id", userId)
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: false })
    .limit(300);

  if (!events?.length) return [];

  const created: any[] = [];

  const hasTwoPeopleRule = (rules || []).some(
    (r) =>
      r.rule_key === "two_people_light_logic" &&
      ["learning", "active"].includes(r.status)
  );

  const twoPeopleRecently = events.some(
    (e: any) =>
      e.entity_id === "person.manuele" ||
      e.entity_id === "person.valentina"
  );

  const offEvents = events.filter(
    (e) =>
      ["light_off", "switch_off"].includes(e.event_type) &&
      ["salotto", "cucina", "camera", "scale"].includes(e.room_key || "")
  );

  if (hasTwoPeopleRule && twoPeopleRecently && offEvents.length >= 2) {
    const control = await createControlPlan({
      userId,
      automationKey: "auto_off_review_two_people",
      automationName: "Revisione spegnimenti automatici con due persone",
      roomKey: null,
      controlType: "suggest_hold_auto_off",
      reason:
        "Hai confermato che quando siete in due GhostMe deve evitare spegnimenti aggressivi. Ho visto spegnimenti recenti in stanze principali: posso preparare una regola di controllo per chiedere conferma prima di spegnere.",
      confidence: 7,
    });

    if (control) created.push(control);
  }

  const kitchenTvOn = events.some(
    (e) => e.room_key === "cucina" && e.event_type === "tv_on"
  );

  const kitchenOff = events.some(
    (e) =>
      e.room_key === "cucina" &&
      ["light_off", "switch_off"].includes(e.event_type)
  );

  if (kitchenTvOn && kitchenOff) {
    const control = await createControlPlan({
      userId,
      automationKey: "kitchen_tv_hold_before_off",
      automationName: "Protezione cucina con TV accesa",
      roomKey: "cucina",
      controlType: "suggest_hold_kitchen_auto_off",
      reason:
        "Ho visto la TV cucina accesa e spegnimenti recenti in cucina. Posso preparare una regola per chiedere conferma prima di spegnere la cucina quando la TV è accesa.",
      confidence: 7,
    });

    if (control) created.push(control);
  }

  return created;
}