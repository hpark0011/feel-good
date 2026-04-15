---
name: create-spec
description: >
  Create a product spec from user requirements through multi-agent research,
  adversarial critique, and iterative refinement. Spawns PM, Adversarial Reviewer,
  domain expert (when relevant), and Verification agents in separate context windows.
  Outputs a spec with Playwright E2E tests and team orchestration plan to
  workspace/spec/. Use when the user wants to create a spec, write requirements,
  plan a feature, or says "create spec", "spec this", "write a spec".
---

# Create Spec

Five-phase workflow: gather requirements, gather materials, create spec, adversarial critique loop, final verification. Produces a spec in `workspace/spec/{feature-name}-spec.md`.

---

## Phase 1: Gather Requirements

1. Read the user's requirement carefully.
2. If any of these are unclear, ask before proceeding:
   - What the feature does and why it matters
   - Scope boundaries (what's in, what's out)
   - Constraints (tech stack, performance, UX)
3. Do NOT proceed to Phase 2 until requirements are unambiguous.

---

## Phase 2: Gather Materials

Run these in parallel where possible:

### 2a — Read Research Material

If the user provided or referenced research material (links, docs, prior specs), read it in full. Summarize key findings that affect design decisions.

### 2b — Investigate Codebase

Spawn a **Codebase Analyst** agent:

```
You are a Codebase Analyst. Investigate how the current codebase relates to the
feature described below and report what exists vs what needs to be built.

## Feature
{user's requirement}

## Instructions
1. Use Grep and Glob to find related files. Read key files to understand existing patterns.
2. Check package.json files for relevant dependencies.
3. Examine store slices, components, IPC handlers, and preload scripts as relevant.
4. Report:
   - Feature status: exists | partial | missing
   - Related files with brief descriptions
   - Existing architectural patterns for similar features
   - Where new code should live (packages, directories)
   - Integration points with existing code
   - Files to create and files to modify
```

### 2c — Consult Domain Expert (When Relevant)

Check `.claude/agents/` for a domain expert agent whose description matches the feature's domain:

| Agent                   | Domain                                                           |
| ----------------------- | ---------------------------------------------------------------- |
| `agent-stream-pipeline` | Streaming, chunk processing, token buffering, backpressure       |
| `auth-layer`            | OAuth, API keys, token storage, auth state, credential injection |
| `release`               | Packaging, CI, code signing, auto-updater, versioning            |

If the feature touches one of these domains, spawn that agent with the user's requirement and ask it to:

1. Review the proposed feature for domain-specific concerns
2. Identify constraints, gotchas, or patterns that must be followed
3. Flag risks or conflicts with existing domain architecture

If no domain expert applies, skip this step.

---

## Phase 3: Create Spec

Instantiate the spec template at:

- **Template**: `.claude/skills/create-spec/spec-template/spec.md`

The template is the single source of truth for spec structure — Overview, Requirements (FR/NFR tables with hard verification columns), Architecture, Unit Tests table, Playwright E2E Tests table, Anti-patterns, Team Orchestration Plan, Open Questions, and the Adversarial Review Summary placeholder.

Rules for Phase 3:

1. Read `spec-template/spec.md` and instantiate it; do not invent additional top-level sections.
2. Every requirement row MUST have a concrete, automatable `Verification` value — no subjective criteria.
3. Every requirement must be referenced by at least one row in Unit Tests or Playwright E2E Tests (ideally both where user-visible).
4. Test file paths must match real package/app conventions (Vitest in `__tests__/` with `.test.ts`; Playwright in the owning app's e2e dir with `.spec.ts`). Verify against the codebase, don't guess.
5. Team Orchestration Plan must name real agents from `.claude/agents/` or explicitly recommend `/new-codebase-expert` for missing owners.

**Who runs Phase 3**: the skill does not name an executor. Whichever agent invokes this skill is responsible for Phase 3 — that routing decision belongs to the caller (or the agent's own spec), not to the skill. This keeps the dependency arrow one-directional (template ← skill ← agent) and avoids a cycle where the skill names an agent that names the skill.

---

## Phase 4: Adversarial Critique Loop

After the PM Agent produces the spec, spawn **two agents in parallel** (three if a domain expert was consulted in Phase 2):

### Agent 1: Adversarial Spec Reviewer

```
You are an Adversarial Spec Reviewer. You challenge plans by trying to falsify
them. Where other reviewers evaluate whether a document is clear or feasible,
you ask whether it's RIGHT — whether the premises hold, the assumptions are
warranted, and the decisions would survive contact with reality.

You construct counterarguments, not checklists.

If you spot any part of the spec that is a band-aid solution over a solution
that makes the wrong thing structurally hard to do, call it out. The
architecture should prevent mistakes, not just handle them.

## User's Requirement
{paste requirement}

## Spec
{paste spec content}

## Instructions
For each concern, provide:
- Severity: Critical | Important | Minor
- The specific problem
- Why it matters (what breaks, what's fragile, what's wrong)
- Your proposed fix

Focus on:
1. Assumptions that might not hold
2. Edge cases the spec doesn't address
3. Architectural decisions that will cause pain later
4. Requirements that are undertested or have weak verification
5. Band-aid solutions where structural prevention is possible
6. Missing failure modes
```

### Agent 2: Domain Expert (if consulted in Phase 2)

Re-spawn the same domain expert agent from Phase 2 with the full spec, asking it to review for domain-specific correctness, missed constraints, and compatibility with existing domain architecture.

### After critique completes:

1. Evaluate each concern. Not all feedback is valid — reject concerns that contradict the user's explicit requirements.
2. For accepted concerns: update the spec.
3. If significant changes were made (any Critical or 2+ Important concerns accepted), re-run the adversarial reviewer on the updated spec.
4. Iterate until the adversarial reviewer returns no Critical concerns and no more than 1 Important concern.
5. Record the critique results in an **Adversarial Review Summary** table at the bottom of the spec:

| Concern   | Severity   | Resolution                             |
| --------- | ---------- | -------------------------------------- |
| {concern} | {severity} | **Accepted** / **Rejected** — {reason} |

---

## Phase 5: Final Verification

Spawn a **Verification Agent**:

```
You are a Verification Agent. Verify the final spec is complete and correct.

## User's Original Requirement
{paste requirement}

## Final Spec
{paste spec content}

## Checklist — report PASS or FAIL for each:
1. Requirements coverage: Does every user requirement have a corresponding FR/NFR?
2. Test coverage: Does every FR have at least one unit test AND one E2E test?
3. E2E tests are user-perspective: Do Playwright tests describe user flows, not internal state?
4. Team orchestration plan exists and references real agents from .claude/agents/ where applicable
5. Verification criteria: Every requirement has a concrete, automatable check (no "looks good")
6. Codebase alignment: File paths and package locations match actual codebase structure
7. Anti-patterns section exists with specific items

## Output
For each item: PASS/FAIL with details.
If any FAIL: list the specific fix needed.
```

If the Verification Agent finds failures, fix them in the spec. Re-verify only the failed items.

---

## Final Output

1. Write the spec to `workspace/spec/{feature-name}-spec.md`
2. Present a summary:

```
## Spec Complete

**Location:** workspace/spec/{feature-name}-spec.md

### Requirements
- {N} functional + {N} non-functional requirements

### Test Plan
- {N} unit tests + {N} E2E tests

### Orchestration
- {summary of who does what}

### Adversarial Review
- {N} concerns raised, {N} accepted, {N} rejected
- No unresolved Critical concerns

### Verification
- All checks PASS
```

---

## Rules

- **Minimum 3 sub-agents**: PM Agent, Adversarial Spec Reviewer, Verification Agent. Each gets its own context window via the Agent tool.
- **Domain expert is additive**: When a domain expert is consulted, it adds a 4th agent (used in Phase 2 and Phase 4).
- **Hard verification only**: Every requirement must have a concrete, automatable check.
- **Codebase accuracy**: File paths in the spec must be verified against the real codebase. Do not guess.
- **Spec output**: `workspace/spec/{feature-name}-spec.md`, kebab-case filename.
- **Artifact hierarchy** (per `.claude/skills/new-codebase-expert/SKILL.md#artifact-hierarchy-principle`): the spec template lives at `spec-template/spec.md` and is referenced — not inlined — by this SKILL.md. This skill does not name its executor; agents that invoke it reach down, never the other way around. One-directional dependency: `spec-template/` ← `SKILL.md` ← agent.
- **Iterate critiques**: The adversarial loop runs until no Critical concerns remain.
- **User requirements are sovereign**: If the adversarial reviewer argues against something the user explicitly requested, reject it and document why.
