/**
 * FR-14: "Clear all customizations" opens a confirmation dialog
 * FR-15: Confirming clear resets all three fields to null server-side and empty client-side
 * FR-16: Confirmation dialog body reads verbatim text
 *
 * BLOCKER: Requires authenticated owner session with Convex DB seeding.
 * Move to ./e2e once auth + seed fixtures are available.
 */
import { test, expect } from "@playwright/test";

const OWNER_USERNAME = process.env.E2E_OWNER_USERNAME ?? "test-owner";

const VERBATIM_DIALOG_BODY =
  "This removes your tone, persona, and topics. Your clone will fall back to the default persona.";

test.describe("Dirty state and clear-all", () => {
  test.beforeEach(async ({ page: _page }) => {
    // TODO: authenticate as owner and seed all three fields with values
  });

  test("FR-14: Clicking 'Clear all customizations' opens alertdialog", async ({
    page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    await page
      .getByRole("button", { name: /clear all customizations/i })
      .click();

    await expect(page.getByRole("alertdialog")).toBeVisible({ timeout: 5000 });
  });

  test("FR-16: Dialog body contains exact verbatim text", async ({ page }) => {
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    await page
      .getByRole("button", { name: /clear all customizations/i })
      .click();

    await expect(page.getByRole("alertdialog")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(VERBATIM_DIALOG_BODY)).toBeVisible();
  });

  test.fixme("FR-15: Confirming clear empties all fields and persists after reload", async ({
    page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    await page
      .getByRole("button", { name: /clear all customizations/i })
      .click();
    await expect(page.getByRole("alertdialog")).toBeVisible({ timeout: 5000 });

    // Confirm
    await page.getByRole("button", { name: /^clear all$/i }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0, {
      timeout: 5000,
    });

    // All fields should be empty
    await expect(
      page.getByPlaceholder(/describe how your clone/i),
    ).toHaveValue("");
    await expect(page.getByPlaceholder(/list topics your clone/i)).toHaveValue(
      "",
    );
    await expect(page.getByRole("combobox")).toHaveText(/default|none/i);

    // Reload — still empty
    await page.reload();
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByPlaceholder(/describe how your clone/i),
    ).toHaveValue("");
    await expect(page.getByPlaceholder(/list topics your clone/i)).toHaveValue(
      "",
    );
    await expect(page.getByRole("combobox")).toHaveText(/default|none/i);
  });
});
