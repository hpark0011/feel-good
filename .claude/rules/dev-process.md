# Dev Process Guidelines

Rules for how Claude and the developer work together. Derived from retrospective analysis.

## Session Discipline

- **One focused outcome per session.** Define the single deliverable before starting. Commit progress and start fresh for the next piece.
- **State the branch and plan file** at session start if they exist.
- **Don't let sessions balloon.** If context is getting heavy, commit what's done and continue in a new session rather than losing context.
- **Hard ceiling: ~150 turns.** Sessions approaching 150 turns should checkpoint-commit and continue fresh. The 700-turn Tavus session proved that quality degrades well before context limits.

## Tool Discipline

- **Never use Bash for file reading or searching.** Use `Read` instead of `cat`/`head`/`tail`, `Grep` instead of `grep`/`rg`, `Glob` instead of `find`/`ls`. This was flagged in 5/9 recent sessions.
- **Infrastructure sessions still need investigation.** Even for worktree/setup tasks, use Read/Grep to check existing state before running Bash commands.

## Debugging UI/Visual Bugs

- **Observe before coding.** Use Chrome MCP to screenshot/inspect the live behavior before writing a fix. The developer reproducing in browser + Claude observing via MCP is the fastest path.
- **State hypothesis before implementation.** Explain the root cause theory and let the developer validate before writing code.
- **Never use setTimeout to fix visual timing issues.** It's always a bandaid. Find the architectural root cause (render lifecycle, transition conflicts, lazy loading interactions).
- **Limit agent orchestration for UI bugs.** Multi-agent workflows help for code review and refactoring, not pixel-level debugging. Keep it to 1-2 focused agents max.

## Problem-Solving Flow

Follow this order — don't skip steps:

1. **Developer describes the problem** (often with their own analysis)
2. **Claude investigates and states hypothesis** — compare with developer's thinking
3. **Align on approach** before touching code
4. **Implement from a plan** — not ad-hoc
5. **Verify** — browser check, build, or test

## Solution Quality

- **Reject bandaid fixes.** If the fix doesn't address root cause, don't ship it.
- **One revert = rethink.** If a solution needs reverting, step back and re-investigate rather than iterating on the same approach.
- **Prefer the developer's architectural instinct.** When the developer provides a root cause analysis, weight it heavily — they know the codebase deeply.

## Task Management

- Drive work through `workspace/tickets/` using the `generate-issue-tickets` skill. Reference tickets with `work on @workspace/tickets/...`.
- Document learnings from debugging sessions early in `workspace/lessons.md` — don't wait for the fix to land before capturing "what we tried and why it failed."
