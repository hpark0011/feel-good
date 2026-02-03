---
status: pending
priority: p3
issue_id: "031"
tags: [code-review, naming, auth]
dependencies: []
---

# Document or Fix Login vs SignIn Naming Inconsistency

## Problem Statement

The codebase uses "Login" and "SignIn" inconsistently across layers:
- Hooks use "SignIn" (aligning with auth client API)
- Forms/Views/Blocks use "Login" (user-facing terminology)
- Routes use "/sign-in"

## Findings

**Source Agent:** pattern-recognition-specialist

**Current naming:**
| Layer | Term Used |
|-------|-----------|
| Hooks | `usePasswordSignIn` |
| Forms | `PasswordLoginForm` |
| Views | `PasswordLoginView` |
| Blocks | `LoginBlock` |
| Routes | `/sign-in` |

## Proposed Solutions

### Option A: Document the convention (Recommended)
Add to README:
```markdown
## Naming Conventions
- Hooks use "SignIn/SignUp" to match auth client API methods
- UI components use "Login/Register" for user-friendly terminology
- Routes use kebab-case "/sign-in" and "/sign-up"
```
- **Pros:** No code changes, explains the rationale
- **Cons:** Inconsistency remains
- **Effort:** Small
- **Risk:** Low

### Option B: Standardize on "SignIn" everywhere
- **Pros:** Complete consistency
- **Cons:** Breaking change, "Login" is more user-friendly
- **Effort:** Large
- **Risk:** Medium

### Option C: Standardize on "Login" everywhere (including hooks)
- **Pros:** Complete consistency with friendly terms
- **Cons:** Misaligns hooks with auth client API
- **Effort:** Large
- **Risk:** Medium

## Recommended Action

Option A - The current split is intentional (API alignment vs user terminology). Document it.

## Technical Details

**File to Update:**
- `packages/features/auth/README.md`

## Acceptance Criteria

- [ ] README documents naming convention
- [ ] Rationale explained for the split
- [ ] New contributors understand the pattern

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Pattern recognition noted terminology mix |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
