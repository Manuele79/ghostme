import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getDynamicSelfProfileContext(userId: string) {
  if (!userId) return "";

  const { data } = await supabaseAdmin
    .from("dynamic_self_profile")
    .select("trait, description, confidence, source, last_evidence, updated_at")
    .eq("user_id", userId)
    .order("confidence", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(12);

  return (
    data
      ?.map(
        (p) =>
          `${p.trait} (${p.confidence}) | ${p.description} | evidenza: ${p.last_evidence || ""}`
      )
      .join("\n") || ""
  );
}

export async function updateDynamicSelfProfile({
  userId,
  message,
}: {
  userId: string;
  message: string;
}) {
  if (!userId || !message?.trim()) return null;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `
Sei il motore Self Profile dinamico di GhostMe.

Devi capire se dal messaggio emerge qualcosa di stabile sul modo di essere dell'utente.

Esempi:
- tende a fissarsi sui progetti
- usa la moto per staccare
- la montagna lo rilassa
- vuole capire e controllare le cose
- lavora molto sui propri progetti

NON salvare stati temporanei tipo "oggi ho fame".
NON inventare.

Rispondi SOLO con JSON valido:

{
  "has_profile_update": true,
  "trait": "...",
  "description": "...",
  "confidence": 70
}

Se non emerge nulla:
{
  "has_profile_update": false
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
    console.log("SELF PROFILE PARSE ERROR:", err);
    console.log("SELF PROFILE RAW:", raw);
    return null;
  }

  if (!parsed?.has_profile_update || !parsed?.trait) return null;

  const trait = String(parsed.trait).trim();

  const { data: existing } = await supabaseAdmin
    .from("dynamic_self_profile")
    .select("id, confidence")
    .eq("user_id", userId)
    .ilike("trait", trait)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("dynamic_self_profile")
      .update({
        description: parsed.description || "",
        confidence: Math.min(Math.max(existing.confidence || 50, parsed.confidence || 60) + 3, 100),
        last_evidence: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select();

    console.log("SELF PROFILE UPDATE:", data);
    console.log("SELF PROFILE UPDATE ERROR:", error);

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("dynamic_self_profile")
    .insert([
      {
        user_id: userId,
        trait,
        description: parsed.description || "",
        confidence: Math.min(Math.max(parsed.confidence || 60, 1), 100),
        source: "conversation",
        last_evidence: message,
      },
    ])
    .select();

  console.log("SELF PROFILE INSERT:", data);
  console.log("SELF PROFILE INSERT ERROR:", error);

  return data;
}