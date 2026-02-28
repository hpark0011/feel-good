---
id: FG_001
title: "Ticket system coexists with or replaces todos/ system"
date: 2026-02-20
type: chore
status: completed
priority: p1
description: "The workspace/tickets/ system introduces a second work-tracking system alongside the established todos/ directory which has 100+ tickets, active references in dev-process.md and workflow.md, and an established agent workflow. The two systems have incompatible schemas, ID formats, status values, and directory structures with no migration or coexistence plan."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "`grep -rn 'todos/' .claude/rules/dev-process.md .claude/rules/workflow.md` references are either updated to point to the chosen system or document both systems with clear usage boundaries"
  - "The SKILL.md description no longer contains trigger phrases that collide with the todos/ workflow (e.g. 'write a todo') — unless todos/ is deprecated"
  - "A decision is documented in SKILL.md or CLAUDE.md about the relationship between workspace/tickets/ and todos/"
  - "`pnpm build` exits 0 (no build regressions)"
owner_agent: "Architecture Decision Agent"
---

# Ticket System Coexists With or Replaces todos/ System

## Context

The monorepo has an established `todos/` work-tracking system with 100+ completed tickets (001-173+), active pending tickets, a lessons file, and session plans. It is referenced in:

- `.claude/rules/dev-process.md:42` — "Drive work through `todos/` files with `work on @todos/...` pattern"
- `.claude/rules/workflow.md:27` — "After ANY correction from the user: update `todos/lessons.md`"
- `MEMORY.md` — documents the todo workflow conventions

PR #154 introduces `workspace/tickets/` with a completely different schema:

| Aspect | `todos/` | `workspace/tickets/` |
|--------|----------|---------------------|
| ID format | Bare numeric `001` | `FG_NNN` prefix |
| Status values | `pending`, `completed` | `backlog`, `to-do`, `in-progress`, `in-review`, `completed`, `canceled` |
| Directory structure | `todos/`, `todos/completed/` | 6 kanban directories |
| Body sections | Problem Statement, Findings, Solutions | Context, Goal, Scope, Approach |

The SKILL.md trigger phrases include "write a todo" and "track this" — directly colliding with the existing workflow.

- **Source:** Code review of PR #154
- **Location:** `.claude/skills/generate-issue-tickets/SKILL.md:1-210` and `.claude/rules/dev-process.md:42`
- **Evidence:** Two incompatible tracking systems with no documented relationship

## Goal

A single, clear work-tracking strategy exists for the monorepo. Either the two systems are explicitly scoped to different purposes with documented boundaries, or one supersedes the other with a migration path.

## Scope

- Decide: replace `todos/`, coexist with boundaries, or build on top of `todos/`
- Update `.claude/rules/dev-process.md` and `.claude/rules/workflow.md` to reflect the decision
- Update SKILL.md trigger phrases to avoid collision if both systems coexist
- Document the decision in SKILL.md or CLAUDE.md

## Out of Scope

- Migrating existing 100+ todos to the new format (separate ticket if replacement chosen)
- Building new tooling for ticket lifecycle management
- Changing the ticket schema or validation logic

## Approach

Three options exist:

**(A) Supersede todos/ entirely** — Update all rule references, document migration path for existing tickets. Effort: Medium, Risk: Medium (high blast radius on established workflow).

**(B) Scope as distinct systems** — `todos/` for session-level work, `workspace/tickets/` for agent-orchestrated multi-step work. Remove overlapping triggers. Effort: Small, Risk: Low.

**(C) Evolve todos/ with new schema** — Apply the frontmatter contract and validation to the existing `todos/` directory. Preserves history and ID sequence. Effort: Large, Risk: Medium.

- **Effort:** Small-Medium (depending on option chosen)
- **Risk:** Medium

## Constraints

- Must not break references in `dev-process.md` and `workflow.md` without updating them
- Must not lose the 100+ completed tickets in `todos/completed/`
- The chosen approach must be unambiguous — an agent encountering "create a ticket" must know which system to use

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/154
- Existing rules: `.claude/rules/dev-process.md`, `.claude/rules/workflow.md`
