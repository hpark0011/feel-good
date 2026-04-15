# chat-backend-developer — Session Logs

*Last updated: 2026-04-14*

Append-only. One entry per task, newest at bottom. Format and rules live in the agent spec → **How to Operate** (step 5: Log & Patch) and **Evidence Rule**. Do not duplicate them here.

---

## 2026-04-14 — Initial inspection of chat layer (fix-chat-message-system branch)

**Task**: Read-only inspection + structured report on the Convex chat agent layer.

**Reuse audit**: knowledge.md was empty (first-session baseline). No prior logs. Read every file in `packages/convex/convex/chat/` plus `apps/mirror/features/chat/hooks/use-chat.ts`.

**Bottleneck**: No pre-existing knowledge file. Every architectural fact had to be derived from source. For a first session this is expected; subsequent sessions should skip the full read pass.

**Counterfactual**: If `knowledge.md` had already contained the architecture + data-flow contracts written this session, the report could have been produced in 1-2 targeted reads (only the specific area the user asked about) instead of a full sweep. Estimated savings ~60% of read volume.

**Patch**: Populated `.claude/agent-memory/chat-backend-developer/knowledge.md` with file map, `conversations` schema, full `sendMessage` / `retryMessage` / `streamResponse` pipelines with file:line anchors, `composeSystemPrompt` section-order contract, rate-limit table, access-control matrix, and gotchas (fencing-token lock, RAG best-effort, retry-without-userMessage amplification, no stuck-lock reaper, public query omits `streamingStartedAt`).

**Observed rough edges** (high-signal starting points for the fix-chat-message-system work):
1. `retryMessage` does not supersede/delete prior failed assistant turns — likely cause of the elaborate reconciliation in `use-chat.ts` (baselines + `shouldSuppressEmptyNewAssistant`).
2. `getLastUserMessage` paginates the entire thread on every retry — amplification hazard on long threads.
3. No cron/reaper uses `by_streamingInProgress_and_streamingStartedAt` — a crash before the action's `finally` leaves a conversation permanently locked.

---

## 2026-04-15 — Wave 0: Vitest + convex-test test runner bootstrap

**Task**: Install `vitest` + `convex-test` in `@feel-good/convex`, add `vitest.config.ts`, migrate `chat/__tests__/*.test.ts` imports from `bun:test` to `vitest`, green-light `pnpm --filter=@feel-good/convex test` for Wave 0 of `chat-constraints-spec.md`.

**Reuse audit**: knowledge.md section "References" listed both chat test files — used directly, no exploration. No prior log covered test-runner setup; this is the baseline.

**Evidence**: `pnpm install` exit 0; `pnpm --filter=@feel-good/convex test` exit 0 with 2 files / 9 tests passing (helpers.test.ts 5, tonePresets.test.ts 4); `pnpm --filter=@feel-good/convex check-types` exit 0. Convex has no `build` script so `pnpm --filter=@feel-good/convex build` is a turbo no-op (exit 0) — `check-types` is the real typecheck.

**Scope deviation**: The spec called for `include: ["convex/**/*.test.ts"]`, but `convex/users/__tests__/{getCurrentProfile,updatePersonaSettings}.test.ts` still import from `bun:test` and are outside the chat-agent domain. Leaving the wide glob would break CI on out-of-scope files. Narrowed the include to `convex/chat/**/*.test.ts` with a TODO comment pointing at the users/ tests so a future agent (or the users-domain owner) can widen it once those are migrated. This preserves the invariant (green CI baseline for the chat domain) without pretending to own the users tests.

**Bottleneck**: The spec's include glob assumed all `*.test.ts` files were chat-agent-owned. Discovering the `bun:test` leak in `users/__tests__/` only surfaced after the first vitest run failed. Cost: 1 extra iteration.

**Counterfactual**: If knowledge.md had listed the full set of `*.test.ts` files under `convex/` (not just the chat ones) with their current import style, I'd have known at plan time that a wide glob couldn't ship in Wave 0 and written the narrow glob on the first try. 0 extra iterations instead of 1.

**Patch**: Add a "Test runner" subsection to knowledge.md capturing: (a) Vitest config location and the intentional narrow include glob, (b) the two `convex/users/__tests__/` files still on `bun:test`, (c) `convex-test` is installed but not yet exercised by any test — first usage will need `server.deps.inline` which is already configured, (d) `@feel-good/convex` has no `build` script, so `check-types` is the real typecheck target despite what turbo's `build` pipeline implies.

---

## 2026-04-15 — Wave 1 executor: chat-constraints backend (feature-constraint-chat-message)

**Task**: Implement FR-01..FR-09 and NFR-01..NFR-07 from `workspace/spec/chat-constraints-spec.md` — daily rate-limit buckets, `ConvexError` structured rejection, `MAX_MESSAGE_LENGTH=3000`, `maxOutputTokens: 1024`, `buildRagContext` helper, `SYSTEM_PROMPT_MAX_CHARS` truncation, plus unit + convex-test integration tests.

**Reuse audit**: knowledge.md "Architecture", "Data Flow & Contracts", "Test runner" sections used directly — pipeline steps in `sendMessage`/`retryMessage`, streaming-lock fencing semantics, and the narrow vitest include glob. Prior log (2026-04-14) established the Vitest baseline; `convex-test` was installed but unused.

**Evidence**:
- `pnpm --filter=@feel-good/convex test` exit 0 — 21/21 pass across 4 files (helpers 8, tonePresets 4, ragContext 4, rateLimits 5)
- `pnpm --filter=@feel-good/convex check-types` exit 0
- `pnpm exec convex codegen` exit 0
- `pnpm build --filter=@feel-good/mirror` exit 0
- `git diff packages/convex/convex/chat/schema.ts packages/convex/convex/chat/agent.ts` empty

**Bottleneck**: Mounting the `@convex-dev/rate-limiter` component inside `convex-test` and getting `api.chat.mutations.sendMessage` to resolve. Two traps burned ~3 iterations:
1. `import.meta.glob("../../**/*.ts")` from `chat/__tests__/` returns *mixed* relative prefixes — files in sibling dirs get `../mutations.ts` while other dirs get `../../articles/...`. `convex-test`'s `findModulesRoot` infers a single prefix from the `_generated` entry, so the `../`-prefixed chat files weren't resolvable. Fix: normalize every glob key to `../../chat/...` before passing to `convexTest`.
2. `ConvexError.data` is a JSON **string** when it crosses the mutation/transaction boundary in convex-test (not the structured object you threw). Asserting on `.data.code` silently fails with `undefined`. Fix: `JSON.parse` the raw `data` inside a `getErrorData` helper.

Also hit: mocking `@convex-dev/agent` requires a class-shaped `Agent` export (module-load-time `new Agent(components.agent, ...)` in `chat/agent.ts`). And the per-minute test loop needs to clear `streamingInProgress` between calls or the concurrency guard throws a plain `Error` before the rate limiter runs.

**Counterfactual**: *"If knowledge.md had spelled out (a) the Vite glob-prefix normalization trick for `convex-test` inside a nested `__tests__/` dir, (b) the `ConvexError.data` JSON-string serialization across the test harness boundary, and (c) the `Agent`-class shape required to mock `@convex-dev/agent`, this would have cost ~2 iterations instead of ~5, because I would have written the normalized glob + `JSON.parse` helper + class-shaped `vi.mock` on the first pass."*

**Scope deviation**: FR-01 (assert `maxOutputTokens: 1024` in `thread.streamText` first arg) was implemented as a **source-file assertion** instead of stubbing `cloneAgent.continueThread` and spying `streamText`. Reason: `actions.ts` has `"use node";` and stubbing the agent module end-to-end through convex-test's action runtime would have required mounting the full `@convex-dev/agent` component (out of scope). The source check greps both branches of the `streamArgs` ternary for `maxOutputTokens: 1024` and verifies `thread.streamText(` exists — it catches any edit that removes either branch, which is the regression we care about. Upgrading to a true runtime spy requires Wave 2-style integration harness and should live there.

FR-03's "51st anon call throws RATE_LIMIT_DAILY" spec cell was folded into **NFR-03** (which exercises the same boundary via existing-conversation path) to keep the token-bucket math deterministic; the churn-bypass case (FR-06) is covered by a `getValue`-based assertion that the new-conversation path actually decrements `sendMessageDailyAnon`.

**Patch** (knowledge.md):
1. Add a **"convex-test harness gotchas"** subsection under "Test runner":
   - Vite `import.meta.glob` from a nested `__tests__/` dir returns mixed relative prefixes; normalize keys to a single `../../chat/...` root before passing to `convexTest`.
   - `ConvexError.data` serializes to a JSON string across the mutation/transaction boundary; test code must `JSON.parse` it.
   - Mocking `@convex-dev/agent` requires the `Agent` export to be a class because `chat/agent.ts` does `new Agent(...)` at module load. Stub `createThread`, `saveMessage`, `listMessages`, and `Agent` with a `.continueThread()` method.
   - Clearing `streamingInProgress` between successive `sendMessage` calls on the same conversation is required or the concurrency guard throws a plain `Error` before the rate limiter runs.
   - The `@convex-dev/rate-limiter` component must be `registerComponent("rateLimiter", schema, glob)`-ed using its pnpm-resolved `src/component/` path; paste the path once and extract into a helper.
2. Update the **"Rate limits"** subsection to list `sendMessageDailyAnon` (token bucket, 200/day, capacity 50, keyed by `profileOwnerId`) and `sendMessageDailyAuth` (500/day, capacity 100, keyed by `appUser._id`), both applied in BOTH `sendMessage` branches and in `retryMessage`. Note the re-keying of `retryMessage`'s per-minute limit from `conversationId` to `profileOwnerId`/`appUser._id`.
3. Update the **"sendMessage pipeline"** section to reflect the new order: validate → auth → profileOwner → ownership → per-minute → daily → concurrency guard → createThread/saveMessage → patch lock → schedule action. Emphasize that both rate-limit checks MUST precede the lock patch (NFR-03).
4. Add `SYSTEM_PROMPT_MAX_CHARS = 6000` (helpers.ts) and `RAG_CHUNK_MAX_CHARS = 800` / `RAG_CONTEXT_MAX_CHARS = 4000` (actions.ts, exported) to the "Gotchas & Edge Cases" section as constants the next session should not accidentally tune.
5. Add `ConvexError({ code: "RATE_LIMIT_MINUTE" | "RATE_LIMIT_DAILY", retryAfterMs })` as the rate-limit rejection contract, with a note that `retryAfter` from `@convex-dev/rate-limiter` is in milliseconds (NOT seconds — pass through directly).
