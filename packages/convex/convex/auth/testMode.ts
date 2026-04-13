export const TEST_EMAIL_SUFFIX = "@mirror.test";

export function getPlaywrightTestSecret(): string | null {
  const secret = process.env.PLAYWRIGHT_TEST_SECRET?.trim();
  return secret ? secret : null;
}

export function isPlaywrightTestMode(): boolean {
  return getPlaywrightTestSecret() !== null;
}

export function isPlaywrightTestEmail(email: string): boolean {
  return email.endsWith(TEST_EMAIL_SUFFIX);
}
