export type RecallTopic = {
  entity_type?: string | null;
  category?: string | null;
};

function normalizeRecallText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isDeepRecallRequest(
  message: string,
  detectedTopics: RecallTopic[] = []
) {
  const text = normalizeRecallText(message);
  const recallPhrases = [
    "cosa sai",
    "che cosa sai",
    "chi sono i miei",
    "quali sono i miei",
    "sai quali",
    "sai qualcosa di",
    "non ti dice niente",
    "chi e mia",
    "chi e mio",
    "cosa ricordi",
    "che ricordi",
    "che luoghi conosci",
    "collega le informazioni",
    "collega eventi",
  ];
  const relationalTerms = [
    "amici",
    "amico",
    "moglie",
    "marito",
    "famiglia",
    "persone",
    "luoghi",
    "ricordi",
    "eventi",
  ];
  return (
    recallPhrases.some((phrase) => text.includes(phrase)) ||
    (relationalTerms.some((term) => text.includes(term)) &&
      /\b(sai|conosci|ricordi|chi|quali|collega)\b/.test(text)) ||
    detectedTopics.some(
      (topic) =>
        normalizeRecallText(topic.entity_type) === "person" ||
        ["friend", "family", "relationship", "person"].includes(
          normalizeRecallText(topic.category)
        )
    )
  );
}
