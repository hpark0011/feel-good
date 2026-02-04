---
status: pending
priority: p3
issue_id: "027"
tags: [code-review, performance, views, auth]
dependencies: []
---

# Add React.memo to View Components

## Problem Statement

View components are pure presentational components but are not wrapped in `React.memo`. This causes unnecessary re-renders when parent components update with the same props.

## Findings

**Source Agent:** performance-oracle

**Affected Files:**
- `packages/features/auth/components/views/password-login-view.tsx`
- `packages/features/auth/components/views/password-sign-up-view.tsx`
- `packages/features/auth/components/views/magic-link-login-view.tsx`
- `packages/features/auth/components/views/magic-link-sign-up-view.tsx`
- `packages/features/auth/components/views/forgot-password-view.tsx`
- `packages/features/auth/components/views/reset-password-view.tsx`

**Expected Performance Gain:** 10-15% reduction in re-renders for static props scenarios

## Proposed Solutions

### Option A: Wrap all views in React.memo (Recommended)
```typescript
export const PasswordLoginView = memo(function PasswordLoginView({
  email,
  password,
  // ...
}: PasswordLoginViewProps) {
  // component body
});
```
- **Pros:** Prevents re-renders when props haven't changed
- **Cons:** Minor overhead for memo comparison
- **Effort:** Small
- **Risk:** Low

## Technical Details

**Files to Modify:**
- All 6 view components in `packages/features/auth/components/views/`

## Acceptance Criteria

- [ ] All view components wrapped in React.memo
- [ ] Re-renders reduced when props are stable
- [ ] No visual regressions

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Performance oracle noted missing memoization |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
