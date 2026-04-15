import { expect, test, type Page } from "@playwright/test";

const username = "rick-rubin";

async function openChat(page: Page) {
  await page.goto(`/@${username}?chat=1`);
  const textarea = page.locator('textarea[placeholder^="Message "]');
  await expect(textarea).toBeVisible({ timeout: 10000 });
  return textarea;
}

async function exhaustDailyBucket(page: Page) {
  const secret = process.env.PLAYWRIGHT_TEST_SECRET;
  if (!secret) {
    throw new Error("PLAYWRIGHT_TEST_SECRET must be set to run this test");
  }
  const response = await page.request.post("/api/test/exhaust-chat-daily", {
    headers: { "x-test-secret": secret },
    data: { username },
  });
  expect(response.ok()).toBe(true);
}

test.describe("Chat rate limit", () => {
  test("surfaces distinct daily-limit copy when the bucket is exhausted", async ({
    page,
  }) => {
    await exhaustDailyBucket(page);

    const textarea = await openChat(page);
    await textarea.fill("hello");
    await textarea.press("Enter");

    await expect(
      page.getByText("You've hit today's chat limit. Try again tomorrow."),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText("You're sending messages too quickly"),
    ).toHaveCount(0);
  });

  test("rejects messages longer than 3000 characters with the length error", async ({
    page,
  }) => {
    const textarea = await openChat(page);

    const tooLong = "a".repeat(3001);
    await textarea.fill(tooLong);
    await textarea.press("Enter");

    await expect(
      page.getByText("Message exceeds 3000 character limit"),
    ).toBeVisible({ timeout: 10000 });
  });
});
