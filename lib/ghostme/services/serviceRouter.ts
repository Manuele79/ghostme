export type GhostServiceType = "none" | "web_search" | "weather" | "news";

export type GhostServiceDecision = {
  service: GhostServiceType;
  query: string;
  reason: string;
};

export function decideGhostService(message: string): GhostServiceDecision {
  const text = message.toLowerCase().trim();

  const weatherWords = [
    "meteo",
    "piove",
    "piovere",
    "temperatura",
    "tempo farà",
    "che tempo",
    "vento",
    "neve",
    "moto",
    "snowboard",
  ];

  const newsWords = [
    "news",
    "notizie",
    "ultime",
    "oggi",
    "attualità",
    "borsa",
    "economia",
    "sport",
    "automotive",
    "tecnologia",
  ];

  const webWords = [
    "cerca",
    "internet",
    "online",
    "chi è",
    "cos'è",
    "quanto costa",
    "recensioni",
    "prezzo",
    "ultimo",
    "aggiornato",
  ];

  if (weatherWords.some((w) => text.includes(w))) {
    return {
      service: "weather",
      query: message,
      reason: "La richiesta sembra riguardare meteo o condizioni esterne.",
    };
  }

  if (newsWords.some((w) => text.includes(w))) {
    return {
      service: "news",
      query: message,
      reason: "La richiesta sembra richiedere notizie aggiornate.",
    };
  }

  if (webWords.some((w) => text.includes(w))) {
    return {
      service: "web_search",
      query: message,
      reason: "La richiesta sembra richiedere informazioni aggiornate da internet.",
    };
  }

  return {
    service: "none",
    query: message,
    reason: "Risposta gestibile solo con memoria e modello.",
  };
}