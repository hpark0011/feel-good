import { test, expect, type Page } from "@playwright/test";

const BETA_CLOSED_COPY =
  "Sign-ups are currently invite-only. Contact us if you'd like access.";

const SEND_OTP_ROUTE = "**/api/auth/email-otp/send-verification-otp";

function mockBetaClosedError(page: Page) {
  return page.route(SEND_OTP_ROUTE, (route) =>
    route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({
        code: "BETA_CLOSED",
        message: BETA_CLOSED_COPY,
      }),
    })
  );
}

function mockOtpSuccess(page: Page) {
  return page.route(SEND_OTP_ROUTE, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true }),
    })
  );
}

test.describe("Beta allowlist", () => {
  test("blocked signup — unlisted email shows invite-only message (US-1)", async ({
    page,
  }) => {
    await mockBetaClosedError(page);

    await page.goto("/sign-up");

    await page
      .getByTestId("auth.otp-sign-up.email-input")
      .fill("unlisted@example.com");
    await page.getByTestId("auth.otp-sign-up.submit-btn").click();

    // Assert: FormError shows the BETA_CLOSED copy
    const formError = page.getByTestId("auth.form-error");
    await expect(formError).toBeVisible({ timeout: 5000 });
    await expect(formError).toHaveText(BETA_CLOSED_COPY);

    // Assert: user does NOT advance to OTP step
    await expect(
      page.getByTestId("auth.otp-sign-up.otp-input")
    ).not.toBeVisible();
  });

  test("attacker tries sign-in route with unlisted email shows invite-only message (US-4)", async ({
    page,
  }) => {
    await mockBetaClosedError(page);

    await page.goto("/sign-in");

    await page
      .getByTestId("auth.otp-login.email-input")
      .fill("attacker@example.com");
    await page.getByTestId("auth.otp-login.submit-btn").click();

    // Assert: FormError shows the same BETA_CLOSED copy
    const formError = page.getByTestId("auth.form-error");
    await expect(formError).toBeVisible({ timeout: 5000 });
    await expect(formError).toHaveText(BETA_CLOSED_COPY);

    // Assert: user does NOT advance to OTP step
    await expect(
      page.getByTestId("auth.otp-login.otp-input")
    ).not.toBeVisible();
  });

  test("allowlisted signup — happy path advances to OTP step (US-2)", async ({
    page,
  }) => {
    await mockOtpSuccess(page);

    await page.goto("/sign-up");

    await page
      .getByTestId("auth.otp-sign-up.email-input")
      .fill("allowed@example.com");
    await page.getByTestId("auth.otp-sign-up.submit-btn").click();

    // Assert: form transitions to OTP verification step
    await expect(
      page.getByTestId("auth.otp-sign-up.otp-input")
    ).toBeVisible({ timeout: 5000 });
  });

  test("existing off-allowlist user signs in without BETA_CLOSED error (US-3)", async ({
    page,
  }) => {
    await mockOtpSuccess(page);

    await page.goto("/sign-in");

    await page
      .getByTestId("auth.otp-login.email-input")
      .fill("existing-user@example.com");
    await page.getByTestId("auth.otp-login.submit-btn").click();

    // Assert: form transitions to OTP verification step (no error)
    await expect(page.getByTestId("auth.otp-login.otp-input")).toBeVisible({
      timeout: 5000,
    });

    // Assert: no BETA_CLOSED error shown
    await expect(page.getByTestId("auth.form-error")).not.toBeVisible();
  });

  test("rejection message is identical for different unlisted emails — no user enumeration (US-6)", async ({
    page,
  }) => {
    // Both emails get the exact same mock response — the mock controls the wire
    // payload, so the response bodies are byte-identical by construction.
    // This test verifies the frontend renders the same copy for both.

    // --- First email ---
    await mockBetaClosedError(page);
    await page.goto("/sign-up");

    await page
      .getByTestId("auth.otp-sign-up.email-input")
      .fill("unknown-a@example.com");
    await page.getByTestId("auth.otp-sign-up.submit-btn").click();

    const formError = page.getByTestId("auth.form-error");
    await expect(formError).toBeVisible({ timeout: 5000 });
    const firstMessage = await formError.textContent();

    // --- Second email (navigate fresh to reset form state) ---
    // Unroute and re-route to ensure the mock is still active on a fresh page
    await page.unroute(SEND_OTP_ROUTE);
    await mockBetaClosedError(page);
    await page.goto("/sign-up");

    await page
      .getByTestId("auth.otp-sign-up.email-input")
      .fill("unknown-b@example.com");
    await page.getByTestId("auth.otp-sign-up.submit-btn").click();

    await expect(formError).toBeVisible({ timeout: 5000 });
    const secondMessage = await formError.textContent();

    // Assert: both emails produce the identical user-facing copy
    expect(firstMessage).toBe(secondMessage);
    expect(firstMessage).toBe(BETA_CLOSED_COPY);
  });
});
