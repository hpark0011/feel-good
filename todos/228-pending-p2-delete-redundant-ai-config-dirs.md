---
status: pending
priority: p2
issue_id: "228"
tags: [refactor, cleanup, config, docs-reorg]
dependencies: []
---

# Delete Redundant AI Config Directories and Stale Files

## Problem Statement

The `vercel-react-best-practices` skill (49 files, ~264K) is copied byte-identically across `.codex/`, `.cursor/`, and `.github/skills/` in addition to the canonical `.claude/` location. This is ~150 redundant files. `.claude/opportunities.md` is 110 lines of empty boilerplate since Jan 2025.

## Scope

1. Delete `.codex/` entirely (50 files — duplicate vercel skill + duplicate Sentry rule)
2. Delete `.cursor/skills/` then `.cursor/` if empty (49 files — byte-identical skill copy)
3. Delete `.github/skills/` only — **do NOT touch `.github/workflows/`** (49 files — fourth skill copy)
4. Delete `.claude/opportunities.md` (empty template, zero tracked opportunities)

## Why Safe

- Codex, Cursor, and GitHub Copilot all read `AGENTS.md` natively — no per-tool config directories needed
- All deleted content exists canonically in `.claude/skills/vercel-react-best-practices/`
- opportunities.md was never populated in 13 months

## Acceptance Criteria

- [ ] `.codex/` directory does not exist
- [ ] `.cursor/` directory does not exist
- [ ] `.github/skills/` directory does not exist
- [ ] `.github/workflows/` still contains 4 CI workflow files
- [ ] `.claude/skills/vercel-react-best-practices/` still exists (canonical copy)
- [ ] `.claude/opportunities.md` does not exist

## Plan Reference

`docs/plans/2026-02-17-refactor-docs-config-reorganization-plan.md` — Phase 1

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
