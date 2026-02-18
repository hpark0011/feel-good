---
name: list-worktree
description: List all active git worktrees. Invoke with `/workspace:list-worktree`.
---

# List Worktrees

Show all active git worktrees in this repository.

## Trigger

`/workspace:list-worktree`

## Steps

### 1. Run git worktree list

Run:

```bash
git worktree list
```

### 2. Present output

Format the output for the user, showing:
- Each worktree path
- Its associated branch
- The commit hash

If there's only the main worktree (no `.worktrees/` entries), tell the user there are no additional worktrees active.
