---
status: pending
priority: p2
issue_id: "230"
tags: [code-review, maintainability, clean-code, mirror, profile]
dependencies: ["228"]
---

# Normalize Profile Action Callback Naming and Parent Wiring

## Problem Statement

The current callback API uses generic names (`onVideoClick`, `handleClick`) and repeats inline anonymous handlers in `ProfileShell` for the same behavior in both mobile and desktop branches. As action support expands, this naming and wiring pattern will reduce clarity and increase maintenance overhead.

## Findings

- **Location:** `apps/mirror/app/[username]/_components/profile-shell.tsx:74`, `apps/mirror/app/[username]/_components/profile-shell.tsx:99`, `apps/mirror/features/profile/views/profile-info-view.tsx:8`, `apps/mirror/features/profile/components/profile-actions.tsx:27`
- **Source:** Clean-code review of profile action handler plumbing
- **Severity:** Medium
- **Pattern:** Ambiguous callback naming / duplicated handler wiring

## Proposed Solution

Adopt intent-specific naming and centralize shared handler wiring so parent-to-view-to-component callback flow is explicit, consistent, and easy to extend.

- Replace ambiguous handler names with intent-oriented names
- Define shared parent callbacks once and reuse across render branches
- Keep `ProfileInfoView` as a thin view boundary, not a logic dispatcher

## Acceptance Criteria

- [ ] Callback names are intent-specific and consistent across shell/view/actions layers
- [ ] Parent wiring avoids duplicate anonymous handlers for the same action
- [ ] `ProfileInfoView` remains a pass-through presentation boundary
- [ ] Adding new action callbacks does not require ad hoc naming patterns
- [ ] Build/lint pass after refactor

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-18 | Created from clean-code review of profile action handler flow | Clear naming and centralized wiring are needed before adding more action handlers |
