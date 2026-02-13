---
status: pending
priority: p2
issue_id: "174"
tags: [code-review, regression, layout, css, mirror]
dependencies: []
---

# Desktop Scroll Container May Not Fill Height After `*:h-full` Removal

## Problem Statement

In the desktop layout of `profile-shell.tsx`, the `*:h-full` utility was removed from the `flex-1 min-h-0` wrapper that contains `ViewTransition` and the scrollable content div. Without `*:h-full`, the `ViewTransition` wrapper may not receive `height: 100%`, causing its child (the `overflow-y-auto h-full` scroll container) to not fill the available space. This could break scroll behavior when content is shorter than the viewport.

## Findings

- **Location:** `apps/mirror/app/[username]/_components/profile-shell.tsx:86`
- **Old code:** `<div className="flex-1 min-h-0 *:h-full">`
- **New code:** `<div className="flex-1 min-h-0">`
- **Source:** PR #121 — all review agents flagged this. The `ToolbarSlotTarget` is a sibling at a higher level, so `*:h-full` on this inner div would only affect `ViewTransition` (safe to restore).
- **Depends on:** Whether React 19 `<ViewTransition>` renders a DOM wrapper element. If it does, that element needs `height: 100%`.

## Proposed Solutions

### Option A: Restore `*:h-full` (Recommended)
Add `*:h-full` back to the `flex-1 min-h-0` div. The only direct child is `ViewTransition`, so the wildcard is targeted.

```tsx
<div className="flex-1 min-h-0 *:h-full">
```

- **Effort:** Small
- **Risk:** None — only child is ViewTransition

### Option B: Explicit height on ViewTransition
If `ViewTransition` accepts a `className` prop, apply `h-full` directly.

- **Effort:** Small
- **Risk:** Depends on ViewTransition API

## Acceptance Criteria

- [ ] Desktop article list scrolls correctly when content exceeds viewport
- [ ] Desktop article list fills viewport height when content is short
- [ ] Visual regression check on both desktop layouts (wide and narrow panels)
- [ ] `pnpm build --filter=@feel-good/mirror` passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #121 review | Multiple reviewers flagged the `*:h-full` removal independently |
