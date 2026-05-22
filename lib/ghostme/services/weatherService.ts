import { runWebSearch } from "./webSearchService";

export async function runWeatherSearch(query: string) {
  return runWebSearch(`
Previsioni meteo aggiornate:

${query}

Fornisci:
- situazione generale
- temperatura
- probabilità di pioggia
- eventuali avvisi meteo
`);
}