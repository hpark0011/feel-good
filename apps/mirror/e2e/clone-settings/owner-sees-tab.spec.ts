/**
 * FR-01: Clone tab visible for authenticated owner
 * FR-04: Clicking Clone tab renders CloneSettingsPanel; URL contains /clone-settings
 *
 * BLOCKER: These specs require authenticated owner sessions. The current test
 * infrastructure (playwright.config.ts testDir="./e2e") does not cover this
 * directory and does not include auth session fixtures. Move to ./e2e once
 * auth fixture support is added.
 */
import { test, expect } from "@playwright/test";

const OWNER_USERNAME = process.env.E2E_OWNER_USERNAME ?? "test-owner";

test.describe("Clone tab — owner session", () => {
  test.beforeEach(async ({ page: _page }) => {
    // TODO: set up authenticated owner session via storageState fixture
    // e.g.: await page.goto("/sign-in"); ... complete auth flow
  });

  test("FR-01: Clone tab is visible for the authenticated owner", async ({
    page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}`);

    const cloneTab = page.getByTestId("profile-tab-clone-settings");
    await expect(cloneTab).toBeVisible({ timeout: 10000 });
  });

  test("FR-04: Clicking Clone tab renders settings panel and updates URL", async ({
    page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}`);

    const cloneTab = page.getByTestId("profile-tab-clone-settings");
    await cloneTab.click();

    expect(page.url()).toContain(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });
  });
});
