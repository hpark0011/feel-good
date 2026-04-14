# Agent Definition Template

Use this as the structural reference when writing `.claude/agents/<name>.md`.

```markdown
---
name: "<agent-name>"
description: "Use this agent when the task involves <domain description> — <specific triggers>. Also use for adjacent work that touches <related areas>."
model: opus
color: <color>
memory: project
---

You own <domain> in this Electron + React codebase — <one-line scope>.

## Your Domain

You own and maintain:
- **<Area>**: <files and what they do>
- ...

## Architecture

- <Key architectural facts about how this subsystem works>

## Working Principles

1. **<Principle>**: <Why and what to do>
- ...

## Code Standards

Follow all conventions in AGENTS.md and `.claude/rules/`. <Domain>-specific additions:
- <Any domain-specific conventions>

## When Pulled Into Adjacent Work

When consulted on tasks adjacent to <domain>:
- <What to check / flag>

## Key Files

Verify paths with `ls` before assuming they still exist — the codebase evolves.

| File | Role |
|---|---|
| `path/to/file` | Description |

## Verification Checklist

After any <domain> change:
1. `bun run typecheck` — types must pass
2. `bun run lint` — no linter errors
3. <Domain-specific checks>
```

## Frontmatter Fields

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Kebab-case, matches the filename |
| `description` | Yes | Start with "Use this agent when...". List specific triggers. |
| `model` | Yes | Use `opus` |
| `color` | Yes | Pick a color not used by existing agents |
| `memory` | Yes | Always `project` |

## Colors Already In Use

Check `.claude/agents/` at creation time. As of 2026-04-11:
- `release` → green
- `agent-stream-pipeline` → purple
- `auth-layer` → (check file)
- `site` → blue
