---
id: GB_007
title: "Ticket ID prefix reflects monorepo identity not single app"
date: 2026-02-20
type: improvements
status: to-do
priority: p3
description: "The GB_ prefix in ticket IDs presumably stands for GreyBoard, one of four apps. The ticket system serves the entire monorepo including mirror, ui-factory, and greyboard-desktop. The prefix should reflect the monorepo identity like FG_ for feel-good, matching the @feel-good/* package namespace."
dependencies:
  - GB_001
parent_plan_id:
acceptance_criteria:
  - "`grep -rn 'GB_' .claude/skills/generate-issue-tickets/` returns no matches (prefix updated everywhere)"
  - "The ID_PATTERN in validate.mjs uses the new prefix"
  - "The FILENAME_PATTERN in validate.mjs uses the new prefix"
  - "Both example files use the new prefix"
  - "Template.md uses the new prefix"
owner_agent: "Naming Convention Agent"
---

# Ticket ID Prefix Reflects Monorepo Identity Not Single App

## Context

The ticket ID format is `GB_NNN` where `GB` presumably stands for "GreyBoard," one of the four apps in the monorepo. However, the ticket system is monorepo-wide — tickets can target `mirror`, `ui-factory`, `greyboard-desktop`, or shared packages. The existing `@feel-good/*` package namespace uses "feel-good" as the identity.

- **Source:** Code review of PR #154 (Architecture Strategist)
- **Location:** `.claude/skills/generate-issue-tickets/SKILL.md:45`, `.claude/skills/generate-issue-tickets/scripts/validate.mjs:44-46`
- **Evidence:** `GB_` prefix appears in ID_PATTERN, FILENAME_PATTERN, SKILL.md contract, template, and both examples

## Goal

The ticket ID prefix reflects the monorepo identity rather than a single app.

## Scope

- Update ID_PATTERN regex in validate.mjs
- Update FILENAME_PATTERN regex in validate.mjs
- Update SKILL.md frontmatter contract and naming convention sections
- Update template.md
- Update both example files

## Out of Scope

- Renaming existing tickets (none exist yet in the main system)
- Changing the numeric portion format (NNN stays as 3-digit zero-padded)

## Approach

Global find-and-replace of `GB_` with `FG_` (for "feel-good") across all files in the skill directory. Update the regex patterns accordingly.

- **Effort:** Small
- **Risk:** Low

## Constraints

- The new prefix must be exactly 2-3 characters followed by underscore
- Must update all references in a single commit to avoid inconsistency

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/154
