---
name: generate-issue-tickets
description: >
  Generate structured issue ticket markdown files in the todos/ directory.
  Use when the user describes a bug, feature request, refactoring task, or
  any work item that needs to be tracked. Invoke with /generate-issue-tickets
  or when the user says "create a ticket", "file an issue", "write a todo",
  "track this", or describes work that should become a ticket.
---

# Generate Issue Tickets

Create issue ticket markdown files in `todos/` following established conventions.

## Workflow

1. **Understand the request.** Parse the user's free-text description. Ask clarifying questions only if the problem statement is genuinely ambiguous.
2. **Investigate the codebase.** Read relevant files to fill in Findings, location references, and technical context. Do not guess file paths — verify them.
3. **Determine the next issue ID.** Scan `todos/` and `todos/completed/` for the highest existing `NNN` prefix and increment by 1. Zero-pad to 3 digits.
4. **Determine priority.** Use the priority rubric below. If unclear, default to p2.
5. **Generate the ticket.** Follow the template in [template.md](template.md) exactly. Write the file to `todos/{NNN}-pending-{priority}-{slug}.md`.
6. **Report back.** Show the user the filename and a one-line summary.

## Priority Rubric

| Priority | Criteria | Examples |
|----------|----------|---------|
| p1 | Security vulnerability, data loss, crash, broken core flow | Open redirect, auth bypass, runtime error |
| p2 | Functional bug, missing guard, performance issue, significant tech debt | Missing validation, race condition, N+1 query |
| p3 | Code quality, naming, cleanup, minor inconsistency | Unused import, naming convention violation, missing JSDoc |

## Naming Convention

Filename: `{NNN}-pending-{priority}-{slug}.md`

- `NNN`: Zero-padded 3-digit issue ID (e.g., `241`)
- `priority`: `p1`, `p2`, or `p3`
- `slug`: Kebab-case summary, max 6 words (e.g., `missing-auth-guard-protected-layout`)

## Tags

Use consistent tags from this list (extend when needed):

- **Area:** `mirror`, `greyboard`, `ui-factory`, `greyboard-desktop`, `convex`, `features`, `ui`
- **Type:** `bug`, `feature`, `refactor`, `code-review`, `tech-debt`, `docs`
- **Domain:** `auth`, `security`, `performance`, `ux`, `accessibility`, `navigation`, `dock`, `authorization`

## Hard Validations

Every ticket must include a `## Hard Validations` section containing **deterministic, machine-checkable** criteria. These are the self-validation checks an execution agent runs after implementing the fix — no human judgment required.

Each hard validation must specify:
- **What to check** — a concrete command, grep, build, or file-system assertion
- **Expected result** — the exact output, exit code, or condition that constitutes a pass

### Valid hard validation types

| Type | Example |
|------|---------|
| **Grep** | `grep -r "isAuthenticated" apps/mirror/app/api/admin/` returns matches |
| **Grep-absence** | `grep -r "import styles" apps/mirror/app/(protected)/dashboard/layout.tsx` returns no matches |
| **File existence** | `apps/mirror/app/api/admin/users/route.ts` exists / does not exist |
| **Build** | `pnpm build --filter=@feel-good/mirror` exits 0 |
| **Lint** | `pnpm lint --filter=@feel-good/mirror` exits 0 |
| **Type check** | `pnpm tsc --noEmit` exits 0 |
| **Test** | `pnpm test:e2e --filter=@feel-good/mirror` exits 0 |
| **Pattern match** | File at `path:line` contains/does not contain a specific pattern |
| **Count** | `grep -c "TODO" path/to/file.ts` returns 0 |

### Rules for hard validations

- Every validation must be runnable by an agent with zero ambiguity.
- No subjective language: "looks correct", "properly handles", "is clean" are **not** valid.
- Prefer grep/file checks over build-only checks — they're faster and more specific.
- Include at least one **positive check** (the fix is present) and one **negative check** (the problem is gone).
- If the fix requires a behavioral check that can't be done deterministically (e.g., "animation plays smoothly"), note it separately under `## Manual Verification` — but still include whatever deterministic checks are possible.

## Rules

- **One ticket per issue.** Don't combine unrelated problems.
- **Verify file paths.** Every path in Findings must be confirmed via Read/Grep.
- **Hard validations must be deterministic.** Every check must be runnable by an agent with an unambiguous pass/fail result.
- **Proposed solutions need effort/risk.** Always include effort (Small/Medium/Large) and risk (Low/Medium/High).
- **Work Log starts with creation.** First entry records the creation date and source.
- **When generating multiple tickets**, determine all IDs upfront to avoid collisions. Run the ID scan once, then assign sequential IDs.

## Batch Generation

When generating multiple tickets from a single request (e.g., "create tickets for all the issues found in this review"):

1. Scan for the highest ID once
2. Assign sequential IDs to all tickets before writing any files
3. Write all files
4. Report a summary table: `| ID | Priority | Title |`
