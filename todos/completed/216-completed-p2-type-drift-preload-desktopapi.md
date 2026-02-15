---
status: pending
priority: p2
issue_id: "216"
tags: [code-review, architecture, greyboard-desktop, typescript]
dependencies: []
---

# Type Safety Gap Between Preload and DesktopAPI Interface

## Problem Statement

The `DesktopAPI` interface, preload implementation, and IPC client wrapper define the same API surface in 3 separate locations with no compile-time enforcement that they stay in sync. The preload runs under `tsconfig.node.json` which does not reference `src/types/`. A method signature change in the preload will not cause a compiler error in the renderer.

## Findings

- **DesktopAPI type:** `src/types/desktop-api.ts`
- **Preload impl:** `electron/preload.ts`
- **Client wrapper:** `src/lib/ipc/client.ts`
- **Risk:** Silent runtime type mismatches when API evolves
- **Flagged by:** Architecture, TypeScript, Pattern Recognition reviewers

## Proposed Solutions

### Option A: `satisfies DesktopAPI` in preload
Move `DesktopAPI` to a shared types location included by both tsconfigs and use `satisfies` in the preload.

### Option B: Window type marked optional
At minimum, change `global.d.ts` to `greyboardDesktop?: DesktopAPI` (it is currently non-optional but may not exist).

- **Effort:** Small-Medium
- **Risk:** Low

## Acceptance Criteria

- [ ] Compile-time enforcement that preload implementation matches DesktopAPI interface
- [ ] `window.greyboardDesktop` typed as optional in `global.d.ts`

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | Separate tsconfigs create type drift risk at IPC boundaries |
