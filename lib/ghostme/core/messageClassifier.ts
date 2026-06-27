import type {
  CognitiveAddressee,
  CognitiveDecision,
  CognitiveFollowUpNeed,
  CognitiveMemoryDepth,
  CognitiveMessageType,
  CognitiveRequestedAction,
  CognitiveTone,
  DetectedTopicLike,
} from "@/lib/ghostme/chat/chatTypes";

export type GhostMessageClass = {
  type: "micro" | "normal" | "important";
  shouldRunHeavyEngines: boolean;
};

function includesAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

function uniqueActions(actions: CognitiveRequestedAction[]) {
  const unique = [...new Set(actions)];
  return unique.length ? unique : (["none"] as CognitiveRequestedAction[]);
}

function hasExplicitUserCalendarIntent(text: string) {
  const explicitCalendarPhrases = [
    "aggiungi al calendario",
    "metti in calendario",
    "segna in calendario",
    "crea un appuntamento",
    "salva un appuntamento",
    "ho un appuntamento",
    "appuntamento con",
    "appuntamento per",
    "crea un promemoria",
    "metti un promemoria",
    "salva un promemoria",
    "imposta un promemoria",
    "ricordamelo",
    "ricordami di",
    "reminder per",
    "promemoria per",
  ];
  const hasExplicitPhrase = includesAny(text, explicitCalendarPhrases);
  const hasTimeAnchor = includesAny(text, [
    " alle ",
    " domani",
    " dopodomani",
    " stasera",
    " stamattina",
    " lunedi",
    " lunedì",
    " martedi",
    " martedì",
    " mercoledi",
    " mercoledì",
    " giovedi",
    " giovedì",
    " venerdi",
    " venerdì",
    " sabato",
    " domenica",
  ]);

  return hasExplicitPhrase || (includesAny(text, ["promemoria", "appuntamento"]) && hasTimeAnchor);
}

export function classifyGhostMessage(message: string): GhostMessageClass {
  const text = (message || "").trim().toLowerCase();

  if (!text) {
    return { type: "micro", shouldRunHeavyEngines: false };
  }

  const microMessages = [
    "ok",
    "fatto",
    "grazie",
    "perfetto",
    "vai",
    "si",
    "sì",
    "no",
    "ahaha",
    "hahaha",
    "bene",
  ];

  if (microMessages.includes(text) || text.length <= 4) {
    return { type: "micro", shouldRunHeavyEngines: false };
  }

  const importantSignals = [
    "ricordati",
    "non dimenticare",
    "per me è importante",
    "voglio",
    "vorrei",
    "devo",
    "sto creando",
    "sto sviluppando",
    "mi piace",
    "mi interessa",
    "obiettivo",
    "progetto",
    "appuntamento",
    "promemoria",
    "vale",
    "ghostme",
    "askdj",
    "home assistant",
    "moto",
    "snowboard",
  ];

  const isImportant = importantSignals.some((s) => text.includes(s));

  if (isImportant) {
    return { type: "important", shouldRunHeavyEngines: true };
  }

  return { type: "normal", shouldRunHeavyEngines: true };
}

export function buildBaseCognitiveDecision(
  message: string,
  messageClass: GhostMessageClass
): CognitiveDecision {
  const text = (message || "").trim().toLowerCase();
  const reasons: string[] = [];

  const isQuestion = /[?？]\s*$/.test(message) || includesAny(text, [
    "come ",
    "cosa ",
    "quando ",
    "dove ",
    "perche",
    "perché",
    "chi ",
    "quale ",
    "mi dici",
    "dimmi",
  ]);
  const isCommandToGhost = includesAny(text, [
    "ghostme",
    "ricordati",
    "non dimenticare",
    "fammi",
    "dimmi",
    "cercami",
    "controlla",
    "salva",
    "segnati",
    "tienilo",
    "ricordamelo",
  ]);
  const isReminder = includesAny(text, [
    "ricordati",
    "ricordamelo",
    "promemoria",
    "reminder",
    "appuntamento",
    "alle ",
    "domani",
    "stasera",
    "oggi",
  ]);
  const hasUserCalendarIntent = hasExplicitUserCalendarIntent(text);
  const isBehaviorChange = includesAny(text, [
    "da oggi",
    "d'ora in poi",
    "sempre",
    "mai piu",
    "mai più",
    "preferisco che",
    "non usare",
    "rispondimi",
    "chiamami",
  ]);
  const isPreference = includesAny(text, [
    "mi piace",
    "non mi piace",
    "preferisco",
    "odio",
    "adoro",
    "mi interessa",
  ]);
  const isCorrection = includesAny(text, [
    "non e cosi",
    "non è così",
    "correggi",
    "in realta",
    "in realtà",
    "ti sbagli",
  ]);
  const isProject = includesAny(text, ["progetto", "sto creando", "sto sviluppando"]);
  const isGoal = includesAny(text, ["obiettivo", "voglio", "vorrei", "devo"]);
  const isPlace = includesAny(text, ["sono a", "sono in", "casa", "ufficio", "palestra", "luogo"]);
  const isRelationship = includesAny(text, [
    "amico",
    "amica",
    "collega",
    "moglie",
    "marito",
    "figlio",
    "figlia",
    "valentina",
  ]);
  const isObservation = includesAny(text, ["ho notato", "succede", "capita", "pattern"]);

  let messageType: CognitiveMessageType = "conversation";
  if (hasUserCalendarIntent) messageType = "personal_reminder";
  else if (isCommandToGhost) messageType = "command_to_ghost";
  else if (isQuestion) messageType = "question";
  else if (isReminder) messageType = "personal_reminder";
  else if (isCorrection) messageType = "correction";
  else if (isBehaviorChange) messageType = "behavior_change";
  else if (isPreference) messageType = "new_preference";
  else if (isProject) messageType = "project";
  else if (isRelationship) messageType = "relationship";
  else if (isPlace) messageType = "place";
  else if (isObservation) messageType = "observation";
  else if (includesAny(text, ["ieri", "oggi", "stamattina", "stasera"])) {
    messageType = "event";
  } else if (text.length > 40) {
    messageType = "memory";
  }

  let addressee: CognitiveAddressee = "self";
  if (isCommandToGhost) addressee = "ghostme";
  if (includesAny(text, ["digli", "dille", "scrivi a", "manda a"])) {
    addressee = "third_person";
  }

  const actions: CognitiveRequestedAction[] = [];
  if (messageClass.type !== "micro") actions.push("response");
  if (hasUserCalendarIntent) actions.push("calendar");
  if (isBehaviorChange) actions.push("behavior");
  if (isPreference) actions.push("memory", "behavior");
  if (isCorrection) actions.push("memory", "behavior");
  if (isProject) actions.push("project", "goals", "memory");
  if (isGoal) actions.push("goals", "memory");
  if (isRelationship) actions.push("people_graph", "memory");
  if (isPlace) actions.push("memory", "observation");
  if (isObservation) {
    actions.push("observation");
    if (!isCommandToGhost) actions.push("proactive");
  }
  if (messageType === "event" || messageType === "memory") {
    actions.push("memory", "timeline");
  }

  const persistence =
    isBehaviorChange || isPreference || isProject || isRelationship
      ? "permanent"
      : "temporary";

  let followUpNeed: CognitiveFollowUpNeed = "none";
  if (
    (isQuestion && !isCommandToGhost) ||
    includesAny(text, ["non so", "forse", "boh", "non ricordo"])
  ) {
    followUpNeed = "wait";
  }
  if (isObservation || isPlace) followUpNeed = "observe";

  let memoryDepth: CognitiveMemoryDepth = "mixed";
  if (messageClass.type === "micro") memoryDepth = "recent_only";
  if (includesAny(text, ["ricordi", "ti ricordi", "mai", "sempre", "storia", "passato"])) {
    memoryDepth = "deep_recall";
  }

  let tone: CognitiveTone = "informal";
  if (includesAny(text, ["codice", "typescript", "api", "errore", "build"])) tone = "technical";
  if (includesAny(text, ["sto male", "ansia", "triste", "felice", "paura"])) tone = "emotional";
  if (messageClass.type === "micro") tone = "synthetic";
  if (actions.includes("proactive")) tone = "proactive";

  if (messageClass.type === "micro") reasons.push("messaggio breve o conferma");
  if (isCommandToGhost) reasons.push("comando rivolto a GhostMe");
  if (hasUserCalendarIntent) {
    reasons.push("intenzione esplicita calendario/promemoria utente");
  } else if (isReminder) {
    reasons.push("segnale reminder non persistente per comando a GhostMe");
  }
  if (isBehaviorChange) reasons.push("preferenza o regola duratura");
  if (isRelationship) reasons.push("possibile informazione relazionale");
  if (memoryDepth === "deep_recall") reasons.push("richiesta di recall profondo");

  return {
    messageType,
    addressee,
    requestedActions: uniqueActions(actions),
    persistence,
    priority: messageClass.type === "important" ? 8 : messageClass.type === "normal" ? 5 : 1,
    followUpNeed,
    memoryDepth,
    tone,
    shouldRespond: messageClass.type !== "micro" || isQuestion || isCommandToGhost,
    shouldRunHeavyEngines: messageClass.shouldRunHeavyEngines,
    reasons,
  };
}

export function refineCognitiveDecision({
  decision,
  detectedTopics,
  importanceLevel,
}: {
  decision: CognitiveDecision;
  detectedTopics: DetectedTopicLike[];
  importanceLevel: number;
}): CognitiveDecision {
  const actions = [...decision.requestedActions];
  const topicTypes = detectedTopics.map((topic) =>
    String(topic.entity_type || topic.category || "").toLowerCase()
  );

  if (topicTypes.includes("person")) actions.push("people_graph", "memory");
  if (topicTypes.includes("project")) actions.push("project", "goals", "memory");
  if (topicTypes.includes("place")) actions.push("observation", "memory");
  if (detectedTopics.some((topic) => topic.needs_clarification)) {
    actions.push("curiosity");
  }

  const followUpNeed =
    detectedTopics.some((topic) => topic.needs_clarification) &&
    importanceLevel >= 7
      ? "ask"
      : decision.followUpNeed;

  const memoryDepth =
    decision.memoryDepth === "deep_recall" || importanceLevel >= 9
      ? "deep_recall"
      : decision.memoryDepth;

  return {
    ...decision,
    requestedActions: uniqueActions(actions),
    priority: Math.max(decision.priority, importanceLevel),
    followUpNeed,
    memoryDepth,
    shouldRunHeavyEngines:
      decision.shouldRunHeavyEngines || importanceLevel >= 4 || detectedTopics.length > 0,
    reasons: [
      ...decision.reasons,
      ...(detectedTopics.length ? ["topic/entity rilevati"] : []),
      ...(importanceLevel >= 8 ? ["importanza alta"] : []),
    ],
  };
}
