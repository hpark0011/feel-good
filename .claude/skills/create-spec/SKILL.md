---
name: create-spec
description: Create a product spec from user requirements through multi-agent research, adversarial critique, and iterative refinement. Spawns PM, Adversarial Reviewer, domain expert (when relevant), and Verification agents in separate context windows. Outputs a spec with Playwright E2E tests and team orchestration plan to workspace/spec/. Use when the user wants to create a spec, write requirements, plan a feature, or says "create spec", "spec this", "write a spec".
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

Spawn a **Codebase Analyst** agent using the prompt at `agents/codebase-analyst.md`.

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

Spawn with the prompt at `agents/adversarial-reviewer.md`.

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

Spawn a **Verification Agent** with the prompt at `agents/verification.md`.

If the Verification Agent finds failures, fix them in the spec. Re-verify only the failed items.

---

## Final Output

1. Write the spec to `workspace/spec/{feature-name}-spec.md`
2. Present a summary including: spec location, FR/NFR counts, unit + E2E test counts, orchestration summary, adversarial review tallies (raised / accepted / rejected, no unresolved Critical), and verification result.

---

## Rules

- **Minimum 3 sub-agents**: PM Agent, Adversarial Spec Reviewer, Verification Agent. Each gets its own context window via the Agent tool.
- **Domain expert is additive**: When a domain expert is consulted, it adds a 4th agent (used in Phase 2 and Phase 4).
- **Hard verification only**: Every requirement must have a concrete, automatable check.
- **Codebase accuracy**: File paths in the spec must be verified against the real codebase. Do not guess.
- **Spec output**: `workspace/spec/{feature-name}-spec.md`, kebab-case filename.
- **Artifact hierarchy** (per `.claude/skills/new-codebase-expert/SKILL.md#artifact-hierarchy-principle`): the output template lives at `spec-template/spec.md` and the prompts for workflow-only sub-agents live at `agents/*.md` — both are referenced, never inlined, by this SKILL.md. This skill does not name its executor; agents that invoke it reach down, never the other way around. One-directional dependency: `spec-template/` + `agents/` ← `SKILL.md` ← caller.
- **Iterate critiques**: The adversarial loop runs until no Critical concerns remain.
- **User requirements are sovereign**: If the adversarial reviewer argues against something the user explicitly requested, reject it and document why.
