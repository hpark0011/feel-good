# <Feature Name> — Spec

_Template artifact. Consumed by `.claude/skills/create-spec/SKILL.md` (Phase 3).
Do NOT reference this file directly from an agent — go through the skill._

---

## Overview

<What the feature does, why it matters. 2–3 sentences.>

## Requirements

### Functional Requirements

| ID    | Requirement   | Priority | Verification            |
| ----- | ------------- | -------- | ----------------------- |
| FR-01 | {requirement} | {p0-p3}  | {concrete, automatable} |

### Non-functional Requirements (if any)

| ID     | Requirement   | Priority | Verification            |
| ------ | ------------- | -------- | ----------------------- |
| NFR-01 | {requirement} | {p0-p3}  | {concrete, automatable} |

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

| Test File | Scenario                            | Verifies |
| --------- | ----------------------------------- | -------- |
| {path}    | {user flow from user's perspective} | {FR-XX}  |

E2E tests go in the owning app's Playwright directory (e.g., `apps/mirror/e2e/`) with a `.spec.ts` suffix. Use the Playwright CLI only (`.claude/rules/testing.md`). Tests must describe real user flows, not internal state checks.

## Anti-patterns to Avoid

- <Specific thing NOT to do, with reason.>

## Team Orchestration Plan

Reviewer selection and wave packaging happen at execution time — see `.claude/skills/orchestrate-implementation/SKILL.md`. This plan lists logical work chunks with hard gates; it does not pre-assign critics. The spec describes *what must be true*; orchestration decides *who reviews*.

Plan which agents execute the implementation work. Check `.claude/agents/` for specialized agents that can own specific steps. Prefer existing specialized agents over creating new ones.

```
Step N — {description}
Suggested executor: {agent name from .claude/agents/, or "general"}
Scope: {files touched, what changes}
Hard gate: {exact shell command(s) that must exit 0 before this step is done}
Verifies: {FR-XX, FR-YY}
```

## Open Questions (if any)

<Anything that needs user input before implementation.>

## Adversarial Review Summary

Populated by Phase 4 of the skill. Include the final stop reason (`quality bar met` or `iteration limit reached`).

| Concern   | Severity   | Resolution                             |
| --------- | ---------- | -------------------------------------- |
| {concern} | {severity} | **Accepted** / **Rejected** — {reason} |
