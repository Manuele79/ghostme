import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const cleanRuleText = ruleText.trim();

    const { data: existingRule } = await supabaseAdmin
      .from("ghost_behavior_rules")
      .select("id, confidence, priority")
      .eq("user_id", userId)
      .eq("status", "active")
      .ilike("rule_text", `%${cleanRuleText.slice(0, 60)}%`)
      .limit(1)
      .maybeSingle();

    if (existingRule?.id) {
      const { data, error } = await supabaseAdmin
        .from("ghost_behavior_rules")
        .update({
          confidence: Math.min((existingRule.confidence || 8) + 1, 10),
          priority: Math.max(existingRule.priority || 5, priority),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRule.id)
        .select()
        .single();

      if (error) {
        console.log("UPDATE EXISTING BEHAVIOR RULE ERROR:", error);
        return null;
      }

      return data;
    }

  const { data, error } = await supabaseAdmin
    .from("ghost_behavior_rules")
    .insert([
      {
        user_id: userId,
        rule_text: cleanRuleText,
        rule_type: ruleType,
        context: context || null,
        trigger_hint: triggerHint || null,
        target_area: targetArea || "general",
        source_message: sourceMessage || cleanRuleText,
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

  if (rules.length) {
  await supabaseAdmin
    .from("ghost_behavior_rules")
    .update({
      last_applied_at: new Date().toISOString(),
    })
    .in(
      "id",
      rules.map((rule) => rule.id)
    );
}

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

export async function detectAndSaveBehaviorRule({
  userId,
  message,
}: {
  userId: string;
  message: string;
}) {
  if (!userId || !message?.trim()) return null;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 450,
    messages: [
      {
        role: "system",
        content: `
Sei il Behavior Learning Engine interno di GhostMe.

Devi capire se il messaggio contiene una preferenza stabile dell'utente su come GhostMe deve comportarsi in futuro.

Salva SOLO regole utili e durature.

Esempi da salvare:
- "preferisco risposte brevi"
- "dammi sempre codice completo"
- "non chiedermelo più"
- "quando parli di codice, dimmi sempre dove incollare"
- "non usare tono motivazionale"
- "da ora in poi fai così"
- "non propormi più questa cosa"

NON salvare:
- emozioni momentanee
- fatti personali normali
- appuntamenti
- semplici risposte tipo ok/fatto/grazie
- preferenze non legate al comportamento di GhostMe

Rispondi SOLO con JSON valido:

{
  "has_rule": true,
  "rule_text": "...",
  "rule_type": "preference | boundary | style | workflow",
  "target_area": "chat | code | calendar | daily | proactive | general",
  "trigger_hint": "...",
  "priority": 1
}

Se non c'è regola:
{
  "has_rule": false
}
        `,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  let parsed: any = null;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.log("BEHAVIOR RULE DETECTION PARSE ERROR:", err);
    console.log("BEHAVIOR RULE DETECTION RAW:", raw);
    return null;
  }

  if (!parsed?.has_rule || !parsed?.rule_text) return null;

  return saveBehaviorRule({
    userId,
    ruleText: parsed.rule_text,
    ruleType: parsed.rule_type || "preference",
    targetArea: parsed.target_area || "general",
    triggerHint: parsed.trigger_hint || null,
    sourceMessage: message,
    priority: Math.min(Math.max(parsed.priority || 5, 1), 10),
  });
}