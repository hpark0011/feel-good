---
title: Add update-claude-md skill and workflow
type: feat
date: 2026-02-03
---

# Add update-claude-md Skill and Workflow

Add a dedicated workflow for updating existing CLAUDE.md files, complementing the existing `create-claude-md` and `review-claude-md` workflows.

## Problem Statement

The claude-md-maintainer skill currently has two workflows:
- **create-claude-md**: Generates new CLAUDE.md files from scratch
- **review-claude-md**: Audits existing files and provides scored feedback

There's no workflow for **updating** an existing CLAUDE.md based on user requirements. The review workflow identifies issues but doesn't apply targeted changes based on user intent.

## Proposed Solution

Add `update-claude-md` workflow that:
1. Reads quality criteria from `best-practices.md`
2. Understands user's specific update requirements
3. Inspects current CLAUDE.md setup (including monorepo structure)
4. Plans and executes targeted updates that meet both user requirements and quality criteria

## Why This Approach

| Alternative | Why Not |
|-------------|---------|
| Extend review-claude-md | Review focuses on auditing, not user-driven updates. Mixing concerns would make both workflows less clear. |
| Use create-claude-md with overwrite | Create assumes no existing file; loses institutional knowledge and carefully-tuned content. |
| Manual editing after review | Loses the guided workflow; user must translate review findings into changes themselves. |

The dedicated update workflow is the cleanest separation of concerns:
- **create** = generate from scratch
- **review** = audit and score
- **update** = apply targeted changes

## Acceptance Criteria

- [x] `update-claude-md.md` skill file created in `.claude/skills/claude-md-maintainer/`
- [x] `update-claude-md.md` command created in `.claude/commands/`
- [x] SKILL.md updated to list the new workflow
- [x] Workflow follows the 4-step process from requirements
- [x] Workflow references `best-practices.md` for quality criteria
- [x] Plan includes rationale for changes (why suggested plan works)

## Implementation Plan

### Phase 1: Create Skill Workflow File

Create `.claude/skills/claude-md-maintainer/update-claude-md.md`:

```markdown
---
name: update-claude-md
description: Update existing CLAUDE.md files based on user requirements
---

# Update CLAUDE.md

Apply targeted updates to existing CLAUDE.md files based on user requirements.

## Prerequisites

Read `best-practices.md` for quality criteria and output template.

## Steps

### 1. Understand Requirements

Clarify user's update requirements:
- What needs to change?
- Why is the change needed?
- What should NOT change?

### 2. Inspect Current Setup

Read existing CLAUDE.md files:
- Root `CLAUDE.md`
- Any nested `CLAUDE.md` files in apps/packages (for monorepos)
- Note current structure, conventions, and content

Count current instructions and assess quality baseline.

### 3. Plan Updates

For each required change:
1. Identify affected sections
2. Draft the update
3. Explain why this change works

Consider:
- Does the change maintain instruction count targets (<50)?
- Does it follow best practices (terse, imperative)?
- Does it avoid anti-patterns (verbosity, redundancy, staleness)?
- Does it preserve existing well-written content?

Present the plan with rationale before applying.

### 4. Apply Updates

After user approval:
1. Show diff of proposed changes
2. Apply updates
3. Run self-review checklist:
   - [ ] Any instruction could be shorter?
   - [ ] Anything duplicated?
   - [ ] Every command verified?
   - [ ] Anything a linter handles?
4. Output final result

### 5. Offer Follow-up

After updates:
- Run full review to verify quality score maintained/improved
- Suggest additional improvements if found
```

### Phase 2: Create Command File

Create `.claude/commands/update-claude-md.md`:

```markdown
---
argument-hint: [update-requirements]
name: update-claude-md
description: Update existing CLAUDE.md files based on requirements
---

Use the claude-md-maintainer skill to update existing CLAUDE.md files.

Follow the update-claude-md workflow. Read best-practices.md before making changes.

$ARGUMENTS
```

### Phase 3: Update SKILL.md

Update `.claude/skills/claude-md-maintainer/SKILL.md` to include the new workflow:

```markdown
## Workflows

- `create-claude-md.md` — Analyze codebase, generate new CLAUDE.md
- `review-claude-md.md` — Audit existing file, provide scored feedback
- `update-claude-md.md` — Apply targeted updates based on user requirements
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `.claude/skills/claude-md-maintainer/update-claude-md.md` | Create |
| `.claude/commands/update-claude-md.md` | Create |
| `.claude/skills/claude-md-maintainer/SKILL.md` | Modify |

## References

- Existing skill: `.claude/skills/claude-md-maintainer/`
- Best practices: `.claude/skills/claude-md-maintainer/best-practices.md`
- Create workflow: `.claude/skills/claude-md-maintainer/create-claude-md.md`
- Review workflow: `.claude/skills/claude-md-maintainer/review-claude-md.md`
