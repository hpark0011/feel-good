---
name: clean-worktree
description: Remove a git worktree and its associated branch. Invoke with `/workspace:clean-worktree <worktree-name>`.
---

# Clean Worktree

Remove a git worktree and delete its associated branch.

## Trigger

`/workspace:clean-worktree <worktree-name>`

## Input

The user provides the worktree name (same as the branch name, e.g., `feature-auth-refactor`).

## Steps

### 1. Confirm with user

Before running anything, confirm with the user:
- Which worktree will be removed (`.worktrees/<name>`)
- Which branch will be deleted (`<name>`)
- Ask them to confirm they want to proceed

### 2. Run the cleanup script

Execute:

```bash
bash .claude/skills/workspace/clean-worktree/scripts/clean-worktree.sh <worktree-name>
```

This script:
1. Removes the worktree directory via `git worktree remove`
2. Deletes the branch via `git branch -d` (safe delete)
3. Prunes stale worktree metadata

### 3. Handle unmerged branch (exit code 2)

If the script exits with code 2, the branch has unmerged changes. Ask the user:
- "Branch `<name>` has unmerged changes. Do you want to force-delete it?"
- If yes, run `git branch -D <name>` and then `git worktree prune`
- If no, inform them the worktree was removed but the branch remains

### 4. Report result

Tell the user what was cleaned up:
- Worktree removed
- Branch deleted (or kept if user declined force-delete)
