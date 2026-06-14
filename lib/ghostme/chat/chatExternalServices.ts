import { decideGhostService } from "@/lib/ghostme/services/serviceRouter";
import { runWebSearch } from "@/lib/ghostme/services/webSearchService";
import { runWeatherSearch } from "@/lib/ghostme/services/weatherService";

export async function resolveChatExternalService({
  message,
  userLocation,
}: {
  message: string;
  userLocation: string;
}) {
  let serviceContext = "";
  const serviceDecision = decideGhostService(message);

  if (serviceDecision.service === "web_search") {
    try {
      const webResult = await runWebSearch(serviceDecision.query);

      serviceContext = `
    SERVIZIO INTERNET ATTIVO:
    Tipo: web_search
    Motivo: ${serviceDecision.reason}

    Risultato ricerca:
    ${webResult.summary}
    `;
    } catch (err) {
      console.log("WEB SEARCH ERROR:", err);
      serviceContext = `
    SERVIZIO INTERNET:
    La ricerca web era richiesta, ma è fallita.
    Dillo chiaramente nella risposta.`;
    }
  } else if (serviceDecision.service === "weather") {
    try {
      const weatherResult = await runWeatherSearch({
        query: serviceDecision.query,
        location: userLocation,
      });

      serviceContext = `
    SERVIZIO METEO ATTIVO:
    Località usata: ${userLocation || "non specificata"}

    Risultato meteo:
    ${weatherResult.summary}
    `;
    } catch (err) {
      console.log("WEATHER ERROR:", err);
      serviceContext = `
    SERVIZIO METEO:
    Impossibile recuperare le previsioni.`;
    }
  } else if (serviceDecision.service === "news") {
    try {
      const newsResult = await runWebSearch(`
    Cerca notizie aggiornate per questa richiesta:

    ${serviceDecision.query}

    Rispondi in italiano.
    Dai solo le notizie rilevanti, sintetiche e con contesto.
    Se la richiesta è troppo generica, dai le principali notizie pertinenti.
    `);

      serviceContext = `
    SERVIZIO NEWS ATTIVO:
    Tipo: news
    Motivo: ${serviceDecision.reason}

    Risultato notizie:
    ${newsResult.summary}
    `;
    } catch (err) {
      console.log("NEWS SEARCH ERROR:", err);
      serviceContext = `
    SERVIZIO NEWS:
    La ricerca notizie era richiesta, ma è fallita.
    Dillo chiaramente nella risposta.`;
    }
  }

  return serviceContext;
}
