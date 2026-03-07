import { expect, test } from "@playwright/test";

const username = "rick-rubin";
const articleSlug = "the-art-of-listening";
const articleTitle = "The Art of Listening";
const articleExcerpt =
  "Most people think producing music is about adding things.";

test.describe("Article navigation", () => {
  test("shows loading UI during list-to-detail navigation and returns to the list", async ({
    page,
  }) => {
    let delayedNavigation = false;

    await page.route(`**/${username}/${articleSlug}*`, async (route) => {
      const headers = route.request().headers();
      const isPrefetch =
        headers["next-router-prefetch"] !== undefined ||
        headers.purpose === "prefetch";

      if (!delayedNavigation && !isPrefetch) {
        delayedNavigation = true;
        await new Promise((resolve) => setTimeout(resolve, 700));
      }

      await route.continue();
    });

    await page.goto(`/@${username}`);

    const articleLink = page.getByRole("link", { name: articleTitle });
    await expect(articleLink).toBeVisible({ timeout: 10000 });

    await articleLink.click();

    await expect(page.getByTestId("article-detail-loading")).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole("heading", { name: articleTitle }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(articleExcerpt)).toBeVisible({ timeout: 10000 });

    await page.getByRole("link", { name: "Back" }).click();

    await expect(page).toHaveURL(new RegExp(`/@${username}(\\?.*)?$`));
    await expect(articleLink).toBeVisible({ timeout: 10000 });
  });

  test("renders article detail on direct entry", async ({ page }) => {
    await page.goto(`/@${username}/${articleSlug}`);

    await expect(
      page.getByRole("heading", { name: articleTitle }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(articleExcerpt)).toBeVisible({ timeout: 10000 });
  });
});
