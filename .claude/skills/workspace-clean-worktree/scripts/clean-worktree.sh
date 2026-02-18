#!/bin/bash
set -e

WORKTREE_NAME="$1"
[[ -z "$WORKTREE_NAME" ]] && echo "Error: worktree name required" && exit 1

GIT_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_PATH="$GIT_ROOT/.worktrees/$WORKTREE_NAME"

[[ ! -d "$WORKTREE_PATH" ]] && echo "Error: worktree not found at $WORKTREE_PATH" && exit 1

git worktree remove "$WORKTREE_PATH"

if ! git branch -d "$WORKTREE_NAME" 2>&1; then
  echo "Warning: branch '$WORKTREE_NAME' has unmerged changes."
  echo "To force-delete: git branch -D $WORKTREE_NAME"
  exit 2
fi

git worktree prune
echo "Worktree and branch cleaned up successfully."
