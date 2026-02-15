---
status: pending
priority: p3
issue_id: "222"
tags: [code-review, greyboard-desktop, yagni]
dependencies: []
---

# Empty Settings Page and Premature components.json

## Problem Statement

Two pieces of scaffolding that add no value:
1. `src/routes/settings.tsx` - 10-line placeholder with no functionality and no navigation link to it
2. `components.json` - shadcn config pointing to non-existent directories (`@/src/components/ui`) with no local shadcn components installed (app uses `@feel-good/ui` workspace package)

## Findings

- **Settings:** `apps/greyboard-desktop/src/routes/settings.tsx` (empty placeholder, no nav link)
- **components.json:** `apps/greyboard-desktop/components.json` (references non-existent paths)
- **Flagged by:** Code Simplicity reviewer

## Acceptance Criteria

- [ ] Decision: keep or remove settings page and components.json

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | Ship or remove scaffolding |
