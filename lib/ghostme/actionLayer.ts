import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
}: {
  userId: string;
  message: string;
  detectedTopics: { topic: string }[];
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

  const { data, error } = await supabaseAdmin
    .from("action_intents")
    .insert([
      {
        user_id: userId,
        intent_type: parsed.intent_type,
        title: parsed.title || "Azione rilevata",
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

  return data;
}