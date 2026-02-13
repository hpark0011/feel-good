---
status: completed
priority: p2
issue_id: "177"
tags: [code-review, api-surface, barrel-export, mirror]
dependencies: []
---

# Remove useArticleWorkspace from Public Barrel Export

## Problem Statement

`useArticleWorkspace` is exported from `features/articles/index.ts` but is only consumed internally by `ScrollableArticleList` and `ArticleToolbarView`. Exposing it in the barrel invites misuse from outside the feature boundary — the hook only works inside `ArticleWorkspaceProvider`, which is scoped to specific pages.

## Findings

- **Location:** `apps/mirror/features/articles/index.ts:2`
- **Current export:** `export { ArticleWorkspaceProvider, useArticleWorkspace } from "./context/article-workspace-context"`
- **Internal consumers:** `scrollable-article-list.tsx`, `article-toolbar-view.tsx` — both inside `features/articles/`
- **Source:** PR #121 — code simplicity and TypeScript reviewers both flagged this

## Proposed Solutions

Remove `useArticleWorkspace` from the barrel. Internal consumers import directly from the context file.

```tsx
// index.ts — only export the provider
export { ArticleWorkspaceProvider } from "./context/article-workspace-context";

// Internal consumers use direct imports
import { useArticleWorkspace } from "../context/article-workspace-context";
```

- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] `useArticleWorkspace` removed from `features/articles/index.ts`
- [ ] Internal consumers updated to direct imports
- [ ] `pnpm build --filter=@feel-good/mirror` passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #121 review | Keep barrel exports to public API only |
