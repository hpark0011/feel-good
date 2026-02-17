# Plan: Reorganize Documentation & Configuration

## Context

The repo has accumulated redundant AI tool configuration directories (`.codex/`, `.cursor/`, `.github/skills/`) that are byte-identical copies of `.claude/` content. AGENTS.md and CLAUDE.md have overlapping content with an inverted reference pattern. The `todos/` directory has data integrity issues (duplicate IDs, wrong filenames/frontmatter). `.claude/opportunities.md` is 13-month-old empty boilerplate.

**Goal:** Eliminate ~150 redundant files, establish the AGENTS.md Bridge Pattern, and fix todo data integrity — without changing any Claude Code behavior.

---

## Research Summary

### Current State (Problems Found)

1. **~150 redundant files**: `vercel-react-best-practices` skill (49 files) copied identically across `.codex/`, `.cursor/`, `.github/skills/`, and `.claude/` (canonical)
2. **`.codex/` entirely redundant**: 50 files, only duplicates. Its AGENTS.md references wrong path (`tasks/` vs `todos/`)
3. **`.cursor/` entirely redundant**: 49 files, zero Cursor-specific configuration
4. **AGENTS.md inverted**: Line 1 is `@CLAUDE.md` which includes everything — makes AGENTS.md useless as a universal standard. Also contains Claude-specific workflow rules other tools can't use
5. **Todo data integrity**: 4 duplicate IDs, 8 wrong filenames, 11 wrong frontmatter statuses, stale session plans accumulating in `todo.md`
6. **Stale content**: `.claude/opportunities.md` — 110 lines of empty template since Jan 2025
7. **Documentation overlap**: `.claude/rules/folder-structure.md` is a subset of `docs/conventions/file-organization-convention.md`

### Best Practices Applied

- **AGENTS.md Bridge Pattern**: Universal instructions in AGENTS.md (supported by Codex, Cursor, Amp, Jules, Copilot). Claude-specific features in CLAUDE.md with `@AGENTS.md` reference
- **Document lifecycle separation**: Immutable decisions (ADRs), living conventions, ephemeral plans
- **AI config consolidation**: Single canonical location in `.claude/`, eliminate per-tool duplication

---

## Phase 1: Delete Redundant Directories (~150 files removed)

### 1.1 Delete `.codex/` entirely
- 50 files — only contains a duplicate vercel skill + duplicate Sentry rule
- Codex reads `AGENTS.md` natively

### 1.2 Delete `.cursor/skills/` then `.cursor/` if empty
- 49 files — byte-identical copy of `.claude/skills/vercel-react-best-practices/`
- Cursor reads `AGENTS.md` natively

### 1.3 Delete `.github/skills/` (keep `.github/workflows/`)
- 49 files — fourth copy of the same vercel skill
- **Do NOT touch** `.github/workflows/` (4 active CI workflows)

### 1.4 Delete `.claude/opportunities.md`
- Empty boilerplate since Jan 2025, zero tracked opportunities

**Verification:** Confirm `.claude/skills/vercel-react-best-practices/` still exists, `.github/workflows/` untouched.

---

## Phase 2: AGENTS.md / CLAUDE.md Bridge Pattern

### 2.1 Rewrite `AGENTS.md` as universal project instructions
Move tool-agnostic content here:
- Project overview, structure, quick start commands
- Package import patterns
- Core principles (simplicity, root causes, minimal impact, verify before done)
- Task management conventions (todos/ directory structure)

Remove: `@CLAUDE.md` directive, Claude-specific workflow rules

### 2.2 Update `CLAUDE.md` to use `@AGENTS.md`
- Add `@AGENTS.md` as first line
- Remove content now in AGENTS.md (quick start, structure, apps table)
- Keep Claude-specific content: package details, auth layers, TypeScript configs, `.claude/` configuration section

### 2.3 Create `.claude/rules/workflow.md`
Preserve the Claude-specific workflow rules from old AGENTS.md:
- Plan mode default, subagent strategy, self-improvement loop
- Verification before done, demand elegance, autonomous bug fixing

### 2.4 Update sub-project AGENTS.md files
- `packages/ui/AGENTS.md`: `@CLAUDE.md` -> `@AGENTS.md`
- `apps/greyboard-desktop/AGENTS.md`: `@CLAUDE.md` -> `@AGENTS.md`

**Verification:** Start a Claude session, confirm context loads correctly.

---

## Phase 3: Todo Data Integrity Fixes

### 3.1 Rename 8 completed files with wrong status word
Files in `todos/completed/` with "pending" or "done" in filename -> "completed"

### 3.2 Fix frontmatter in completed files
- 9 files with `status: done` -> `status: completed`
- 3 files with `status: pending` -> `status: completed`

### 3.3 Rename + fix frontmatter for 8 canceled files
Files in `todos/canceled/` with "pending" in filename -> "canceled", frontmatter `status: pending` -> `status: canceled`

### 3.4 Fix 3 duplicate ID collisions
- ID 016: renumber second file to 225
- ID 173: renumber completed file to 226 (pending file keeps 173)
- ID 174: renumber second file to 227

### 3.5 Clean up `todos/todo.md`
Currently 174 lines of accumulated session plans. Keep only the incomplete article filter plan (lines 41-80). Add a header explaining the file purpose.

**Verification:** `ls todos/completed/ | grep -E "pending|done"` returns empty. No duplicate IDs.

---

## Phase 4: Documentation Consolidation

### 4.1 Consolidate folder-structure rule
`.claude/rules/folder-structure.md` is a subset of `docs/conventions/file-organization-convention.md`. Replace rule content with `@docs/conventions/file-organization-convention.md` reference. If `@` directives don't work in rules files, keep inline but add comment noting canonical source.

### 4.2 Update context-guardian agent
Remove reference to deleted `.claude/opportunities.md` from `.claude/agents/context-guardian.md`.

---

## Commit Strategy

| Commit | Phase | Description |
|--------|-------|-------------|
| 1 | Phase 1 | Remove redundant `.codex/`, `.cursor/`, `.github/skills/`, `.claude/opportunities.md` |
| 2 | Phase 2 | Restructure AGENTS.md/CLAUDE.md with Bridge Pattern |
| 3 | Phase 3 | Fix todo filenames, frontmatter, duplicate IDs, clean todo.md |
| 4 | Phase 4 | Consolidate folder-structure rule, update context-guardian |

## Key Files Modified

- `/AGENTS.md` — rewrite with universal project instructions
- `/CLAUDE.md` — add `@AGENTS.md`, remove duplicated sections
- `.claude/rules/workflow.md` — new file with Claude-specific workflow rules from old AGENTS.md
- `.claude/rules/folder-structure.md` — consolidate with convention doc
- `.claude/agents/context-guardian.md` — remove opportunities.md reference
- `packages/ui/AGENTS.md` — update reference
- `apps/greyboard-desktop/AGENTS.md` — update reference
- `todos/todo.md` — clean up stale plans
- ~16 todo files — rename + fix frontmatter
- 3 todo files — renumber for duplicate ID resolution

## Risk Assessment

- **Phase 1:** Zero risk — deleting byte-identical copies
- **Phase 2:** Low risk — content redistribution, no information loss
- **Phase 3:** Very low risk — metadata corrections only
- **Phase 4:** Low risk — documentation consolidation
