import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type WebSearchResult = {
  summary: string;
  sourcesText: string;
};

export async function runWebSearch(query: string): Promise<WebSearchResult> {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    tools: [{ type: "web_search" }],
    input: `
Cerca online informazioni aggiornate per questa richiesta:

"${query}"

Rispondi in italiano.

Formato:
- Risposta breve e chiara
- Fonti/link principali se disponibili
`,
  });

  return {
    summary: response.output_text || "Non ho trovato risultati utili.",
    sourcesText: "Fonti incluse nella risposta se disponibili.",
  };
}