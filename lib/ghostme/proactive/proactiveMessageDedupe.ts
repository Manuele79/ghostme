export type ProactiveMessageIdentityInput = {
  logical_key?: string | null;
  category?: string | null;
  title?: string | null;
  message?: string | null;
};

export function normalizeProactiveText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function proactiveMessageIdentity(
  message: ProactiveMessageIdentityInput
) {
  const logicalKey = String(message.logical_key || "").trim();
  if (logicalKey) return `logical:${logicalKey}`;

  return [
    normalizeProactiveText(message.category),
    normalizeProactiveText(message.title),
    normalizeProactiveText(message.message),
  ].join("|");
}

export function dedupeProactiveMessages<
  T extends ProactiveMessageIdentityInput,
>(messages: T[]) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const message of messages || []) {
    const key = proactiveMessageIdentity(message);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(message);
  }

  return result;
}
