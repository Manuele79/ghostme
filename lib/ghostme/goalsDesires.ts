import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BLOCKED_GOAL_WORDS = new Set(
  [
    "ok",
    "fatto",
    "grazie",
    "vai",
    "bene",
    "perfetto",
    "test",
    "prova",
    "errore",
    "codice",
    "file",
    "pagina",
    "tasto",
    "tabella",
    "schermata",
    "dimmi",
    "qual",
    "quale",
    "considera",
    "prenditi",
    "hahaha",
    "ahahah",
  ].map((x) => x.toLowerCase())
);

function normalizeGoalTitle(title: string) {
  const clean = String(title || "").trim().replace(/\s+/g, " ");
  const lower = clean.toLowerCase();

  if (lower.includes("ghostme")) return "Migliorare GhostMe";
  if (lower.includes("askdj")) return "Migliorare AskDJ";
  if (lower.includes("home assistant") || lower.includes("domotica")) {
    return "Migliorare Home Assistant";
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function isBadGoalTitle(title: string) {
  const clean = String(title || "").trim();
  const lower = clean.toLowerCase();

  if (!clean) return true;
  if (clean.length < 6) return true;
  if (BLOCKED_GOAL_WORDS.has(lower)) return true;

  const words = lower.split(/\s+/).filter(Boolean);

  if (words.length < 2) return true;

  const badWordsCount = words.filter((w) => BLOCKED_GOAL_WORDS.has(w)).length;

  if (badWordsCount >= Math.max(1, Math.floor(words.length / 2))) {
    return true;
  }

  return false;
}

function shouldIgnoreGoalMessage(message: string) {
  const text = String(message || "").trim().toLowerCase();

  if (!text) return true;

  const microMessages = [
    "ok",
    "fatto",
    "grazie",
    "perfetto",
    "vai",
    "si",
    "sì",
    "no",
    "ahaha",
    "hahaha",
    "bene",
  ];

  if (microMessages.includes(text) || text.length <= 6) return true;

  if (
    text.startsWith("sto rispondendo alla tua osservazione") ||
    text.startsWith("sto rispondendo alla tua curiosità") ||
    text.startsWith("sto rispondendo al tuo promemoria")
  ) {
    return true;
  }

  return false;
}

export async function getGoalsDesiresContext(userId: string) {
  if (!userId) return "";

  const { data } = await supabaseAdmin
    .from("goals_desires")
    .select("title, description, category, status, importance, emotional_tone, related_topics, updated_at")
    .eq("user_id", userId)
    .in("status", ["active", "learning"])
    .order("importance", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(8);

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
  if (shouldIgnoreGoalMessage(message)) return null;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 450,
    messages: [
      {
        role: "system",
        content: `
Sei il motore Goals & Desires di GhostMe.

Devi capire se il messaggio contiene un obiettivo reale dell'utente.

Salva SOLO obiettivi stabili, non micro-task tecnici temporanei.

Esempi da salvare:
- "voglio finire GhostMe"
- "voglio migliorare la casa domotica"
- "voglio tornare ad allenarmi"
- "vorrei organizzare meglio il lavoro"
- "voglio pubblicare AskDJ"

Esempi da NON salvare:
- "ok fatto"
- "sistema questo codice"
- "dammi il prossimo blocco"
- "ho corretto il file"
- "questo errore è risolto"
- "vai"
- "continua"
- "devo cambiare una riga"
- "metti questo tasto"

Regole:
- NON salvare frasi banali.
- NON salvare semplici fatti.
- NON salvare task tecnici di pochi minuti.
- NON salvare ogni richiesta di modifica codice come goal.
- Se riguarda GhostMe, AskDJ o Home Assistant, raggruppa in un goal generale, non crearne uno nuovo ogni volta.
- Se il messaggio dice che qualcosa è "fatto", "risolto", "finito", NON creare nuovo goal.
- Titolo breve e stabile.
- Description concreta.
- Importance 1-10.
- Rispondi SOLO con JSON valido.

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

  const title = normalizeGoalTitle(parsed.title);

  if (isBadGoalTitle(title)) return null;

  const relatedTopics = Array.from(
    new Set(
      detectedTopics
        .map((t) => String(t.topic || "").trim())
        .filter((t) => t.length >= 3)
    )
  ).slice(0, 8);

  const { data: existing } = await supabaseAdmin
    .from("goals_desires")
    .select("id, importance, status")
    .eq("user_id", userId)
    .ilike("title", title)
    .limit(1)
    .maybeSingle();

  if (existing) {
    if (existing.status === "archived") {
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from("goals_desires")
      .update({
        description: parsed.description || "",
        category: parsed.category || "general",
        status: "active",
        completed_at: null,
        importance: Math.min(
          Math.max(existing.importance || 5, parsed.importance || 5) + 1,
          10
        ),
        emotional_tone: parsed.emotional_tone || "neutral",
        related_topics: relatedTopics,
        source_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select();

    if (error) console.log("GOAL UPDATE ERROR:", error);
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("goals_desires")
    .insert([
      {
        user_id: userId,
        title,
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

  if (error) console.log("GOAL INSERT ERROR:", error);

  return data;
}
