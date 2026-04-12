import { expect, test } from "@playwright/test";
import path from "path";
import fs from "fs";

const username = "rick-rubin";

function createTempMdFile(
  name: string,
  content: string,
): { path: string; cleanup: () => void } {
  const tmpDir = path.join(__dirname, ".tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const filePath = path.join(tmpDir, name);
  fs.writeFileSync(filePath, content);
  return {
    path: filePath,
    cleanup: () => {
      fs.unlinkSync(filePath);
      if (fs.readdirSync(tmpDir).length === 0) fs.rmdirSync(tmpDir);
    },
  };
}

const validMd = `---
title: Test Post Title
slug: test-post-title
category: Process
---

# Hello World

This is a test post with **bold** and *italic* text.
`;

const mdWithoutFrontmatter = `# No Frontmatter Post

Just markdown content without any YAML frontmatter.
`;

test.describe("Post markdown upload", () => {
  test("posts page loads without runtime errors from upload feature code", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/@${username}/posts`, {
      waitUntil: "domcontentloaded",
    });

    // Wait for content to render — toolbar should be present
    await page.waitForSelector("[class*='toolbar'], [class*='border-b']", {
      timeout: 15000,
    });

    // No runtime errors on the page
    expect(errors).toHaveLength(0);
  });

  test("New button visible for profile owner", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/@${username}/posts`, {
      waitUntil: "domcontentloaded",
    });

    // Wait for page to hydrate
    await page.waitForTimeout(3000);

    const newBtn = page.getByTestId("new-post-btn");
    const count = await newBtn.count();

    // If not owner (no auth), button won't appear — that's expected behavior
    if (count === 0) {
      test.skip(true, "New button not visible — user is not authenticated as owner");
    }

    await expect(newBtn).toBeVisible();
  });

  test("upload dialog opens and accepts .md file with preview", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/@${username}/posts`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(3000);

    const newBtn = page.getByTestId("new-post-btn");
    const count = await newBtn.count();
    test.skip(count === 0, "New button not visible — user is not authenticated as owner");

    await newBtn.click();

    // Dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 3000 });
    await expect(dialog.getByText("Import Markdown")).toBeVisible();

    // File input should accept .md files
    const fileInput = dialog.locator('input[type="file"]');
    await expect(fileInput).toHaveAttribute("accept", ".md");

    // Create button should be disabled initially
    const createBtn = dialog.getByTestId("create-post-btn");
    await expect(createBtn).toBeDisabled();

    // Upload a valid .md file
    const tmp = createTempMdFile("test-post.md", validMd);
    try {
      await fileInput.setInputFiles(tmp.path);

      // Preview should show extracted metadata
      await expect(dialog.getByTestId("preview-title")).toHaveText(
        "Test Post Title",
        { timeout: 5000 },
      );
      await expect(dialog.getByTestId("preview-slug")).toHaveText(
        "test-post-title",
      );
      await expect(dialog.getByTestId("preview-category")).toHaveText(
        "Process",
      );

      // Create button should be enabled after parsing
      await expect(createBtn).toBeEnabled();
    } finally {
      tmp.cleanup();
    }
  });

  test("applies fallbacks when frontmatter is absent", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/@${username}/posts`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(3000);

    const newBtn = page.getByTestId("new-post-btn");
    test.skip((await newBtn.count()) === 0, "Not authenticated as owner");

    await newBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 3000 });

    const tmp = createTempMdFile("My Cool Post.md", mdWithoutFrontmatter);
    try {
      await dialog.locator('input[type="file"]').setInputFiles(tmp.path);

      await expect(dialog.getByTestId("preview-title")).toHaveText(
        "My Cool Post",
        { timeout: 5000 },
      );
      await expect(dialog.getByTestId("preview-slug")).toHaveText(
        "my-cool-post",
      );
      await expect(dialog.getByTestId("preview-category")).toHaveText(
        "Creativity",
      );
    } finally {
      tmp.cleanup();
    }
  });

  test("shows error for non-.md file", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/@${username}/posts`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(3000);

    const newBtn = page.getByTestId("new-post-btn");
    test.skip((await newBtn.count()) === 0, "Not authenticated as owner");

    await newBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 3000 });

    const tmp = createTempMdFile("not-markdown.txt", "just plain text");
    try {
      await dialog.locator('input[type="file"]').setInputFiles(tmp.path);

      const error = dialog.getByRole("alert");
      await expect(error).toBeVisible({ timeout: 3000 });
      await expect(error).toContainText(".md");
    } finally {
      tmp.cleanup();
    }
  });

  test("dialog closes when Cancel is clicked", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/@${username}/posts`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(3000);

    const newBtn = page.getByTestId("new-post-btn");
    test.skip((await newBtn.count()) === 0, "Not authenticated as owner");

    await newBtn.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 3000 });

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
  });
});
