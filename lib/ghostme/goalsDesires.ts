import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getGoalsDesiresContext(userId: string) {
  if (!userId) return "";

  const { data } = await supabaseAdmin
    .from("goals_desires")
    .select("title, description, category, status, importance, emotional_tone, related_topics, updated_at")
    .eq("user_id", userId)
    .neq("status", "archived")
    .order("importance", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    data
      ?.map(
        (g) =>
          `${g.title} | ${g.category} | ${g.status} | importanza ${g.importance} | tono ${g.emotional_tone} | ${g.description || ""}`
      )
      .join("\n") || ""
  );
}

export async function detectAndSaveGoalsDesires({
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
Sei il motore Goals & Desires di GhostMe.

Devi capire se il messaggio contiene:
- un obiettivo
- un desiderio
- un'intenzione futura
- qualcosa che l'utente vuole costruire, cambiare, fare, evitare o migliorare

NON salvare frasi banali.
NON salvare semplici fatti.
NON inventare.

Rispondi SOLO con JSON valido:

{
  "has_goal": true,
  "title": "...",
  "description": "...",
  "category": "project | work | health | passion | family | home | travel | general",
  "importance": 1,
  "emotional_tone": "positive | negative | neutral | mixed"
}

Se non c'è nulla:
{
  "has_goal": false
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
    console.log("GOALS PARSE ERROR:", err);
    console.log("GOALS RAW:", raw);
    return null;
  }

  if (!parsed?.has_goal || !parsed?.title) return null;

  const relatedTopics = detectedTopics.map((t) => t.topic);

  const { data: existing } = await supabaseAdmin
    .from("goals_desires")
    .select("id, importance")
    .eq("user_id", userId)
    .ilike("title", `%${String(parsed.title).slice(0, 40)}%`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("goals_desires")
      .update({
        description: parsed.description || "",
        category: parsed.category || "general",
        status: "active",
        importance: Math.min(Math.max(existing.importance || 5, parsed.importance || 5) + 1, 10),
        emotional_tone: parsed.emotional_tone || "neutral",
        related_topics: relatedTopics,
        source_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select();

    console.log("GOAL UPDATE:", data);
    console.log("GOAL UPDATE ERROR:", error);
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("goals_desires")
    .insert([
      {
        user_id: userId,
        title: parsed.title,
        description: parsed.description || "",
        category: parsed.category || "general",
        status: "active",
        importance: Math.min(Math.max(parsed.importance || 5, 1), 10),
        emotional_tone: parsed.emotional_tone || "neutral",
        related_topics: relatedTopics,
        source_message: message,
      },
    ])
    .select();

  console.log("GOAL INSERT:", data);
  console.log("GOAL INSERT ERROR:", error);

  return data;
}