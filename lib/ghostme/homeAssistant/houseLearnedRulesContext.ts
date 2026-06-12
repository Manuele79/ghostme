import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function buildHouseLearnedRulesContext(userId: string) {
  if (!userId) return "";

  const { data: rules, error } = await supabaseAdmin
    .from("house_learned_rules")
    .select(
      "rule_key, title, description, trigger_conditions, suggested_action, confirmations_yes, confirmations_no, confidence, status, updated_at"
    )
    .eq("user_id", userId)
    .in("status", ["learning", "active"])
    .order("confidence", { ascending: false })
    .limit(12);

  if (error) {
    console.log("HOUSE LEARNED RULES CONTEXT ERROR:", error);
    return "";
  }

  if (!rules?.length) return "";

  return `
REGOLE CASA APPRESE:
${rules
  .map(
    (r) => `
- ${r.title}
  Stato: ${r.status}
  Confidenza: ${r.confidence}/10
  Sì: ${r.confirmations_yes || 0}, No: ${r.confirmations_no || 0}
  Descrizione: ${r.description || ""}
  Condizioni: ${JSON.stringify(r.trigger_conditions || {})}
  Azione suggerita: ${JSON.stringify(r.suggested_action || {})}
`.trim()
  )
  .join("\n")}
`.trim();
}