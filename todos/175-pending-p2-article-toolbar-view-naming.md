---
status: pending
priority: p2
issue_id: "175"
tags: [code-review, convention, naming, mirror]
dependencies: []
---

# ArticleToolbarView Violates "Views Are Pure" Convention

## Problem Statement

`ArticleToolbarView` lives in `features/articles/views/` but reads from context via `useArticleWorkspace()`. Every other component in the `views/` directory is a pure presentational component receiving data through props. This creates a false signal about the component's purity and breaks the established convention.

## Findings

- **Location:** `apps/mirror/features/articles/views/article-toolbar-view.tsx`
- **Convention:** `views/` = pure UI (props only). `components/` = may have logic/context deps.
- **Comparison:** `ArticleDetailToolbarView` in the same directory IS pure (props only) — correctly placed.
- **Source:** PR #121 — pattern recognition and TypeScript reviewers both flagged this.

## Proposed Solutions

### Option A: Move to `components/` (Recommended)
Rename and move to `features/articles/components/article-toolbar-connector.tsx` or simply `features/articles/components/article-toolbar-view.tsx`. Update barrel export.

- **Effort:** Small
- **Risk:** Low — just a file move + import update

### Option B: Make it a true view
Remove context read, accept all props explicitly. The page component would read from context and pass props down. But this pushes context reading into the server component page, which would require making it a client component.

- **Effort:** Medium
- **Risk:** Would force page.tsx to become a client component — not desirable

## Acceptance Criteria

- [ ] Component no longer in `views/` directory (or no longer reads from context)
- [ ] Barrel export in `index.ts` updated
- [ ] All imports updated
- [ ] `pnpm build --filter=@feel-good/mirror` passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #121 review | Convention: views = pure, components = connected |
