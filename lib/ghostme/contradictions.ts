import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type MemoryLike = {
  title?: string | null;
  content?: string | null;
  category?: string | null;
};

export async function detectAndSaveContradictions({
  userId,
  message,
}: {
  userId: string;
  message: string;
}) {
  if (!userId || !message?.trim()) return null;

  const { data: memories } = await supabaseAdmin
    .from("memories_active")
    .select("title, content, category")
    .eq("user_id", userId)
    .order("importance", { ascending: false })
    .limit(20);

  const { data: topics } = await supabaseAdmin
    .from("life_topics")
    .select("topic, description, category, entity_type")
    .eq("user_id", userId)
    .order("weight", { ascending: false })
    .limit(20);

  const memoryText =
    (memories || [])
      .map(
        (m: MemoryLike) =>
          `[${m.category || "general"}] ${m.title || ""}: ${m.content || ""}`
      )
      .join("\n") || "nessuna memoria";

  const topicText =
    (topics || [])
      .map(
        (t: any) =>
          `${t.topic} | ${t.entity_type} | ${t.category} | ${
            t.description || "nessuna descrizione"
          }`
      )
      .join("\n") || "nessun topic";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content: `
Sei un motore interno di GhostMe per rilevare contraddizioni.

Devi confrontare il nuovo messaggio dell'utente con memorie e topic già salvati.

Una contraddizione è quando:
- l'utente ora dice l'opposto di una memoria precedente
- cambia posizione su una persona, progetto, lavoro, passione o abitudine
- passa da "mi piace" a "non mi piace"
- passa da "voglio" a "non voglio"
- passa da tono positivo stabile a negativo forte sullo stesso topic

NON segnalare contraddizioni deboli.
NON segnalare semplici cambi di umore temporanei.
NON inventare.

Rispondi SOLO con JSON valido:

{
  "has_contradiction": true,
  "topic": "nome topic",
  "old_statement": "cosa risultava prima",
  "new_statement": "cosa dice ora l'utente",
  "confidence": 0,
  "description": "breve spiegazione"
}

Se non c'è contraddizione:
{
  "has_contradiction": false
}
        `,
      },
      {
        role: "user",
        content: `
MEMORIE ATTIVE:
${memoryText}

TOPIC CONOSCIUTI:
${topicText}

NUOVO MESSAGGIO UTENTE:
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
    console.log("CONTRADICTION PARSE ERROR:", err);
    console.log("CONTRADICTION RAW:", raw);
    return null;
  }

  if (!parsed?.has_contradiction) {
    console.log("CONTRADICTION: none");
    return null;
  }

  if (!parsed.topic || !parsed.old_statement || !parsed.new_statement) {
    console.log("CONTRADICTION: invalid", parsed);
    return null;
  }

  const confidence = Number(parsed.confidence || 0);

  if (confidence < 70) {
    console.log("CONTRADICTION: low confidence", parsed);
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("contradictions")
    .insert([
      {
        user_id: userId,
        tema: parsed.topic,
        descrizione: parsed.description || "",
        topic: parsed.topic,
        old_statement: parsed.old_statement,
        new_statement: parsed.new_statement,
        confidence,
        status: "unresolved",
        source_message: message,
        updated_at: new Date().toISOString(),
      },
    ])
    .select();

  console.log("CONTRADICTION INSERT:", data);
  console.log("CONTRADICTION INSERT ERROR:", error);

  return data;
}