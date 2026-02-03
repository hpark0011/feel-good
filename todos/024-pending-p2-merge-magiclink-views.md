---
status: pending
priority: p2
issue_id: "024"
tags: [code-review, duplication, views, auth]
dependencies: []
---

# Merge Nearly Identical MagicLink Views

## Problem Statement

`MagicLinkLoginView` and `MagicLinkSignUpView` are nearly identical (125 lines each, ~200+ LOC duplicate). The only differences are title text, description, success message, and test ID prefixes.

## Findings

**Source Agent:** pattern-recognition-specialist

**Duplicate Files:**
- `packages/features/auth/components/views/magic-link-login-view.tsx` (125 LOC)
- `packages/features/auth/components/views/magic-link-sign-up-view.tsx` (125 LOC)

**Differences found:**
1. CardTitle: "Login" vs "Create an account"
2. CardDescription: Different text
3. FormSuccess message: Different text
4. data-testid prefixes: "auth.magic-link" vs "auth.magic-link-sign-up"

**Everything else is identical:**
- Form structure
- Email input
- Submit button
- Success state handling
- Error display
- Styling

## Proposed Solutions

### Option A: Create shared MagicLinkView with props (Recommended)
```typescript
// packages/features/auth/components/views/magic-link-view.tsx
interface MagicLinkViewProps {
  // Existing props...
  variant: "login" | "sign-up";
  title: string;
  description: string;
  successTitle: string;
  successMessage: (email: string) => string;
  testIdPrefix: string;
}

export function MagicLinkView({ variant, title, ... }: MagicLinkViewProps) {
  // Single implementation
}

// Wrapper components for backwards compatibility
export function MagicLinkLoginView(props) {
  return <MagicLinkView variant="login" title="Login" ... />;
}
```
- **Pros:** Eliminates duplication, single source of truth
- **Cons:** Additional abstraction layer
- **Effort:** Medium
- **Risk:** Low

### Option B: Keep separate but extract shared parts
- **Pros:** Maintains explicit separation
- **Cons:** Still some duplication
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

Option A - Create unified MagicLinkView component with thin wrapper exports.

## Technical Details

**Files to Modify:**
- `packages/features/auth/components/views/magic-link-login-view.tsx`
- `packages/features/auth/components/views/magic-link-sign-up-view.tsx`

**New File:**
- `packages/features/auth/components/views/magic-link-view.tsx`

**LOC Savings:** ~100 lines

## Acceptance Criteria

- [ ] Single MagicLinkView component handles both variants
- [ ] Wrapper exports maintain backwards compatibility
- [ ] All existing tests pass
- [ ] Test IDs preserved for automation

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Pattern recognition found near-identical components |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
