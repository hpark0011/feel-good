/**
 * FR-07: Persona textarea accepts up to 4000 characters
 * FR-08: Topics textarea accepts up to 500 characters
 * FR-09: Counter shows data-state="warning" at >= 80% of limit
 *
 * BLOCKER: Requires authenticated owner session.
 * Move to ./e2e once auth fixtures are available.
 */
import { test, expect } from "../fixtures/auth";

const OWNER_USERNAME = process.env.E2E_OWNER_USERNAME ?? "test-user";

test.describe("Character counter thresholds", () => {
  test.beforeEach(async ({ authenticatedPage: _page }) => {
    // TODO: authenticate as owner
  });

  test("FR-09 + FR-07: persona counter shows warning at 80% (3200) and danger at 4000", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    const personaTextarea = page.getByPlaceholder(/describe how your clone/i);
    const personaCounter = page.getByTestId("persona-prompt-counter");

    // Type 3200 chars → warning
    await personaTextarea.fill("a".repeat(3200));
    await expect(personaCounter).toBeVisible();
    await expect(personaCounter).toHaveAttribute("data-state", "warning");
    await expect(personaCounter).toContainText("3200/4000");

    // Type to 4000 → danger
    await personaTextarea.fill("a".repeat(4000));
    await expect(personaCounter).toBeVisible();
    await expect(personaCounter).toHaveAttribute("data-state", "danger");
    await expect(personaCounter).toContainText("4000/4000");
  });

  test("FR-09 + FR-08: topics counter shows warning at 80% (400) and danger at 500", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    const topicsTextarea = page.getByPlaceholder(/list topics your clone/i);
    const topicsCounter = page.getByTestId("topics-to-avoid-counter");

    // Type 400 chars → warning
    await topicsTextarea.fill("a".repeat(400));
    await expect(topicsCounter).toBeVisible();
    await expect(topicsCounter).toHaveAttribute("data-state", "warning");
    await expect(topicsCounter).toContainText("400/500");

    // Type to 500 → danger
    await topicsTextarea.fill("a".repeat(500));
    await expect(topicsCounter).toBeVisible();
    await expect(topicsCounter).toHaveAttribute("data-state", "danger");
    await expect(topicsCounter).toContainText("500/500");
  });
});
