---
id: FG_003
title: "Shell hook validates canonical path prefix not substring"
date: 2026-02-20
type: fix
status: completed
priority: p2
description: "The run-validate.sh script uses a substring containment check for /workspace/tickets/ which can be satisfied by paths like /tmp/evil/workspace/tickets/payload.md or paths with ../ traversal segments. Should use a canonicalized prefix check."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "`grep -n '\\*\"/workspace/tickets/\"\\*' .claude/skills/generate-issue-tickets/scripts/run-validate.sh` returns no matches (substring check removed)"
  - "The script resolves the file path and checks it starts with the repo's workspace/tickets/ directory"
  - "`grep -n 'printf' .claude/skills/generate-issue-tickets/scripts/run-validate.sh` returns at least one match (echo replaced with printf)"
  - "The script exits 0 for paths containing newlines or control characters"
owner_agent: "Shell Script Hardening Agent"
---

# Shell Hook Validates Canonical Path Prefix Not Substring

## Context

The `run-validate.sh` PostToolUse hook extracts `file_path` from Claude's tool output JSON and checks whether it contains the substring `/workspace/tickets/`:

```bash
if [[ "$FILE_PATH" != *"/workspace/tickets/"* ]]; then
  exit 0
fi
```

This is a containment check, not a prefix check. A path like `/tmp/malicious/workspace/tickets/evil.md` or one with `../` traversal segments would pass the filter. While exploitation requires controlling Claude's tool output (unlikely), defense-in-depth is appropriate.

Additionally, `echo "$INPUT" | jq` should be `printf '%s' "$INPUT" | jq` for robustness against input starting with `-n`, `-e`, or `-E`.

- **Source:** Code review of PR #154 (Security Sentinel)
- **Location:** `.claude/skills/generate-issue-tickets/scripts/run-validate.sh:7-12`
- **Evidence:** Substring glob match `*"/workspace/tickets/"*` passes for any path containing the literal substring

## Goal

The shell hook only validates files that are canonically located within the repository's `workspace/tickets/` directory, using resolved paths rather than substring matching.

## Scope

- Replace substring glob check with canonicalized prefix check
- Replace `echo` with `printf` for stdin pipe to jq
- Add guard against paths containing newlines or control characters

## Out of Scope

- Adding path validation inside validate.mjs itself
- Changing the PostToolUse hook matcher pattern
- Adding authentication or authorization to the hook

## Approach

Replace the path checking logic:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]] || [[ "$FILE_PATH" == *$'\n'* ]] || [[ "$FILE_PATH" == *$'\r'* ]]; then
  exit 0
fi

if [[ "$FILE_PATH" != *.md ]]; then
  exit 0
fi

REPO_ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
case "$FILE_PATH" in
  "$REPO_ROOT/workspace/tickets/"*)
    ;;
  *)
    exit 0
    ;;
esac

node "$(dirname "$0")/validate.mjs" "$FILE_PATH"
```

- **Effort:** Small
- **Risk:** Low

## Constraints

- Must not break the hook for legitimate ticket file paths
- Must exit 0 (no-op) for non-ticket files — never block unrelated Write/Edit operations
- Must work on macOS (the development platform)

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/154
