---
status: pending
priority: p2
issue_id: "229"
tags: [refactor, docs-reorg, agents-md]
dependencies: ["228"]
---

# Rewrite AGENTS.md as Universal Project Instructions

## Problem Statement

`AGENTS.md` line 1 is `@CLAUDE.md` which includes ALL of CLAUDE.md content — making AGENTS.md useless as a universal standard for other tools. It also contains Claude-specific workflow rules (subagent strategy, plan mode, self-improvement loop) that Codex/Cursor/Copilot cannot use.

## Scope

Rewrite `AGENTS.md` to contain only tool-agnostic, universal project instructions:

- Project overview and monorepo structure
- Quick start commands (`pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`)
- Package import patterns table
- Core principles (simplicity, root causes, minimal impact, verify before done)
- Task management conventions (`todos/` directory structure)

**Remove:**
- `@CLAUDE.md` directive
- Claude-specific workflow rules (these move to `.claude/rules/workflow.md` in #231)

## Acceptance Criteria

- [ ] AGENTS.md does NOT contain `@CLAUDE.md`
- [ ] AGENTS.md contains project overview, quick start, package imports, core principles, task management
- [ ] AGENTS.md contains NO Claude-specific content (subagents, plan mode, skills, commands)
- [ ] Content is useful to any AI tool (Codex, Cursor, Copilot, etc.)

## Plan Reference

`docs/plans/2026-02-17-refactor-docs-config-reorganization-plan.md` — Phase 2.1

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
