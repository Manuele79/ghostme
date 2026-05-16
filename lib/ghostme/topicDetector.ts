export type DetectedTopic = {
  topic: string;
  category: string;
  entity_type: string;
  needs_clarification?: boolean;
  confidence: number;
  reason: string;
};

const ignoredWords = new Set(
  [
    "ciao", "oggi", "domani", "ieri", "come", "cosa", "sono", "sei", "siamo",
    "ero", "era", "eri", "stato", "stata", "stavo", "sto", "per", "con",
    "senza", "dentro", "fuori", "dopo", "prima", "voglio", "vorrei", "devo",
    "faccio", "facendo", "lavoro", "lavorando", "provando", "appena",
    "quando", "dove", "perché", "quindi", "test", "memoria",
    "conversazione", "codici", "codice", "mare", "casa", "andare", "vado",
    "andiamo", "uscire", "uscito", "uscita", "usciti", "uscite", "sera",
    "mattina", "pomeriggio", "notte", "bene", "male", "grazie", "ok",
    "home", "assistant", "san", "santo", "santa", "friulano", "friuli",
    "collio", "cormons", "zona", "ristorante", "friggitoria", "fritto",
    "frittura", "pesce", "moto", "vespa", "piaggio", "ghost", "ghostme",
    "askdj",
  ].map((w) => w.toLowerCase())
);

const knownTopicRules: {
  topic: string;
  category: string;
  entity_type: string;
  keywords: string[];
}[] = [
  {
    topic: "Home Assistant",
    category: "home",
    entity_type: "system",
    keywords: ["home assistant", "domotica", "automazioni casa"],
  },
  {
    topic: "Palestra",
    category: "health",
    entity_type: "habit",
    keywords: ["palestra", "allenamento", "allenarmi"],
  },
  {
    topic: "Lavoro",
    category: "work",
    entity_type: "work",
    keywords: ["lavoro", "azienda", "capo", "collega", "fabbrica"],
  },
  {
    topic: "Moto / Piaggio",
    category: "passion",
    entity_type: "passion",
    keywords: ["moto", "vespa", "piaggio", "ciao piaggio", "kawasaki"],
  },
  {
    topic: "Snowboard",
    category: "passion",
    entity_type: "sport",
    keywords: ["snowboard", "snow"],
  },
  {
    topic: "GhostMe",
    category: "project",
    entity_type: "project",
    keywords: ["ghostme", "ghost me"],
  },
  {
    topic: "AskDJ",
    category: "project",
    entity_type: "project",
    keywords: ["askdj", "ask dj"],
  },
];

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?;:()[\]{}"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTopicName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function extractWords(message: string) {
  return message
    .split(/\s+/)
    .map((word) =>
      word
        .replace(/[.,!?;:()[\]{}"]/g, "")
        .trim()
    )
    .filter(Boolean);
}

function uniqueTopics(topics: DetectedTopic[]) {
  const map = new Map<string, DetectedTopic>();

  for (const item of topics) {
    const key = item.topic.toLowerCase();
    const existing = map.get(key);

    if (!existing || item.confidence > existing.confidence) {
      map.set(key, item);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.confidence - a.confidence
  );
}

function isInsideKnownTopicWord(word: string, detected: DetectedTopic[]) {
  const lower = word.toLowerCase();

  return detected.some((topic) =>
    topic.topic.toLowerCase().split(/\s+|\/+/).includes(lower)
  );
}

const knownPlaces = new Set(
  [
    "tokyo",
    "giappone",
    "cividale",
    "zoncolan",
    "pramollo",
    "austria",
    "badia",
    "collio",
  ]
);

function isPossiblePersonName(
  word: string,
  index: number,
  words: string[],
  detected: DetectedTopic[]
) {
  if (word.length < 3) return false;

  const clean = word.trim();
  const lower = clean.toLowerCase();

  if (ignoredWords.has(lower)) return false;
  if (isInsideKnownTopicWord(clean, detected)) return false;

  // evita URL, sigle, urla
  if (/^[A-ZÀ-Ù]{3,}$/.test(clean)) return false;

  // evita prima parola della frase: spesso è maiuscola solo perché inizia la frase
  if (index === 0) return false;

  // evita pezzi di nomi geografici tipo "San Giovanni"
  const prev = words[index - 1]?.toLowerCase();
  const next = words[index + 1]?.toLowerCase();

  if (lower === "giovanni" && prev === "san") return false;
  if (["san", "santo", "santa"].includes(lower)) return false;

  // Nome proprio semplice: Valentina, Enrico, Ale, Marco
  if (!/^[A-ZÀ-Ù][a-zà-ù]+$/.test(clean)) return false;

  return true;
}

export function detectTopicsFromMessage(message: string): DetectedTopic[] {
  const detected: DetectedTopic[] = [];
  const normalized = normalizeText(message);

  for (const rule of knownTopicRules) {
    const matchedKeyword = rule.keywords.find((keyword) =>
      normalized.includes(keyword.toLowerCase())
    );

    if (matchedKeyword) {
      detected.push({
        topic: rule.topic,
        category: rule.category,
        entity_type: rule.entity_type,
        needs_clarification: false,
        confidence: 95,
        reason: `keyword:${matchedKeyword}`,
      });
    }
  }

  const words = extractWords(message);

words.forEach((word) => {
  const clean = word.trim();
  const lower = clean.toLowerCase();

  if (!knownPlaces.has(lower)) return;

  detected.push({
    topic: normalizeTopicName(clean),
    category: "place",
    entity_type: "place",
    needs_clarification: false,
    confidence: 90,
    reason: "known_place",
  });
});


  words.forEach((word, index) => {
    if (!isPossiblePersonName(word, index, words, detected)) return;

    const cleanName = normalizeTopicName(word);

    detected.push({
      topic: cleanName,
      category: "unknown",
      entity_type: "unknown",
      needs_clarification: true,
      confidence: 70,
      reason: "possible_person_name",
    });
  });

  return uniqueTopics(detected);
}

export function isPossibleEpisode(message: string) {
  const lower = normalizeText(message);

  const episodeSignals = [
    "ieri", "oggi", "domani", "stamattina", "stasera", "sono andato",
    "sono andata", "siamo andati", "siamo andate", "ho fatto", "è successo",
    "sono stato", "sono stata", "siamo stati", "siamo state", "ho incontrato",
    "abbiamo incontrato", "ho visto", "abbiamo visto", "ho parlato",
    "abbiamo parlato", "sono uscito", "sono uscita", "siamo usciti",
    "siamo uscite", "andremo", "usciremo", "vado a", "andiamo a",
    "litigato", "discusso", "mi ha detto", "cena", "pizza", "aperitivo",
    "birra", "vino", "pranzo", "ristorante",
  ];

  return episodeSignals.some((signal) => lower.includes(signal));
}

export function detectEmotionalTone(message: string) {
  const lower = normalizeText(message);

  const positiveSignals = [
    "felice", "contento", "contenta", "bene", "bello", "bella", "figo",
    "figata", "top", "gasato", "gasata", "mi piace", "rilasso", "stacco",
  ];

  const negativeSignals = [
    "stanco", "stanca", "stress", "ansia", "nervoso", "nervosa", "male",
    "incazzato", "incazzata", "litigato", "triste", "preoccupato",
    "preoccupata", "paura",
  ];

  const positive = positiveSignals.some((signal) => lower.includes(signal));
  const negative = negativeSignals.some((signal) => lower.includes(signal));

  if (positive && !negative) return "positive";
  if (negative && !positive) return "negative";
  if (positive && negative) return "mixed";

  return "neutral";
}

export function shouldSaveActiveMemory(message: string) {
  const lower = normalizeText(message);

  const memorySignals = [
    "voglio", "vorrei", "mi piace", "mi interessa", "sto creando",
    "sto sviluppando", "per me è importante", "ricordati", "non dimenticare",
    "in futuro", "da ora in poi", "questa cosa è importante",
  ];

  return memorySignals.some((signal) => lower.includes(signal));
}

export function detectImportanceLevel(message: string) {
  const lower = normalizeText(message);

  const highSignals = [
    "importantissimo",
    "molto importante",
    "fondamentale",
    "ci tengo",
    "amo",
    "adoro",
    "mi rappresenta",
    "progetto principale",
    "voglio davvero",
    "non voglio perderlo",
    "fa parte di me",
  ];

  const mediumSignals = [
    "mi piace",
    "interessante",
    "mi interessa",
    "vorrei",
    "sto pensando",
  ];

  if (highSignals.some((s) => lower.includes(s))) {
    return 3;
  }

  if (mediumSignals.some((s) => lower.includes(s))) {
    return 2;
  }

  return 1;
}

export function detectMemoryCategory(message: string) {
  const lower = normalizeText(message);

  if (
    lower.includes("home assistant") ||
    lower.includes("domotica") ||
    lower.includes("cucina") ||
    lower.includes("doccia") ||
    lower.includes("cucinare") ||
    lower.includes("casa")
  ) {
    return "home";
  }

  if (
    lower.includes("lavoro") ||
    lower.includes("azienda") ||
    lower.includes("capo") ||
    lower.includes("fabbrica") ||
    lower.includes("collega")
  ) {
    return "work";
  }

  if (
    lower.includes("famiglia") ||
    lower.includes("figli") ||
    lower.includes("moglie") ||
    lower.includes("marito") ||
    lower.includes("compagna") ||
    lower.includes("compagno")
  ) {
    return "family";
  }

  if (
    lower.includes("app") ||
    lower.includes("progetto") ||
    lower.includes("sviluppando") ||
    lower.includes("codice") ||
    lower.includes("automazioni") ||
    lower.includes("pc") ||
    lower.includes("ghostme") ||
    lower.includes("askdj")
  ) {
    return "project";
  }

  if (
    lower.includes("moto") ||
    lower.includes("vespa") ||
    lower.includes("piaggio") ||
    lower.includes("snowboard")
  ) {
    return "passion";
  }

  return "conversation";
}