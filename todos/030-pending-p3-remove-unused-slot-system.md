---
status: pending
priority: p3
issue_id: "030"
tags: [code-review, yagni, auth]
dependencies: []
---

# Remove Unused Slot System (YAGNI)

## Problem Statement

The slot system in LoginBlock and SignUpBlock allows swapping internal components, but there are no current consumers using this feature. This is building extensibility for a hypothetical future need.

## Findings

**Source Agent:** code-simplicity-reviewer

**Affected Files:**
- `packages/features/auth/blocks/login-block.tsx` (lines 22-26)
- `packages/features/auth/blocks/sign-up-block.tsx` (lines 22-26)

**Current code:**
```typescript
export interface LoginBlockSlots {
  passwordForm?: FC<PasswordLoginFormProps>;
  magicLinkForm?: FC<MagicLinkLoginFormProps>;
  oauthButtons?: FC<OAuthButtonsProps>;
}
```

**Usage check:** No consumers currently use the `slots` prop.

## Proposed Solutions

### Option A: Remove slot system entirely (Recommended)
```typescript
// Before (with slots)
const PasswordForm = slots?.passwordForm ?? PasswordLoginForm;

// After (direct)
<PasswordLoginForm {...formProps} />
```
- **Pros:** Simpler code, easier to understand, YAGNI compliance
- **Cons:** Loses future flexibility (can be added back if needed)
- **Effort:** Small
- **Risk:** Low

### Option B: Keep but document as advanced API
- **Pros:** Maintains flexibility
- **Cons:** Code complexity for unused feature
- **Effort:** Small
- **Risk:** Low

## Technical Details

**Files to Modify:**
- `packages/features/auth/blocks/login-block.tsx`
- `packages/features/auth/blocks/sign-up-block.tsx`
- `packages/features/auth/blocks/index.ts` (remove slot type exports)

**LOC Savings:** ~30 lines

## Acceptance Criteria

- [ ] Slot interfaces removed
- [ ] Blocks use components directly
- [ ] Types simplified
- [ ] All functionality preserved

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Simplicity reviewer identified YAGNI violation |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
