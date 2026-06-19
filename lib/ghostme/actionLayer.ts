import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  clearGoalReviewForOpenAction,
  completeActionIntentById,
  findGoalIdForAction,
} from "@/lib/ghostme/goals/goalsActionsLifecycle";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getActionIntentContext(userId: string) {
  if (!userId) return "";

  const { data } = await supabaseAdmin
    .from("action_intents")
    .select("intent_type, title, description, status, priority, related_topics, updated_at")
    .eq("user_id", userId)
    .in("status", ["detected", "pending"])
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    data
      ?.map(
        (a) =>
          `${a.intent_type} | ${a.title || ""} | priorità ${a.priority} | ${a.description || ""}`
      )
      .join("\n") || ""
  );
}

export async function detectAndSaveActionIntent({
  userId,
  message,
  detectedTopics,
  preferredGoalId,
}: {
  userId: string;
  message: string;
  detectedTopics: { topic: string }[];
  preferredGoalId?: string | null;
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
Sei il motore Action Layer futuro di GhostMe.

Devi rilevare se l'utente esprime qualcosa che in futuro potrebbe diventare azione:

Tipi:
- reminder
- calendar
- email
- web_search
- home_assistant
- agenda
- note
- generic_action

NON eseguire nulla.
Solo salva intenzioni future.

Esempi:
"ricordamelo domani" -> reminder
"devo scrivere a Marco" -> email o generic_action
"controlla il meteo" -> web_search
"accendi la cucina" -> home_assistant
"mettilo in agenda" -> calendar

Rispondi SOLO con JSON valido:

{
  "has_action": true,
  "intent_type": "reminder | calendar | email | web_search | home_assistant | agenda | note | generic_action",
  "title": "...",
  "description": "...",
  "priority": 1
}

Se non c'è azione:
{
  "has_action": false
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
    console.log("ACTION INTENT PARSE ERROR:", err);
    console.log("ACTION INTENT RAW:", raw);
    return null;
  }

  if (!parsed?.has_action || !parsed?.intent_type) return null;

  const relatedTopics = detectedTopics.map((t) => t.topic);
  const title = parsed.title || "Azione rilevata";
  const goalId = await findGoalIdForAction({
    userId,
    preferredGoalId,
    action: {
      title,
      description: parsed.description || "",
      sourceMessage: message,
      relatedTopics,
    },
  });

  const { data: existing } = await supabaseAdmin
    .from("action_intents")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["detected", "pending"])
    .ilike("title", title)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    if (!existing.goal_id && goalId) {
      const { data } = await supabaseAdmin
        .from("action_intents")
        .update({ goal_id: goalId, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .eq("user_id", userId)
        .is("goal_id", null)
        .select();

      await clearGoalReviewForOpenAction(userId, goalId);

      return data || [existing];
    }

    return [existing];
  }

  const { data, error } = await supabaseAdmin
    .from("action_intents")
    .insert([
      {
        user_id: userId,
        goal_id: goalId,
        intent_type: parsed.intent_type,
        title,
        description: parsed.description || "",
        status: "detected",
        priority: Math.min(Math.max(parsed.priority || 5, 1), 10),
        related_topics: relatedTopics,
        source_message: message,
      },
    ])
    .select();

  console.log("ACTION INTENT INSERT:", data);
  console.log("ACTION INTENT INSERT ERROR:", error);

  if (!error && data?.length && goalId) {
    await clearGoalReviewForOpenAction(userId, goalId);
  }

  return data;
}

export async function cleanupOldActionIntents(userId: string) {
  if (!userId) return;

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 30);

  const { error } = await supabaseAdmin
    .from("action_intents")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .in("status", ["detected", "pending"])
    .lt("updated_at", limitDate.toISOString());

  if (error) {
    console.log("CLEANUP OLD ACTION INTENTS ERROR:", error);
  }
}

export async function detectAndCompleteActionIntent({
  userId,
  message,
}: {
  userId: string;
  message: string;
}) {
  if (!userId || !message?.trim()) return null;

  const { data: pendingActions } = await supabaseAdmin
    .from("action_intents")
    .select("id, goal_id, intent_type, title, description, source_message, priority, updated_at")
    .eq("user_id", userId)
    .in("status", ["detected", "pending"])
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(10);

  if (!pendingActions?.length) return null;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 350,
    messages: [
      {
        role: "system",
        content: `
Sei il motore interno di completamento azioni di GhostMe.

Devi capire se il messaggio dell'utente indica che una delle azioni aperte è stata completata.

Regole:
- Completa SOLO se è chiaro.
- Frasi come "fatto", "già fatto", "ho chiamato", "ho mandato", "ho sistemato" possono completare.
- Non completare se l'utente sta solo parlando dell'azione.
- Non inventare.
- Se non sei sicuro, has_completed false.

Rispondi SOLO con JSON valido:

{
  "has_completed": true,
  "action_id": "uuid della azione completata",
  "reason": "motivo breve"
}

Oppure:

{
  "has_completed": false
}
        `,
      },
      {
        role: "user",
        content: `
AZIONI APERTE:
${JSON.stringify(pendingActions, null, 2)}

MESSAGGIO UTENTE:
${message}
        `,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  let parsed: any = null;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.log("ACTION COMPLETE PARSE ERROR:", err);
    console.log("ACTION COMPLETE RAW:", raw);
    return null;
  }

  if (!parsed?.has_completed || !parsed?.action_id) return null;

  const validAction = pendingActions.find(
    (a) => a.id === parsed.action_id
  );

  if (!validAction) return null;

  const result = await completeActionIntentById({
    userId,
    actionId: validAction.id,
  });

  if (result.error || !result.action) {
    console.log("ACTION COMPLETE UPDATE ERROR:", result.error);
    return null;
  }

  return [result.action];
}
