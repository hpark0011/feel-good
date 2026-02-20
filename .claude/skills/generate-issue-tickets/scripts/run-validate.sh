#!/bin/bash
# PostToolUse hook wrapper for ticket validation.
# Reads tool input JSON from stdin, filters to workspace/tickets/ .md files,
# and runs the validator. Exits 0 (no-op) for non-ticket files.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only validate ticket files
if [[ "$FILE_PATH" != *"/workspace/tickets/"* ]]; then
  exit 0
fi

# Only validate .md files
if [[ "$FILE_PATH" != *.md ]]; then
  exit 0
fi

node "$(dirname "$0")/validate.mjs" "$FILE_PATH"
