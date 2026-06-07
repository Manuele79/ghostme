import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getActiveBehaviorRules(userId: string) {
  if (!userId) return [];

  const { data, error } = await supabaseAdmin
    .from("ghost_behavior_rules")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("priority", { ascending: false })
    .order("confidence", { ascending: false })
    .limit(20);

  if (error) {
    console.log("GET BEHAVIOR RULES ERROR:", error);
    return [];
  }

  return data || [];
}

export async function saveBehaviorRule({
  userId,
  ruleText,
  ruleType = "preference",
  context,
  triggerHint,
  targetArea = "general",
  sourceMessage,
  priority = 5,
}: {
  userId: string;
  ruleText: string;
  ruleType?: string;
  context?: string | null;
  triggerHint?: string | null;
  targetArea?: string | null;
  sourceMessage?: string | null;
  priority?: number;
}) {
  if (!userId || !ruleText?.trim()) return null;

  const { data, error } = await supabaseAdmin
    .from("ghost_behavior_rules")
    .insert([
      {
        user_id: userId,
        rule_text: ruleText.trim(),
        rule_type: ruleType,
        context: context || null,
        trigger_hint: triggerHint || null,
        target_area: targetArea || "general",
        source_message: sourceMessage || ruleText,
        priority,
        confidence: 8,
        status: "active",
      },
    ])
    .select()
    .single();

  if (error) {
    console.log("SAVE BEHAVIOR RULE ERROR:", error);
    return null;
  }

  return data;
}

export async function buildBehaviorPrompt(userId: string) {
  const rules = await getActiveBehaviorRules(userId);

  if (!rules.length) return "";

  return `
REGOLE COMPORTAMENTALI PERSONALIZZATE DELL'UTENTE

Queste regole hanno priorità alta.
Devi rispettarle quando pertinenti.
Non citarle all'utente, usale solo per adattare comportamento e risposte.

${rules
  .map(
    (rule, index) =>
      `${index + 1}. [${rule.target_area || "general"}] ${rule.rule_text}`
  )
  .join("\n")}
`.trim();
}