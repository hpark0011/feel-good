---
status: completed
priority: p2
issue_id: "217"
tags: [code-review, greyboard-desktop, dependencies]
dependencies: []
---

# electron-updater in devDependencies Instead of dependencies

## Problem Statement

`electron-updater` is listed in `devDependencies` but is dynamically imported at runtime in the main process. It currently works because esbuild bundles it (only `electron` is in the `external` list), but this is fragile -- if someone adds `electron-updater` to `external`, the production app would crash silently.

## Findings

- **Location:** `apps/greyboard-desktop/package.json:38` (devDependencies)
- **Runtime usage:** `electron/ipc/updates.ts:14` (`await import('electron-updater')`)
- **Flagged by:** Architecture reviewer

## Proposed Solutions

Move `electron-updater` from `devDependencies` to `dependencies`.

- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] `electron-updater` listed under `dependencies` in `package.json`

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | Runtime deps belong in dependencies even when bundled |
