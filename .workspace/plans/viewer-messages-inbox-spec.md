# Viewer Messages Inbox Spec

## Overview

Mirror needs a viewer-scoped inbox so authenticated readers can see every chat conversation they have started across all authors, instead of only seeing conversations while visiting a single `@username` profile. This spec adds a protected `/messages` route, a viewer-scoped Convex query, and a durable inbox summary model that supports author context, last-message preview, and latest-activity ordering without regressing the existing per-profile chat experience.

## Requirements

### Functional Requirements

| ID | Requirement | Priority | Verification |
|----|-------------|----------|--------------|
| FR-01 | Add an authenticated viewer inbox route at `apps/mirror/app/(protected)/messages/page.tsx` that redirects unauthenticated requests to `/sign-in`. | p0 | Playwright test visits `/messages` while signed out and asserts redirect to `/sign-in`; authenticated test visits `/messages` and asserts the inbox shell renders. |
| FR-02 | Add a new viewer-scoped, paginated Convex query in `packages/convex/convex/chat/queries.ts` that returns conversations for the logged-in viewer across profile owners and does not require `profileOwnerId`. | p0 | Unit test covers the query contract with mixed-author fixtures and asserts the first page returns only rows for the authenticated `viewerId` plus a continuation cursor; authenticated Playwright test seeds more than one page of conversations, asserts the first page renders on `/messages`, then loads the next page and sees additional rows. |
| FR-03 | Each inbox row must include author avatar, author display name, username, conversation status, and a last-message preview derived from stored conversation summary fields. | p0 | Unit test asserts row view-model creation includes avatar/display name/username/preview for a complete record and falls back to `@username` when `name` is null; Playwright test asserts each rendered row shows those fields for seeded conversations. |
| FR-04 | Each inbox row must navigate to the existing profile chat route using `conversationId`, with the canonical user-facing href `/@{username}/chat/{conversationId}`. | p0 | Unit test asserts the href builder returns `/@rick-rubin/chat/<conversationId>` for a known row; Playwright test clicks an inbox row and asserts navigation to `/@username` with the chat conversation selected via the existing redirect behavior. |
| FR-05 | Viewer inbox ordering must be newest activity first, where activity is updated on both user sends and completed assistant responses, and ties are broken deterministically. | p0 | Unit test covers summary update helpers for user-send and assistant-complete events and asserts `lastActivityAt`, `lastActivitySortKey`, and `lastMessagePreview` are updated correctly; Playwright test creates or seeds conversations with different activity times and identical activity times, then asserts `/messages` shows a stable newest-first order across reloads. |
| FR-06 | Preserve the existing per-profile chat behavior on `apps/mirror/app/[username]/**`; owner/viewer access rules and `getConversations(profileOwnerId)` semantics must remain unchanged. | p0 | Unit test asserts the existing profile conversation mapping path is untouched by the new inbox helper additions; Playwright test opens `/<username>?chat=1` as a viewer and confirms only conversations with that author are shown in the profile conversation list. |
| FR-07 | Baseline inbox behavior is authenticated-only; anonymous per-profile chat remains supported on profile pages but does not appear in `/messages`. | p1 | Playwright test confirms a signed-out user cannot access `/messages` and can still load an anonymous profile chat entry point on a public `@username` page. |
| FR-08 | Existing conversations created before this feature ships must receive inbox summary data via a dedicated backfill before `/messages` is exposed to users, so the inbox can render previews and sort deterministically on day one. | p1 | Unit test covers backfill summary derivation from a message history fixture; automated rollout verification runs the documented backfill command against seeded pre-feature conversations before enabling `/messages`, then asserts the inbox renders non-empty previews in stable order. |

### Non-functional Requirements

| ID | Requirement | Priority | Verification |
|----|-------------|----------|--------------|
| NFR-01 | `/messages` must load from a single paginated viewer-scoped conversation query plus author metadata joins; it must not fan out into per-thread `listThreadMessages` or `listMessages` reads to assemble previews. | p0 | Static verification command asserts `getViewerConversations` does not import or call thread message listing helpers, and unit tests assert the inbox consumes denormalized summary fields from conversation records. |
| NFR-02 | Latest-activity ordering must be index-backed through a deterministic viewer sort key derived from activity time plus a stable tie-breaker. | p0 | Schema verification confirms an index exists for `viewerId` + `lastActivitySortKey`, and unit tests seed equal timestamps to assert ordering remains stable across repeated reads. |
| NFR-03 | The new inbox implementation must be additive: it must not change route rewrites, profile page entry points, or existing chat mutation authorization rules except where needed to maintain inbox summary fields. | p1 | Automated verification runs `git diff --exit-code -- apps/mirror/next.config.ts` after implementation and targeted profile chat Playwright coverage remains green. |

## Architecture

### Component Design

#### Recommended Model

Use a dedicated viewer inbox read path instead of repurposing the existing profile-scoped conversation list.

1. Add denormalized inbox summary fields to the `conversations` table:
   - `lastActivityAt: number`
   - `lastActivitySortKey: string`
   - `lastMessagePreview: string`
   - `lastMessageRole: "user" | "assistant"`
2. Add a composite index to `packages/convex/convex/chat/schema.ts`:
   - `.index("by_viewerId_and_lastActivitySortKey", ["viewerId", "lastActivitySortKey"])`
3. Add a new query in `packages/convex/convex/chat/queries.ts`:
   - `getViewerConversations()`
   - Requires auth
   - Accepts `paginationOpts`
   - Resolves the current app user from auth
   - Reads conversations with the new viewer/activity index in descending order
   - Joins each `profileOwnerId` to the author profile record and avatar URL
    - Returns a new viewer-inbox row type instead of reusing the minimal `Conversation` type
4. Add a protected page in `apps/mirror/app/(protected)/messages/page.tsx`:
   - Rely on the existing `apps/mirror/middleware.ts` protection for non-public routes without changing its matcher or route lists
   - Add a server-side auth check in the page as defense in depth, not as a new global guard design
   - Render a messages-specific feature entry point
5. Add a dedicated messages feature slice under `apps/mirror/features/messages/`:
   - `hooks/use-viewer-conversations.ts`
   - `components/messages-inbox.tsx`
   - `components/messages-inbox-row.tsx`
   - `lib/build-chat-conversation-href.ts`
   - `types.ts`
   - Use paginated loading from day one, with an explicit “Load more” interaction instead of an unbounded fetch
6. Keep existing profile chat list behavior intact:
   - Do not change the `useConversations({ profileOwnerId })` API
   - Do not change the `ChatRouteController` selection logic for profile pages

#### Rollout Plan

Ship this feature in two phases so pre-feature conversations never appear blank or unstable in production:

1. Backend phase:
   - Add optional summary fields and the deterministic sort-key index.
   - Add write-path summary maintenance plus a canonical summary rebuild helper.
   - Land the backfill command and verify it against seeded data.
   - Do not expose a `/messages` entry point or navigation affordance yet.
2. Launch phase:
   - Run the backfill to completion in the target environment.
   - Verify no viewer-owned conversations are missing summary fields.
   - Enable the `/messages` route and ship the UI.

This prevents a launch window where old conversations would render empty previews or unstable ordering.

#### Data Flow

1. Authenticated viewer requests `/messages`.
2. Existing `apps/mirror/middleware.ts` already treats `/messages` as protected because it is not in `PUBLIC_ROUTES`, and `apps/mirror/app/(protected)/messages/page.tsx` performs a server-side auth check as defense in depth.
3. The page renders a messages inbox feature component that calls `api.chat.queries.getViewerConversations` through paginated loading.
4. `getViewerConversations` reads `conversations` through `by_viewerId_and_lastActivitySortKey`, joins author profile data from `users`, resolves avatar URLs, and returns rows sorted by `lastActivitySortKey desc`.
5. The inbox renders the first page, exposes “Load more” when `continueCursor` exists, and never performs an account-wide `collect()`.
6. Each row renders author context and preview text, and links to `/@${username}/chat/${conversationId}`.
7. The existing rewrite and redirect flow sends that path through `apps/mirror/app/[username]/chat/[conversationId]/page.tsx`, which redirects into the existing query-param based chat UI.

#### Preview and Sorting Model

This feature must not compute preview text by reading every thread on inbox load. That would scale poorly, makes latest-activity ordering expensive, and turns a simple list page into an N+1 read pattern.

Store inbox summary fields on the conversation record and maintain them through a shared canonical summary path:

1. In `packages/convex/convex/chat/mutations.ts`:
   - On new conversation creation, initialize `lastActivityAt`, `lastActivitySortKey`, and `lastMessagePreview` from the first user message.
   - On every subsequent user send, patch the same fields immediately after the message is accepted.
   - Reuse the same normalization helper that the repair path uses so truncation and tie-breaking rules stay identical.
2. In `packages/convex/convex/chat/actions.ts`:
   - After `streamResponse` completes, call an idempotent internal rebuild helper that derives the canonical summary from thread history and patches `lastActivityAt`, `lastActivitySortKey`, `lastMessagePreview`, and `lastMessageRole`.
   - If assistant completion is expected but the final assistant message is not yet queryable, the rebuild helper must return a retryable status and schedule bounded retries automatically until the canonical summary is visible or the retry budget is exhausted.
   - If assistant persistence succeeds but the summary patch fails, the same rebuild helper must be callable by retries and operational repair jobs until the conversation is repaired.
   - On streaming failure, preserve the latest successful user summary so ordering remains deterministic.
3. Add a one-time backfill for pre-existing conversations:
   - Reuse the same idempotent rebuild helper used by assistant completion
   - Iterate viewer-owned conversations before launch
   - Patch summary fields for every existing conversation with a `viewerId`

Summary normalization rules:

- `lastMessagePreview` is normalized server-side by collapsing whitespace and truncating to 140 characters.
- `lastActivitySortKey` is derived from `lastActivityAt` plus a stable tie-breaker so equal timestamps remain deterministically ordered across reloads and pages.
- `/messages` shows both `active` and `archived` conversations to preserve parity with the existing profile-scoped conversation list.
- Archived rows may be visually de-emphasized, but they must remain navigable.

This is the baseline recommendation because it structurally prevents the inbox from depending on per-thread fan-out reads.

### Files to Create

| File | Purpose |
|------|---------|
| `apps/mirror/app/(protected)/messages/page.tsx` | Authenticated `/messages` route entry point. |
| `apps/mirror/features/messages/index.ts` | Public exports for the messages feature slice. |
| `apps/mirror/features/messages/types.ts` | Viewer inbox row types distinct from the profile-scoped `Conversation` type. |
| `apps/mirror/features/messages/hooks/use-viewer-conversations.ts` | Convex hook for `getViewerConversations`. |
| `apps/mirror/features/messages/components/messages-inbox.tsx` | Inbox container and empty/loading states for `/messages`. |
| `apps/mirror/features/messages/components/messages-inbox-row.tsx` | Row renderer for author context, preview, timestamp, and link. |
| `apps/mirror/features/messages/lib/build-chat-conversation-href.ts` | Single source of truth for `/@username/chat/[conversationId]` links. |
| `apps/mirror/features/messages/lib/__tests__/build-chat-conversation-href.test.ts` | Unit tests for row deep-link generation. |
| `apps/mirror/features/messages/lib/__tests__/viewer-inbox-row-model.test.ts` | Unit tests for row view-model shaping and fallback behavior. |
| `apps/mirror/features/messages/lib/__tests__/conversation-summary-model.test.ts` | Unit tests for preview truncation, role tracking, and activity ordering helpers imported from the chat domain. |
| `apps/mirror/e2e/messages.authenticated.spec.ts` | Authenticated viewer inbox flows across multiple authors. |

### Files to Modify

| File | Change |
|------|--------|
| `packages/convex/convex/chat/schema.ts` | Add optional summary fields plus the `by_viewerId_and_lastActivitySortKey` index for deterministic inbox ordering. |
| `packages/convex/convex/chat/queries.ts` | Add paginated `getViewerConversations` and keep `getConversations(profileOwnerId)` unchanged. |
| `packages/convex/convex/chat/helpers.ts` | Add internal helpers to derive canonical conversation summaries and backfill data from thread history. |
| `packages/convex/convex/chat/mutations.ts` | Patch conversation summary fields on user sends and expose an idempotent summary rebuild entry point. |
| `packages/convex/convex/chat/actions.ts` | Rebuild conversation summary data after assistant streaming completes and expose/drive backfill. |
| `apps/mirror/features/chat/types.ts` | Keep the existing `Conversation` type stable; only extend if a shared helper truly requires it. |
| `apps/mirror/features/chat/index.ts` | Export any shared chat helper reused by the messages feature, without collapsing the new inbox type into the existing conversation contract. |
| `apps/mirror/e2e/auth.spec.ts` or `apps/mirror/e2e/auth-fixture.authenticated.spec.ts` | Add signed-out and signed-in route checks for `/messages` if coverage fits better there; otherwise keep route coverage in the new messages spec. |
| `packages/convex/convex/seed.ts` | Populate summary fields for seeded conversations so local seed data behaves like production data. |

### Files Explicitly Not to Modify

| File | Reason |
|------|--------|
| `apps/mirror/middleware.ts` | Existing non-public route protection already covers `/messages`; the feature must not widen middleware scope. |
| `apps/mirror/next.config.ts` | The inbox deep-link uses the current `@username` rewrite behavior without new aliases or rewrite changes. |

### Dependencies to Add

None.

The baseline implementation should use existing Next.js, Convex, and Playwright/Vitest tooling already present in the repo.

## Unit Tests

Note: the repo’s current unit test runner is `vitest` in `apps/mirror`. Unit tests in this spec therefore live under `apps/mirror/**/__tests__` and should import pure helpers or view-model mappers extracted from the page layer and the chat domain as needed.

| Test File | Test Case | Verifies |
|-----------|-----------|----------|
| `apps/mirror/features/messages/lib/__tests__/build-chat-conversation-href.test.ts` | `builds /@username/chat/[conversationId] links from viewer inbox rows` | FR-04 |
| `apps/mirror/features/messages/lib/__tests__/viewer-inbox-row-model.test.ts` | `maps author name, username, avatar, status, and preview into a renderable inbox row` | FR-03 |
| `apps/mirror/features/messages/lib/__tests__/viewer-inbox-row-model.test.ts` | `falls back to @username when author display name is missing` | FR-03 |
| `apps/mirror/features/messages/lib/__tests__/conversation-summary-model.test.ts` | `promotes the latest user send to the top of the inbox ordering` | FR-05, NFR-02 |
| `apps/mirror/features/messages/lib/__tests__/conversation-summary-model.test.ts` | `rebuilds the canonical preview and activity key after assistant completion` | FR-05 |
| `apps/mirror/features/messages/lib/__tests__/conversation-summary-model.test.ts` | `keeps ordering stable when two conversations share the same activity timestamp` | FR-05, NFR-02 |
| `apps/mirror/features/messages/lib/__tests__/conversation-summary-model.test.ts` | `derives deterministic summary data for backfilled pre-feature conversations` | FR-08 |
| `apps/mirror/features/messages/lib/__tests__/conversation-summary-model.test.ts` | `repairs a stale summary when assistant content exists but summary fields are outdated` | FR-08 |
| `apps/mirror/features/messages/lib/__tests__/conversation-summary-model.test.ts` | `retries canonical summary rebuild when assistant content becomes visible after the first repair attempt` | FR-05, FR-08 |
| `apps/mirror/features/messages/lib/__tests__/viewer-inbox-query-contract.test.ts` | `filters mixed-author conversations to the authenticated viewer, paginates, and preserves newest-first order` | FR-02, NFR-01, NFR-02 |
| `apps/mirror/features/messages/lib/__tests__/viewer-inbox-query-contract.test.ts` | `does not include anonymous conversations in the viewer inbox contract` | FR-07 |
| `apps/mirror/features/messages/lib/__tests__/profile-chat-contract.test.ts` | `keeps profile-scoped conversation filtering keyed by profileOwnerId` | FR-06, NFR-03 |
| `apps/mirror/features/messages/lib/__tests__/messages-route-access.test.ts` | `returns redirect metadata for signed-out /messages access` | FR-01 |

## Playwright E2E Tests

| Test File | Scenario | Verifies |
|-----------|----------|----------|
| `apps/mirror/e2e/messages.authenticated.spec.ts` | Authenticated viewer opens `/messages`, sees the first page of conversations from at least two different authors, and can load the next page. | FR-01, FR-02 |
| `apps/mirror/e2e/messages.authenticated.spec.ts` | Inbox rows render author avatar, display name, username, preview text, and timestamp for seeded conversations. | FR-03 |
| `apps/mirror/e2e/messages.authenticated.spec.ts` | Clicking an inbox row navigates to `/@username/chat/[conversationId]` and lands in the existing chat UI with that conversation selected. | FR-04 |
| `apps/mirror/e2e/messages.authenticated.spec.ts` | After sending a new message in one conversation, returning to `/messages` moves that conversation to the top with the updated preview, and equal-timestamp fixtures retain stable order across reloads. | FR-05 |
| `apps/mirror/e2e/messages.authenticated.spec.ts` | Existing pre-feature conversations display non-empty preview text after the summary backfill has run and before the inbox route is enabled for launch. | FR-08 |
| `apps/mirror/e2e/messages.authenticated.spec.ts` | Viewer opens `/@username?chat=1` and still only sees conversations with that profile owner in the in-profile conversation list. | FR-06, NFR-03 |
| `apps/mirror/e2e/auth.spec.ts` | Signed-out visitor requesting `/messages` is redirected to `/sign-in`. | FR-01, FR-07 |
| `apps/mirror/e2e/chat-assistant-placeholder.spec.ts` | Existing profile chat send/stream behavior continues to work after inbox summary maintenance is added. | FR-06, NFR-03 |

## Anti-patterns to Avoid

- Do not widen `getConversations(profileOwnerId)` into a global inbox query. That would couple the profile page behavior to `/messages` and risks regressing owner/viewer semantics on `@username` routes.
- Do not build `/messages` by calling `listThreadMessages` or `listMessages` once per conversation row. That creates an avoidable N+1 read pattern and makes newest-first sorting unstable.
- Do not launch `/messages` before the summary backfill has completed for existing viewer-owned conversations. That would surface blank previews and unstable ordering on day one.
- Do not change `apps/mirror/middleware.ts` for this feature. Existing non-public-route protection already covers `/messages`, and widening matcher scope would increase regression risk outside the inbox.
- Do not overload the existing `Conversation` type with viewer-inbox-specific author metadata. Use a separate viewer inbox row type so profile chat remains simple and stable.
- Do not link inbox rows with `threadId`. The user-facing route must use `conversationId`, matching `apps/mirror/app/[username]/chat/[conversationId]/page.tsx`.
- Do not introduce anonymous global inbox aggregation in this baseline. It conflicts with the explicit authenticated-only scope and would require a durable guest identity design that is out of scope here.
- Do not add a second route alias such as `/inbox` in the initial implementation. Keep the surface area small with `/messages` unless product requirements explicitly expand it later.

## Team Orchestration Plan

### Step 1 — Lock the data model and query contract
Agent: `code-architect`

Tasks:
1. Finalize the conversation summary fields and composite index in `packages/convex/convex/chat/schema.ts`.
2. Define the paginated `getViewerConversations` return type and confirm it is additive to the existing profile-scoped query.
3. Lock the summary normalization rule at collapsed whitespace plus a 140-character cap, and confirm archived conversations remain visible in `/messages`.
4. Lock the deterministic sort-key design so equal timestamps do not flap between reads.

Verification:
- Diff shows additive schema/query changes only.
- Query contract includes `conversationId`, `username`, `displayName`, `avatarUrl`, `status`, `lastMessagePreview`, `lastMessageRole`, `lastActivityAt`, and pagination metadata.
- No changes to `apps/mirror/middleware.ts` or `apps/mirror/next.config.ts`.

### Step 2 — Implement server-side inbox summary maintenance
Agent: `general`

Tasks:
1. Add summary fields and index to `packages/convex/convex/chat/schema.ts`.
2. Update `packages/convex/convex/chat/mutations.ts` to patch summary fields on new and existing user sends.
3. Update `packages/convex/convex/chat/actions.ts` and `packages/convex/convex/chat/helpers.ts` to expose an idempotent summary rebuild helper for assistant completion, backfill, retries, and repair.
4. Add and validate the rollout backfill command before the UI route is enabled.
5. Update `packages/convex/convex/seed.ts` or equivalent seed flow so seeded conversations include summary data.

Verification:
- Summary fields update on both user and assistant message paths.
- Backfill logic can derive summary data for pre-feature conversations, repair stale summaries, and self-heal when assistant visibility lags the first rebuild attempt.
- Existing chat authorization logic remains unchanged except for summary maintenance.

### Step 3 — Implement the `/messages` route and feature UI
Agent: `general`

Tasks:
1. Add `apps/mirror/app/(protected)/messages/page.tsx` with the established auth redirect pattern.
2. Add `apps/mirror/features/messages/` with hook, types, row component, and inbox container.
3. Implement paginated loading with an explicit “Load more” control.
4. Add deep-link generation to `/@username/chat/[conversationId]`.
5. Keep `apps/mirror/features/chat/hooks/use-conversations.ts` and `apps/mirror/app/[username]/_providers/chat-route-controller.tsx` unchanged except for any safe shared helper extraction.

Verification:
- `/messages` renders for authenticated users and redirects signed-out users.
- Inbox rows show all required author and preview fields.
- Inbox pagination loads additional rows without an unbounded fetch.
- Clicking a row lands in the existing profile chat flow for the selected conversation.

### Step 4 — Add unit and end-to-end coverage
Agent: `playwright-browser-agent`

Tasks:
1. Add Vitest coverage for link generation, row shaping, summary ordering, canonical rebuild, repair, tie-breaking, and backfill derivation.
2. Add Playwright coverage for signed-out redirect, multi-author inbox rendering, paginated loading, row navigation, latest-activity ordering, and profile chat non-regression.
3. Run `pnpm --filter=@feel-good/mirror test:unit` and the targeted Playwright specs for `/messages` and profile chat only after the backfill verification step has passed.

Verification:
- Every FR maps to at least one unit test and one E2E test.
- `/messages` scenarios pass for authenticated and unauthenticated flows.
- Existing profile chat flow remains green.

## Open Questions

None for the baseline implementation.

## Adversarial Review Summary

| Concern | Severity | Resolution |
|---------|----------|------------|
| Computing previews from thread reads at inbox load would create an N+1 query pattern and fragile newest-first sorting. | Critical | **Accepted** — the spec requires denormalized summary fields on `conversations` plus a viewer sort-key index. |
| Reusing the existing `Conversation` type for `/messages` would leak inbox-only author metadata into the profile chat contract and raise regression risk. | Important | **Accepted** — the spec introduces a dedicated viewer inbox row type in `apps/mirror/features/messages/types.ts`. |
| The feature should also aggregate anonymous conversations into `/messages`. | Important | **Rejected** — the user explicitly requested an authenticated-only baseline, so guest identity aggregation is out of scope for this spec. |
| Backfill was optional because new conversations would populate summary fields automatically. | Important | **Accepted** — the spec makes backfill mandatory so older conversations render previews and sort deterministically on launch day. |
| Launching `/messages` before pre-feature conversations are backfilled would expose blank previews and unstable ordering. | Critical | **Accepted** — the spec now requires a two-phase rollout: backend maintenance and backfill first, UI exposure second. |
| A global inbox query without pagination would inherit the current `collect()` scaling problem and make author joins unbounded. | Important | **Accepted** — the spec now requires a paginated `getViewerConversations` query and paginated UI loading from day one. |
| Ordering by `lastActivityAt` alone is not deterministic when two rows share the same timestamp. | Important | **Accepted** — the spec now adds `lastActivitySortKey` and equal-timestamp test coverage. |
| Summary maintenance lacked a canonical repair path if assistant content was persisted but summary patching failed. | Important | **Accepted** — the spec now requires an idempotent rebuild helper reused by assistant completion, backfill, retries, and repair flows. |
| Mentioning middleware as the primary guard risked implying a broader auth-system change even though existing non-public-route protection already covers `/messages`. | Important | **Accepted** — the spec now states that `apps/mirror/middleware.ts` remains unchanged and the page-level auth check is defense in depth only. |
| Rebuilding immediately after assistant completion still left a timing hole if the final assistant message was not queryable yet. | Important | **Accepted** — the spec now requires the rebuild helper to return a retryable status and schedule bounded self-healing retries automatically. |

## Verification Checklist

| Check | Result | Details |
|-------|--------|---------|
| Requirements coverage | PASS | Each user requirement maps to FR-01 through FR-08, with NFR-01 through NFR-03 covering performance and additive rollout constraints. |
| Test coverage | PASS | Every FR is represented in the unit test table and the Playwright E2E table, including pagination, tie-breaking, and summary repair coverage. |
| E2E tests are user-perspective | PASS | All Playwright scenarios describe page visits, visible inbox rows, navigation, sends, and redirects rather than internal state inspection. |
| Team orchestration plan exists and references real agents | PASS | The plan references `.agents/agents/code-architect.md` and `.agents/agents/playwright-browser-agent.md`, which exist in this repo. |
| Verification criteria are concrete | PASS | Every FR and NFR uses explicit route, query, rendering, ordering, pagination, rollout, or command-based checks. |
| Codebase alignment | PASS | All file paths and route shapes match the current repo, including `/@username` rewrites, existing middleware protection, and existing profile chat redirect files. |
| Anti-patterns section exists with specific items | PASS | The spec includes eight concrete anti-patterns tied to known risks in the current architecture. |
