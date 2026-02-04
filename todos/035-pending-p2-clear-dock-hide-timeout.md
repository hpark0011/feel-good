---
status: pending
priority: p2
issue_id: "035"
tags: [code-review, dock, hooks, behavior]
dependencies: []
---

# Prevent Dock Hide Timeout Stacking

## Problem Statement

`useDockVisibility.hide()` can schedule multiple timeouts without clearing prior ones, causing the dock to hide after re-enter even when it should be visible.

## Findings

**Source:** Code review

**Affected Files:**
- `packages/features/dock/hooks/use-dock-visibility.ts`

**Details:**
- `hide()` sets a new timeout without clearing an existing one.
- If the user re-enters the activation zone, an earlier timeout can still fire and hide the dock while hovered.

## Proposed Solutions

### Option A: Clear existing timeout before scheduling (Recommended)
- **Pros:** Prevents stale timers; minimal change
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

### Option B: Use a single timeout managed by `useEffect`
- **Pros:** Centralized lifecycle management
- **Cons:** Slightly more complex
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

Clear any existing timeout before scheduling a new hide, and add cleanup on unmount.

## Acceptance Criteria

- [ ] `hide()` clears any existing timeout before scheduling a new one
- [ ] Timeout is cleared on unmount
- [ ] Dock does not hide while cursor remains over activation zone or dock

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-04 | Created from code review | Pending |
