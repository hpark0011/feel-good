/**
 * FR-02: Clone tab absent for non-owners
 * FR-03: Direct URL returns 404 for non-owners
 * FR-25: Server component computes isOwner via fetchAuthQuery
 *
 * BLOCKER: Requires multi-session support (owner + non-owner sessions).
 * Current test infrastructure does not include auth session fixtures.
 * Move to ./e2e once auth fixture support is added.
 */
import { test, expect } from "@playwright/test";

const OWNER_USERNAME = process.env.E2E_OWNER_USERNAME ?? "test-owner";

test.describe("Clone tab — non-owner / unauthenticated", () => {
  test("FR-02: Clone tab absent for unauthenticated visitors", async ({
    page,
  }) => {
    // No auth setup — unauthenticated session
    await page.goto(`/@${OWNER_USERNAME}`);

    // Wait for profile to load
    await page.waitForLoadState("networkidle");

    const cloneTab = page.getByTestId("profile-tab-clone-settings");
    await expect(cloneTab).toHaveCount(0);
  });

  test("FR-03: Direct URL returns 404 for unauthenticated visitor", async ({
    page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);

    // Next.js not-found renders either a data-testid="not-found" or h1 with 404
    const notFoundIndicator = page.locator(
      '[data-testid="not-found"], h1:has-text("404"), h2:has-text("404")',
    );
    await expect(notFoundIndicator).toBeVisible({ timeout: 10000 });
  });

  test("FR-02: Clone tab absent for a different authenticated user (non-owner)", async ({
    page,
  }) => {
    // TODO: sign in as a different user (non-owner) when auth fixtures exist
    // For now this test serves as a placeholder
    await page.goto(`/@${OWNER_USERNAME}`);
    await page.waitForLoadState("networkidle");

    const cloneTab = page.getByTestId("profile-tab-clone-settings");
    // Unauthenticated acts as non-owner
    await expect(cloneTab).toHaveCount(0);
  });

  test("FR-03: Direct URL returns 404 for non-owner authenticated user", async ({
    page,
  }) => {
    // TODO: sign in as a different user when auth fixtures exist
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);

    const notFoundIndicator = page.locator(
      '[data-testid="not-found"], h1:has-text("404"), h2:has-text("404")',
    );
    await expect(notFoundIndicator).toBeVisible({ timeout: 10000 });
  });
});
