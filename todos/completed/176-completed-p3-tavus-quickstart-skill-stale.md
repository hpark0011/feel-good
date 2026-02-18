---
status: completed
priority: p3
issue_id: "176"
tags: [code-review, documentation, tavus]
dependencies: []
---

# Update Stale Tavus Quickstart Skill Doc

## Problem Statement

The Tavus quickstart skill at `.claude/skills/tavus-cvi-quickstart/SKILL.md` (line 96) uses `max_duration` in its code examples, but the Tavus API actually expects `max_call_duration`. This stale documentation caused the original 400 error — Claude agents consulting this skill will produce incorrect API calls.

## Findings

- **Location:** `.claude/skills/tavus-cvi-quickstart/SKILL.md:96`
- **Source:** Code review — architecture-strategist agent
- **Severity:** Low
- **Note:** The completed design plan at `docs/plans/completed/2026-02-17-feat-tavus-cvi-video-calling-plan.md` (lines 106, 237) also uses the stale name

## Proposed Solutions

### Solution A: Update Skill Doc (Recommended)

Change `"max_duration": 600` to `"max_call_duration": 600` in the skill SKILL.md.

- **Pros:** Prevents future agents from repeating the same mistake
- **Cons:** None
- **Effort:** Small (one-line change)
- **Risk:** None

## Acceptance Criteria

- [ ] `.claude/skills/tavus-cvi-quickstart/SKILL.md` uses `max_call_duration` in all examples
- [ ] No references to `max_duration` remain in active skill docs

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-19 | Created from code review of unstaged changes on mirror/fix-tavus-server-error | Stale skill doc was the root cause of the original 400 error |
| 2026-02-19 | Updated `max_duration` → `max_call_duration` in SKILL.md | No other stale references found in active skill docs |
