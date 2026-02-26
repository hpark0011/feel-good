---
id: FG_035
title: "Batch article delete validates ownership before any deletion"
date: 2026-02-26
type: improvement
status: to-do
priority: p2
description: "The remove mutation silently skips non-existent article IDs but throws on unauthorized ones. This inconsistency allows probing article existence across users: including a known-owned ID alongside a target ID reveals whether the target exists and belongs to another user based on whether the mutation succeeds or fails. Validating all ownership before deleting any article would prevent this information disclosure."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "packages/convex/convex/articles/mutations.ts remove handler validates ownership for all articles before deleting any"
  - "Non-existent IDs are handled consistently with unauthorized IDs (either both skip or both fail)"
  - "pnpm exec convex codegen succeeds"
owner_agent: "Security hardening agent"
---

# Batch article delete validates ownership before any deletion

## Context

In `packages/convex/convex/articles/mutations.ts:98-118`, the `remove` mutation iterates over an array of IDs. Non-existent articles are silently skipped (`continue`), but articles owned by another user cause a throw that aborts the entire transaction. This inconsistency enables an information disclosure attack: an authenticated user can probe whether a specific article ID exists by including it alongside their own article IDs in a batch delete call. Flagged by the security sentinel and TypeScript reviewer.

## Goal

The batch delete mutation validates ownership for all articles before performing any deletions, providing consistent error handling regardless of whether an ID doesn't exist or belongs to another user.

## Scope

- Restructure the remove handler to validate first, then delete
- Consistent handling of non-existent and unauthorized IDs

## Out of Scope

- Adding rate limiting to the delete endpoint
- Returning detailed error information about which IDs failed

## Approach

Fetch all articles in parallel first, validate all ownership, then perform deletions. Skip non-existent IDs silently and also skip unauthorized IDs silently (treating "not found" and "not mine" identically from the caller's perspective).

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. In `packages/convex/convex/articles/mutations.ts` remove handler, fetch all articles first: `const articles = await Promise.all(args.ids.map(id => ctx.db.get(id)))`
2. Filter to only articles owned by the current user: `const owned = articles.filter(a => a && a.userId === appUser._id)`
3. Delete all owned articles and their storage files
4. Run `pnpm exec convex codegen` to verify
5. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must remain within a single Convex mutation (transaction atomicity)
- Must not expose whether a skipped ID was non-existent vs unauthorized

## Resources

- PR #172: feat(mirror): migrate articles to Convex
- Code review findings: Security sentinel, TypeScript reviewer
