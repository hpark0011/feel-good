# Dev Process Retrospectives

Running journal of reflections on how we work together. Used to update `.claude/rules/dev-process.md` when patterns stabilize.

---

## 2026-02-15 — First Retrospective (Full Audit)

**Scope:** 432 sessions over ~25 days (Jan 22 – Feb 15), 682 user messages, 860 subagent sessions.

### What's Working

- **Todo-driven workflow.** 198 completed todos, consistent naming (`NNN-pending-pN-description.md`), `work on @todos/...` drives sessions cleanly.
- **Plan-then-implement.** ~120 sessions start with "Implement the following plan." Plans give architectural control before code is written.
- **Fast rejection of bad solutions.** Developer catches setTimeout hacks, bandaid fixes, and shallow root cause analysis quickly. Saves time by not letting bad code accumulate.
- **Branch-per-feature discipline.** 10+ feature branches, clearly scoped.
- **Best session pattern.** Developer describes problem with own analysis → Claude validates/compares → align → implement from plan. These sessions are the fastest and produce the best outcomes.

### Where We Lost Time

#### Animation/Transition Debugging — 83 sessions
The View Transition + `next/dynamic` interaction was the biggest time sink. Pattern: Claude proposes fix → test → doesn't work/causes regressions → revert → new session → repeat. The breakthrough came when the developer said "I reproduced it in browser with devtools open. Could you observe via Chrome MCP?" — browser-first observation should have been step 1.

**Rule added:** Observe before coding. Use Chrome MCP to inspect before writing fixes.

#### Context Exhaustion — 19 sessions hit context limit
All were multi-thousand-KB sessions (up to 17MB). Each continuation loses context and requires re-explanation.

**Rule added:** One focused outcome per session. Commit and start fresh rather than ballooning.

#### Solution Rejection/Revert Cycle — ~24 instances
Checkbox indeterminate dash, toolbar flash, double slide-in all followed: implement → doesn't work → revert → try again. Multiple rounds before landing on the right fix.

**Rule added:** State hypothesis before implementation. One revert = rethink the approach entirely.

#### Subagent Overhead
234 sessions used subagents, spawning 860 total. Some sessions had 20-29 subagents. Heavy orchestration on UI bugs added latency without proportional value — the final fix usually came from focused manual investigation, not parallel agents.

**Rule added:** Limit agent orchestration for UI bugs.

### Metrics Snapshot

| Metric | Value |
|--------|-------|
| Total sessions | 432 |
| Active days | 19 |
| Avg sessions/day | ~23 |
| Sessions with subagents | 234 (54%) |
| Context exhaustions | 19 (4.4%) |
| Completed todos | 198 |
| Revert requests | ~4 explicit |
| Solution rejections | ~20 |
| Branches worked | 10+ |

### Action Items

- [x] Created `.claude/rules/dev-process.md` with actionable guidelines
- [x] Created this retrospective journal
- [ ] Reduce context exhaustion rate below 2% (target: smaller session scope)
- [ ] Front-load browser observation for all UI bugs
