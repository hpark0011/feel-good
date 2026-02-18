---
name: new-worktree
description: Create a new git worktree for parallel development. Supports three input modes — empty (scratch), todo file, or free-text requirement. Invoke with `/workspace:new-worktree`, `/workspace:new-worktree <todo-file.md>`, or `/workspace:new-worktree <requirement>`.
---

# New Worktree

Create a new git worktree for parallel feature development in this monorepo.

## Trigger

- `/workspace:new-worktree` — start a scratch worktree, rename after scoping
- `/workspace:new-worktree <path-to-todo.md>` — derive name from a todo file
- `/workspace:new-worktree <requirement>` — derive name from a free-text description

## Input Detection

Determine the mode from the argument:

| Condition                | Mode                      |
| ------------------------ | ------------------------- |
| No argument provided     | **Empty (scratch)**       |
| Argument ends with `.md` | **Todo file**             |
| Anything else            | **Free-text requirement** |

## Name Generation Rules

All branch names must follow these conventions:

- **Prefix**: `feature-`, `fix-`, `chore-`, `docs-`, `improvements-` or `refactor-`
- **Slug**: 2-4 words, kebab-case, lowercase
- **Max length**: 40 characters total
- **No special characters** beyond hyphens
- Examples: `feature-auth-magic-link`, `fix-nav-transition-bug`, `refactor-dock-layout`

## Mode 1: Empty (Scratch)

### Steps

1. Generate a temporary name: `scratch-<4-char-hex>` (e.g., `scratch-a3f1`). Use a random hex value.
2. Check the name doesn't collide with existing worktrees/branches (regenerate if it does).
3. Run the creation script:
   ```bash
   bash .claude/skills/workspace/new-worktree/scripts/new-worktree.sh scratch-<hex>
   ```
4. Report the temporary worktree is ready.
5. **Ask the user** what they want to work on in this worktree — the scope, feature, or bug.
6. Once the user responds, generate a proper branch name following the naming rules above.
7. Present the generated name and ask for confirmation.
8. On confirmation, rename the worktree:
   ```bash
   bash .claude/skills/workspace/new-worktree/scripts/rename-worktree.sh scratch-<hex> <new-name>
   ```
9. Report the final name and path.

## Mode 2: Todo File

### Steps

1. **Read the todo file** using the Read tool to extract its title, tags, and description.
2. **Derive the prefix** from tags or content:
   - Tags contain `bug` or `fix` → `fix-`
   - Tags contain `refactor` → `refactor-`
   - Otherwise → `feature-`
3. **Slugify the title** into a branch name: lowercase, strip special characters, replace spaces with hyphens, truncate to 2-4 key words.
4. **Present the generated name** to the user and ask for confirmation. If rejected, ask what they'd prefer.
5. Once confirmed, proceed to **Shared Steps** below.

## Mode 3: Free-Text Requirement

### Steps

1. **Analyze the requirement** to determine the prefix:
   - Describes a bug or broken behavior → `fix-`
   - Describes restructuring existing code → `refactor-`
   - Otherwise → `feature-`
2. **Generate a concise slug** (2-4 words, kebab-case) that captures the essence of the requirement.
3. **Present the generated name** to the user and ask for confirmation. If rejected, ask what they'd prefer.
4. Once confirmed, proceed to **Shared Steps** below.

## Shared Steps (All Modes)

These run after a branch name is confirmed (Modes 2 & 3) or after initial creation (Mode 1):

### 1. Check worktree doesn't already exist

Run `git worktree list` and check if a worktree for this branch already exists. Also check if the branch name is already taken with `git branch --list <branch-name>`. If either exists, inform the user and stop.

### 2. Run the creation script

```bash
bash .claude/skills/workspace/new-worktree/scripts/new-worktree.sh <branch-name>
```

### 3. Report result

Tell the user:

- The worktree path (`.worktrees/<branch-name>`)
- The branch name created
- That `pnpm install` completed
- Remind them to use a different port if running dev servers in multiple worktrees
