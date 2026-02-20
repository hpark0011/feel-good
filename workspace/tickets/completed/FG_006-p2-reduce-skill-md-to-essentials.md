---
id: FG_006
title: "SKILL.md contains only essential sections"
date: 2026-02-20
type: refactor
status: completed
priority: p2
description: "SKILL.md is 210 lines with several sections that duplicate information already in the frontmatter contract table or are unnecessary process methodology for an LLM. Scoping Enforcement, Owner Agent, Parent Plan, Status Lifecycle, and Batch Generation sections can be collapsed into existing sections, reducing the file to approximately 130-140 lines."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "SKILL.md is under 150 lines"
  - "The frontmatter contract table still contains all 11 fields with their validation rules"
  - "The workflow steps are preserved"
  - "The priority rubric and type enum are preserved"
  - "Scoping enforcement rules are present as bullets in the Rules section (not a separate section)"
  - "`grep -c '## ' .claude/skills/generate-issue-tickets/SKILL.md` returns fewer headings than before"
owner_agent: "Documentation Refactor Agent"
---

# SKILL.md Contains Only Essential Sections

## Context

SKILL.md is 210 lines. Several sections duplicate information or provide unnecessary process methodology:

- **Scoping Enforcement** (lines 157-189, 33 lines): Formal decomposition protocol that an LLM handles naturally. Can be reduced to 2-3 bullets in the Rules section.
- **Owner Agent** (lines 139-148, 10 lines): Explains how to choose an agent title — obvious LLM behavior. Already documented in the frontmatter table.
- **Parent Plan** (lines 149-154, 6 lines): Says "optional, set when derived from a plan" — already in the frontmatter table.
- **Status Lifecycle** (lines 99-110, 12 lines): Duplicates the directory structure shown at lines 24-32. The table adds "Meaning" but directory names are self-explanatory.
- **Batch Generation** (lines 203-210, 8 lines): Edge case already covered by workflow step 3 and the Rules section.
- **Acceptance Criteria types table** (lines 123-136, 14 lines): Lists 9 types — could be a single sentence plus 2 inline examples.

- **Source:** Code review of PR #154 (Code Simplicity Reviewer)
- **Location:** `.claude/skills/generate-issue-tickets/SKILL.md:99-210`
- **Evidence:** 83 lines (~40%) of SKILL.md duplicates or over-specifies

## Goal

SKILL.md is concise and contains only information that changes the LLM's behavior. Redundant sections are removed or inlined.

## Scope

- Inline Owner Agent and Parent Plan notes into the frontmatter contract table
- Collapse Scoping Enforcement into 2-3 bullets in the Rules section
- Remove duplicate Status Lifecycle table (directory structure section already covers this)
- Remove Batch Generation section (covered by workflow step 3 + Rules)
- Reduce Acceptance Criteria types to a concise list

## Out of Scope

- Changing the frontmatter contract itself
- Modifying the template or examples
- Changing the validator logic

## Approach

Work through the file top-to-bottom, removing or inlining each identified section. Verify the remaining content still covers all contract requirements by cross-referencing with the validator's checks.

- **Effort:** Small
- **Risk:** Low

## Constraints

- Must not remove any information that changes the LLM's ticket generation behavior
- The frontmatter contract table and workflow steps must be preserved exactly
- Priority rubric and type enum must be preserved

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/154
