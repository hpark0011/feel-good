---
status: pending
priority: p1
issue_id: "211"
tags: [code-review, security, greyboard-desktop, electron, csp]
dependencies: []
---

# No Content-Security-Policy Headers on BrowserWindow

## Problem Statement

No CSP is configured -- not as a `<meta>` tag in `index.html`, not via `session.defaultSession.webRequest.onHeadersReceived`, and not in BrowserWindow options. Without CSP, if any XSS vulnerability exists in the renderer, an attacker could abuse the exposed `greyboardDesktop` IPC bridge to trigger file writes, read JSON files from disk, or spam OS-level notifications.

## Findings

- **Location:** `apps/greyboard-desktop/electron/main.ts:11-23` (no CSP in BrowserWindow config)
- **Location:** `apps/greyboard-desktop/index.html` (no CSP meta tag)
- **Context:** Even with sandbox enabled, the renderer has access to the full IPC bridge API
- **Flagged by:** Security Sentinel

## Proposed Solutions

### Option A: Set CSP via session headers (Recommended)
```typescript
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
      ],
    },
  })
})
```

For dev mode, `connect-src` needs the Vite dev server URL.

- **Pros:** Defense-in-depth, prevents XSS escalation
- **Cons:** Needs conditional logic for dev vs prod
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] CSP header set on BrowserWindow in production
- [ ] Dev mode CSP allows Vite dev server connection
- [ ] No inline scripts or unsafe-eval in production CSP

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | Electron CSP prevents XSS from escalating to IPC abuse |
