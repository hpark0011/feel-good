---
status: pending
priority: p2
issue_id: "228"
tags: [code-review, architecture, clean-code, mirror, profile]
dependencies: []
---

# Replace Label-Based Action Branching with Stable Action IDs

## Problem Statement

`ProfileActions` currently branches behavior using display text (`label === "Video"`) in `apps/mirror/features/profile/components/profile-actions.tsx`. This couples domain behavior to presentation copy and makes the interaction model fragile as additional actions are added or labels change.

## Findings

- **Location:** `apps/mirror/features/profile/components/profile-actions.tsx:27-31`
- **Source:** Clean-code review of `onVideoClick` handling flow
- **Severity:** Medium
- **Pattern:** Stringly-typed dispatch / behavior coupled to UI labels

## Proposed Solution

Introduce stable action identifiers in the action config (for example: `text`, `video`, `voice`) and route behavior based on those identifiers rather than user-facing labels.

- Add an `id` field to each entry in `PROFILE_ACTIONS`
- Replace `handleClick(label)` with an intent-based dispatch using `id`
- Use an explicit handler map to keep future action additions predictable

## Acceptance Criteria

- [ ] Action config defines explicit IDs for each profile action
- [ ] Click dispatch logic uses action IDs, not labels
- [ ] Behavior no longer depends on display text values
- [ ] Adding a new action does not require brittle string checks
- [ ] Build/lint pass after refactor

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-18 | Created from clean-code review of profile action click handling | Dispatch-by-label is fragile and will degrade as action count grows |
