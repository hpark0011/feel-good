/// <reference types="vite/client" />

// Env setup BEFORE importing anything that transitively pulls `convex/env.ts`.
// `auth/client.ts` imports `../env`, which throws at module-load if these are
// missing. Keep the stubs identical to the other test files in this package.
process.env.SITE_URL = process.env.SITE_URL ?? "https://test.local";
process.env.GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ?? "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET ?? "test-google-client-secret";

import { describe, expect, it, vi } from "vitest";
import { APIError } from "better-auth/api";

// Dynamic import so the top-of-file `process.env.*` assignments above run
// BEFORE `auth/client.ts` transitively loads `../env` (which validates the
// env vars at module-load). Static `import` is hoisted above the env stubs
// under ESM semantics, which would make env validation fail here.
const { runSendVerificationOtpGate } = await import("../../auth/client");

// The `components.*` / `internal.*` function references in `_generated/api`
// are Proxy objects whose identity is not guaranteed across calls — we can't
// use `ref === someImport` to classify which query was invoked. Instead, we
// rely on call ORDER: per `runSendVerificationOtpGate`, call #0 is always
// the `components.betterAuth.adapter.findOne` lookup, and call #1 (if it
// exists) is always the `internal.betaAllowlist.queries.isEmailAllowed`
// check. This mirrors the exact control flow in `auth/client.ts`.

// ---------------------------------------------------------------------------
// Strategy B — the Tier 2 gate body is extracted into
// `runSendVerificationOtpGate`. The inline `sendVerificationOTP` callback in
// `createAuth()` delegates to it. We exercise the helper with a fake
// `actionCtx` whose `runQuery` is a `vi.fn`, which lets us:
//   - assert exact query counts (NFR-01)
//   - control the existing-user-vs-unknown branching
//   - capture the thrown `APIError` and inspect `.body.code` directly
// We do not drive the real Better Auth HTTP path because convex-test has no
// action runtime and `createAuth` constructs a `betterAuth` instance that
// requires the `@convex-dev/better-auth` component to be registered against
// a live adapter. Per the spec's escape hatch, Strategy A is infeasible — we
// report Strategy B in the wave report.
// ---------------------------------------------------------------------------

const BETA_CLOSED_COPY =
  "Sign-ups are currently invite-only. Contact us if you'd like access.";

type QueryCall = { index: number; args: unknown };

/**
 * Fake actionCtx whose `runQuery` returns the Nth value from
 * `findOneThenAllowed` — index 0 is the `findOne` result (an object = user
 * exists, null = not found), index 1 is the `isEmailAllowed` result (bool).
 * If the gate makes more calls than provided, the responder throws so the
 * test fails loudly instead of returning undefined.
 */
function makeCtx(responses: ReadonlyArray<unknown>): {
  ctx: Parameters<typeof runSendVerificationOtpGate>[0];
  calls: QueryCall[];
} {
  const calls: QueryCall[] = [];
  const runQuery = vi.fn(async (_ref: unknown, args: unknown) => {
    const index = calls.length;
    calls.push({ index, args });
    if (index >= responses.length) {
      throw new Error(
        `fake runQuery: no response configured for call index ${index}`,
      );
    }
    return responses[index];
  });
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx: { runQuery: runQuery as any },
    calls,
  };
}

// Call #0 in the gate is always `components.betterAuth.adapter.findOne`.
// Call #1 (if any) is always `internal.betaAllowlist.queries.isEmailAllowed`.
function countFindOne(calls: QueryCall[]): number {
  return calls.filter((c) => c.index === 0).length;
}

function countIsEmailAllowed(calls: QueryCall[]): number {
  return calls.filter((c) => c.index === 1).length;
}

describe("sendVerificationOTP Tier 2 gate (runSendVerificationOtpGate)", () => {
  it("unlisted + unknown email throws APIError with body.code === 'BETA_CLOSED'", async () => {
    // findOne -> null (unknown), isEmailAllowed -> false (unlisted).
    const { ctx, calls } = makeCtx([null, false]);

    let caught: unknown;
    try {
      await runSendVerificationOtpGate(ctx, "ghost@example.com");
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(APIError);
    const err = caught as APIError;
    // `APIError.body` is the object passed into the constructor, spread
    // after an auto-derived code. Because we pass `code` explicitly,
    // `body.code` must be the literal string we passed.
    expect((err as unknown as { body?: { code?: string } }).body?.code).toBe(
      "BETA_CLOSED",
    );
    expect(
      (err as unknown as { body?: { message?: string } }).body?.message,
    ).toBe(BETA_CLOSED_COPY);
    // Shape guard: findOne called once (index 0), isEmailAllowed called once (index 1).
    expect(countFindOne(calls)).toBe(1);
    expect(countIsEmailAllowed(calls)).toBe(1);
  });

  it("existing Better Auth user (off-allowlist) passes through and does NOT hit isEmailAllowed", async () => {
    // findOne -> existing user doc. Second response would trip the
    // "no response configured" guard if the gate regressed and called
    // isEmailAllowed anyway, so we deliberately provide only one response.
    const { ctx, calls } = makeCtx([
      { _id: "auth_existing", email: "existing@example.com" },
    ]);

    const outcome = await runSendVerificationOtpGate(
      ctx,
      "Existing@Example.com",
    );

    expect(outcome).toBe("existing-user");
    // NFR-01 existing-user case: exactly 1 findOne, 0 isEmailAllowed.
    expect(countFindOne(calls)).toBe(1);
    expect(countIsEmailAllowed(calls)).toBe(0);
  });

  it("allowlisted + unknown email passes through (no throw)", async () => {
    // findOne -> null, isEmailAllowed -> true.
    const { ctx, calls } = makeCtx([null, true]);

    const outcome = await runSendVerificationOtpGate(
      ctx,
      "invited@example.com",
    );

    expect(outcome).toBe("allowlisted");
    // NFR-01 allowlisted-unknown case: exactly 1 findOne + 1 isEmailAllowed.
    expect(countFindOne(calls)).toBe(1);
    expect(countIsEmailAllowed(calls)).toBe(1);
  });

  it("NFR-01 query counts across all three branches", async () => {
    // Existing user — 1 findOne only.
    const existing = makeCtx([{ _id: "a", email: "a@x.com" }]);
    await runSendVerificationOtpGate(existing.ctx, "a@x.com");
    expect(countFindOne(existing.calls)).toBe(1);
    expect(countIsEmailAllowed(existing.calls)).toBe(0);

    // Allowlisted unknown — 1 findOne + 1 isEmailAllowed.
    const allowlisted = makeCtx([null, true]);
    await runSendVerificationOtpGate(allowlisted.ctx, "b@x.com");
    expect(countFindOne(allowlisted.calls)).toBe(1);
    expect(countIsEmailAllowed(allowlisted.calls)).toBe(1);

    // Unlisted unknown — 1 findOne + 1 isEmailAllowed, then throws.
    const unlisted = makeCtx([null, false]);
    await expect(
      runSendVerificationOtpGate(unlisted.ctx, "c@x.com"),
    ).rejects.toBeInstanceOf(APIError);
    expect(countFindOne(unlisted.calls)).toBe(1);
    expect(countIsEmailAllowed(unlisted.calls)).toBe(1);
  });

  it("NFR-02 / US-6: three rejection-shape inputs each produce the expected outcome; only unlisted-unknown throws BETA_CLOSED", async () => {
    // (a) unlisted + unknown — throws BETA_CLOSED.
    const a = makeCtx([null, false]);
    let errA: unknown;
    try {
      await runSendVerificationOtpGate(a.ctx, "stranger@example.com");
    } catch (e) {
      errA = e;
    }
    expect(errA).toBeInstanceOf(APIError);
    expect(
      (errA as unknown as { body?: { code?: string; message?: string } }).body,
    ).toMatchObject({ code: "BETA_CLOSED", message: BETA_CLOSED_COPY });

    // (b) allowlisted + unknown — passes through (no throw).
    const b = makeCtx([null, true]);
    await expect(
      runSendVerificationOtpGate(b.ctx, "invited@example.com"),
    ).resolves.toBe("allowlisted");

    // (c) unlisted + existing user — passes through silently (US-6 no-leak).
    const c = makeCtx([{ _id: "existing", email: "user@example.com" }]);
    await expect(
      runSendVerificationOtpGate(c.ctx, "user@example.com"),
    ).resolves.toBe("existing-user");

    // Only branch (a) throws; the error code and message are the canonical
    // FR-10 copy. No other branch leaks a different error shape.
  });
});
