---
id: GB_010
title: "Skill has one example file instead of two"
date: 2026-02-20
type: chore
status: to-do
priority: p3
description: "The skill has two example files that demonstrate the same template structure. The p3 cleanup example teaches nothing the p1 security example does not. Removing the redundant example reduces maintenance burden and skill directory size."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "`ls .claude/skills/generate-issue-tickets/examples/` shows exactly one file"
  - "The remaining example is `example-p1-security.md`"
  - "`grep -rn 'example-p3' .claude/skills/generate-issue-tickets/` returns no matches (no dangling references)"
owner_agent: "Cleanup Agent"
---

# Skill Has One Example File Instead of Two

## Context

The skill includes two example tickets:
- `examples/example-p1-security.md` (68 lines) — demonstrates a P1 security fix with rich acceptance criteria and a code snippet
- `examples/example-p3-cleanup.md` (59 lines) — demonstrates a P3 chore with simpler scope

Both follow the identical template structure because the template dictates it. The second example does not demonstrate any format variation, different field usage, or edge case handling that the first does not. It adds 59 lines of content that an LLM does not need to learn the format.

- **Source:** Code review of PR #154 (Code Simplicity Reviewer)
- **Location:** `.claude/skills/generate-issue-tickets/examples/example-p3-cleanup.md`
- **Evidence:** Both examples have identical section structure (Context, Goal, Scope, Out of Scope, Approach, Constraints, Resources)

## Goal

The examples directory contains exactly one high-quality example that demonstrates the full ticket format.

## Scope

- Delete `examples/example-p3-cleanup.md`
- Verify no references to `example-p3` exist in SKILL.md or other files

## Out of Scope

- Modifying the remaining example
- Adding different types of examples (feature, refactor, etc.)

## Approach

Delete the file. Check for references.

- **Effort:** Small
- **Risk:** Low

## Constraints

- Must not remove the remaining example
- Must verify no dangling references exist

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/154
