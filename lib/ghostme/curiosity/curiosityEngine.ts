import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function trimText(value: string, max = 1800) {
  if (!value) return "";
  return value.length > max ? value.slice(0, max) + "\n[...]" : value;
}

export async function generateCuriosityMessage(userId: string) {
  if (!userId) return null;

  // massimo 1 curiosità ogni  ore
  const { data: recent } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "curiosity")
    .gte("created_at", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (recent && recent.length > 0) return null;
  const situation = await buildGhostSituation(userId);

  const [
    topicsRes,
    goalsRes,
    profileRes,
    contradictionsRes,
    timelineRes,
    summariesRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("life_topics")
      .select("topic, category, entity_type, description, weight, mention_count, relationship_strength, status, last_mentioned_at")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("weight", { ascending: false })
      .limit(18),

    supabaseAdmin
      .from("goals_desires")
      .select("title, description, category, status, importance, emotional_tone, related_topics, updated_at")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("importance", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("dynamic_self_profile")
      .select("trait, description, confidence, last_evidence, updated_at")
      .eq("user_id", userId)
      .order("confidence", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("contradictions")
      .select("tema, descrizione, topic, old_statement, new_statement, confidence, status, updated_at")
      .eq("user_id", userId)
      .eq("status", "unresolved")
      .order("confidence", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("autobiographical_timeline")
      .select("title, summary, emotional_tone, importance, related_topics, event_date")
      .eq("user_id", userId)
      .order("event_date", { ascending: false })
      .limit(8),

    supabaseAdmin
      .from("conversation_summaries")
      .select("title, summary, topics, emotional_tone, period_start, period_end, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const topics = topicsRes.data || [];
  const goals = goalsRes.data || [];
  const profile = profileRes.data || [];
  const contradictions = contradictionsRes.data || [];
  const timeline = timelineRes.data || [];
  const summaries = summariesRes.data || [];

  if (
    topics.length === 0 &&
    goals.length === 0 &&
    profile.length === 0 &&
    contradictions.length === 0
  ) {
    return null;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 260,
    messages: [
      {
        role: "system",
        content: `
Sei il Curiosity Engine di GhostMe.

Il tuo compito NON è dare consigli.
Il tuo compito è trovare UNA domanda intelligente che aiuterebbe GhostMe a capire meglio l'utente.

Devi cercare:
- argomenti dominanti
- argomenti ricorrenti ma poco chiari
- cambiamenti di priorità
- contraddizioni
- obiettivi aperti
- aree della vita molto presenti o sparite
- progetti che occupano molta attenzione
- relazioni o passioni che sembrano importanti

Regole:
- Se non c'è una domanda davvero utile, rispondi SOLO: NO_MESSAGE
- Non fare domande banali.
- Non fare il coach.
- Non dire "focalizzati", "riduci lo stress", "prenditi una pausa".
- Non giudicare.
- Non inventare dati.
- Massimo 55 parole.
- Deve sembrare GhostMe che ha notato qualcosa, non un questionario.
- Una sola domanda.
- Se il luogo attuale è già noto, NON chiedere dove si trova l'utente.
- Se il contesto dice che il luogo attuale è casa/lavoro/altro luogo noto, usalo come dato già disponibile.
        `,
      },
      {
        role: "user",
        content: trimText(`

CONTESTO ATTUALE:
Luogo attuale: ${situation.currentPlace || "sconosciuto"}
Momento: ${situation.timeContext}, ${situation.dayContext}
Località profilo: ${situation.userLocation || "non specificata"}

TOPIC IMPORTANTI:
${JSON.stringify(topics, null, 2)}

OBIETTIVI:
${JSON.stringify(goals, null, 2)}

PROFILO DINAMICO:
${JSON.stringify(profile, null, 2)}

CONTRADDIZIONI:
${JSON.stringify(contradictions, null, 2)}

TIMELINE RECENTE:
${JSON.stringify(timeline, null, 2)}

RIASSUNTI RECENTI:
${JSON.stringify(summaries, null, 2)}
        `),
      },
    ],
  });

  const message = completion.choices[0]?.message?.content?.trim() || "";

  if (!message || message === "NO_MESSAGE") return null;

  return message;
}