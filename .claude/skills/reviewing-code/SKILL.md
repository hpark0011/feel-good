---
name: reviewing-code
argument-hint: "[path | branch | --staged]"
description: Reviews pending code changes in this monorepo against AGENTS.md and .claude/rules/, producing a prioritized findings report. Use when the user says "review this code", "code review", "review my changes", "check this before I commit", or asks for feedback on a diff, branch, or file. Distinct from review-pr (fetches GitHub PR comments) and security-review (threat-model focused).
---

# Reviewing Code

Senior-engineer code review tuned to this repo's conventions. Reads the change set, checks it against the rules that already live in `AGENTS.md` and `.claude/rules/`, and returns a prioritized findings list — not a rewrite.

## Scope & non-goals

- **Not for GitHub PR comments** — use [`review-pr`](../review-pr/SKILL.md).
- **Not a rewrite pass** — propose changes, don't silently apply them. Only edit if the user says "fix it" after the report.
- **Not a substitute for `pnpm build` / `pnpm lint`** — run those too; this skill catches what linters can't.

## Quick start

1. Determine the change set: `git diff main...HEAD` by default, or the path/branch the user named.
2. Read every changed file end-to-end (not just the diff) to understand context.
3. Load only the `.claude/rules/` files that match touched paths (see [Rule mapping](#step-2--rule-mapping)).
4. Produce a findings report grouped by severity (see [Report format](#step-4--report-format)).

## Workflow

```
- [ ] 1. Identify scope — arg, staged diff, or main...HEAD
- [ ] 2. List changed files (git diff --stat) and map to rule files
- [ ] 3. Read each changed file fully
- [ ] 4. Run the checklist against each file
- [ ] 5. Run pnpm build + lint for the affected app (per verification.md)
- [ ] 6. Write findings report — severity-grouped, file:line anchored
- [ ] 7. Capture findings as tickets via the [`generate-issue-tickets`](../generate-issue-tickets/SKILL.md) skill
- [ ] 8. Ask if the user wants fixes applied
```

### Step 1 — Identify scope

| Input       | Command                    |
| ----------- | -------------------------- |
| No arg      | `git diff main...HEAD`     |
| `--staged`  | `git diff --staged`        |
| Branch name | `git diff main...<branch>` |
| File or dir | `git diff main -- <path>`  |

If the working tree is clean and no arg given, ask the user what to review instead of guessing.

### Step 2 — Rule mapping

Only load rules that apply to touched paths. Every loaded rule costs tokens.

| If the diff touches…                     | Load                                    |
| ---------------------------------------- | --------------------------------------- |
| `packages/convex/**`                     | `.claude/rules/convex.md`               |
| `**/forms/**`, `react-hook-form` imports | `.claude/rules/forms.md`                |
| `*.tsx` components                       | `.claude/rules/react-components.md`     |
| `store/`, context providers              | `.claude/rules/state-management.md`     |
| Tailwind classes, `*.css`                | `.claude/rules/tailwind.md`             |
| `*.ts` types, generics                   | `.claude/rules/typescript.md`           |
| `providers/`, root layouts               | `.claude/rules/providers.md`            |
| New/moved/renamed files                  | `.claude/rules/file-organization.md`    |
| `apps/mirror/**`                         | `.claude/rules/apps/mirror/**`          |
| Anything                                 | `.claude/rules/dev-process.md` (always) |

### Step 3 — Review checklist

Walk each changed file against these. Skip categories that don't apply.

**Correctness**

- Logic matches the stated intent; no off-by-one, null-deref, unhandled rejection.
- Boundary inputs (empty array, undefined, zero, error path) are handled.
- No accidental breaking changes to exported APIs.

**Convention compliance**

- File placement matches `file-organization.md` (`components/` not `views/` in apps).
- Naming: `-connector.tsx` only for context-reading shims with no markup.
- Imports use `@feel-good/*` paths, not deep relative traversal.
- No re-introduction of removed patterns (`useMountedRef`, `views/` in apps, `setTimeout` for visual timing).

**Simplicity (AGENTS.md core principles)**

- No speculative abstraction, feature flags, or backwards-compat shims for hypothetical needs.
- No error handling for impossible states; validation only at system boundaries.
- No comments explaining _what_; only _why_ when non-obvious.
- No unrequested refactors bundled with a bug fix.

**React / Next**

- Client components marked `"use client"` only when needed.
- `useEffect` has a real dependency; not used for derived state.
- No prop drilling where context or composition would be clearer.

**Convex** (if touched)

- Triggers wired via BOTH `triggers` and `authFunctions` in `createClient`.
- No hyphens in Convex filenames.
- `pnpm exec convex codegen` ran after schema changes.

**Tests / verification**

- Matches the verification tier in `.claude/rules/verification.md` for the change type.
- E2E uses Playwright CLI, not MCP.

### Step 4 — Report format

```text
## Code Review — <scope>

**Files changed:** N  |  **Lines:** +X / -Y
**Verified:** build ✓/✗  lint ✓/✗

### 🔴 Blockers (fix before merge)
- **path/to/file.tsx:42** — <one-line problem>. <one-line fix direction>.

### 🟡 Should fix
- **path/to/file.ts:17** — <…>

### 🟢 Nits / style
- **path/to/file.css:8** — <…>

### ✅ Looks good
- <one-line positive callout, if any>
```

Report rules:

- Every finding has a `file:line` anchor. No vague "in the auth module".
- One line per finding unless a snippet is genuinely needed.
- **Blockers** = correctness, security, convention violations with known past incidents.
- **Should fix** = design smells, missed simplifications, minor convention drift.
- **Nits** = style a linter would catch.
- If the whole change is clean, say so in one sentence — don't invent findings.

### Step 5 — Capture findings as tickets

After the report is written, invoke the [`generate-issue-tickets`](../generate-issue-tickets/SKILL.md) skill to turn every 🔴 Blocker and 🟡 Should-fix finding into a tracked ticket in `workspace/tickets/to-do/`. Nits are optional — only file them if the user asks.

- Pass the report findings as input; one ticket per finding.
- Preserve the `file:line` anchor in the ticket body so the fix is traceable.
- Do this **before** offering fixes — tickets exist even if the user defers the work.

### Step 6 — Offer fixes

End with: _"Want me to apply the blockers / should-fix items?"_ Do not fix preemptively. If the user says yes, apply edits and re-run build + lint per `verification.md`.

## Examples

**Input:** user says "review my changes" on a branch that adds a chat input component.

**Output (abridged):**

```text
## Code Review — fix-chat-message-system

**Files changed:** 3  |  **Lines:** +87 / -4
**Verified:** build ✓  lint ✓

### 🔴 Blockers
- **apps/mirror/app/(chat)/chat-input.tsx:34** — useEffect syncs `value` prop into local state, causing a render loop when parent re-renders. Derive via useMemo or lift state.

### 🟡 Should fix
- **packages/features/chat/views/message-bubble.tsx:12** — file lives in `views/` but is app-level per file-organization.md. Move to `apps/mirror/app/(chat)/_components/`.

### 🟢 Nits
- **apps/mirror/app/(chat)/chat-input.tsx:5** — unused `cn` import.

Want me to apply the blockers and should-fix items?
```

## Anti-patterns

- **Reviewing the diff without reading the whole file.** Context lives outside the hunks.
- **Inventing findings to justify the review.** A clean diff deserves "looks good" in one line.
- **Rewriting the code in the report.** Point at the problem; let the author write the fix.
- **Loading every rule file regardless of scope.** Token cost compounds — map paths to rules.
- **Mixing review with fixes in the same pass.** Report first, ask, then fix.
- **Duplicating `pnpm lint`.** If ESLint catches it, point at lint output instead of re-listing.
