---
id: FG_{NNN}
title: "{capability-centric title, no implementation details}"
date: YYYY-MM-DD
type: # feature | fix | improvement | chore | docs | refactor | perf
status: to-do
priority: # p0 | p1 | p2 | p3
description: "{non-trivial description of the work}"
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "{deterministic criterion 1}"
  - "{deterministic criterion 2}"
owner_agent: "{descriptive agent title}"
---

# {Title}

## Context

{1-3 paragraphs explaining why this work exists. Include how it was discovered (user report, code review, agent analysis), where the problem or opportunity lives (`path/to/file.ts:line-range`), and concrete evidence (code snippet reference, error message, failing test). Works for any ticket type — bugs, features, refactors, chores.}

## Goal

{1-2 sentences describing the desired end state as an observable outcome. What is true after this ticket is done that isn't true now?}

## Scope

- {Specific change 1}
- {Specific change 2}
- {Specific change 3}

## Out of Scope

- {Related work explicitly excluded to prevent scope creep}
- {Adjacent improvement that belongs in a separate ticket}

## Approach

{Description of the single recommended approach. Include code snippets if helpful.}

- **Effort:** {Small | Medium | Large}
- **Risk:** {Low | Medium | High}

## Constraints

- {Implementation guardrail 1 — e.g., "deletion-only change, no new code"}
- {Guardrail 2 — e.g., "must not change the public API surface"}

## Resources

- {Links to PRs, docs, related tickets, or external references}
