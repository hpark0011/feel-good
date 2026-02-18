#!/bin/bash
set -e

BRANCH_NAME="$1"
[[ -z "$BRANCH_NAME" ]] && echo "Error: branch name required" && exit 1

GIT_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_PATH="$GIT_ROOT/.worktrees/$BRANCH_NAME"

[[ -d "$WORKTREE_PATH" ]] && echo "Error: worktree already exists at $WORKTREE_PATH" && exit 1

mkdir -p "$GIT_ROOT/.worktrees"
git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" main

cd "$WORKTREE_PATH"
pnpm install

echo ""
echo "Worktree created: $WORKTREE_PATH"
