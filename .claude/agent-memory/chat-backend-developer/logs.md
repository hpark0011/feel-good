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
