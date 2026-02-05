---
status: completed
priority: p3
issue_id: "028"
tags: [code-review, testing, accessibility, auth]
dependencies: []
---

# Add Test IDs to FormError and FormSuccess Components

## Problem Statement

FormError and FormSuccess components lack `data-testid` attributes, making it difficult for automation to verify error and success states.

## Findings

**Source Agent:** agent-native-reviewer

**Affected Files:**
- `packages/features/auth/components/shared/form-error.tsx` (lines 11-20)
- `packages/features/auth/components/shared/form-success.tsx` (lines 6-20)

**Current state:**
- Components have proper `role` and `aria-live` attributes for accessibility
- Missing `data-testid` for automation

## Proposed Solutions

### Option A: Add test IDs (Recommended)
```typescript
// form-error.tsx
<div
  id={id}
  role="alert"
  aria-live="polite"
  data-testid="auth.form-error"
  data-error-code={error.code}  // Optional: expose error code
  className="..."
>
  <span data-testid="auth.form-error.message">{error.message}</span>
</div>

// form-success.tsx
<Card data-testid="auth.form-success" className="...">
  <CardTitle data-testid="auth.form-success.title">{title}</CardTitle>
  <CardDescription data-testid="auth.form-success.message">{message}</CardDescription>
</Card>
```
- **Pros:** Enables automation testing, follows existing test ID conventions
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

## Technical Details

**Files to Modify:**
- `packages/features/auth/components/shared/form-error.tsx`
- `packages/features/auth/components/shared/form-success.tsx`

**Also consider adding to success states in views:**
- `packages/features/auth/components/views/password-sign-up-view.tsx` (success card)
- `packages/features/auth/components/views/reset-password-view.tsx` (invalid token card)

## Acceptance Criteria

- [ ] FormError has data-testid="auth.form-error"
- [ ] FormSuccess has data-testid="auth.form-success"
- [ ] Error message is queryable via test ID
- [ ] Success states in views have test IDs

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Agent-native reviewer found 4 missing test IDs |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
