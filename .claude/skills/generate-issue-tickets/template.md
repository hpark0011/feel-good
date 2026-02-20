---
status: backlog
priority: {priority}
issue_id: "{NNN}"
tags: [{tags}]
dependencies: [{dependencies}]
---

# {Title}

## Problem Statement

{1-3 paragraphs describing the issue. Be specific about what's wrong, what the expected behavior is, and what the actual behavior is. Include code references with file:line format.}

## Findings

- **Source:** {How this was discovered — user report, code review, agent analysis, etc.}
- **Location:** {`path/to/file.ts:line-range`}
- **Evidence:** {Concrete evidence — code snippet reference, error message, failing test, etc.}

## Proposed Solutions

### Option A: {Name} (Recommended)

{Description of the approach}

- **Effort:** {Small | Medium | Large}
- **Risk:** {Low | Medium | High}

### Option B: {Name}

{Description of the alternative}

- **Effort:** {Small | Medium | Large}
- **Risk:** {Low | Medium | High}

## Hard Validations

<!-- Deterministic checks an execution agent runs to self-validate. Each must be unambiguous pass/fail. -->

- [ ] **{check type}:** `{command or assertion}` → {expected result}
- [ ] **{check type}:** `{command or assertion}` → {expected result}
- [ ] **{check type}:** `{command or assertion}` → {expected result}

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| {YYYY-MM-DD} | Created: {source context} | {Initial insight if any} |

## Resources

- {Links to PRs, docs, related tickets, or external references}
