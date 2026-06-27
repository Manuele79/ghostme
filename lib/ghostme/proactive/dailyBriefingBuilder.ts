import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sanitizeDailyBriefing(text: string) {
  const forbidden = [
    "focus",
    "entusiasmo",
    "stress",
    "stanchezza",
    "condizione mentale",
    "stato mentale",
    "stato interno",
  ];
  const sentences = String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => {
      const clean = sentence.toLowerCase();
      return !forbidden.some((word) => clean.includes(word));
    });

  return sentences.join(" ").trim();
}

export async function buildDailyBriefingMessage({
  user,
  calendar,
  goals,
  actions,
  mental,
  timeline,
  topics,
  summaries = [],
  places = [],
  behaviorPatterns = [],
  houseEvents = [],
  housePatterns = [],
  houseSuggestions = [],
  currentSituation = null,
}: {
  user: any;
  calendar: any[];
  goals: any[];
  actions: any[];
  mental: any;
  timeline: any[];
  topics: any[];
  summaries?: unknown[];
  places?: unknown[];
  behaviorPatterns?: unknown[];
  houseEvents?: unknown[];
  housePatterns?: unknown[];
  houseSuggestions?: unknown[];
  currentSituation?: unknown;
}) {
  const systemPrompt = `
Sei GhostMe.

Devi creare un briefing proattivo personale per l'utente.
Massimo 130 parole.
Solo cose operative: appuntamenti, promemoria, azioni concrete, anomalie utili.
CALENDARIO FUTURO VERIFICATO e AZIONI ATTUALI APERTE sono le fonti operative prioritarie.
Usa prima SITUAZIONE ATTUALE se disponibile: e la sintesi gia integrata di luogo, presenza, casa, media e pattern.
Usa casa, luoghi, pattern e riassunti solo se producono una conseguenza pratica oggi.
Non elencare sensori grezzi: traduci in situazione umana concreta.
TIMELINE STORICA descrive fatti passati e non può creare o cancellare un impegno futuro presente nel calendario active.
Se un elemento compare soltanto nella timeline o nella memoria, non presentarlo come appuntamento futuro o cosa da fare.
Non citare elementi completed, archived, dismissed, cancelled o expired.
Lo stato mentale e un segnale interno: non citare valori, etichette tecniche, focus, entusiasmo, stress o stanchezza.
Non proporre domande: il briefing deve orientare, non interrogare.
Niente motivazione finta, niente coaching, niente poesia.
Se non c'e nulla di concreto, fai un briefing molto breve.
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

CALENDARIO FUTURO VERIFICATO:
${JSON.stringify(calendarForPrompt, null, 2)}

OBIETTIVI ATTUALI:
${JSON.stringify(goals || [], null, 2)}

AZIONI ATTUALI APERTE:
${JSON.stringify(actions || [], null, 2)}

STATO INTERNO:
${mental ? "disponibile come segnale interno, non da citare esplicitamente" : "non disponibile"}

TIMELINE STORICA/RECENTE — NON OPERATIVA:
${JSON.stringify(timeline || [], null, 2)}

TOPIC IMPORTANTI:
${JSON.stringify(topics || [], null, 2)}

RIASSUNTI CONVERSAZIONE:
${JSON.stringify(summaries || [], null, 2)}

SITUAZIONE ATTUALE INTEGRATA:
${JSON.stringify(currentSituation || null, null, 2)}

LUOGHI SIGNIFICATIVI:
${JSON.stringify(places || [], null, 2)}

PATTERN COMPORTAMENTALI:
${JSON.stringify(behaviorPatterns || [], null, 2)}

EVENTI CASA RECENTI:
${JSON.stringify(houseEvents || [], null, 2)}

PATTERN CASA:
${JSON.stringify(housePatterns || [], null, 2)}

SUGGERIMENTI CASA APERTI:
${JSON.stringify(houseSuggestions || [], null, 2)}
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

  const rawDailyMessage =
    completion.choices[0]?.message?.content ||
    `Buongiorno ${user.full_name || ""}. Non ho abbastanza dati per un briefing utile oggi.`;
  const dailyMessage =
    sanitizeDailyBriefing(rawDailyMessage) ||
    `Buongiorno ${user.full_name || ""}. Non ho abbastanza dati per un briefing utile oggi.`;

  return { dailyMessage };
}
