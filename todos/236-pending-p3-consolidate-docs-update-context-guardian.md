---
status: pending
priority: p3
issue_id: "236"
tags: [refactor, cleanup, docs-reorg]
dependencies: ["228"]
---

# Consolidate Folder-Structure Rule and Update Context-Guardian

## Problem Statement

1. `.claude/rules/folder-structure.md` (75 lines) is a strict subset of `docs/conventions/file-organization-convention.md` (134 lines) — duplicate content
2. `.claude/agents/context-guardian.md` references `.claude/opportunities.md` which is deleted in #228

## Scope

### 4.1 Consolidate folder-structure rule
Replace `.claude/rules/folder-structure.md` content with an `@` reference to the convention doc:
```markdown
# Folder Structure Convention
@docs/conventions/file-organization-convention.md
```

If `@` directives don't work in `.claude/rules/` files, keep the rule content inline but add a comment at the top noting the canonical source.

### 4.2 Update context-guardian agent
Remove references to `.claude/opportunities.md` from `.claude/agents/context-guardian.md`.

## Acceptance Criteria

- [ ] `.claude/rules/folder-structure.md` either references or notes `docs/conventions/file-organization-convention.md` as canonical source
- [ ] `.claude/agents/context-guardian.md` does not reference `opportunities.md`
- [ ] Claude session still loads folder-structure rules correctly

## Plan Reference

`docs/plans/2026-02-17-refactor-docs-config-reorganization-plan.md` — Phase 4

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
