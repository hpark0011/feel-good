---
id: FG_005
title: "Validator checks directory matches frontmatter status"
date: 2026-02-20
type: fix
status: completed
priority: p2
description: "SKILL.md documents that ticket status is encoded in two places that must stay in sync: the status field in YAML frontmatter and the directory the file lives in. The validator does not check this invariant, allowing drift between directory and frontmatter status."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "A ticket in `workspace/tickets/to-do/` with `status: completed` in frontmatter produces a validation error"
  - "A ticket in `workspace/tickets/completed/` with `status: to-do` in frontmatter produces a validation error"
  - "A ticket in `workspace/tickets/to-do/` with `status: to-do` passes validation"
  - "`node .claude/skills/generate-issue-tickets/scripts/validate.mjs .claude/skills/generate-issue-tickets/examples/example-p1-security.md` still exits 0 (examples are outside the status directory tree)"
owner_agent: "Validator Enhancement Agent"
---

# Validator Checks Directory Matches Frontmatter Status

## Context

SKILL.md lines 33-34 document a dual-source-of-truth invariant:

> Ticket status is encoded in **two places** that must stay in sync:
> 1. The `status` field in YAML frontmatter
> 2. The directory the file lives in

The validator (`validate.mjs`) checks that `status` is a valid enum value (lines 144-150) but does not compare the file's parent directory name against the frontmatter status. An agent could use `Edit` to change `status: to-do` to `status: completed` without moving the file, creating an inconsistent state that passes validation.

- **Source:** Code review of PR #154 (Architecture Strategist, Agent-Native Reviewer)
- **Location:** `.claude/skills/generate-issue-tickets/scripts/validate.mjs` (absent check)
- **Evidence:** No code in the validator references the file's directory path for status comparison

## Goal

The validator detects and reports when a ticket file's parent directory does not match its frontmatter `status` field.

## Scope

- Add a directory-status consistency check to `validateFilename()` or a new function
- Map directory names to expected status values using the lifecycle table
- Report an error when they don't match
- Handle files outside the `workspace/tickets/` tree gracefully (no error, since examples live elsewhere)

## Out of Scope

- Automatically moving files to match status changes
- Adding a transition-ticket skill or script
- Enforcing status transitions (e.g., preventing to-do -> completed without in-progress)

## Approach

Extract the parent directory name from the file path and compare against the frontmatter `status`:

```javascript
function validateDirectoryStatus(filepath, fm, errors) {
  if (!fm?.status) return;
  const parentDir = basename(dirname(filepath));
  const statusDirs = new Set(VALID_STATUSES);
  if (!statusDirs.has(parentDir)) return; // file not in a status directory
  if (parentDir !== fm.status) {
    errors.push(`Directory "${parentDir}" does not match frontmatter status "${fm.status}"`);
  }
}
```

- **Effort:** Small
- **Risk:** Low

## Constraints

- Must not fail for files outside the status directory tree (examples, templates)
- Must handle the `to-do` directory name correctly (it contains a hyphen, matching the status value)

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/154
- SKILL.md status lifecycle table: lines 99-110
