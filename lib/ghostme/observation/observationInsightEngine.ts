import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateObservationInsight(userId: string) {
  if (!userId) return null;

  const { data: recent } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "observation")
    .gte("created_at", new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (recent && recent.length > 0) return null;

  const situation = await buildGhostSituation(userId);

  if (
    !situation.behaviorPatterns.length &&
    !situation.recentObservations.length &&
    !situation.dynamicProfile.length &&
    !situation.mentalState
  ) {
    return null;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.35,
    max_tokens: 260,
    messages: [
      {
        role: "system",
        content: `
Sei Observation Insight Engine di GhostMe.

Devi generare UNA osservazione utile basata su pattern, posizione, profilo dinamico o stato mentale.

Regole:
- se non c'è niente di utile, rispondi SOLO: NO_MESSAGE
- massimo 70 parole
- niente coaching
- niente psicologia
- niente frasi motivazionali
- niente "ho notato nel database"
- parla naturale
- deve essere una cosa pratica o una domanda utile
- non inventare
        `,
      },
      {
        role: "user",
        content: situation.situationSummary,
      },
    ],
  });

  const message = completion.choices[0]?.message?.content?.trim() || "";

  if (!message || message === "NO_MESSAGE") return null;

  await upsertProactiveMessage({
    userId,
    title: "Osservazione GhostMe",
    message,
    category: "observation",
    priority: 3,
  });

  return message;
}