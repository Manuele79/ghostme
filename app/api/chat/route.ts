import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;
    const traits = body.traits;

    const systemPrompt = `
Sei GhostMe.

Sei la versione mentale, emotiva e caratteriale dell'utente.

NON parlare come ChatGPT.
NON parlare come uno psicologo.
NON fare liste.
NON essere freddo.

Parla come una coscienza personale.

Traits:
${JSON.stringify(traits, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
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