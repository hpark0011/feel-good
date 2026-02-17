---
status: pending
priority: p2
issue_id: "231"
tags: [refactor, docs-reorg, claude-rules]
dependencies: ["229"]
---

# Extract Claude-Specific Workflow Rules to .claude/rules/workflow.md

## Problem Statement

The current AGENTS.md contains Claude-specific workflow orchestration rules (plan mode, subagent strategy, self-improvement loop, demand elegance, autonomous bug fixing). These are being removed from AGENTS.md in #229 and need a new home so they're not lost.

## Scope

Create `.claude/rules/workflow.md` containing the Claude-specific rules from old AGENTS.md:

1. **Plan Mode Default** — enter plan mode for non-trivial tasks
2. **Subagent Strategy** — use subagents liberally for parallel analysis
3. **Self-Improvement Loop** — update `todos/lessons.md` after corrections
4. **Verification Before Done** — prove work before marking complete
5. **Demand Elegance** — pause and ask "is there a more elegant way?"
6. **Autonomous Bug Fixing** — just fix bugs without hand-holding

Check for overlap with existing `.claude/rules/dev-process.md` — avoid duplication.

## Acceptance Criteria

- [ ] `.claude/rules/workflow.md` exists with all 6 workflow rules
- [ ] No duplication with `.claude/rules/dev-process.md`
- [ ] Rules auto-load in Claude sessions (confirmed by being in `.claude/rules/`)

## Plan Reference

`docs/plans/2026-02-17-refactor-docs-config-reorganization-plan.md` — Phase 2.3

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
