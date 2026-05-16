import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getTimelineContext(userId: string) {
  if (!userId) return "";

  const { data } = await supabaseAdmin
    .from("autobiographical_timeline")
    .select("period_label, event_type, title, summary, emotional_tone, importance, related_topics, event_date")
    .eq("user_id", userId)
    .order("event_date", { ascending: false })
    .limit(10);

  return (
    data
      ?.map(
        (e) =>
          `${e.period_label || "periodo recente"} | ${e.event_type} | ${e.title || "evento"} | tono ${e.emotional_tone} | ${e.summary}`
      )
      .join("\n") || ""
  );
}

export async function detectAndSaveTimelineEvent({
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
Sei il motore timeline autobiografica di GhostMe.

Devi capire se il messaggio contiene un evento personale utile da ricordare nel tempo.

Salva eventi tipo:
- esperienze vissute
- cambiamenti
- viaggi
- periodi particolari
- scelte importanti
- cose che l'utente dice "ultimamente", "prima", "ora", "da mesi", "in futuro"

NON salvare chiacchiere banali.

Rispondi SOLO con JSON valido:

{
  "has_event": true,
  "period_label": "oggi | ultimamente | passato | futuro | periodo non specificato",
  "event_type": "personal | work | project | travel | health | passion | relationship | general",
  "title": "...",
  "summary": "...",
  "emotional_tone": "positive | negative | neutral | mixed",
  "importance": 1
}

Se non c'è evento:
{
  "has_event": false
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
    console.log("TIMELINE PARSE ERROR:", err);
    console.log("TIMELINE RAW:", raw);
    return null;
  }

  if (!parsed?.has_event || !parsed?.summary) return null;

  const relatedTopics = detectedTopics.map((t) => t.topic);

  const { data, error } = await supabaseAdmin
    .from("autobiographical_timeline")
    .insert([
      {
        user_id: userId,
        period_label: parsed.period_label || "periodo non specificato",
        event_type: parsed.event_type || "general",
        title: parsed.title || "Evento personale",
        summary: parsed.summary,
        emotional_tone: parsed.emotional_tone || "neutral",
        importance: Math.min(Math.max(parsed.importance || 5, 1), 10),
        related_topics: relatedTopics,
        source_message: message,
        event_date: new Date().toISOString(),
      },
    ])
    .select();

  console.log("TIMELINE INSERT:", data);
  console.log("TIMELINE INSERT ERROR:", error);

  return data;
}