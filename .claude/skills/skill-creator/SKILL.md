---
name: skill-creator
description: Scaffolds new project skills in .claude/skills/ using the repo's standard SKILL.md template (frontmatter + When to use, Quick start, Workflow, Examples, References, Anti-patterns). Use when the user asks to create, scaffold, author, or add a new skill, says "new skill", "make a skill", or wants to turn a repeated workflow into a reusable skill. Also use when auditing an existing skill against the template.
---

# Skill Creator

Author new skills for this repo that follow Anthropic's skill-authoring best practices and this project's conventions. The goal is skills Claude can reliably discover, load cheaply, and execute without drift.

## When to use

- User says "create a skill", "new skill", "scaffold a skill", "turn this into a skill".
- A repeated workflow in this repo is being rediscovered each session and should be captured once.
- Auditing or refactoring an existing skill in `.claude/skills/` against the template.

**Do NOT use for**: one-off prompts, personal memory entries (use auto-memory), automation that requires hooks (use `update-config`), or CLAUDE.md edits (use `claude-md-maintainer`).

## Quick start

1. Ask the user for: **skill name** (gerund preferred), **one-sentence purpose**, **trigger phrases**, and **the 80% workflow**.
2. Create `.claude/skills/<skill-name>/SKILL.md` using the template below.
3. Fill only the sections that have real content — omit empty sections, don't write "N/A".
4. Verify: read the file back, confirm frontmatter parses, check body is <500 lines.

## Template

Canonical scaffold lives at [skill-template/SKILL.md](skill-template/SKILL.md). Copy the file verbatim into `.claude/skills/<new-skill-name>/SKILL.md`, then fill in the placeholders and delete sections that don't apply.

**Artifact convention:** Any bundled artifact (template, script, example file) goes in a `{artifact-name}-template/` or similarly-named subdirectory of the skill and is referenced from `SKILL.md`. Never inline artifacts larger than ~20 lines.

## Authoring rules

1. **Frontmatter is the discovery surface.** `name` + `description` are the only tokens pre-loaded. Description must be third-person, include *what* and *when*, and name concrete trigger phrases. Max 1024 chars — every token competes with every other skill's metadata.
2. **Naming convention: gerund form** (verb + `-ing`), lowercase, hyphen-separated. Examples: `creating-tickets`, `reviewing-prs`, `scaffolding-components`, `processing-pdfs`. The gerund aligns the skill's identity with the user's intent verb, which is how Claude matches triggers. Noun names (`tickets`, `pdf-helper`) force an extra inference hop and invite scope creep.
   - **Constraints**: `^[a-z0-9-]+$`, ≤64 chars, no reserved words (`anthropic`, `claude`).
   - **Directory name must equal frontmatter `name`** — location already namespaces the skill, so don't prefix.
   - **Acceptable fallbacks when gerunds are awkward**: action form (`configure-settings`) or tool-action (`sentry-cli`, `tavus-cvi-quickstart`) when the tool name is the primary trigger.
   - **Avoid**: `helper`, `utils`, `tools`, version suffixes (`v2-...`), filler verbs (`do-stuff-with-...`), CamelCase.
   - **Do not mass-rename existing skills.** Apply this to new skills and rename opportunistically when editing an existing one — churn costs more than inconsistency.
3. **Omit empty sections.** The template is a ceiling, not a floor. A 40-line skill should be 40 lines.
4. **No progressive disclosure under ~150 lines.** Splitting small skills into multiple files adds navigation cost without token savings.
5. **References stay one level deep from SKILL.md.** Claude partially-reads nested files and loses info.
6. **Match freedom to fragility.** High freedom (heuristics) for open-ended tasks, low freedom (exact commands) for fragile ones like migrations.
7. **No time-sensitive language** ("as of 2026…"). Put deprecated patterns under a collapsed "Old patterns" section.
8. **Consistent terminology** within the skill — pick one term and stick to it.
9. **Don't explain what Claude already knows.** Every paragraph must justify its token cost.

## Workflow

```
- [ ] 1. Clarify purpose, triggers, and the 80% workflow with the user
- [ ] 2. Check .claude/skills/ for overlap with existing skills
- [ ] 3. Create .claude/skills/<name>/SKILL.md from the template
- [ ] 4. Write frontmatter first; validate name + description constraints
- [ ] 5. Draft body, omitting empty sections
- [ ] 6. Re-read the file; confirm <500 lines and references one level deep
- [ ] 7. Report the path and a one-line summary to the user
```

**Step 1 — Clarify.** If any of purpose/triggers/workflow is missing, ask before scaffolding. Skills built from vague briefs mis-activate.

**Step 2 — Overlap check.** Grep `.claude/skills/*/SKILL.md` for the proposed triggers. If an existing skill already covers them, propose editing it instead.

**Step 3-5 — Write.** Use the template verbatim, then delete sections that don't apply.

**Step 6 — Verify.** Re-read with the Read tool (don't trust the write). Check: frontmatter delimiters present, `name` matches directory, description ≤1024 chars, no nested references beyond one level.

**Step 7 — Report.** Single sentence: path + what it does. Don't summarize the file contents.

## Examples

**Good description** (specific, third-person, triggers named):
```yaml
description: Generates Conventional Commit messages from staged git diffs. Use when the user asks to commit, says "commit this", or wants a PR-ready message.
```

**Bad description** (vague, first-person, no triggers):
```yaml
description: I help you with git stuff
```

**Good name**: `creating-tickets`, `reviewing-prs`, `scaffolding-components`
**Bad name**: `helper`, `utils`, `claude-tools`

## Anti-patterns

- **Filling every section because the template has it.** Empty sections train Claude to skim. Delete them.
- **Description as marketing copy.** Every padded word displaces another skill's metadata at discovery time.
- **Premature file splitting.** A 120-line skill in 4 files costs more round-trips than it saves tokens.
- **Nested references** (`SKILL.md → advanced.md → details.md`). Claude partial-reads these and misses content. Flat-link from SKILL.md.
- **Copy-paste from another skill without trimming.** Inherited boilerplate is the fastest way to dilute trigger signal.
- **Time-stamped prose** ("in 2026 we do X"). Rots immediately.
- **Skill that duplicates CLAUDE.md rules.** If it's always-on guidance, it belongs in CLAUDE.md or `.claude/rules/`, not a skill.
