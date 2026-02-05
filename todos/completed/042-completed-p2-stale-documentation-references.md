---
status: completed
priority: p2
issue_id: "042"
tags: [code-review, pr-103, documentation]
dependencies: []
---

# Update Documentation After Auth Cleanup

## Problem Statement

The PR deletes 8 legacy auth form components and removes password login from LoginBlock, but CLAUDE.md and package documentation may still reference deleted files and removed capabilities.

## Findings

**Source:** PR #103 code review (multi-agent)

**Affected Files:**
- `packages/features/CLAUDE.md`
- `packages/features/auth/README.md` (has broken slot override examples and "Password + Magic Link + OAuth" description)
- `CLAUDE.md` (root)
- `apps/mirror/CLAUDE.md` (line 46 references deleted legacy imports)
- `.claude/rules/monorepo.md` (line 25 references deleted legacy imports)

**Details:**
- 8 legacy form components deleted: `sign-in-form.tsx`, `sign-up-form.tsx`, `magic-link-form.tsx`, `oauth-buttons.tsx`, `forgot-password-form.tsx`, `reset-password-form.tsx`, `form-error.tsx`, `form-success.tsx`
- Import examples in docs may reference deleted paths
- Auth flow descriptions may mention password login on LoginBlock which no longer exists
- The compatibility layer created in PR #66 (Jan 28) is fully removed

## Proposed Solutions

### Option A: Audit and update all docs (Recommended)
- **Pros:** Accurate documentation
- **Cons:** Takes time
- **Effort:** Medium
- **Risk:** None

## Recommended Action

Search all `.md` files for references to deleted components and update them to reflect the current four-layer architecture.

## Acceptance Criteria

- [ ] No references to deleted legacy form components in docs
- [ ] Auth flow documentation reflects magic-link-only LoginBlock
- [ ] Import examples use current paths

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 review | Pending |
