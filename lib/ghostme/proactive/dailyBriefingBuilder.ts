import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function buildDailyBriefingMessage({
  user,
  calendar,
  goals,
  actions,
  mental,
  timeline,
  topics,
}: {
  user: any;
  calendar: any[];
  goals: any[];
  actions: any[];
  mental: any;
  timeline: any[];
  topics: any[];
}) {
  const systemPrompt = `
Sei GhostMe.

Devi creare un briefing proattivo personale per l'utente.
Massimo 130 parole.
Solo cose operative: appuntamenti, promemoria, azioni concrete, anomalie utili.
Niente motivazione finta, niente coaching, niente poesia.
Se non c'ÃƒÂ¨ nulla di concreto, fai un briefing molto breve.
      `;

  const calendarForPrompt = (calendar || []).map((event) => ({
    ...event,
    when_it: event.start_at
      ? new Date(event.start_at).toLocaleString("it-IT", {
          timeZone: "Europe/Rome",
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : event.remind_at
        ? new Date(event.remind_at).toLocaleString("it-IT", {
            timeZone: "Europe/Rome",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "orario non specificato",
  }));

  const userPrompt = `
UTENTE:
${JSON.stringify(user, null, 2)}

CALENDARIO:
${JSON.stringify(calendarForPrompt, null, 2)}

OBIETTIVI:
${JSON.stringify(goals || [], null, 2)}

AZIONI APERTE:
${JSON.stringify(actions || [], null, 2)}

STATO MENTALE:
${JSON.stringify(mental || null, null, 2)}

TIMELINE RECENTE:
${JSON.stringify(timeline || [], null, 2)}

TOPIC IMPORTANTI:
${JSON.stringify(topics || [], null, 2)}
      `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 300,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const dailyMessage =
    completion.choices[0]?.message?.content ||
    `Buongiorno ${user.full_name || ""}. Non ho abbastanza dati per un briefing utile oggi.`;

  return { dailyMessage };
}
