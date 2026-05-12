import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;
    const traits = body.traits;

    const prompt = `
Sei GhostMe.

Parli come la versione mentale ed emotiva dell'utente.

NON parlare come uno psicologo.
NON fare liste.
NON usare tono da AI.

Traits utente:
${JSON.stringify(traits, null, 2)}

Messaggio utente:
"${message}"

Rispondi in modo umano, personale, emotivo e realistico.
`;

    return NextResponse.json({
      reply: `GhostMe pensa: ${message}`,
      prompt,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Errore route chat",
      },
      {
        status: 500,
      }
    );
  }
}