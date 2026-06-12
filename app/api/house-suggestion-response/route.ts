import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function buildRuleFromSuggestion(suggestion: any, response: "yes" | "no") {
  const accepted = response === "yes";

  if (suggestion.suggestion_type === "two_people_light_logic") {
    return {
      rule_key: "two_people_light_logic",
      title: "Gestione luci con due persone in casa",
      description:
        "Quando risultano due persone in casa, GhostMe deve tenere conto che più stanze possono essere occupate.",
      trigger_conditions: { people_home_count: 2 },
      suggested_action: {
        avoid_aggressive_auto_off: accepted,
        ask_before_auto_off: true,
      },
    };
  }

  if (suggestion.suggestion_type === "kitchen_evening_tv_hold") {
    return {
      rule_key: "kitchen_evening_tv_hold",
      title: "Cucina attiva con TV accesa di sera",
      description:
        "Quando la TV cucina è accesa di sera/notte, la cucina va considerata zona attiva.",
      trigger_conditions: {
        room: "cucina",
        tv_on: true,
        time_window: ["sera", "notte"],
      },
      suggested_action: {
        hold_room_active: accepted,
        ask_before_auto_off: true,
      },
    };
  }

  if (suggestion.suggestion_type === "low_light_active_room") {
    return {
      rule_key: "low_light_active_room",
      title: "Luce bassa in stanza attiva",
      description:
        "Quando una stanza è attiva ma buia, GhostMe può suggerire più luce.",
      trigger_conditions: { low_lux: true, room_active: true },
      suggested_action: { suggest_more_light: accepted },
    };
  }

  if (suggestion.suggestion_type === "hot_house_climate") {
    return {
      rule_key: "hot_house_climate",
      title: "Temperatura alta in casa",
      description:
        "Quando la temperatura interna è alta, GhostMe può proporre clima o monitoraggio.",
      trigger_conditions: { temperature_min: 27 },
      suggested_action: { suggest_climate: accepted },
    };
  }

  return null;
}

export async function POST(req: Request) {
  const body = await req.json();

  const proactiveMessageId = body.proactiveMessageId as string;
  const response = body.response as "yes" | "no";

  if (!proactiveMessageId || !["yes", "no"].includes(response)) {
    return NextResponse.json(
      { success: false, error: "Dati non validi" },
      { status: 400 }
    );
  }

  const { data: proactiveMessage } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("*")
    .eq("id", proactiveMessageId)
    .maybeSingle();

  if (!proactiveMessage) {
    return NextResponse.json(
      { success: false, error: "Messaggio non trovato" },
      { status: 404 }
    );
  }

  const { data: suggestion } = await supabaseAdmin
    .from("house_suggestions")
    .select("*")
    .eq("user_id", proactiveMessage.user_id)
    .eq("title", proactiveMessage.title)
    .eq("message", proactiveMessage.message)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!suggestion) {
    return NextResponse.json(
      { success: false, error: "Suggerimento casa non trovato" },
      { status: 404 }
    );
  }

  await supabaseAdmin
    .from("house_suggestions")
    .update({
      status: "answered",
      user_response: response,
      response_at: new Date().toISOString(),
    })
    .eq("id", suggestion.id);

  await supabaseAdmin
    .from("ghost_proactive_messages")
    .update({ status: "read" })
    .eq("id", proactiveMessageId);

  const rule = buildRuleFromSuggestion(suggestion, response);

  if (rule) {
    const accepted = response === "yes";

    const { data: existing } = await supabaseAdmin
      .from("house_learned_rules")
      .select("*")
      .eq("user_id", suggestion.user_id)
      .eq("rule_key", rule.rule_key)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("house_learned_rules")
        .update({
          title: rule.title,
          description: rule.description,
          trigger_conditions: rule.trigger_conditions,
          suggested_action: rule.suggested_action,
          confirmations_yes: (existing.confirmations_yes || 0) + (accepted ? 1 : 0),
          confirmations_no: (existing.confirmations_no || 0) + (!accepted ? 1 : 0),
          confidence: Math.min(10, Math.max(1, (existing.confidence || 1) + (accepted ? 1 : -1))),
          status: accepted ? "learning" : "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("house_learned_rules").insert({
        user_id: suggestion.user_id,
        rule_key: rule.rule_key,
        title: rule.title,
        description: rule.description,
        trigger_conditions: rule.trigger_conditions,
        suggested_action: rule.suggested_action,
        confirmations_yes: accepted ? 1 : 0,
        confirmations_no: accepted ? 0 : 1,
        confidence: accepted ? 2 : 1,
        status: accepted ? "learning" : "rejected",
      });
    }
  }

  return NextResponse.json({ success: true, response, ruleUpdated: !!rule });
}