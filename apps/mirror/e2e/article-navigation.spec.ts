import { expect, test } from "@playwright/test";

const username = "rick-rubin";
const articleSlug = "the-art-of-listening";
const articleTitle = "The Art of Listening";
const articleExcerpt =
  "Most people think producing music is about adding things.";
const postTitle = "Listening Before Speaking";

test.describe("Article navigation", () => {
  test("redirects the profile root to the typed article list", async ({
    page,
  }) => {
    await page.goto(`/@${username}`);

    await expect(page).toHaveURL(new RegExp(`/@${username}/articles(\\?.*)?$`));
    await expect(
      page.getByRole("link", { name: articleTitle }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("shows loading UI during list-to-detail navigation and returns to the typed list", async ({
    page,
  }) => {
    let delayedNavigation = false;

    await page.route(`**/${username}/articles/${articleSlug}*`, async (route) => {
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

    await page.goto(`/@${username}/articles`);

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

    await expect(page).toHaveURL(
      new RegExp(`/@${username}/articles(\\?.*)?$`),
    );
    await expect(articleLink).toBeVisible({ timeout: 10000 });
  });

  test("renders article detail on direct entry", async ({ page }) => {
    await page.goto(`/@${username}/articles/${articleSlug}`);

    await expect(
      page.getByRole("heading", { name: articleTitle }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(articleExcerpt)).toBeVisible({ timeout: 10000 });
  });

  test("navigates to the posts tab", async ({ page }) => {
    await page.goto(`/@${username}/articles`);

    await page.getByRole("tab", { name: "Posts" }).click();

    await expect(page).toHaveURL(new RegExp(`/@${username}/posts(\\?.*)?$`));

    const emptyState = page.getByText("No posts yet");
    const seededPostLink = page.getByRole("link", { name: postTitle });

    await Promise.race([
      emptyState.waitFor({ state: "visible", timeout: 10000 }),
      seededPostLink.waitFor({ state: "visible", timeout: 10000 }),
    ]);

    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
      return;
    }

    await expect(seededPostLink).toBeVisible({ timeout: 10000 });
    await seededPostLink.click();
    await expect(page).toHaveURL(new RegExp(`/@${username}/posts/.+`));
    await expect(
      page.getByRole("heading", { name: postTitle }),
    ).toBeVisible({ timeout: 10000 });
  });

  test("legacy slug routes no longer resolve", async ({ page }) => {
    await page.goto(`/@${username}/${articleSlug}`);

    await expect(page).toHaveURL(new RegExp(`/@${username}/${articleSlug}$`));
    await expect(page.getByText("This page could not be found.")).toBeVisible({
      timeout: 10000,
    });
  });
});
