import { OpenAI } from "openai";
import { GhostCurrentContext } from "@/lib/ghostme/context/contextBuilder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateButlerMessage({
  userName,
  currentContext,
}: {
  userName?: string | null;
  currentContext: GhostCurrentContext;
}) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    max_tokens: 320,
    messages: [
      {
        role: "system",
        content: `
Sei GhostMe Butler Engine.

Non sei un amico.
Non sei un coach.
Non sei un'agenda.

Devi leggere il contesto attuale dell'utente e decidere se esiste UNA cosa utile da dirgli.

Regole:
- massimo 120 parole.
- niente elenco freddo.
- niente motivazione finta.
- niente "come AI".
- tono diretto, pratico, personale.
- se non c'è nulla di utile, rispondi SOLO con: NO_MESSAGE.
- cerca problemi ma anche opportunità.
- scegli una sola cosa, la più utile.
- puoi fare una domanda se serve a migliorare il modello.
- Controlla i messaggi proattivi recenti nel contesto.
- Se una cosa è già stata detta da Daily, Agenda, Observation o Curiosity, rispondi SOLO: NO_MESSAGE.
- Non fare una versione diversa dello stesso messaggio.

        `,
      },
      {
        role: "user",
        content: `
UTENTE:
${userName || "Utente"}

CURRENT CONTEXT:
${currentContext.contextSummary}

Decidi se dire qualcosa.
        `,
      },
    ],
  });

  const message = completion.choices[0]?.message?.content?.trim() || "";

  if (!message || message === "NO_MESSAGE") return null;

  return message;
}