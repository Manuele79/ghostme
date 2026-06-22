import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePatternInsight(userId: string) {
  if (!userId) return null;

  const { data: recent } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "observation")
    .in("status", ["unread", "read"])
    .gte("created_at", new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (recent?.length) return null;

  const { data: patterns } = await supabaseAdmin
    .from("behavior_patterns")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte(
      "last_seen_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order("confidence", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(8);

  if (!patterns?.length) return null;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.35,
    max_tokens: 260,
    messages: [
      {
        role: "system",
        content: `
Sei il Pattern Insight Engine di GhostMe.

Devi trasformare pattern comportamentali già appresi in UNA osservazione utile.

Regole:
- Se non c'è niente di utile, rispondi SOLO: NO_MESSAGE
- Massimo 70 parole
- Niente coaching
- Niente psicologia
- Niente frasi motivazionali
- Niente "ho analizzato i dati"
- Parla naturale
- Puoi fare una domanda se serve confermare un'abitudine
- Non inventare
        `,
      },
      {
        role: "user",
        content: `
PATTERN ATTIVI:
${JSON.stringify(patterns, null, 2)}
        `,
      },
    ],
  });

  const message = completion.choices[0]?.message?.content?.trim() || "";

  if (!message || message === "NO_MESSAGE") return null;

  return message;
}
