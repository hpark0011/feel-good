---
status: completed
priority: p3
issue_id: "220"
tags: [code-review, greyboard-desktop, reliability]
dependencies: []
---

# No Error Boundaries in Renderer

## Problem Statement

The React tree has no `ErrorBoundary` component. An unhandled exception in any route component crashes the entire renderer with a white screen, which is especially problematic in a desktop app where users cannot simply refresh the page.

## Findings

- **Location:** `apps/greyboard-desktop/src/App.tsx` - `<Outlet />` not wrapped in error boundary
- **Impact:** White screen crash on any unhandled error
- **Flagged by:** Architecture reviewer

## Acceptance Criteria

- [ ] Error boundary wrapping the route outlet with recovery UI

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | Desktop apps need error boundaries more than web apps |
