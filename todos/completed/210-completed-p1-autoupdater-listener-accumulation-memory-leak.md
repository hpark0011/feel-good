---
status: completed
priority: p1
issue_id: "210"
tags: [code-review, bug, greyboard-desktop, memory-leak, electron]
dependencies: []
---

# Auto-Updater Event Listeners Re-Registered on Every check() Call

## Problem Statement

Every invocation of the `greyboard:updates:check` IPC handler registers 6 new `autoUpdater.on(...)` listeners without removing previous ones. If the user checks for updates N times, there will be 6*N listeners. Each status event fires N duplicate callbacks, flooding the renderer with duplicate IPC messages. This is a memory leak and correctness bug.

## Findings

- **Location:** `apps/greyboard-desktop/electron/ipc/updates.ts:16-38`
- **Impact:** After 10 check calls, 60 listeners attached. Memory grows unbounded in long-running desktop sessions. Duplicate status events cause UI confusion.
- **Additional risk:** Stale `mainWindow` reference in closures if window is recreated (macOS activate pattern)
- **Flagged by:** All 7 review agents

## Proposed Solutions

### Option A: Register listeners once with guard flag (Recommended)
```typescript
export function registerUpdateHandlers(mainWindow: BrowserWindow) {
  let listenersRegistered = false

  ipcMain.handle('greyboard:updates:check', async () => {
    try {
      const { autoUpdater } = await import('electron-updater')
      if (!listenersRegistered) {
        autoUpdater.on('checking-for-update', () => { ... })
        // ... other listeners ...
        listenersRegistered = true
      }
      await autoUpdater.checkForUpdates()
      return { status: 'checking' as UpdateStatus }
    } catch {
      return { status: 'error' as UpdateStatus }
    }
  })
}
```

- **Pros:** Minimal change, fixes both memory leak and duplicate events
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

### Option B: Remove entire updates module (if unused in MVP)
No component currently calls `updates.check()` or `updates.onStatus()`. Remove until needed.

- **Pros:** Eliminates the bug entirely, reduces code surface
- **Cons:** Loses scaffolding for future feature
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Event listeners registered at most once regardless of how many times `check()` is called
- [ ] No duplicate status events sent to renderer
- [ ] No MaxListenersExceededWarning in Node.js

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | EventEmitter.on() is additive -- listeners must be guarded |
