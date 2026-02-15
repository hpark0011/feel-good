---
status: pending
priority: p1
issue_id: "223"
tags: [code-review, bug, greyboard-desktop, electron, ipc]
dependencies: []
---

# Register IPC handlers only once per app lifecycle

## Problem Statement

`registerAllHandlers(mainWindow)` is called inside `createWindow()`. On macOS, when a user closes all windows and re-activates the app from the dock, `createWindow()` is called again, which re-runs all `ipcMain.handle(...)` registrations. Electron treats these handlers as singleton registrations per channel, so repeated registration can throw and prevent the window from being recreated.

## Findings

- **Location:** `apps/greyboard-desktop/electron/main.ts:40`
- **Related flow:** `app.on('activate')` calls `createWindow()` when no windows exist
- **Impact:** App reactivation path on macOS can break due to duplicate IPC handler registration

## Proposed Solutions

### Option A: Register handlers once after app is ready (Recommended)

- Move `registerAllHandlers(...)` out of `createWindow()` and into an app-level initialization path that runs exactly once
- Keep window construction separate from IPC setup

- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] IPC handlers are registered exactly once per app process
- [ ] Closing all windows and re-opening app on macOS recreates window without IPC registration errors
- [ ] No duplicate `ipcMain.handle(...)` registration attempts across window lifecycle

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from code review on `claude/orchestration-greyboard-desktop-KISfQ` | Handler registration currently tied to window creation instead of app lifecycle |
