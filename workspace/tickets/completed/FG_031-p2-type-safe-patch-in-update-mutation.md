---
id: FG_031
title: "Article update mutation uses type-safe patch object"
date: 2026-02-26
type: improvement
status: to-do
priority: p2
description: "The update mutation in articles/mutations.ts builds a patch object typed as Record<string, unknown>, which discards all type safety. Invalid field assignments would not be caught at compile time. The patch should use a proper Convex document type to get compile-time field validation."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "packages/convex/convex/articles/mutations.ts update handler does not use Record<string, unknown> for the patch object"
  - "The patch type is derived from Convex's document types (e.g., Partial<Doc<'articles'>> or equivalent)"
  - "pnpm exec convex codegen succeeds"
  - "pnpm build --filter=@feel-good/mirror succeeds"
owner_agent: "TypeScript quality agent"
---

# Article update mutation uses type-safe patch object

## Context

In `packages/convex/convex/articles/mutations.ts:78`, the update handler builds the patch object as `Record<string, unknown>`, which throws away all type information. Assigning `patch.nonExistentField = "oops"` would compile without error. Flagged by the TypeScript reviewer.

## Goal

The patch object in the update mutation is strongly typed, so TypeScript catches invalid field assignments at compile time.

## Scope

- Change the patch type from `Record<string, unknown>` to a type derived from the Convex schema

## Out of Scope

- Refactoring the overall update mutation structure
- Adding new update fields

## Approach

Import `Doc` from `../_generated/dataModel` and type the patch as `Partial<Doc<"articles">>`, or use a manually constructed type that includes only the patchable fields.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Import `Doc` from `../_generated/dataModel` in `packages/convex/convex/articles/mutations.ts`
2. Replace `const patch: Record<string, unknown> = {}` with a properly typed partial
3. Run `pnpm exec convex codegen` in `packages/convex`
4. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must not change the mutation's external behavior or API surface

## Resources

- PR #172: feat(mirror): migrate articles to Convex
- Code review finding: TypeScript reviewer
