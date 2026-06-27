import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type BehaviorRuleInput = {
  ruleText: string;
  ruleType?: string;
  targetArea?: string | null;
  triggerHint?: string | null;
  priority?: number;
};

type BehaviorRule = {
  id: string;
  rule_text: string;
  rule_type?: string | null;
  target_area?: string | null;
  priority?: number | null;
  confidence?: number | null;
};

const NO_AUTOMATIC_CLOSING_RULE =
  "Non chiudere le risposte con domande finali o call-to-action automatiche. Evita formule come: \"fammi sapere\", \"se hai bisogno\", \"se hai altre domande\", \"dimmi pure\", \"posso aiutarti\".";

function normalizeForMatching(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isNoAutomaticClosingRule(value?: string | null) {
  if (!value) return false;

  const text = normalizeForMatching(value);
  const hasNegation =
    /\b(non|evita|smetti|basta|senza|mai)\b/.test(text) ||
    text.includes("non serve");
  const mentionsEnding =
    /\b(chiud|finisc|fini|termin|conclud)\w*/.test(text) ||
    text.includes("fine risposta") ||
    text.includes("risposta finale");
  const mentionsQuestionOrCta =
    text.includes("altre domande") ||
    text.includes("altra domanda") ||
    text.includes("fammi sapere") ||
    text.includes("se hai bisogno") ||
    text.includes("se ti serve") ||
    text.includes("dimmi pure") ||
    text.includes("posso aiutarti") ||
    text.includes("chiedendomi") ||
    text.includes("chiedermi") ||
    /\bdomand\w*/.test(text);

  return hasNegation && (mentionsEnding || text.includes("chied")) && mentionsQuestionOrCta;
}

function normalizeBehaviorRuleInput(input: BehaviorRuleInput) {
  const normalized: Required<BehaviorRuleInput> = {
    ruleText: input.ruleText.trim(),
    ruleType: input.ruleType || "preference",
    targetArea: input.targetArea || "general",
    triggerHint: input.triggerHint || null,
    priority: Math.min(Math.max(input.priority || 5, 1), 10),
  };

  if (isNoAutomaticClosingRule(normalized.ruleText)) {
    return {
      ...normalized,
      ruleText: NO_AUTOMATIC_CLOSING_RULE,
      ruleType: "boundary",
      targetArea: "chat",
      triggerHint:
        normalized.triggerHint ||
        "Quando GhostMe genera una risposta chat, deve concludere naturalmente senza domanda o call-to-action finale automatica.",
      priority: 10,
    };
  }

  if (normalized.ruleType === "boundary" && normalized.targetArea === "chat") {
    normalized.priority = Math.max(normalized.priority, 9);
  }

  return normalized;
}

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

    const normalizedRule = normalizeBehaviorRuleInput({
      ruleText,
      ruleType,
      targetArea,
      triggerHint,
      priority,
    });
    const cleanRuleText = normalizedRule.ruleText;

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
          priority: Math.max(existingRule.priority || 5, normalizedRule.priority),
          rule_type: normalizedRule.ruleType,
          target_area: normalizedRule.targetArea,
          trigger_hint: normalizedRule.triggerHint,
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
        rule_type: normalizedRule.ruleType,
        context: context || null,
        trigger_hint: normalizedRule.triggerHint,
        target_area: normalizedRule.targetArea,
        source_message: sourceMessage || cleanRuleText,
        priority: normalizedRule.priority,
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
  const rules = (await getActiveBehaviorRules(userId)) as BehaviorRule[];

  if (!rules.length) return "";

  await supabaseAdmin
    .from("ghost_behavior_rules")
    .update({
      last_applied_at: new Date().toISOString(),
    })
    .in(
      "id",
      rules.map((rule) => rule.id)
    );

  const sortedRules = [...rules].sort((a, b) => {
    const aWeight =
      (a.rule_type === "boundary" ? 100 : 0) +
      (a.target_area === "chat" ? 20 : 0) +
      (a.priority || 0) +
      (a.confidence || 0) / 10;
    const bWeight =
      (b.rule_type === "boundary" ? 100 : 0) +
      (b.target_area === "chat" ? 20 : 0) +
      (b.priority || 0) +
      (b.confidence || 0) / 10;

    return bWeight - aWeight;
  });
  const hasNoAutomaticClosingRule = sortedRules.some((rule) =>
    isNoAutomaticClosingRule(rule.rule_text)
  );

  const formattedRules = sortedRules
    .map((rule, index) => {
      const label =
        rule.rule_type === "boundary" && rule.target_area === "chat"
          ? "VINCOLO CHAT PRIORITARIO"
          : rule.rule_type === "boundary"
            ? "VINCOLO PRIORITARIO"
            : "regola";

      return `${index + 1}. [${label}; tipo=${
        rule.rule_type || "preference"
      }; area=${rule.target_area || "general"}; priorita=${
        rule.priority ?? ""
      }] ${rule.rule_text}`;
    })
    .join("\n");
  const closingBoundary = hasNoAutomaticClosingRule
    ? `
VINCOLO SPECIFICO DI CHIUSURA:
- Concludi la risposta naturalmente, senza domanda finale automatica.
- Non chiudere con formule tipo "fammi sapere", "se hai bisogno", "se hai altre domande", "dimmi pure", "posso aiutarti".
- Se serve una domanda davvero necessaria per risolvere la richiesta, falla nel corpo della risposta, non come saluto/chiusura standard.
`
    : "";

  return `
REGOLE COMPORTAMENTALI DELL'UTENTE - PRIORITA ALTA

Queste regole sono istruzioni attive dell'utente.
Prevalgono sullo stile generico, sulla proattivita e sull'IDENTITA OPERATIVA quando c'e conflitto.
Le regole di tipo boundary, soprattutto area chat, sono vincoli forti: non vanno ammorbidite da frasi di cortesia.
Non citarle all'utente, usale solo per adattare comportamento e risposte.

${formattedRules}
${closingBoundary}
`.trim();

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

  const normalizedRule = normalizeBehaviorRuleInput({
    ruleText: parsed.rule_text,
    ruleType: parsed.rule_type || "preference",
    targetArea: parsed.target_area || "general",
    triggerHint: parsed.trigger_hint || null,
    priority: parsed.priority || 5,
  });

  return saveBehaviorRule({
    userId,
    ruleText: normalizedRule.ruleText,
    ruleType: normalizedRule.ruleType,
    targetArea: normalizedRule.targetArea,
    triggerHint: normalizedRule.triggerHint,
    sourceMessage: message,
    priority: normalizedRule.priority,
  });
}
