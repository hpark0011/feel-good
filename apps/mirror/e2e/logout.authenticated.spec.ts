import { test, expect } from "./fixtures/auth";

const username = "test-user"; // matches ensureTestUser's username

test.describe("Logout via logo menu", () => {
  test("owner can open the logo menu and see the logout option", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/@${username}`);

    const trigger = page.getByTestId("mirror-logo-menu-trigger");
    await expect(trigger).toBeVisible();

    await trigger.click();

    const logoutItem = page.getByTestId("logout-menu-item");
    await expect(logoutItem).toBeVisible();
    await expect(logoutItem).toHaveText(/log out/i);
  });

  test("clicking log out signs out and redirects to /sign-in", async ({
    authenticatedPage: page,
  }) => {
    await page.goto(`/@${username}`);

    // Mock the sign-out endpoint to avoid hitting real backend
    await page.route("**/api/auth/sign-out", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      }),
    );

    await page.getByTestId("mirror-logo-menu-trigger").click();
    await page.getByTestId("logout-menu-item").click();

    await expect(page).toHaveURL(/\/sign-in/, { timeout: 10_000 });
  });

  test("visitor does not see the logo menu", async ({ browser }) => {
    // Clear storageState so the browser has no session
    const ctx = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await ctx.newPage();

    await page.goto(`/@${username}`, { waitUntil: "domcontentloaded" });

    // The dropdown trigger must NOT be present for visitors
    await expect(
      page.getByTestId("mirror-logo-menu-trigger"),
    ).not.toBeVisible({ timeout: 5_000 });

    await ctx.close();
  });
});
