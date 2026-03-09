import { expect, test, type Locator } from "@playwright/test";

const username = "rick-rubin";
const articleSlug = "the-art-of-listening";
const articleTitle = "The Art of Listening";

async function getPanelWidth(locator: Locator) {
  return locator.evaluate((element) => {
    return Math.round(element.getBoundingClientRect().width);
  });
}

test.describe("Profile content panel toggle", () => {
  test("slides the desktop content panel closed, then restores a 50/50 layout", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/@${username}/articles/${articleSlug}`);

    await expect(
      page.getByRole("heading", { name: articleTitle }),
    ).toBeVisible({ timeout: 10000 });

    const toggle = page.getByRole("button", { name: "Hide Records" });
    const contentRegion = page.getByTestId("desktop-content-panel");
    const resizablePanels = page.locator('[data-slot="resizable-panel"]');
    const contentResizablePanel = resizablePanels.nth(1);
    const handle = page.locator('[data-slot="resizable-handle"]');

    await expect(contentRegion).toHaveAttribute("data-state", "open");

    const initialContentWidth = await getPanelWidth(contentResizablePanel);
    const handleBox = await handle.boundingBox();

    if (!handleBox) {
      throw new Error("Resizable handle is not visible");
    }

    await page.mouse.move(
      handleBox.x + handleBox.width / 2,
      handleBox.y + handleBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      handleBox.x + 220,
      handleBox.y + handleBox.height / 2,
      { steps: 16 },
    );
    await page.mouse.up();

    await expect
      .poll(async () => {
        const currentWidth = await getPanelWidth(contentResizablePanel);
        return Math.abs(currentWidth - initialContentWidth);
      })
      .toBeGreaterThan(120);

    await toggle.dblclick();

    const reopenToggle = page.getByRole("button", { name: "Show Records" });
    await expect(reopenToggle).toBeVisible({ timeout: 5000 });
    await expect(contentRegion).toHaveAttribute("data-state", "closed");

    await expect
      .poll(async () => await getPanelWidth(contentResizablePanel))
      .toBeLessThan(8);

    await expect(page).toHaveURL(
      new RegExp(`/@${username}/articles/${articleSlug}(\\?.*)?$`),
    );

    await reopenToggle.click();

    await expect(toggle).toBeVisible({ timeout: 5000 });
    await expect(contentRegion).toHaveAttribute("data-state", "open");
    await expect(
      page.getByRole("heading", { name: articleTitle }),
    ).toBeVisible({ timeout: 10000 });

    await expect
      .poll(async () => {
        const currentWidth = await getPanelWidth(contentResizablePanel);
        return Math.abs(currentWidth - initialContentWidth);
      })
      .toBeLessThan(80);
  });

  test("keeps the mobile drawer behavior unchanged", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/@${username}/articles`);

    await expect(
      page.getByRole("button", { name: /Hide Records|Show Records/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Articles" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole("link", { name: articleTitle }),
    ).toBeVisible({ timeout: 10000 });
  });
});
