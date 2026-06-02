export type GhostMessageClass = {
  type: "micro" | "normal" | "important";
  shouldRunHeavyEngines: boolean;
};

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