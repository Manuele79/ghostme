import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getTodayRange() {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function generateDailyConversationSummary(userId: string) {
  if (!userId) return;

  const { start, end } = getTodayRange();

  const { data: messages, error } = await supabaseAdmin
    .from("chat_messages")
    .select(`
      role,
      content,
      created_at
    `)
    .eq("user_id", userId)
    .gte("created_at", start)
    .lte("created_at", end)
    .order("message_order", { ascending: false })
    .limit(30);

        console.log("DAILY SUMMARY QUERY ERROR:", error);
console.log("DAILY SUMMARY MESSAGES:", messages?.length, messages);

  if (error || !messages || messages.length < 12) {
    console.log("DAILY SUMMARY: non abbastanza messaggi oggi", messages?.length || 0);
    return;
  }

const orderedMessages = [...messages].reverse();

  const conversationText = orderedMessages
    .map(
      (m) =>
        `${m.role === "user" ? "Utente" : "GhostMe"}: ${m.content}`
    )
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Sei un sistema di memoria interna di GhostMe.

Devi creare un riassunto giornaliero compatto della conversazione.

Questo NON è una risposta all'utente.
È archivio interno.

Devi estrarre:
- cosa ha occupato mentalmente l'utente oggi
- topic principali
- tono emotivo generale
- eventuali intenzioni future
- collegamenti personali emersi

Regole:
- massimo 140 parole
- niente frasi poetiche
- niente coaching
- niente psicologia pesante
- tono neutro e concreto
- non inventare nulla

Rispondi SOLO con JSON valido:

{
  "title": "...",
  "summary": "...",
  "topics": ["topic1", "topic2"],
  "emotional_tone": "positive | negative | neutral | mixed"
}
        `,
      },
      {
        role: "user",
        content: conversationText,
      },
    ],
    temperature: 0.2,
    max_tokens: 350,
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  console.log("DAILY SUMMARY RAW:", raw);

  let parsed: any = null;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.log("DAILY SUMMARY PARSE ERROR:", err);
    return;
  }

  if (!parsed?.summary) {
    console.log("DAILY SUMMARY INVALID");
    return;
  }

  const { data: existingSummary } = await supabaseAdmin
    .from("conversation_summaries")
    .select("id")
    .eq("user_id", userId)
    .gte("period_start", start)
    .lte("period_start", end)
    .limit(1)
    .maybeSingle();

  if (existingSummary) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("conversation_summaries")
      .update({
        title: parsed.title || "Riassunto giornata",
        summary: parsed.summary,
        topics: parsed.topics || [],
        emotional_tone: parsed.emotional_tone || "neutral",
        period_start: start,
        period_end: end,
        messages_count: messages.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSummary.id)
      .select();

    console.log("DAILY SUMMARY UPDATE:", updated);
    console.log("DAILY SUMMARY UPDATE ERROR:", updateError);

    return updated;
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("conversation_summaries")
    .insert([
      {
        user_id: userId,
        title: parsed.title || "Riassunto giornata",
        summary: parsed.summary,
        topics: parsed.topics || [],
        emotional_tone: parsed.emotional_tone || "neutral",
        period_start: start,
        period_end: end,
        messages_count: messages.length,
      },
    ])
    .select();

  console.log("DAILY SUMMARY INSERT:", inserted);
  console.log("DAILY SUMMARY INSERT ERROR:", insertError);

  return inserted;
}