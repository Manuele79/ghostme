const INSIGHT_CATEGORIES = new Set(["observation", "curiosity"]);
const INSIGHT_STOP_WORDS = new Set([
  "a",
  "ad",
  "ancora",
  "che",
  "ci",
  "dei",
  "delle",
  "gli",
  "hai",
  "i",
  "il",
  "in",
  "la",
  "le",
  "lo",
  "sono",
  "un",
  "una",
]);

function normalizeText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function messageDedupeKey(message: any) {
  const category = normalizeText(message.category);

  if (INSIGHT_CATEGORIES.has(category)) {
    const tokens = normalizeText(message.message)
      .split(" ")
      .filter((token) => token && !INSIGHT_STOP_WORDS.has(token))
      .map((token) => (token.startsWith("apert") ? "apert" : token));
    const signature = [...new Set(tokens)].sort().join("|");

    return `${category}|${signature || normalizeText(message.title)}`;
  }

  return [category, normalizeText(message.title), normalizeText(message.message)].join(
    "|"
  );
}

export function dedupeProactiveMessages<T>(messages: T[]) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const message of messages || []) {
    const key = messageDedupeKey(message);
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(message);
  }

  return result;
}
