---
status: pending
priority: p3
issue_id: "033"
tags: [code-review, dock, lint]
dependencies: []
---

# Remove Unused cn Import in AppDock Block

## Problem Statement

`cn` is imported but never used in the dock block, which will fail linting and adds noise.

## Findings

**Source:** Code review

**Affected Files:**
- `packages/features/dock/blocks/app-dock.tsx`

**Details:**
- `cn` is imported but unused.

## Proposed Solutions

### Option A: Remove the unused import (Recommended)
- **Pros:** Clears lint warnings, reduces dead code
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

## Recommended Action

Remove the unused `cn` import.

## Acceptance Criteria

- [ ] `cn` import removed from `packages/features/dock/blocks/app-dock.tsx`
- [ ] Lint passes for `@feel-good/features`

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-04 | Created from code review | Pending |
