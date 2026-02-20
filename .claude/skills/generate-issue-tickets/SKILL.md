---
name: generate-issue-tickets
description: >
  Generate structured issue ticket markdown files with strict frontmatter contract in workspace/tickets/to-do.
  Use when the user describes a bug, feature request, refactoring task, break down a plan, or
  any work item that needs to be tracked. Invoke with /generate-issue-tickets
  or when the user says "create a ticket", "file an issue", "write a todo",
  "track this", or describes work that should become a ticket.
---

# Generate Issue Tickets

Create issue ticket markdown files in `workspace/tickets/to-do` following a strict frontmatter contract.

## Directory Structure

```
workspace/tickets/
├── backlog/        # Identified but not ready to be picked up
├── to-do/          # Prioritized and ready to be picked up
├── in-progress/    # Actively being worked on
├── in-review/      # Implementation done, awaiting review
├── completed/      # Resolved and verified
└── canceled/       # Won't fix / no longer relevant
```

Ticket status is encoded in **two places** that must stay in sync:

1. The `status` field in YAML frontmatter
2. The directory the file lives in

## Frontmatter Contract

Every ticket must conform to this contract. All required fields must be present and valid.

| Field                 | Type           | Required | Validation                                                      |
| --------------------- | -------------- | -------- | --------------------------------------------------------------- |
| `id`                  | string         | yes      | Format `GB_NNN` (3-digit zero-padded)                           |
| `title`               | string         | yes      | Max 80 chars                                                    |
| `date`                | string         | yes      | `YYYY-MM-DD` format, today's date at creation                   |
| `type`                | enum           | yes      | One of: feature, fix, improvements, chore, docs, refactor, perf |
| `status`              | enum           | yes      | Must be `to-do` on creation                                     |
| `priority`            | enum           | yes      | One of: p0, p1, p2, p3                                          |
| `description`         | string         | yes      | Min 10 words                                                    |
| `dependencies`        | list\<string\> | yes      | List of `GB_NNN` IDs (can be empty `[]`)                        |
| `parent_plan_id`      | string         | no       | Path to plan markdown file if ticket was derived from a plan    |
| `acceptance_criteria` | list\<string\> | yes      | Non-empty, each item must be deterministic/verifiable           |
| `owner_agent`         | string         | yes      | Descriptive title for the agent best suited to execute          |

## Workflow

1. **Understand the request.** Parse the user's free-text description. Ask clarifying questions only if the problem statement is genuinely ambiguous.
2. **Investigate the codebase.** Read relevant files to fill in Context, location references, and technical context. Do not guess file paths — verify them.
3. **Determine the next issue ID.** Scan all subdirectories of `workspace/tickets/` for the highest existing `GB_NNN` numeric portion and increment by 1. Zero-pad to 3 digits. If no tickets exist, start at `001`.
4. **Determine priority.** Use the priority rubric below. If unclear, default to p2.
5. **Apply scoping enforcement.** Before writing, check the ticket against all scoping rules (see Scoping Enforcement below). If the scope is too broad, decompose into multiple tickets.
6. **Generate the ticket.** Follow the template in [template.md](template.md) exactly. Write the file to `workspace/tickets/to-do/GB_{NNN}-{priority}-{slug}.md` with `status: to-do` in frontmatter.
7. **Validate the ticket.** Run `node .claude/skills/generate-issue-tickets/validate.mjs <filepath>` and fix any reported errors. Then read the file back for a final human-readable check.
8. **Report back.** Show the user the filename and a one-line summary.

## Priority Rubric

| Priority | Criteria                                                     | Examples                                      |
| -------- | ------------------------------------------------------------ | --------------------------------------------- |
| p0       | Needs immediate attention — production down, security breach | Site crash, data leak, auth completely broken |
| p1       | Merge blocking — must fix before next release                | Broken build, failing CI, critical regression |
| p2       | Not merge blocking but needs to be fixed                     | Missing validation, race condition, tech debt |
| p3       | Improvements — nice to have                                  | Unused import, naming cleanup, minor refactor |

## Type Enum

| Type           | When to use                                |
| -------------- | ------------------------------------------ |
| `feature`      | New functionality                          |
| `fix`          | Something is broken                        |
| `improvements` | Improve existing feature                   |
| `chore`        | Maintenance (deps update, config, CI)      |
| `docs`         | Documentation changes                      |
| `refactor`     | Code improvement without changing behavior |
| `perf`         | Performance optimization                   |

## Naming Convention

Filename: `GB_{NNN}-{priority}-{slug}.md`

- `GB_NNN`: Zero-padded 3-digit issue ID (e.g., `GB_001`)
- `priority`: `p0`, `p1`, `p2`, or `p3`
- `slug`: Kebab-case summary, max 6 words (e.g., `missing-auth-guard-protected-layout`)

The filename stays the same across status transitions — only the directory changes.

## Status Lifecycle

| Status        | Directory      | Meaning                              |
| ------------- | -------------- | ------------------------------------ |
| `backlog`     | `backlog/`     | Identified, not yet prioritized      |
| `to-do`       | `to-do/`       | Prioritized, ready to pick up        |
| `in-progress` | `in-progress/` | Actively being worked on             |
| `in-review`   | `in-review/`   | Implementation done, awaiting review |
| `completed`   | `completed/`   | Resolved and verified                |
| `canceled`    | `canceled/`    | Won't fix or no longer relevant      |

To transition a ticket: move the file to the new directory and update `status` in frontmatter. Both must match.

## Acceptance Criteria

Acceptance criteria live in the frontmatter `acceptance_criteria` field. They replace the old `## Hard Validations` body section.

Each criterion must be:

- **Deterministic** — an agent can verify pass/fail with zero ambiguity
- **Concrete** — reference specific commands, greps, file checks, or build commands
- **Non-empty** — at least 1 criterion, prefer 3+
- Include at least one **positive check** (the fix is present) and one **negative check** (the problem is gone)

### Valid acceptance criteria types

| Type               | Example                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **Grep**           | `grep -r "isAuthenticated" apps/mirror/app/api/admin/` returns matches                        |
| **Grep-absence**   | `grep -r "import styles" apps/mirror/app/(protected)/dashboard/layout.tsx` returns no matches |
| **File existence** | `apps/mirror/app/api/admin/users/route.ts` exists / does not exist                            |
| **Build**          | `pnpm build --filter=@feel-good/mirror` exits 0                                               |
| **Lint**           | `pnpm lint --filter=@feel-good/mirror` exits 0                                                |
| **Type check**     | `pnpm tsc --noEmit` exits 0                                                                   |
| **Test**           | `pnpm test:e2e --filter=@feel-good/mirror` exits 0                                            |
| **Pattern match**  | File at `path:line` contains/does not contain a specific pattern                              |
| **Count**          | `grep -c "TODO" path/to/file.ts` returns 0                                                    |

If the fix requires a behavioral check that can't be done deterministically (e.g., "animation plays smoothly"), note it separately under `## Manual Verification` in the body — but still include whatever deterministic checks are possible in `acceptance_criteria`.

## Owner Agent

The `owner_agent` field assigns a descriptive title for the agent best suited to execute the ticket.

When choosing the owner agent:

- Read the ticket type, affected files, and required skills
- Generate a descriptive title reflecting the task (e.g., "Auth Guard Security Agent", "CSS Cleanup Agent", "Convex Schema Migration Agent")
- Consider the agent-orchestration model strategy: what kind of agent would best handle this work

## Parent Plan

The `parent_plan_id` field is optional — set only when the ticket is derived from a plan markdown file.

- Value should be the relative path to the plan file (e.g., `workspace/plans/auth-overhaul.md`)
- Leave empty or omit when the ticket is standalone

## Scoping Enforcement

Apply these rules before writing any ticket. They prevent scope creep and decision paralysis for executing agents.

### Single Outcome Rule

The title and goal must describe ONE observable outcome. If the goal contains "and" connecting two independent outcomes, split into separate tickets linked via `dependencies`.

- BAD: "Fix auth guard and add rate limiting to admin routes"
- GOOD: "Admin API routes reject unauthenticated requests" + separate ticket for rate limiting

### Capability-Centric Phrasing

Titles describe outcomes, not implementation steps. The executing agent decides *how*.

- BAD: "Add isAuthenticated check to route handler"
- GOOD: "Admin API routes reject unauthenticated requests"
- BAD: "Delete unused CSS import"
- GOOD: "Dashboard layout has no dead CSS imports"

### Acceptance Criteria Count

- Ideal: 3-5 criteria
- Fewer than 2: ticket is too vague — add more specificity
- More than 7: ticket is too broad — decompose

### Decomposition Protocol

When a ticket fails any scoping rule:

1. Identify the independent outcomes
2. Create a separate ticket for each outcome
3. Link them via `dependencies` if ordering matters
4. Each sub-ticket must independently pass all scoping rules

## Rules

- **One ticket per issue.** Don't combine unrelated problems.
- **Verify file paths.** Every path in Context must be confirmed via Read/Grep.
- **Acceptance criteria must be deterministic.** Every check must be runnable by an agent with an unambiguous pass/fail result.
- **Approach needs effort/risk.** Always include effort (Small/Medium/Large) and risk (Low/Medium/High) for the recommended approach.
- **Titles must be capability-centric.** Describe the outcome, not the implementation step (see Scoping Enforcement).
- **Out of Scope is required.** Every ticket must explicitly list what is NOT included to prevent scope creep.
- **When generating multiple tickets**, determine all IDs upfront to avoid collisions. Run the ID scan once, then assign sequential IDs.
- **Validate before reporting success.** Read the file back and check every field against the contract.

## Batch Generation

When generating multiple tickets from a single request (e.g., "create tickets for all the issues found in this review"):

1. Scan for the highest ID once
2. Assign sequential IDs to all tickets before writing any files
3. Write all files
4. Validate all files against the contract
5. Report a summary table: `| ID | Priority | Title |`
