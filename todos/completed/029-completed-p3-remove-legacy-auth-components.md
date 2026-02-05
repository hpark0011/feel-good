---
status: completed
priority: p3
issue_id: "029"
tags: [code-review, cleanup, auth]
dependencies: []
---

# Remove Legacy Duplicate Auth Components

## Problem Statement

The commit added a new four-layer auth system while keeping all legacy components. This results in 731 LOC of duplicate functionality that increases maintenance burden.

## Findings

**Source Agent:** code-simplicity-reviewer

**Legacy Files (to be removed):**
- `packages/features/auth/components/sign-in-form.tsx` (88 LOC)
- `packages/features/auth/components/sign-up-form.tsx` (122 LOC)
- `packages/features/auth/components/forgot-password-form.tsx` (84 LOC)
- `packages/features/auth/components/reset-password-form.tsx` (139 LOC)
- `packages/features/auth/components/magic-link-form.tsx` (88 LOC)
- `packages/features/auth/components/oauth-buttons.tsx` (69 LOC)
- `packages/features/auth/components/form-error.tsx` (12 LOC)
- `packages/features/auth/components/form-success.tsx` (20 LOC)

**Total:** ~731 LOC

**New equivalents:**
- `components/forms/password-login-form.tsx` replaces `sign-in-form.tsx`
- `components/forms/password-sign-up-form.tsx` replaces `sign-up-form.tsx`
- etc.

## Proposed Solutions

### Option A: Remove legacy files, update exports (Recommended)
1. Delete legacy component files
2. Update `components/index.ts` to re-export from new locations with legacy names
3. Test all consuming apps

- **Pros:** Clean codebase, single implementation
- **Cons:** Breaking change for direct imports
- **Effort:** Medium
- **Risk:** Medium (need to verify all consumers)

### Option B: Keep for one release cycle with deprecation warnings
- **Pros:** Smoother migration
- **Cons:** Maintains duplicate code longer
- **Effort:** Medium
- **Risk:** Low

## Technical Details

**Files to Remove:**
- `packages/features/auth/components/sign-in-form.tsx`
- `packages/features/auth/components/sign-up-form.tsx`
- `packages/features/auth/components/forgot-password-form.tsx`
- `packages/features/auth/components/reset-password-form.tsx`
- `packages/features/auth/components/magic-link-form.tsx`
- `packages/features/auth/components/oauth-buttons.tsx`
- `packages/features/auth/components/form-error.tsx`
- `packages/features/auth/components/form-success.tsx`

**Files to Update:**
- `packages/features/auth/components/index.ts`

**LOC Savings:** ~731 lines

## Acceptance Criteria

- [ ] Legacy files removed
- [ ] Re-exports maintain backwards compatibility where needed
- [ ] All consuming apps work correctly
- [ ] No duplicate implementations remain

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Simplicity reviewer found 731 LOC duplication |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
