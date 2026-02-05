---
status: completed
priority: p3
issue_id: "026"
tags: [code-review, performance, auth]
dependencies: []
---

# Remove Unnecessary Suspense Boundaries in Blocks

## Problem Statement

Auth blocks wrap content in Suspense boundaries, but the inner content does not use `use()`, lazy imports, or throw promises. The Suspense is never triggered and serves no purpose while adding overhead.

## Findings

**Source Agent:** performance-oracle

**Affected Files:**
- `packages/features/auth/blocks/login-block.tsx` (lines 96-106)
- `packages/features/auth/blocks/sign-up-block.tsx` (lines 91-101)

**Current code:**
```typescript
export function LoginBlock(props: LoginBlockProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-muted/50 mx-auto h-96 w-full max-w-md animate-pulse rounded-lg" />
      }
    >
      <LoginBlockContent {...props} />
    </Suspense>
  );
}
```

## Proposed Solutions

### Option A: Remove Suspense (Recommended)
```typescript
export function LoginBlock(props: LoginBlockProps) {
  return <LoginBlockContent {...props} />;
}
```
- **Pros:** Removes unnecessary overhead, clearer code
- **Cons:** Loses defensive Suspense for potential future async
- **Effort:** Small
- **Risk:** Low

### Option B: Add lazy loading to justify Suspense
```typescript
const PasswordLoginForm = lazy(() => import('../components/forms/password-login-form'));
```
- **Pros:** Actual bundle splitting, smaller initial load
- **Cons:** More complex
- **Effort:** Medium
- **Risk:** Low

## Technical Details

**Files to Modify:**
- `packages/features/auth/blocks/login-block.tsx`
- `packages/features/auth/blocks/sign-up-block.tsx`
- Possibly `forgot-password-block.tsx` and `reset-password-block.tsx` if they have same pattern

## Acceptance Criteria

- [ ] Suspense removed or justified with actual async content
- [ ] Block components still render correctly
- [ ] No visual regressions

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Performance oracle noted inactive Suspense |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
