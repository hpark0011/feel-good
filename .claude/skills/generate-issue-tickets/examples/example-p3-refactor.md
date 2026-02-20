<!-- File location: workspace/tickets/to-do/FG_015-p3-consolidate-cn-imports.md -->
---
id: FG_015
title: "Components import cn from single canonical source"
date: 2026-02-20
type: refactor
status: to-do
priority: p3
description: "Multiple files import the cn utility from different paths — some use @feel-good/utils/cn, others use a local utils/cn re-export, and a few inline their own clsx+twMerge wrapper. This creates confusion about the canonical source and risks subtle merge conflicts."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "`grep -rn 'from.*utils/cn' packages/ui/src/ | grep -v '@feel-good/utils/cn'` returns no matches (no local re-exports used)"
  - "`grep -rn 'clsx\\|twMerge' packages/ui/src/primitives/ | grep -v node_modules` returns no matches (no inline wrappers)"
  - "`grep -rl 'cn(' packages/ui/src/primitives/ --include='*.tsx' | xargs grep -L '@feel-good/utils/cn'` returns no matches (every file that calls cn uses the canonical import)"
  - "`pnpm build` exits 0"
  - "`pnpm lint` exits 0"
owner_agent: "Codebase Cleanup Agent"
---

# Components Import cn from Single Canonical Source

## Context

The `cn` utility (a `clsx` + `tailwind-merge` wrapper) is defined canonically in `packages/utils/src/cn.ts` and exported as `@feel-good/utils/cn`. However, some UI primitives import from a local `../utils/cn` re-export, and at least two files inline their own `clsx(twMerge(...))` call instead of using the shared utility.

- **Source:** Pattern analysis during code review
- **Location:** `packages/ui/src/primitives/` (multiple files)
- **Evidence:** `grep -rn 'from.*utils/cn' packages/ui/src/` shows 3 distinct import paths for the same function.

## Goal

Every component that uses `cn` imports it from `@feel-good/utils/cn`. No local re-exports or inline wrappers exist in the UI package.

## Scope

- Replace local `../utils/cn` imports with `@feel-good/utils/cn` in all UI primitives
- Remove inline `clsx(twMerge(...))` calls and replace with `cn()`
- Delete the local `packages/ui/src/utils/cn.ts` re-export file if it becomes unused

## Out of Scope

- Changing the `cn` implementation itself
- Auditing app-level code for the same issue (separate pass)
- Adding ESLint rule to enforce the import path (separate ticket)

## Approach

Find-and-replace across `packages/ui/src/primitives/`:

1. `grep -rn 'from.*\.\./utils/cn' packages/ui/src/` to identify local re-export consumers
2. Replace each with `import { cn } from "@feel-good/utils/cn"`
3. `grep -rn 'clsx\|twMerge' packages/ui/src/primitives/` to find inline wrappers
4. Replace with `cn()` call and add the canonical import
5. Check if `packages/ui/src/utils/cn.ts` has any remaining consumers; delete if unused

- **Effort:** Small
- **Risk:** Low

## Constraints

- Deletion-only for the re-export file — do not add new files
- Must not change the behavior of any component (pure import path change)

## Resources

- Canonical source: `packages/utils/src/cn.ts`
