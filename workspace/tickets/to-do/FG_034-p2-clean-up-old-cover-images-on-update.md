---
id: FG_034
title: "Article update mutation cleans up replaced cover images"
date: 2026-02-26
type: fix
status: to-do
priority: p2
description: "When updating an article's cover image via the update mutation, the old coverImageStorageId is overwritten but the old file in Convex storage is never deleted. This creates orphaned storage objects over time, increasing storage costs. The remove mutation correctly cleans up storage, but update does not."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "packages/convex/convex/articles/mutations.ts update handler deletes the old storage file when coverImageStorageId changes"
  - "Old cover image is NOT deleted if the new coverImageStorageId equals the existing one"
  - "pnpm exec convex codegen succeeds"
owner_agent: "Backend quality agent"
---

# Article update mutation cleans up replaced cover images

## Context

In `packages/convex/convex/articles/mutations.ts:83-84`, when a user updates an article's cover image, the mutation patches `coverImageStorageId` with the new value. However, it does not delete the old storage file. The `remove` mutation at line 108-110 correctly deletes cover images before deleting articles, but the `update` mutation lacks this cleanup. Over time, replaced cover images accumulate as orphaned storage objects. Flagged by the performance oracle.

## Goal

When an article's cover image is replaced via the update mutation, the previously-stored image file is deleted from Convex storage.

## Scope

- Add storage cleanup logic in the update handler when `coverImageStorageId` changes

## Out of Scope

- Batch cleanup of already-orphaned storage files
- Adding a storage garbage collection cron

## Approach

Before patching, check if the cover image changed and the old one exists. If so, delete the old storage file.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. In `packages/convex/convex/articles/mutations.ts` update handler, add before the patch call:
   ```ts
   if (args.coverImageStorageId !== undefined &&
       args.coverImageStorageId !== article.coverImageStorageId &&
       article.coverImageStorageId) {
     await ctx.storage.delete(article.coverImageStorageId);
   }
   ```
2. Run `pnpm exec convex codegen` to verify
3. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must not delete the old image if the new storage ID is the same (no-op update)
- Must handle the case where the article has no existing cover image

## Resources

- PR #172: feat(mirror): migrate articles to Convex
- Code review finding: Performance oracle
- Pattern reference: `remove` mutation at mutations.ts:108-110 already handles this correctly
