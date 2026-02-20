---
id: GB_004
title: "Validator enforces SKILL.md contract severity levels"
date: 2026-02-20
type: fix
status: to-do
priority: p2
description: "The validator treats several contract violations as warnings that the SKILL.md documents as errors. Acceptance criteria count below 2 is described as 'too vague' but validated as a warning. Status is not checked for to-do on creation. The Approach regex silently skips Effort/Risk when it fails to match."
dependencies:
  - GB_002
parent_plan_id:
acceptance_criteria:
  - "Running the validator on a ticket with `status: backlog` reports an error (not just a warning) when the ticket is in the `to-do/` directory"
  - "Running the validator on a ticket with only 1 acceptance criterion reports an error, not a warning"
  - "Running the validator on a ticket where the Approach section cannot be parsed emits a warning about the parsing failure"
  - "`node .claude/skills/generate-issue-tickets/scripts/validate.mjs .claude/skills/generate-issue-tickets/examples/example-p1-security.md` still exits 0"
owner_agent: "Validator Consistency Agent"
---

# Validator Enforces SKILL.md Contract Severity Levels

## Context

Three mismatches exist between what SKILL.md documents and what the validator enforces:

1. **Status on creation:** SKILL.md line 49 says `status` "Must be `to-do` on creation." The validator (`validate.mjs:144-150`) accepts any valid status enum value without checking context.

2. **Acceptance criteria count:** SKILL.md line 179 says "Fewer than 2: ticket is too vague." The validator (`validate.mjs:191-195`) treats this as a warning, not an error. An agent can create a ticket with 1 criterion and receive no error.

3. **Silent Approach parsing failure:** When the Approach regex doesn't match (`validate.mjs:221-230`), no warning is emitted. The validator gives false confidence that Effort/Risk are present.

- **Source:** Code review of PR #154 (Pattern Recognition Specialist)
- **Location:** `.claude/skills/generate-issue-tickets/scripts/validate.mjs:144-150, 191-195, 221-230`
- **Evidence:** Validator exits 0 for tickets that violate documented constraints

## Goal

The validator's error/warning classification matches the SKILL.md contract. Documented hard requirements produce errors, not warnings.

## Scope

- Promote acceptance criteria count < 2 from warning to error
- Add warning when Approach section regex fails to match
- Consider adding a `--strict` mode or directory-aware check for status validation

## Out of Scope

- Adding new validation rules not documented in SKILL.md
- Changing the SKILL.md contract itself
- Adding unit tests for the validator (separate ticket)

## Approach

In `validateFrontmatter()`:
- Change the `< 2` criteria check from `warnings.push` to `errors.push`

In `validateBody()`:
- Add `else` branch when `approachMatch` is null to emit a warning

For status validation, add a `--strict` flag or check the file's parent directory to determine if it's a creation (to-do/) vs transition.

- **Effort:** Small
- **Risk:** Low

## Constraints

- Must not break validation of existing example tickets
- The validator must remain usable for tickets in any status (not just to-do)
- Error vs warning distinction must be clear and documented

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/154
