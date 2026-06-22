import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";

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
    .in("status", ["unread", "read"])
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
- se non c'è niente di utile, rispondi SOLO: NO_MESSAGE.
- massimo 70 parole.
- niente coaching.
- niente psicologia.
- niente frasi motivazionali.
- niente "ho notato nel database".
- parla naturale.
- deve essere una cosa pratica o una domanda utile.
- non inventare.
- Se questa osservazione è già stata fatta nei messaggi proattivi recenti, rispondi SOLO: NO_MESSAGE.
- Non ripetere curiosità, daily o agenda già presenti.
- Se il luogo attuale è già noto, NON chiedere dove si trova l'utente.
- Se il contesto dice che il luogo attuale è casa/lavoro/altro luogo noto, usalo come dato già disponibile.
- Ignora parole sporche o topic casuali tipo "dimmi", "qual", "considera", "prenditi", "hahaha".
- Non creare osservazioni partendo da parole isolate o messaggi tecnici generici.
- Parla solo della situazione presente o di eventi delle ultime 24 ore.
- Considera soltanto goal attivi, eventi futuri attivi e action aperte.
- Se episodi o timeline indicano che qualcosa è già successo, non proporlo.
- Ignora completed, archived, dismissed, cancelled ed expired.
        `,
      },
      {
        role: "user",
        content: `
        SITUAZIONE:
        Luogo attuale: ${situation.currentPlace || "sconosciuto"}
        Momento: ${situation.timeContext}, ${situation.dayContext}
        Località profilo: ${situation.userLocation || "non specificata"}

        ${situation.situationSummary}

        MESSAGGI PROATTIVI RECENTI:
        ${(await getRecentProactiveText(userId)) || "nessuno"}
        `,
      },
    ],
  });

  const message = completion.choices[0]?.message?.content?.trim() || "";

  if (!message || message === "NO_MESSAGE") return null;

  return message;
}

async function getRecentProactiveText(userId: string) {
  const { data } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("category, title, message, created_at")
    .eq("user_id", userId)
    .in("status", ["unread", "read"])
    .gte("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    data
      ?.map(
        (m) =>
          `[${m.category || "general"}] ${m.title || "Messaggio"}: ${m.message}`
      )
      .join("\n") || ""
  );
}
