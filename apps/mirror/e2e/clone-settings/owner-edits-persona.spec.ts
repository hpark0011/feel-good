/**
 * FR-11: Saving valid form data calls updatePersonaSettings with correct payload
 * FR-12: Form is pre-populated with owner's current settings on mount
 * FR-15: Confirming clear resets fields to null server-side and empty client-side
 * FR-24: Clearing an individual field sets the DB column to null
 *
 * BLOCKER: Requires authenticated owner session with Convex DB seeding.
 * Current test infrastructure does not include auth session fixtures or DB
 * seeding utilities. Move to ./e2e once auth + seed fixtures are available.
 */
import { test, expect } from "@playwright/test";

const OWNER_USERNAME = process.env.E2E_OWNER_USERNAME ?? "test-owner";

test.describe("Owner edits persona settings", () => {
  test.beforeEach(async ({ page: _page }) => {
    // TODO: authenticate as owner and seed DB with initial persona data
  });

  test("FR-11 + FR-12: Owner can fill and save persona settings; values persist on reload", async ({
    page,
  }) => {
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    // Select "Witty" tone preset
    const selectTrigger = page.getByRole("combobox");
    await selectTrigger.click();
    await page.getByRole("option", { name: "Witty" }).click();

    // Fill persona prompt
    const personaTextarea = page.getByPlaceholder(
      /describe how your clone/i,
    );
    await personaTextarea.fill("I am a creative and witty persona.");

    // Fill topics to avoid
    const topicsTextarea = page.getByPlaceholder(/list topics your clone/i);
    await topicsTextarea.fill("Politics, sports");

    // Save
    await page.getByRole("button", { name: /^save$/i }).click();

    // Reload and verify persistence (FR-12)
    await page.reload();
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByPlaceholder(/describe how your clone/i)).toHaveValue(
      "I am a creative and witty persona.",
    );
    await expect(page.getByPlaceholder(/list topics your clone/i)).toHaveValue(
      "Politics, sports",
    );
  });

  test("FR-24: Clearing persona field sets DB column to null", async ({
    page,
  }) => {
    // TODO: seed personaPrompt="initial value" before navigating
    await page.goto(`/@${OWNER_USERNAME}/clone-settings`);
    await expect(page.getByTestId("clone-settings-panel")).toBeVisible({
      timeout: 10000,
    });

    const personaTextarea = page.getByPlaceholder(/describe how your clone/i);
    await personaTextarea.clear();

    await page.getByRole("button", { name: /^save$/i }).click();

    // Reload and verify persona is empty (null server-side = empty client-side)
    await page.reload();
    await expect(
      page.getByPlaceholder(/describe how your clone/i),
    ).toHaveValue("");
  });
});
