function configuredValues(...values: Array<string | undefined>) {
  return values
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getHomeAssistantUserIds() {
  return Array.from(
    new Set(
      configuredValues(
        process.env.GHOSTME_HOME_ASSISTANT_USER_IDS,
        process.env.GHOSTME_HOME_ASSISTANT_USER_ID,
        process.env.HOME_ASSISTANT_USER_ID,
        process.env.GHOSTME_MANUELE_USER_ID,
        process.env.GHOSTME_VALENTINA_USER_ID,
        process.env.GHOSTME_TEST_USER_ID
      )
    )
  );
}

export function canAccessHomeAssistant(userId: string) {
  return Boolean(userId && getHomeAssistantUserIds().includes(userId));
}

export function getDefaultHomeAssistantUserId() {
  return getHomeAssistantUserIds()[0] || null;
}

export function getHomeAssistantPersonForUser(userId: string) {
  const manueleIds = configuredValues(
    process.env.GHOSTME_MANUELE_USER_ID,
    process.env.GHOSTME_HOME_ASSISTANT_USER_ID,
    process.env.HOME_ASSISTANT_USER_ID,
    process.env.GHOSTME_TEST_USER_ID
  );
  if (manueleIds.includes(userId)) return "manuele" as const;
  if (process.env.GHOSTME_VALENTINA_USER_ID === userId) return "valentina" as const;
  return null;
}
