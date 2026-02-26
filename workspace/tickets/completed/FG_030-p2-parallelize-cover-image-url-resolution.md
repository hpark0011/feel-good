---
id: FG_030
title: "Cover image URLs resolved concurrently in article queries"
date: 2026-02-26
type: perf
status: to-do
priority: p2
description: "The getByUsername query resolves cover image URLs sequentially in a for loop (N+1 pattern). Each article triggers an individual ctx.storage.getUrl() call. Using Promise.all to batch these calls would reduce query latency from O(n) to O(1) sequential calls."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "packages/convex/convex/articles/queries.ts getByUsername uses Promise.all for cover image URL resolution instead of sequential awaits in a loop"
  - "pnpm build --filter=@feel-good/mirror succeeds"
owner_agent: "Backend optimization agent"
---

# Cover image URLs resolved concurrently in article queries

## Context

In `packages/convex/convex/articles/queries.ts:27-47`, each article's cover image URL is resolved sequentially via `await resolveCoverImageUrl(ctx, article.coverImageStorageId)` inside a `for` loop. For N articles with cover images, this produces N sequential async operations. Flagged by the performance oracle and TypeScript reviewer.

## Goal

Cover image URLs are resolved concurrently using `Promise.all`, reducing query latency from O(n) to O(1) sequential storage lookups.

## Scope

- Refactor `getByUsername` to filter articles first, then resolve all cover URLs in parallel via `Promise.all`

## Out of Scope

- Modifying `getBySlug` (single article, no N+1 issue)
- Caching storage URLs

## Approach

Filter visible articles first, then use `Promise.all` to resolve all cover image URLs concurrently, and zip the results back together.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. In `packages/convex/convex/articles/queries.ts`, filter articles for visibility first: `const visible = articles.filter(a => isOwner || a.status !== "draft")`
2. Resolve all cover URLs: `const coverUrls = await Promise.all(visible.map(a => resolveCoverImageUrl(ctx, a.coverImageStorageId)))`
3. Map results: `return visible.map((article, i) => ({ ...spread, coverImageUrl: coverUrls[i] }))`
4. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must maintain the same return shape
- Must preserve draft visibility filtering

## Resources

- PR #172: feat(mirror): migrate articles to Convex
- Code review finding: Performance oracle
