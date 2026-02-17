---
status: pending
priority: p2
issue_id: "230"
tags: [refactor, docs-reorg, claude-md]
dependencies: ["229"]
---

# Update CLAUDE.md to Use Bridge Pattern

## Problem Statement

CLAUDE.md currently contains universal project info (quick start, structure, apps table) that duplicates what should be in AGENTS.md. After AGENTS.md is rewritten (#229), CLAUDE.md needs to reference it and remove the duplicated sections.

## Scope

1. Add `@AGENTS.md` as first line of `CLAUDE.md`
2. Remove content now in AGENTS.md (quick start, structure overview, apps table)
3. Keep Claude-specific content: detailed package docs, auth layers, TypeScript configs, `.claude/` configuration section
4. Update sub-project AGENTS.md files:
   - `packages/ui/AGENTS.md`: change `@CLAUDE.md` to `@AGENTS.md`
   - `apps/greyboard-desktop/AGENTS.md`: change `@CLAUDE.md` to `@AGENTS.md`

## Acceptance Criteria

- [ ] CLAUDE.md first line is `@AGENTS.md`
- [ ] No duplicated content between AGENTS.md and CLAUDE.md
- [ ] Claude-specific content preserved (package details, auth layers, TS configs, .claude/ config)
- [ ] `packages/ui/AGENTS.md` references `@AGENTS.md`
- [ ] `apps/greyboard-desktop/AGENTS.md` references `@AGENTS.md`
- [ ] Start a Claude session and confirm context loads correctly

## Plan Reference

`docs/plans/2026-02-17-refactor-docs-config-reorganization-plan.md` — Phase 2.2 + 2.4

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
