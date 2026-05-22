import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ParsedCalendarIntent = {
  has_calendar_intent: boolean;
  type?: "appointment" | "reminder" | "note" | "voice_note";
  title?: string;
  description?: string;
  start_at?: string | null;
  end_at?: string | null;
  remind_at?: string | null;
};

export async function parseCalendarIntent({
  message,
  nowIso,
  location,
}: {
  message: string;
  nowIso: string;
  location?: string;
}): Promise<ParsedCalendarIntent> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: `
Sei un parser calendario interno di GhostMe.

Devi capire se il messaggio dell'utente vuole creare:
- appuntamento
- promemoria
- nota calendario
- memo vocale trascritto

Rispondi SOLO con JSON valido.

Data/ora attuale:
${nowIso}

Località utente:
${location || "non specificata"}

Regole:
- Se non c'è intenzione calendario, has_calendar_intent false.
- Se l'utente dice "ricordami", usa type "reminder".
- Se l'utente dice "appuntamento", "ho il dentista", "riunione", usa type "appointment".
- Se l'utente dice "nota", usa type "note".
- Se manca l'ora ma c'è un giorno, usa start_at null e spiega nel title/description.
- Usa formato ISO per start_at, end_at, remind_at.
- Per reminder, remind_at deve essere la data/ora del promemoria.
- Per appointment, start_at deve essere la data/ora dell'appuntamento.
- Se end_at non è chiaro, lascialo null.

Formato:
{
  "has_calendar_intent": true,
  "type": "reminder",
  "title": "Chiamare Marco",
  "description": "Promemoria creato da GhostMe",
  "start_at": null,
  "end_at": null,
  "remind_at": "2026-05-24T09:00:00+02:00"
}

Oppure:
{
  "has_calendar_intent": false
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

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.log("CALENDAR INTENT PARSE ERROR:", err);
    console.log("CALENDAR INTENT RAW:", raw);

    return {
      has_calendar_intent: false,
    };
  }
}