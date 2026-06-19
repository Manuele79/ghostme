export function canAccessHomeAssistant(userId: string) {
  const ownerUserId = process.env.GHOSTME_TEST_USER_ID;
  return Boolean(ownerUserId && userId && userId === ownerUserId);
}
