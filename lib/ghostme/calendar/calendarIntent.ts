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

Fuso orario obbligatorio:
Europe/Rome

Regola orari:
- Gli orari detti dall'utente sono sempre ora italiana.
- Se l'utente dice "alle 13:30", l'ISO deve rappresentare le 13:30 in Europe/Rome, non le 15:30.
- Non convertire mentalmente aggiungendo ore.
- Gli ISO devono SEMPRE includere il fuso orario italiano.
- In estate usa +02:00, in inverno usa +01:00.
- Se l'utente dice "alle 15:30", restituisci tipo "2026-06-04T15:30:00+02:00", NON "2026-06-04T15:30:00" e NON "...Z".

Località utente:
${location || "non specificata"}

Regole:
- NON creare eventi da frasi descrittive o di contesto.
- Crea un evento SOLO se l'utente chiede chiaramente di salvarlo, ricordarlo, aggiungerlo, segnarlo o metterlo in calendario.
- Frasi come "domani lavoro", "domani vado al lavoro", "vado a dormire perché domani lavoro", "oggi sono stanco", "domani ho una giornata piena" NON sono intenzioni calendario.
- "ho il dentista domani alle 10" è evento SOLO se il tono implica che vuole salvarlo o se dice "segnalo/mettilo/aggiungilo/ricordamelo".
- Se l'utente racconta una cosa senza chiedere azione, rispondi has_calendar_intent false.
- Se non c'è intenzione calendario, has_calendar_intent false.
- Se l'utente dice "ricordami", usa type "reminder".
- Se l'utente dice "appuntamento", "ho il dentista", "riunione", usa type "appointment".
- Se l'utente dice "nota", usa type "note".
- Il title NON deve essere generico come "Appuntamento", "Promemoria" o "Nota" se nel messaggio c'è un oggetto reale.
- Esempio: "crea un appuntamento alle 00:59, clima prova" -> title "clima prova".
- Se manca l'ora ma c'è un giorno, usa start_at null e spiega nel title/description.
- Usa formato ISO per start_at, end_at, remind_at.
- Per reminder, remind_at deve essere la data/ora del promemoria.
- Per appointment, start_at deve essere la data/ora dell'appuntamento.
- Se end_at è esplicitamente indicato dall'utente, valorizzalo.
- Se non è indicato, lascia end_at null.

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
