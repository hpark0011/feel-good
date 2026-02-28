---
id: FG_028
title: "Profile layout fetches getCurrentUser concurrently with other queries"
date: 2026-02-26
type: perf
status: to-do
priority: p1
description: "The profile layout server component runs fetchAuthQuery(api.auth.queries.getCurrentUser) sequentially after a Promise.all block, adding a full round-trip to every profile page load. Moving it into the existing Promise.all would eliminate this unnecessary latency."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "apps/mirror/app/[username]/layout.tsx contains a single Promise.all that includes getCurrentUser alongside getByUsername and getByUsername articles queries"
  - "No sequential fetchAuthQuery call exists after the Promise.all block"
  - "pnpm build --filter=@feel-good/mirror succeeds"
owner_agent: "Performance optimization agent"
---

# Profile layout fetches getCurrentUser concurrently with other queries

## Context

In `apps/mirror/app/[username]/layout.tsx:19-48`, the profile layout runs three Convex queries in `Promise.all` (fetchAuthQuery for profile, preloadAuthQuery for profile, preloadAuthQuery for articles), then runs a fourth query (`fetchAuthQuery(api.auth.queries.getCurrentUser)`) sequentially after the `Promise.all` completes. This adds an unnecessary round-trip to every profile page render. Flagged by the performance oracle.

## Goal

All four Convex queries in the layout run concurrently via a single `Promise.all`, reducing page load latency by one round-trip.

## Scope

- Move `fetchAuthQuery(api.auth.queries.getCurrentUser, {})` into the existing `Promise.all`
- Destructure the result alongside the existing three values

## Out of Scope

- Deduplicating the fetchAuthQuery + preloadAuthQuery calls for the same profile query (separate optimization)
- Server-side caching of auth state

## Approach

Add the `getCurrentUser` call as the fourth element in the existing `Promise.all` array and destructure it.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Open `apps/mirror/app/[username]/layout.tsx`
2. Add `fetchAuthQuery(api.auth.queries.getCurrentUser, {})` to the `Promise.all` array
3. Destructure the fourth result as `currentAuthUser`
4. Remove the standalone `const currentAuthUser = await fetchAuthQuery(...)` line
5. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must not change the behavior of the `isOwner` computation
- Must not introduce new dependencies

## Resources

- PR #172: feat(mirror): migrate articles to Convex
- Code review finding: Performance oracle
