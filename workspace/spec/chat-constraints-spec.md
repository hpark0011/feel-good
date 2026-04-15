# Chat Message Constraints — Spec

## Overview

Harden the Mirror chat layer against uncapped Anthropic API spend. Today `packages/convex/convex/chat/` has per-minute rate limits and a 4000-char input cap but no output-token ceiling, no daily bucket, and no bound on RAG context size — a single anon session can sustain unbounded calls. This spec caps output tokens, adds daily rate-limit buckets, tightens input length, bounds RAG context, and surfaces structured rate-limit errors so the UI can distinguish burst vs daily exhaustion.

## Requirements

### Functional Requirements

| ID    | Requirement | Priority | Verification |
| ----- | ----------- | -------- | ------------ |
| FR-01 | `thread.streamText` call in `actions.ts` passes `maxOutputTokens: 1024` to cap Anthropic output spend per turn. | p0 | Unit test asserts the first arg to `thread.streamText` includes `maxOutputTokens: 1024` (spy/mock `cloneAgent.continueThread`). |
| FR-02 | `MAX_MESSAGE_LENGTH` in `mutations.ts` is `3000`; messages > 3000 chars throw `"Message exceeds 3000 character limit"`. | p0 | Unit test: calling `sendMessage` with a 3001-char body throws with the exact message; 3000-char body does not throw on length. |
| FR-03 | New `sendMessageDailyAnon` rate-limit bucket: **token bucket**, `rate: 200` tokens per 24h, `capacity: 50` (burst cap), keyed by `profileOwnerId`. Applied in `sendMessage` (both new-conversation AND existing-conversation branches) when no authenticated `appUser`, AND in `retryMessage` when no `appUser`. | p0 | Integration test via `convex-test`: 51st anon call in rapid succession throws `RATE_LIMIT_DAILY`; after simulated 24h via `vi.useFakeTimers`, budget is fully refilled. |
| FR-04 | New `sendMessageDailyAuth` rate-limit bucket: **token bucket**, `rate: 500` tokens per 24h, `capacity: 100` burst, keyed by `appUser._id`. Applied in `sendMessage` (both branches) and `retryMessage` when authenticated. | p0 | Integration test: an authenticated user can send the full burst capacity (100 calls) without rejection, then the daily bucket trips with `RATE_LIMIT_DAILY` within the next ~20 calls (token-bucket refill at 1 token / ~172s means calls 101–104 may legitimately pass on refilled tokens before exhaustion — the test asserts the eventual `RATE_LIMIT_DAILY` rejection, not an exact-boundary throw). |
| FR-05 | `retryMessage`'s existing per-minute limit is re-keyed to `profileOwnerId` (anon) / `appUser._id` (auth) — matching `sendMessage` — so retries on a fresh conversation cannot bypass daily caps by key-switching. | p0 | Integration test: anon exhausts daily cap via `sendMessage` on conversation A, then `retryMessage` on a fresh conversation B for the same `profileOwnerId` throws `RATE_LIMIT_DAILY`. |
| FR-06 | Daily bucket is checked in addition to (not replacing) the existing per-minute bucket; both must pass. New-conversation path ALSO checks the daily `sendMessage` bucket before `createThread` to prevent churn bypass. | p0 | Integration test: daily unreached but 11 per-minute calls throws `RATE_LIMIT_MINUTE` on the 11th; per-minute unreached but daily exhausted throws `RATE_LIMIT_DAILY`; new-conversation churn (3/min × 24h) trips daily cap after 200 calls, not 4320. |
| FR-07 | Rate-limit rejections throw `ConvexError` with `{ code: "RATE_LIMIT_MINUTE" \| "RATE_LIMIT_DAILY", retryAfterMs: number }`. `retryAfterMs` is passed through directly from `@convex-dev/rate-limiter`'s `retryAfter` field (which is already in milliseconds — do NOT convert). | p0 | Integration test asserts `ConvexError.data.code` and that `retryAfterMs > 0` on rejection. |
| FR-08 | `ragContext` injected in `actions.ts` is bounded: `RAG_RESULT_LIMIT` stays at 5, and each chunk's text is truncated to a new constant `RAG_CHUNK_MAX_CHARS = 800`; total concatenated `ragContext` is capped at `RAG_CONTEXT_MAX_CHARS = 4000`. | p0 | Unit test on a helper `buildRagContext(chunks)` confirms: chunk truncation to 800 chars, total string ≤ 4000 chars, deterministic ordering. |
| FR-09 | `composeSystemPrompt` output is capped at `SYSTEM_PROMPT_MAX_CHARS = 6000` by truncating the persona/bio/topics sections proportionally when total would exceed it. Safety prefix and tone clause are never truncated. | p1 | Unit test in `helpers.test.ts`: feeding oversize persona/bio returns ≤ 6000 chars and preserves the safety-prefix substring verbatim at the start. |
| FR-10 | Frontend `use-chat.ts` maps `ConvexError` with `code === "RATE_LIMIT_DAILY"` to a distinct user-facing message ("You've hit today's chat limit. Try again tomorrow.") separate from the per-minute "sending too quickly" copy. | p1 | Playwright test: force the daily bucket to exhaust (via test-only Convex helper) and assert the chat input shows the distinct daily-limit copy. |

### Non-functional Requirements

| ID     | Requirement | Priority | Verification |
| ------ | ----------- | -------- | ------------ |
| NFR-01 | No schema change: all new limits are global constants in `rateLimits.ts` / `actions.ts`; `conversations` table is untouched. | p0 | `git diff packages/convex/convex/chat/schema.ts` shows zero changes; `pnpm exec convex codegen` produces no diff beyond function signatures. |
| NFR-02 | Existing per-minute buckets (`sendMessage` 10/min, `createConversation` 3/min, `retryMessage` 5/min) remain unchanged. | p0 | Diff of `rateLimits.ts` shows additions only; existing three bucket definitions are byte-identical. |
| NFR-03 | Streaming lock invariant preserved: daily-cap rejection throws strictly before `streamingInProgress` is patched, so no stale lock state. | p0 | Unit test: mock rate limiter to throw daily-cap error, call `sendMessage`, assert `ctx.db.patch` was never called with `streamingInProgress: true`. |
| NFR-04 | Sonnet remains the production model; no change to `LLM_PROVIDER`/`LLM_MODEL` env resolution in `agent.ts`. | p0 | Diff of `agent.ts` shows no change to `getLanguageModel` or default model constants. |
| NFR-05 | `pnpm --filter=@feel-good/convex check-types` and `pnpm build --filter=@feel-good/mirror` exit 0 after changes. (Note: `@feel-good/convex` has no `build` script — `check-types` is the real typecheck via `tsc --noEmit -p convex/tsconfig.json`.) | p0 | CI output. |
| NFR-06 | `pnpm --filter=@feel-good/convex test` (new script running Vitest) passes all migrated and new `chat/__tests__`. | p0 | Test runner exit code. |
| NFR-07 | Existing `helpers.test.ts` and `tonePresets.test.ts` assertions remain semantically identical after migrating their imports from `bun:test` → `vitest`. | p0 | Before/after diff shows only the import line and (if any) assertion-API rename; no test case added or removed; all original cases still pass. |

## Architecture

**Data flow (unchanged except marked)**:

1. Client → `chat.mutations.sendMessage` (mutation)
2. Validate input length (3000 cap) → auth lookup → profile-owner check → conversation-ownership check
3. **NEW**: `chatRateLimiter.limit(ctx, "sendMessage", …)` (per-minute, existing) THEN `chatRateLimiter.limit(ctx, "sendMessageDailyAnon" | "sendMessageDailyAuth", …)` — both with `throws: false`, check `.ok`, throw `ConvexError` with structured code on rejection
4. Streaming-lock check → `saveMessage` → patch `streamingInProgress = true` → schedule `streamResponse`
5. `streamResponse` (internal action): load context → build RAG context via **NEW** `buildRagContext()` helper (bounded) → call `thread.streamText({ ..., maxOutputTokens: 1024 })` → `finally { clearStreamingLock }`

`retryMessage` mirrors steps 3 (minute + daily) and re-uses the same structured-error path.

### Files to create

| File | Purpose |
| ---- | ------- |
| `packages/convex/convex/chat/__tests__/rateLimits.test.ts` | `convex-test` integration tests for daily-bucket behavior, structured errors, key unification, new-conversation churn, streaming-lock invariant (FR-01 – FR-07, NFR-03). |
| `packages/convex/convex/chat/__tests__/ragContext.test.ts` | Unit tests for the pure `buildRagContext` helper (FR-08). |
| `packages/convex/vitest.config.ts` | Vitest config for the Convex package. Node environment, includes `convex/**/*.test.ts`, enables fake timers for rate-limit tests. |
| `packages/convex/convex/chat/testHelpers.ts` | `internalMutation` exports used by Playwright E2E to pre-fill a rate-limit bucket. Registered as `internal*` (not public) so it is not reachable from the browser regardless of deploy env. |

### Files to modify

| File | Change |
| ---- | ------ |
| `packages/convex/convex/chat/rateLimits.ts` | Add `sendMessageDailyAnon` (200/day fixed window) and `sendMessageDailyAuth` (500/day fixed window). |
| `packages/convex/convex/chat/mutations.ts` | Set `MAX_MESSAGE_LENGTH = 3000`; add daily-bucket calls (anon → `profileOwnerId`, auth → `appUser._id`) with `throws: false`, and translate both per-minute AND daily rejections into `ConvexError({ code, retryAfterMs })`. Apply daily bucket in BOTH the new-conversation and existing-conversation branches of `sendMessage`. Apply the same pattern in `retryMessage` AND re-key `retryMessage`'s existing per-minute limit to `profileOwnerId`/`appUser._id` (currently `conversationId` for anon — see mutations.ts:173). |
| `packages/convex/convex/chat/actions.ts` | Add `RAG_CHUNK_MAX_CHARS`, `RAG_CONTEXT_MAX_CHARS`; factor RAG string assembly into `buildRagContext(chunks)` helper (exported for tests); pass `maxOutputTokens: 1024` as a field on the first arg object to `thread.streamText`. |
| `packages/convex/convex/chat/helpers.ts` | Add `SYSTEM_PROMPT_MAX_CHARS = 6000` and truncate persona/bio/topics in `composeSystemPrompt` when over budget, preserving safety prefix + tone clause (FR-09). |
| `packages/convex/convex/chat/__tests__/helpers.test.ts` | Migrate imports from `bun:test` → `vitest` (`describe`, `it`, `expect`). Add cases for FR-09 (safety prefix preserved, total ≤ 6000). |
| `packages/convex/convex/chat/__tests__/tonePresets.test.ts` | Migrate imports from `bun:test` → `vitest`. No test-case changes. |
| `packages/convex/package.json` | Add `"test": "vitest run"` script; add `vitest` and `convex-test` to `devDependencies`. |
| `apps/mirror/features/chat/hooks/use-chat.ts` | In the `catch` branch, detect `ConvexError` with `data.code === "RATE_LIMIT_DAILY"` and set distinct `sendError` copy (FR-10). |

### Dependencies

- **Add**: `vitest` and `convex-test` (dev dependencies in `packages/convex/package.json`). Vitest is the single runner for this package going forward; `convex-test` is required to exercise rate-limiter state machines and mutation handlers in-process.
- `@convex-dev/rate-limiter` already supports token-bucket with arbitrary `rate`, `period`, `capacity`; `convex/values` already exports `ConvexError`.

## Tests

**Single runner: Vitest.** The existing `helpers.test.ts` and `tonePresets.test.ts` currently import from `"bun:test"` but are not wired into any script in `packages/convex/package.json` (verified: no `"test"` script exists today), so there is zero CI migration cost. Migrate both files by swapping the import line from `"bun:test"` → `"vitest"` — the `describe`/`it`/`expect` APIs are compatible for the cases in those files.

Rationale for Vitest over Bun: `convex-test` runs natively in Vitest and supports `vi.useFakeTimers()` for time-advancing rate-limit tests. Maintaining two runners (Bun for pure, Vitest for integration) would duplicate config and split CI discoverability for no benefit, since no existing script pins us to Bun.

### Unit tests (Vitest, no Convex harness needed)

| Test File | Test Case | Verifies |
| --------- | --------- | -------- |
| `packages/convex/convex/chat/__tests__/ragContext.test.ts` | chunk > 800 chars truncated to 800 | FR-08 |
| `packages/convex/convex/chat/__tests__/ragContext.test.ts` | 5 max-size chunks produce `ragContext.length ≤ 4000` | FR-08 |
| `packages/convex/convex/chat/__tests__/ragContext.test.ts` | ordering is deterministic (input order preserved) | FR-08 |
| `packages/convex/convex/chat/__tests__/helpers.test.ts` | oversize persona still yields `composeSystemPrompt` output ≤ 6000 | FR-09 |
| `packages/convex/convex/chat/__tests__/helpers.test.ts` | safety prefix substring is unchanged at start after truncation | FR-09 |
| `packages/convex/convex/chat/__tests__/helpers.test.ts` | section order unchanged when under-budget | FR-09 |

### Integration tests (Vitest + convex-test)

| Test File | Test Case | Verifies |
| --------- | --------- | -------- |
| `packages/convex/convex/chat/__tests__/rateLimits.test.ts` | anon token bucket: 50th call passes, 51st throws `RATE_LIMIT_DAILY` | FR-03 |
| same file | anon bucket refills after `vi.advanceTimersByTime(24h)` | FR-03 |
| same file | auth token bucket: 100th passes, 101st throws `RATE_LIMIT_DAILY` | FR-04 |
| same file | anon exhausts on conversation A, retry on conversation B same `profileOwnerId` throws | FR-05 |
| same file | new-conversation branch consumes daily bucket (churn-attack path) | FR-06 |
| same file | 11 calls in 1 minute throws `RATE_LIMIT_MINUTE` (not `RATE_LIMIT_DAILY`) | FR-06, FR-07 |
| same file | thrown `ConvexError.data` has `code` and positive `retryAfterMs` | FR-07 |
| same file | rate-limit rejection does NOT patch `streamingInProgress: true` (observe db state via `convex-test` query helper) | NFR-03 |
| same file | 3001-char message rejected before any rate-limit call | FR-02 |
| same file | stub `cloneAgent.continueThread`; assert `thread.streamText` first-arg contains `maxOutputTokens: 1024` | FR-01 |

`convex-test` supports `vi.useFakeTimers()`-driven time advancement, which is how the daily-refill cases are exercised without real 24h waits.

## Playwright E2E Tests

| Test File | Scenario | Verifies |
| --------- | -------- | -------- |
| `apps/mirror/e2e/chat-rate-limit.spec.ts` | Anon visitor sends messages until daily cap exhausted via a test-only Convex mutation that pre-fills the bucket; next send shows "You've hit today's chat limit" copy in the chat input error region. | FR-10 |
| `apps/mirror/e2e/chat-rate-limit.spec.ts` | Message longer than 3000 chars surfaces "Message exceeds 3000 character limit" in the error region; 3000-char message sends successfully. | FR-02 |

E2E uses Playwright CLI (`.claude/rules/testing.md`). The test-only "pre-fill bucket" helper lives in `packages/convex/convex/chat/testHelpers.ts` and is registered as an **`internalMutation`** — it cannot be called from the browser and does not rely on a runtime env-var check. The Playwright test invokes it through a server-side route under `apps/mirror/app/api/__test__/` that is itself gated by a shared secret (`E2E_TEST_SECRET`), so the helper is unreachable from the production frontend.

## Anti-patterns to Avoid

- **Do not inline ad-hoc throttling** inside `mutations.ts` or `actions.ts`. All throttling lives in `rateLimits.ts` (see chat-backend-developer agent spec, Guiding Principles).
- **Do not throw generic `Error`** for rate-limit rejections — the frontend already string-matches, and we're replacing that brittle path with a structured `ConvexError` discriminator.
- **Do not move the daily-bucket check after the streaming-lock patch.** Stale-lock risk. Check before `ctx.db.patch({ streamingInProgress: true })`.
- **Do not touch `composeSystemPrompt` section order.** Only truncate within sections; the safety prefix → tone → bio → persona → topics order is load-bearing and covered by existing tests.
- **Do not change `LLM_PROVIDER`/`LLM_MODEL` defaults.** Sonnet stays.
- **Do not add a schema change.** Daily limits are enforced via the rate-limiter component's own state, not a field on `conversations` or `users`.
- **Do not bump `RAG_RESULT_LIMIT`.** Keep at 5; bound per-chunk and total instead.
- **Do not skip `pnpm exec convex codegen`** after touching function signatures — required by `.claude/rules/convex.md`.

Every step pairs an Executor with independent Critique agents. Critique runs in a separate context window on the executor's diff — never self-review. Rationale: self-evaluation is systematically biased toward praise; an external evaluator is the load-bearing mechanism. See https://www.anthropic.com/engineering/harness-design-long-running-apps.

```
Step 1 — Backend constraints + tests
Executor: chat-backend-developer (.claude/agents/chat-backend-developer.md)
Critique: code-review-correctness + code-review-tests + code-review-concurrency
  - code-review-correctness: rate-limit branch logic (both sendMessage branches + retryMessage), ConvexError shape, key unification in retryMessage, MAX_MESSAGE_LENGTH boundary behavior
  - code-review-tests: convex-test integration suite actually proves FR-03…FR-07 (boundary calls, fake timers, churn path, structured error assertions); migrated Bun → Vitest files are byte-equal except imports (NFR-07)
  - code-review-concurrency: streaming-lock invariant (NFR-03) — daily-cap rejection throws strictly before streamingInProgress is patched
Tasks:
  1. Wire test runner: add `vitest` + `convex-test` dev deps; add `"test": "vitest run"` to packages/convex/package.json; add packages/convex/vitest.config.ts; migrate helpers.test.ts + tonePresets.test.ts imports from "bun:test" → "vitest" (no assertion changes)
  2. Add daily buckets (token bucket) in rateLimits.ts
  3. Update MAX_MESSAGE_LENGTH=3000, add ConvexError structured throws, wire daily buckets into sendMessage (both branches) + retryMessage, re-key retryMessage per-minute limit to profileOwnerId/appUser._id (mutations.ts)
  4. Add RAG_CHUNK_MAX_CHARS + RAG_CONTEXT_MAX_CHARS, buildRagContext helper (exported), maxOutputTokens: 1024 on streamText (actions.ts)
  5. Add SYSTEM_PROMPT_MAX_CHARS=6000 truncation in helpers.ts (preserve safety prefix + tone)
  6. Write __tests__/rateLimits.integration.test.ts (convex-test) and __tests__/ragContext.test.ts; extend helpers.test.ts with FR-09 cases
  7. Run `pnpm exec convex codegen` then `pnpm build --filter=@feel-good/convex` then `pnpm --filter=@feel-good/convex test`
Handoff: critique agents review the executor's diff; executor addresses all Critical findings before Step 2 begins.
Verification: all tests pass (migrated + new); build exit 0; streaming-lock regression check (NFR-03) green; diff of `helpers.test.ts` / `tonePresets.test.ts` shows only the import line changed (NFR-07); critique findings resolved.

Step 2 — Frontend error copy
Executor: general (small change in apps/mirror/features/chat/hooks/use-chat.ts)
Critique: code-review-correctness + code-review-convention
  - code-review-correctness: ConvexError.data.code discrimination handles the non-ConvexError branch and the unknown-code branch without regressing the existing per-minute copy
  - code-review-convention: copy strings placed consistent with existing error-message conventions in use-chat.ts
Tasks:
  1. Branch on ConvexError data.code for RATE_LIMIT_DAILY vs RATE_LIMIT_MINUTE
  2. Add distinct copy strings
Handoff: critique agents review the executor's diff before Step 3.
Verification: `pnpm build --filter=@feel-good/mirror` exit 0; critique findings resolved.

Step 3 — E2E test + test helper
Executor: general
Critique: code-review-tests + code-review-security
  - code-review-tests: Playwright spec actually exercises the daily-cap path and the 3000-char path end-to-end from user perspective (not internal state checks)
  - code-review-security: internalMutation bucket-prefill helper is unreachable from the browser; the E2E_TEST_SECRET-gated Next route rejects unauthenticated/unsigned calls; secret not leaked to client bundle
Tasks:
  1. Add testHelpers.ts with an `internalMutation` bucket-prefill (not reachable from the browser)
  2. Add apps/mirror/app/api/__test__/ route gated by E2E_TEST_SECRET that invokes the internalMutation
  3. Write apps/mirror/e2e/chat-rate-limit.spec.ts
Handoff: critique agents review the executor's diff before reporting done.
Verification: `pnpm --filter=@feel-good/mirror test:e2e -- chat-rate-limit` passes; critique findings resolved.
```

No new agents needed. `chat-backend-developer` owns `packages/convex/convex/chat/**` per its own spec.

## Open Questions

None. User answered all clarifying questions: 1024 output tokens, daily anon (200) + auth (500) caps via token bucket, 3000-char input, keep Sonnet, global constants.

`@convex-dev/rate-limiter`'s `limit({ throws: false })` returns `retryAfter` in **milliseconds** (confirmed from `@convex-dev/rate-limiter` type definitions during adversarial review). Pass through directly as `retryAfterMs` — do not convert.

## Adversarial Review Summary

**Stop reason**: quality bar met on iteration 1 after accepting all Critical and Important concerns.

| Concern | Severity | Resolution |
| ------- | -------- | ---------- |
| Rate-limit unit tests untestable in Bun (no Convex harness for live component). | Critical | **Accepted** — added `convex-test` dev dep, split into Bun unit suite (pure helpers) + Vitest integration suite (`rateLimits.integration.test.ts`). |
| `retryMessage` per-minute key is `conversationId` (anon) today — daily bucket would be bypassable via fresh conversations. | Critical | **Accepted** — FR-05 now mandates re-keying `retryMessage`'s existing per-minute limit to `profileOwnerId`/`appUser._id` to match `sendMessage`, and the daily bucket uses the same key. |
| `createConversation` (new-conversation path) has no daily cap — 3/min × 24h = 4320 calls/day bypass. | Important | **Accepted** — FR-06 now requires the daily `sendMessage*` bucket to run in BOTH the new-conversation and existing-conversation branches of `sendMessage`, before `createThread`. |
| Fixed-window daily cap permits full-burst consumption in minutes. | Important | **Accepted** — switched FR-03/FR-04 from fixed-window to token bucket with `capacity` set to 25% of daily rate (anon 50, auth 100) to cap burst while preserving sustained ceiling. |
| `retryAfter` unit ambiguity deferred to implementation. | Important | **Accepted** — closed in spec: it's milliseconds, pass through directly. |
| `testHelpers.ts` guarded only by `NODE_ENV` env var. | Minor | **Accepted** — registered as `internalMutation` (not reachable from browser) and fronted by a secret-gated API route for Playwright. |

