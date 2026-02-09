---
status: pending
priority: p3
issue_id: "112"
tags: [code-review, simplicity, mirror, profile]
dependencies: []
---

# contentRef Callback Ref Wrapper May Be Unnecessary

## Problem Statement

In `mobile-profile-layout.tsx`, a callback ref wraps `setContentElement` to pipe the DOM node into state. Since `useState` setters are already stable functions, the `useCallback` wrapper around `setContentElement` adds no value — the setter can be passed directly as the ref.

## Findings

- **Source:** code-simplicity-reviewer agent
- **Location:** `apps/mirror/features/profile/views/mobile-profile-layout.tsx`

## Proposed Solutions

### Option A: Pass setter directly as ref (Recommended)
```typescript
<div ref={setContentElement}>
```
Instead of wrapping in `useCallback`.
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] Remove unnecessary useCallback wrapper if present
- [ ] Verify state updates still work correctly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-09 | Created from PR #106 review | useState setters are stable — no need for useCallback wrapper |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/106
