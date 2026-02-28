#!/bin/bash
# PostToolUse hook wrapper for ticket validation.
# Reads tool input JSON from stdin, filters to workspace/tickets/ .md files,
# and runs the validator. Exits 0 (no-op) for non-ticket files.

INPUT=$(cat)
FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')

# Reject empty paths or paths with control characters
if [[ -z "$FILE_PATH" ]] || [[ "$FILE_PATH" == *$'\n'* ]] || [[ "$FILE_PATH" == *$'\r'* ]]; then
  exit 0
fi

# Only validate .md files
if [[ "$FILE_PATH" != *.md ]]; then
  exit 0
fi

# Only validate files canonically inside workspace/tickets/
REPO_ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
case "$FILE_PATH" in
  "$REPO_ROOT/workspace/tickets/"*)
    ;;
  *)
    exit 0
    ;;
esac

node "$(dirname "$0")/validate.mjs" "$FILE_PATH"
