import { OpenAI } from "openai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateConversationSummary(
  userId: string
) {
  if (!userId) return;

  // =====================================================
  // PRENDE ULTIMI MESSAGGI
  // =====================================================

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select(`
      role,
      content,
      created_at
    `)
    .eq("user_id", userId)
    .order("message_order", { ascending: false })
    .limit(30);

  if (error || !messages || messages.length < 10) {
    console.log(
      "SUMMARY: non abbastanza messaggi"
    );
    return;
  }

  const orderedMessages = [...messages].reverse();

  const conversationText = orderedMessages
    .map(
      (m) =>
        `${m.role === "user" ? "Utente" : "GhostMe"}: ${
          m.content
        }`
    )
    .join("\n");

  // =====================================================
  // AI SUMMARY
  // =====================================================

  const completion =
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Sei un sistema di memoria interna.

Devi creare un riassunto breve ma utile della conversazione.

IMPORTANTE:
- niente frasi poetiche
- niente linguaggio da AI assistant
- niente analisi psicologica pesante
- massimo 120 parole
- tono realistico e neutro

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
      temperature: 0.3,
      max_tokens: 300,
    });

  const raw =
    completion.choices[0]?.message?.content || "{}";

  console.log("SUMMARY RAW:", raw);

  let parsed: any = null;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.log("SUMMARY PARSE ERROR:", err);
    return;
  }

  if (!parsed?.summary) {
    console.log("SUMMARY INVALID");
    return;
  }

  // =====================================================
  // DATE RANGE
  // =====================================================

  const oldest = orderedMessages[0];
  const newest =
    orderedMessages[orderedMessages.length - 1];

  // =====================================================
  // SAVE
  // =====================================================

  const { data: inserted, error: insertError } =
    await supabase
      .from("conversation_summaries")
      .insert([
        {
          user_id: userId,
          title:
            parsed.title || "Riassunto conversazione",
          summary: parsed.summary,
          topics: parsed.topics || [],
          emotional_tone:
            parsed.emotional_tone || "neutral",
          period_start: oldest?.created_at,
          period_end: newest?.created_at,
          messages_count: orderedMessages.length,
        },
      ])
      .select();

  console.log("SUMMARY INSERT:", inserted);
  console.log(
    "SUMMARY INSERT ERROR:",
    insertError
  );

  return inserted;
}