---
status: pending
priority: p3
issue_id: "052"
tags: [code-review, pr-103, naming, convention]
dependencies: []
---

# Standardize _views (Plural) Directory Naming

## Problem Statement

Greyboard uses `_view/` (singular) while ui-factory and mirror use `_views/` (plural). PR #103 established `_views/` as the convention going forward.

## Findings

**Source:** PR #103 pattern recognition review

**Affected Files:**
- `apps/greyboard/app/(protected)/dashboard/tasks/_view/` — singular
- `apps/ui-factory/app/_views/` — plural
- `apps/mirror/app/_views/` — plural

**Details:**
The underscore prefix prevents Next.js App Router from treating these as route segments. The plural form `_views/` is now the majority convention after this PR.

## Proposed Solutions

### Option A: Rename greyboard's _view to _views (Recommended)
- **Pros:** Consistent convention across all apps
- **Cons:** Requires updating imports
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] All apps use `_views/` (plural) for view directories
- [ ] All imports updated
- [ ] Build passes

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 pattern recognition review | Pending |
