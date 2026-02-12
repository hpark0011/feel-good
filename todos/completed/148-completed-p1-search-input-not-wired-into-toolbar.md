---
status: completed
priority: p1
issue_id: "148"
tags: [code-review, regression, mirror, articles]
dependencies: []
---

# Search Input Component Not Wired Into Toolbar

## Problem Statement

Commit `cf6502fc` adds `ArticleSearchInput`, but the toolbar still renders the old static search icon button. The new open/close and clear behavior is not reachable in runtime.

## Findings

- **Source:** Commit review of `cf6502fc`
- **Location:** `apps/mirror/features/articles/components/article-toolbar.tsx` lines 62-73
- **Location:** `apps/mirror/features/articles/components/article-search-input.tsx` (new file, not mounted)
- **Evidence:** Toolbar still renders a plain icon button with no state/handlers; no call site mounts `ArticleSearchInput`

## Proposed Solutions

### Option A: Wire `ArticleSearchInput` into `ArticleToolbar` (Recommended)

- Replace static search icon block with `<ArticleSearchInput />`
- Provide `query`, `onQueryChange`, `isOpen`, `onOpen`, `onClose` from toolbar/list state
- Verify open, close, clear, and filtering behavior end-to-end
- **Effort:** Small
- **Risk:** Low

### Option B: Revert partial search commit

- Revert component-only commit until full wiring lands
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] `ArticleToolbar` mounts `ArticleSearchInput` instead of the stub icon
- [ ] Search toggle opens and closes input in runtime
- [ ] Clear button appears only with non-empty query and clears text
- [ ] Search query actually affects visible article list

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from commit review | Component-only fixes are inert unless wired into runtime surfaces |
| 2026-02-12 | Resolved in `63ab65ff` — toolbar now mounts ArticleSearchInput with full props | — |
