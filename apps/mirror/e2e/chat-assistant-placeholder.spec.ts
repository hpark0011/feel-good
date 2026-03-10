import { expect, test, type Locator, type Page } from "@playwright/test";

const username = "rick-rubin";
const firstMessage = "Reply with exactly: ok";
const secondMessage = "Reply with exactly: hi";

async function installChatStateTracking(page: Page) {
  await page.addInitScript(() => {
    const trackedWindow = window as typeof window & {
      __pendingAssistantSeen?: boolean;
      __chatLoadingStateSeen?: boolean;
      __assistantTextSeen?: boolean;
      __pendingAssistantDroppedBeforeText?: boolean;
      __blankAssistantSeen?: boolean;
    };
    const pendingAssistantSelector = '[data-pending-assistant="true"]';
    const loadingStateSelector = '[data-slot="chat-message-loading-state"]';
    const blankAssistantSelector =
      '[data-assistant-empty="true"]:not([data-pending-assistant="true"])';
    const receivedBubbleSelector =
      '[data-slot="chat-message"][data-variant="received"] [data-slot="chat-message-bubble"]';

    trackedWindow.__pendingAssistantSeen = false;
    trackedWindow.__chatLoadingStateSeen = false;
    trackedWindow.__assistantTextSeen = false;
    trackedWindow.__pendingAssistantDroppedBeforeText = false;
    trackedWindow.__blankAssistantSeen = false;

    const markFlags = () => {
      const hasPendingAssistant = document.querySelector(pendingAssistantSelector)
        !== null;
      const hasAssistantText = Array.from(
        document.querySelectorAll(receivedBubbleSelector),
      ).some((element) => (element.textContent ?? "").trim().length > 0);

      if (hasPendingAssistant) {
        trackedWindow.__pendingAssistantSeen = true;
      }

      if (hasAssistantText) {
        trackedWindow.__assistantTextSeen = true;
      }

      if (
        trackedWindow.__pendingAssistantSeen
        && !trackedWindow.__assistantTextSeen
        && !hasPendingAssistant
      ) {
        trackedWindow.__pendingAssistantDroppedBeforeText = true;
      }

      if (document.querySelector(loadingStateSelector)) {
        trackedWindow.__chatLoadingStateSeen = true;
      }

      if (document.querySelector(blankAssistantSelector)) {
        trackedWindow.__blankAssistantSeen = true;
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
        characterData: true,
        attributeFilter: [
          "data-assistant-empty",
          "data-pending-assistant",
          "data-slot",
          "data-variant",
        ],
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
      __assistantTextSeen?: boolean;
      __pendingAssistantDroppedBeforeText?: boolean;
      __blankAssistantSeen?: boolean;
    };

    trackedWindow.__pendingAssistantSeen = false;
    trackedWindow.__chatLoadingStateSeen = false;
    trackedWindow.__assistantTextSeen = false;
    trackedWindow.__pendingAssistantDroppedBeforeText = false;
    trackedWindow.__blankAssistantSeen = false;
  });
}

async function getChatStateTracking(page: Page) {
  return page.evaluate(() => {
    const trackedWindow = window as typeof window & {
      __pendingAssistantSeen?: boolean;
      __chatLoadingStateSeen?: boolean;
      __assistantTextSeen?: boolean;
      __pendingAssistantDroppedBeforeText?: boolean;
      __blankAssistantSeen?: boolean;
    };

    return {
      pendingAssistantSeen: trackedWindow.__pendingAssistantSeen ?? false,
      chatLoadingStateSeen: trackedWindow.__chatLoadingStateSeen ?? false,
      assistantTextSeen: trackedWindow.__assistantTextSeen ?? false,
      pendingAssistantDroppedBeforeText:
        trackedWindow.__pendingAssistantDroppedBeforeText ?? false,
      blankAssistantSeen: trackedWindow.__blankAssistantSeen ?? false,
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
    await expect.poll(async () => {
      const tracking = await getChatStateTracking(page);
      return tracking.assistantTextSeen;
    }, { timeout: 30000 }).toBe(true);
    const firstSendTracking = await getChatStateTracking(page);
    expect(firstSendTracking.chatLoadingStateSeen).toBe(false);
    expect(firstSendTracking.pendingAssistantDroppedBeforeText).toBe(false);
    expect(firstSendTracking.blankAssistantSeen).toBe(false);

    await expect(textarea).toBeEnabled({ timeout: 30000 });

    await resetChatStateTracking(page);
    await sendChatMessage(textarea, secondMessage);

    await expect(page.getByText(secondMessage)).toBeVisible();
    await expect(textarea).toBeDisabled();
    await expect.poll(async () => {
      const tracking = await getChatStateTracking(page);
      return tracking.pendingAssistantSeen;
    }, { timeout: 5000 }).toBe(true);
    await expect.poll(async () => {
      const tracking = await getChatStateTracking(page);
      return tracking.assistantTextSeen;
    }, { timeout: 30000 }).toBe(true);
    const secondSendTracking = await getChatStateTracking(page);
    expect(secondSendTracking.chatLoadingStateSeen).toBe(false);
    expect(secondSendTracking.pendingAssistantDroppedBeforeText).toBe(false);
    expect(secondSendTracking.blankAssistantSeen).toBe(false);
  });
});
