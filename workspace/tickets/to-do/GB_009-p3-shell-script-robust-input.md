---
id: GB_009
title: "Shell script uses printf and guards control characters"
date: 2026-02-20
type: fix
status: to-do
priority: p3
description: "The run-validate.sh script uses echo to pipe input to jq, which has edge-case behavior when input starts with -n, -e, or -E flags. Should use printf for robustness. Additionally, paths containing newlines or control characters should be rejected early."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "`grep -n 'echo' .claude/skills/generate-issue-tickets/scripts/run-validate.sh` returns no matches (echo replaced)"
  - "`grep -n 'printf' .claude/skills/generate-issue-tickets/scripts/run-validate.sh` returns at least one match"
  - "The script contains a guard against newline characters in FILE_PATH"
owner_agent: "Shell Script Agent"
---

# Shell Script Uses printf and Guards Control Characters

## Context

`run-validate.sh:7` uses `echo "$INPUT" | jq` to extract the file path from JSON. While `echo` with double-quoted variables is generally safe, it has platform-dependent edge cases when input starts with `-n`, `-e`, or `-E` (interpreted as flags on some systems). `printf '%s'` is the robust alternative.

Additionally, the script does not guard against paths containing newlines or other control characters, which could cause the glob matches to behave unexpectedly.

- **Source:** Code review of PR #154 (Security Sentinel)
- **Location:** `.claude/skills/generate-issue-tickets/scripts/run-validate.sh:7`
- **Evidence:** `echo "$INPUT"` on line 7

## Goal

The shell script handles all input robustly regardless of content.

## Scope

- Replace `echo "$INPUT"` with `printf '%s' "$INPUT"`
- Add guard rejecting paths with newlines or carriage returns

## Out of Scope

- Restructuring the shell script logic
- Adding jq availability check

## Approach

Two-line change:

```bash
FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE_PATH" == *$'\n'* ]] || [[ "$FILE_PATH" == *$'\r'* ]]; then
  exit 0
fi
```

- **Effort:** Small
- **Risk:** Low

## Constraints

- Must not change the script's filtering behavior for valid paths

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/154
