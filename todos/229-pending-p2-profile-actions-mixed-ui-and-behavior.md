---
status: pending
priority: p2
issue_id: "229"
tags: [code-review, architecture, clean-code, mirror, profile]
dependencies: ["228"]
---

# Separate Presentation from Behavior Side Effects in ProfileActions

## Problem Statement

`ProfileActions` currently mixes rendering concerns with behavioral side effects by both rendering action buttons and deciding what to do on click (open video flow vs show toast) inside the same component. This blurs boundaries between UI and interaction logic and violates single-responsibility expectations for a reusable action view.

## Findings

- **Location:** `apps/mirror/features/profile/components/profile-actions.tsx:26-33`
- **Source:** Clean-code review of profile action click architecture
- **Severity:** Medium
- **Pattern:** Mixed concerns (presentation + behavior orchestration + side effects)

## Proposed Solution

Refactor `ProfileActions` into a presentational component that emits action intent only. Move behavior orchestration and side effects (video modal open, "coming soon" toast strategy) into the parent/container layer.

- Keep rendering and interaction affordances in `ProfileActions`
- Emit a typed action intent callback from `ProfileActions`
- Handle intent-to-effect mapping in `ProfileInfoView`/`ProfileShell` boundary (or a dedicated container)

## Acceptance Criteria

- [ ] `ProfileActions` is presentational and does not contain product side effects
- [ ] Action handlers in `ProfileActions` only emit intent
- [ ] Parent/container owns side-effect logic (modal opening, fallback messaging)
- [ ] Component API clearly communicates intent-driven callbacks
- [ ] Build/lint pass after refactor

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-18 | Created from clean-code review of profile action click handling | Keeping UI and behavior separate improves extensibility for upcoming actions |
