# <Feature Name> — Spec

*Template artifact. Consumed by `.claude/skills/create-spec/SKILL.md` (Phase 3).
Do NOT reference this file directly from an agent — go through the skill.*

---

## Overview

<What the feature does, why it matters. 2–3 sentences.>

## Requirements

### Functional Requirements

| ID    | Requirement      | Priority | Verification            |
| ----- | ---------------- | -------- | ----------------------- |
| FR-01 | {requirement}    | {p0-p3}  | {concrete, automatable} |

### Non-functional Requirements (if any)

| ID     | Requirement      | Priority | Verification            |
| ------ | ---------------- | -------- | ----------------------- |
| NFR-01 | {requirement}    | {p0-p3}  | {concrete, automatable} |

## Architecture

- Component design: where each piece lives, data flow, key interfaces
- Files to create:

| File   | Purpose |
| ------ | ------- |
| {path} | {what}  |

- Files to modify:

| File   | Change |
| ------ | ------ |
| {path} | {what} |

- Dependencies to add (if any)

## Unit Tests

| Test File | Test Case   | Verifies |
| --------- | ----------- | -------- |
| {path}    | {test name} | {FR-XX}  |

Use Vitest. Match the owning package's existing patterns: tests in `__tests__/` with `.test.ts` suffix, or `.unit.test.ts` when the package is already configured for it.

## Playwright E2E Tests

| Test File | Scenario                             | Verifies |
| --------- | ------------------------------------ | -------- |
| {path}    | {user flow from user's perspective}  | {FR-XX}  |

E2E tests go in the owning app's Playwright directory (e.g., `apps/mirror/e2e/`) with a `.spec.ts` suffix. Use the Playwright CLI only (`.claude/rules/testing.md`). Tests must describe real user flows, not internal state checks.

## Anti-patterns to Avoid

- <Specific thing NOT to do, with reason.>

## Team Orchestration Plan

Plan which agents execute the implementation work. Check `.claude/agents/` for specialized agents that can own specific steps. Prefer existing specialized agents over creating new ones.

**Every step MUST pair an Executor with a Critique agent.** The critique agent runs in a separate context window on the executor's diff — never self-review. Self-evaluation is systematically biased toward praise; an independent, skeptical evaluator is the load-bearing mechanism that catches last-mile issues. See https://www.anthropic.com/engineering/harness-design-long-running-apps. This applies even for one-file changes.

```
Step N — {description}
Executor: {agent name} — produces the artifact
Critique: {one or more agents from .claude/agents/code-review-*} — independent review on the executor's diff
Tasks: {numbered list}
Handoff: critique runs on the executor's diff; executor addresses findings before the step is considered done
Verification: {what to check before moving on}
```

### Critique routing table

Pick the critique agent(s) that match the work type. Stack multiple when a step spans categories.

| Work type                                      | Default critique                                     |
| ---------------------------------------------- | ---------------------------------------------------- |
| Backend logic, mutations, state machines       | `code-review-correctness` + `code-review-tests`      |
| Schema / migrations / Convex validators        | `code-review-data-integrity`                         |
| Auth, permissions, input boundaries, secrets   | `code-review-security`                               |
| Streaming, locks, retries, cancellation, async | `code-review-concurrency`                            |
| File organization, naming, public API contract | `code-review-convention`                             |
| Hot paths, large lists, Convex reads, rendering| `code-review-performance`                            |
| Test suites themselves                         | `code-review-tests`                                  |

## Open Questions (if any)

<Anything that needs user input before implementation.>

## Adversarial Review Summary

Populated by Phase 4 of the skill. Include the final stop reason (`quality bar met` or `iteration limit reached`).

| Concern   | Severity   | Resolution                             |
| --------- | ---------- | -------------------------------------- |
| {concern} | {severity} | **Accepted** / **Rejected** — {reason} |
