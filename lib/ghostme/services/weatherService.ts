import { runWebSearch } from "./webSearchService";

export async function runWeatherSearch({
  query,
  location,
}: {
  query: string;
  location?: string;
}) {
  const finalQuery = location
    ? `${query}\nLocalità utente: ${location}`
    : query;

  return runWebSearch(`
Previsioni meteo aggiornate per questa richiesta:

${finalQuery}

Fornisci:
- situazione generale
- temperatura prevista
- probabilità di pioggia
- vento se rilevante
- consiglio pratico finale
`);
}