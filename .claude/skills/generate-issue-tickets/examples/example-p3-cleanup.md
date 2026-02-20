<!-- File location: workspace/tickets/to-do/GB_002-p3-unused-css-import-dashboard.md -->
---
id: GB_002
title: "Dashboard layout has no dead CSS imports"
date: 2026-02-20
type: chore
status: to-do
priority: p3
description: "The dashboard layout imports a CSS module that is never referenced in the component JSX. The CSS file contains 45 lines of dead styles superseded by Tailwind classes."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "`grep -n 'import styles' apps/mirror/app/(protected)/dashboard/layout.tsx` returns no matches (import removed)"
  - "`apps/mirror/app/(protected)/dashboard/styles/dashboard.module.css` does not exist"
  - "`grep -rn 'dashboard.module.css' apps/mirror/` returns no matches (no remaining references)"
  - "`pnpm build --filter=@feel-good/mirror` exits 0"
owner_agent: "CSS Cleanup Agent"
---

# Dashboard Layout Has No Dead CSS Imports

## Context

`apps/mirror/app/(protected)/dashboard/layout.tsx` imports `styles/dashboard.module.css` at line 3, but no classes from this module are referenced anywhere in the component. The CSS file itself contains 45 lines of unused styles that were superseded by Tailwind classes in PR #130.

- **Source:** Refactor review
- **Location:** `apps/mirror/app/(protected)/dashboard/layout.tsx:3`
- **Evidence:** `import styles from "./styles/dashboard.module.css"` — `styles` is never referenced in the JSX. Grep for `styles.` in the file returns zero matches.

## Goal

Dashboard layout has no dead CSS imports. The unused CSS module file and its import are removed.

## Scope

- Remove the `import styles from "./styles/dashboard.module.css"` line from `layout.tsx`
- Delete the `styles/dashboard.module.css` file

## Out of Scope

- Auditing other components for dead CSS imports (separate ticket)
- Migrating any remaining CSS modules to Tailwind
- Refactoring the dashboard layout component itself

## Approach

Delete the import line and the CSS file. This is a pure deletion — no new code needed.

- **Effort:** Small
- **Risk:** Low

## Constraints

- Deletion-only change — no new code or refactoring
- Must not modify the dashboard layout's rendered output

## Resources

- Related PR: https://github.com/hpark0011/feel-good/pull/130
