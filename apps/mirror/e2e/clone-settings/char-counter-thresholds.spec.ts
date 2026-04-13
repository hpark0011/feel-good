/**
 * FR-07: Persona textarea accepts up to 4000 characters
 * FR-08: Topics textarea accepts up to 500 characters
 * FR-09: Counter shows data-state="warning" at >= 80% of limit
 *
 * BLOCKER: Requires authenticated owner session.
 * Move to ./e2e once auth fixtures are available.
 */
import { test, expect } from "@playwright/test";

const OWNER_USERNAME = process.env.E2E_OWNER_USERNAME ?? "test-owner";

test.describe("Character counter thresholds", () => {
  test.beforeEach(async ({ page: _page }) => {
    // TODO: authenticate as owner
  });

  test("FR-09 + FR-07: persona counter shows warning at 80% (3200) and danger at 4000", async ({
    page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    const personaTextarea = page.getByPlaceholder(/describe how your clone/i);

    // Type 3200 chars → warning
    await personaTextarea.fill("a".repeat(3200));
    const warningCounter = page.locator("[data-state=warning]").first();
    await expect(warningCounter).toBeVisible();
    await expect(warningCounter).toContainText("3200/4000");

    // Type to 4000 → danger
    await personaTextarea.fill("a".repeat(4000));
    const dangerCounter = page.locator("[data-state=danger]").first();
    await expect(dangerCounter).toBeVisible();
    await expect(dangerCounter).toContainText("4000/4000");
  });

  test("FR-09 + FR-08: topics counter shows warning at 80% (400) and danger at 500", async ({
    page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    const topicsTextarea = page.getByPlaceholder(/list topics your clone/i);

    // Type 400 chars → warning
    await topicsTextarea.fill("a".repeat(400));
    const warningCounter = page.locator("[data-state=warning]").nth(1);
    await expect(warningCounter).toBeVisible();
    await expect(warningCounter).toContainText("400/500");

    // Type to 500 → danger
    await topicsTextarea.fill("a".repeat(500));
    const dangerCounter = page.locator("[data-state=danger]").nth(1);
    await expect(dangerCounter).toBeVisible();
    await expect(dangerCounter).toContainText("500/500");
  });
});
