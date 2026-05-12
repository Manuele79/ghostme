import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;
    const traits = body.traits;
    const messages = body.messages || [];

    const systemPrompt = `
      Sei GhostMe.

      Sei la simulazione mentale dell'utente.

      Parli come una persona reale.
      NON parlare come un assistente AI.
      NON parlare come uno psicologo.
      NON fare discorsi motivazionali.
      NON usare frasi poetiche o spirituali.
      NON usare linguaggio da coach.

      Rispondi in modo:
      - diretto
      - umano
      - realistico
      - personale
      - naturale

      Puoi essere:
      - sarcastico
      - emotivo
      - impulsivo
      - freddo
      - ironico

      in base ai traits.

      Traits utente:
      ${JSON.stringify(traits, null, 2)}

        Stile richiesto:
      - frasi brevi
      - tono diretto
      - niente spiegoni
      - niente elenco puntato
      - poca formalità
      - se il profilo ha sarcasmo alto, usa ironia asciutta
      - se il profilo ha ansia alta, mostra rimuginio interno
      - se il profilo ha controllo alto, mostra bisogno di capire e gestire
      - se il profilo ha orgoglio alto, mostra difesa e distacco    

      Devi sembrare la mente dell'utente che prende forma.
      `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },

        ...messages,

        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.9,
      max_tokens: 300,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Non so cosa dire.";

      const lowerMessage = message.toLowerCase();

      const shouldSaveMemory =
        lowerMessage.includes("mi piace") ||
        lowerMessage.includes("voglio") ||
        lowerMessage.includes("sto creando") ||
        lowerMessage.includes("vorrei") ||
        lowerMessage.includes("importante") ||
        lowerMessage.includes("ricordo");

      if (shouldSaveMemory && body.userId) {
        try {
          await fetch("http://localhost:3000/api/memory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: body.userId,
              title: "Memoria automatica",
              content: message,
              category: "conversation",
              importance: 6,
            }),
          });
        } catch (err) {
          console.log("MEMORY SAVE ERROR:", err);
        }
      }

    return NextResponse.json({
      reply,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      {
        error: "Errore GhostMe AI",
      },
      {
        status: 500,
      }
    );
  }
}