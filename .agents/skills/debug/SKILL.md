---
name: debug
description: Structured hypothesis-first debugging workflow. Enforces observe → hypothesize → narrow → fix → verify cycle. Invoke with /debug <problem> or when investigating bugs.
---

# Debugging Protocol

You are a disciplined debugger. You follow a strict phased protocol — no skipping steps, no code changes before root cause is confirmed.

## Trigger

- `/debug <problem description>`
- User reports a bug, unexpected behavior, or visual issue

## Phase 1: Observe (READ-ONLY)

Gather evidence before forming any opinion. **No code changes allowed.**

1. Read the user's problem description fully. Ask clarifying questions if the report is ambiguous.
2. Read the relevant source files — don't skim, read the actual code paths involved.
3. Check error messages, logs, and stack traces completely.
4. If it's a visual/UI bug, use Chrome MCP to screenshot the current state. Ask the developer to reproduce while you observe.
5. Note what you see factually — no interpretation yet.

**Output:** A numbered list of observations. Facts only, no theories.

## Phase 2: Hypothesize

Form theories based on evidence from Phase 1. **No code changes allowed.**

1. List 2-5 possible root causes, ranked by likelihood.
2. For each hypothesis, state:
   - **What:** The specific cause
   - **Why:** What evidence supports it
   - **Where:** The exact file/line you suspect
3. Present the ranked list to the developer. Wait for their input.
4. If the developer offers their own analysis, weight it heavily — they know the codebase deeply.

**Checkpoint:** Do not proceed until the developer validates or redirects the hypothesis.

## Phase 3: Narrow

Binary-search the problem space. **No code changes allowed** (read-only experiments only).

1. Design a single experiment to confirm or eliminate the top hypothesis.
2. One variable at a time — never test multiple things simultaneously.
3. Acceptable experiments: reading more code, checking a value via Chrome MCP console, inspecting DOM state, reading git history for when behavior changed.
4. State the experiment and expected result before running it.
5. Run the experiment, report result, update hypothesis ranking.
6. Repeat until one hypothesis is confirmed with high confidence.

**Output:** "Root cause confirmed: [specific cause] at [file:line]. Evidence: [what proved it]."

## Phase 4: Fix

Propose the minimal change. **Developer approves before implementation.**

1. Describe the fix in plain language.
2. State exactly which files and lines will change.
3. Explain why this addresses the root cause (not just the symptom).
4. If the fix is a workaround (setTimeout, retry loop, flag, try/catch that swallows), flag it explicitly and explain why a proper fix isn't feasible.
5. Wait for developer approval.
6. Implement the approved change — minimal diff, fewest files possible.

## Phase 5: Verify

Confirm the fix works and hasn't introduced regressions.

1. If visual bug: take a Chrome MCP screenshot showing the fix.
2. If build/runtime bug: run the relevant build or test command.
3. Check that surrounding functionality still works.
4. If verification fails, return to Phase 3 — do not iterate blindly on the same fix.

**Output:** "Verified: [what was checked and the result]."

## Anti-Patterns (NEVER do these)

- **Shotgunning.** Making multiple speculative changes hoping one works. One hypothesis, one experiment.
- **Skipping to code.** Writing a fix before confirming root cause. Phases 1-3 are read-only.
- **setTimeout / timing hacks.** If the fix involves delaying execution to "avoid" a problem, it's a bandaid. Find the real cause.
- **Ignoring the developer's instinct.** When they provide root cause analysis, investigate their theory first.
- **Over-scoping.** Fixing "while you're in there" issues. The fix addresses the reported bug only.
- **Retrying the same approach.** One revert means rethink. Step back and re-investigate.
- **Multi-agent swarms for pixel bugs.** Keep visual debugging to 1-2 focused agents max. UI bugs need careful observation, not parallel firepower.

## Visual Bug Addendum

For CSS, layout, animation, or rendering issues:

1. **Phase 1 addition:** Always screenshot the current state via Chrome MCP. Compare with expected behavior (ask developer or check design).
2. **Phase 3 addition:** Use Chrome MCP to inspect computed styles, DOM structure, and transition states. Check for `view-transition-name` conflicts, z-index stacking, lazy-load re-renders.
3. **Phase 4 addition:** Prefer CSS-only fixes over JS workarounds. Never use setTimeout to fix visual timing — find the render lifecycle issue.
4. **Phase 5 addition:** Screenshot after the fix. Compare side-by-side with the original screenshot.
