import { expect, test, type Locator, type Page } from "@playwright/test";

const username = "rick-rubin";
const firstMessage = "Reply with exactly: ok";
const secondMessage = "Reply with exactly: hi";

async function installChatStateTracking(page: Page) {
  await page.addInitScript(() => {
    const trackedWindow = window as typeof window & {
      __pendingAssistantSeen?: boolean;
      __chatLoadingStateSeen?: boolean;
    };
    const pendingAssistantSelector = '[data-pending-assistant="true"]';
    const loadingStateSelector = '[data-slot="chat-message-loading-state"]';

    trackedWindow.__pendingAssistantSeen = false;
    trackedWindow.__chatLoadingStateSeen = false;

    const markFlags = () => {
      if (document.querySelector(pendingAssistantSelector)) {
        trackedWindow.__pendingAssistantSeen = true;
      }

      if (document.querySelector(loadingStateSelector)) {
        trackedWindow.__chatLoadingStateSeen = true;
      }
    };

    const startObserver = () => {
      markFlags();

      const observer = new MutationObserver(() => {
        markFlags();
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-pending-assistant", "data-slot"],
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startObserver, {
        once: true,
      });
    } else {
      startObserver();
    }
  });
}

async function resetChatStateTracking(page: Page) {
  await page.evaluate(() => {
    const trackedWindow = window as typeof window & {
      __pendingAssistantSeen?: boolean;
      __chatLoadingStateSeen?: boolean;
    };

    trackedWindow.__pendingAssistantSeen = false;
    trackedWindow.__chatLoadingStateSeen = false;
  });
}

async function getChatStateTracking(page: Page) {
  return page.evaluate(() => {
    const trackedWindow = window as typeof window & {
      __pendingAssistantSeen?: boolean;
      __chatLoadingStateSeen?: boolean;
    };

    return {
      pendingAssistantSeen: trackedWindow.__pendingAssistantSeen ?? false,
      chatLoadingStateSeen: trackedWindow.__chatLoadingStateSeen ?? false,
    };
  });
}

async function openChat(page: Page) {
  await page.goto(`/@${username}?chat=1`);

  const textarea = page.locator('textarea[placeholder^="Message "]');
  await expect(textarea).toBeVisible({ timeout: 10000 });

  return textarea;
}

async function sendChatMessage(textarea: Locator, message: string) {
  await textarea.fill(message);
  await textarea.press("Enter");
}

test.describe("Chat assistant placeholder", () => {
  test("shows the assistant placeholder immediately on first and subsequent sends", async ({
    page,
  }) => {
    await installChatStateTracking(page);

    const textarea = await openChat(page);

    await resetChatStateTracking(page);
    await sendChatMessage(textarea, firstMessage);

    await expect(page.getByText(firstMessage)).toBeVisible();
    await expect(textarea).toBeDisabled();
    await expect.poll(async () => {
      const tracking = await getChatStateTracking(page);
      return tracking.pendingAssistantSeen;
    }, { timeout: 5000 }).toBe(true);
    await expect(page).toHaveURL(new RegExp(`/@${username}.*[?&]conversation=`));

    await page.waitForTimeout(1500);
    const firstSendTracking = await getChatStateTracking(page);
    expect(firstSendTracking.chatLoadingStateSeen).toBe(false);

    await expect(textarea).toBeEnabled({ timeout: 30000 });

    await resetChatStateTracking(page);
    await sendChatMessage(textarea, secondMessage);

    await expect(page.getByText(secondMessage)).toBeVisible();
    await expect(textarea).toBeDisabled();
    await expect.poll(async () => {
      const tracking = await getChatStateTracking(page);
      return tracking.pendingAssistantSeen;
    }, { timeout: 5000 }).toBe(true);

    await page.waitForTimeout(1500);
    const secondSendTracking = await getChatStateTracking(page);
    expect(secondSendTracking.chatLoadingStateSeen).toBe(false);
  });
});
