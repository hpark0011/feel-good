---
id: GB_008
title: "Type enum uses consistent singular form"
date: 2026-02-20
type: fix
status: to-do
priority: p3
description: "The type enum includes improvements (plural) while all other values are singular: feature, fix, chore, docs, refactor, perf. This inconsistency will cause validation failures when agents write improvement (singular) which is the natural English form."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "`grep -n 'improvements' .claude/skills/generate-issue-tickets/scripts/validate.mjs` returns no matches (changed to singular)"
  - "`grep -n 'improvements' .claude/skills/generate-issue-tickets/SKILL.md` returns no matches (changed to singular)"
  - "The validator accepts `type: improvement` as valid"
owner_agent: "Naming Consistency Agent"
---

# Type Enum Uses Consistent Singular Form

## Context

The type enum in both SKILL.md and validate.mjs includes `improvements` (plural):

```javascript
const VALID_TYPES = ["feature", "fix", "improvements", "chore", "docs", "refactor", "perf"];
```

Every other value is singular. This is inconsistent and will cause validation failures when agents naturally write `improvement` (singular), which follows the pattern of all other enum values.

- **Source:** Code review of PR #154 (Agent-Native Reviewer)
- **Location:** `.claude/skills/generate-issue-tickets/scripts/validate.mjs:18-25` and `.claude/skills/generate-issue-tickets/SKILL.md:48,83`
- **Evidence:** 6 of 7 enum values are singular; `improvements` is the outlier

## Goal

All type enum values use consistent singular form.

## Scope

- Change `improvements` to `improvement` in validate.mjs VALID_TYPES array
- Change `improvements` to `improvement` in SKILL.md frontmatter contract and type enum table

## Out of Scope

- Adding new type enum values
- Changing other enum naming conventions

## Approach

Find-and-replace `improvements` with `improvement` in validate.mjs and SKILL.md.

- **Effort:** Small
- **Risk:** Low

## Constraints

- Must update both SKILL.md and validate.mjs in the same commit

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/154
