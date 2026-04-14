---
name: new-domain-agent
description: "Create a new domain expert agent with full memory scaffold. Use when the user asks to create a domain agent, create an agent for X, add a new domain expert, or set up an agent for a subsystem. Invoke with `/new-domain-agent` or `/new-domain-agent <domain-name>`."
---

# New Domain Agent

Create a domain expert agent definition and its memory scaffold in one pass.

## Trigger

- `/new-domain-agent` — interactive: ask what domain to create an agent for
- `/new-domain-agent <domain-name>` — create agent for the named domain

## Process

### 1. Determine the domain

If no argument provided, ask: "What subsystem or domain should this agent own?"

From the user's answer, derive:
- **Agent name**: kebab-case, 1-3 words (e.g., `site`, `auth-layer`, `release`)
- **Domain scope**: what code/files/subsystems it owns

### 2. Research the domain

Explore the codebase to understand the domain before writing anything:

1. Read existing agents in `.claude/agents/` for structural reference and to avoid overlap
2. Read `.claude/domain-agent-template/` for the current memory template structure
3. Explore the domain's source files — glob for relevant files, read key ones
4. Identify: key files, architecture patterns, dependencies, build/test commands, common gotchas
5. Check `.claude/agent-memory/` to see which colors are already taken

### 3. Create the agent definition

Write `.claude/agents/<name>.md` following the structure in [references/agent-definition-template.md](references/agent-definition-template.md).

Key requirements:
- Frontmatter must include: `name`, `description`, `model: opus`, `color` (unique), `memory: project`
- Description starts with "Use this agent when..."
- Body sections: Your Domain, Architecture, Working Principles, Code Standards, When Pulled Into Adjacent Work, Key Files, Verification Checklist
- Key Files table must list actual files discovered during research, not placeholders
- Working Principles should reflect real patterns from the codebase, not generic advice

### 4. Bootstrap agent memory

Create `.claude/agent-memory/<name>/` with every file from `.claude/domain-agent-template/`, customized:

| Template file | Customization |
|---|---|
| `MEMORY.md` | Replace `<Agent Name>` with the agent's display name. Add a one-line scope comment. Leave Operating Principles empty — they accumulate from real work. |
| `gotchas.md` | Replace `<Agent Name>` with display name. Set date to today. Leave gotchas as commented-out template. |
| `architecture-summary.md` | Replace `<Agent Name>` with display name. Set date to today. Leave sections as commented-out template. |
| `decision-log.md` | Replace `<Agent Name>` with display name. Set date to today. Leave decisions as commented-out template. |
| `wiki.md` | Replace `<Agent Name>` with display name. Set date to today. Leave tables empty. |

Do NOT pre-fill memory content. Memory accumulates from real work sessions, not from initial setup.

### 5. Verify

Confirm all artifacts exist:

```
.claude/agents/<name>.md          ← agent definition
.claude/agent-memory/<name>/
├── MEMORY.md
├── gotchas.md
├── architecture-summary.md
├── decision-log.md
└── wiki.md
```

### 6. Report

Tell the user:
- Agent name and file path
- What domain it covers
- The memory directory path
- That memory files are empty templates — they'll populate as the agent works

## Anti-patterns

- **Don't pre-fill memory**: Gotchas, decisions, and architecture docs come from real work, not speculation
- **Don't overlap with existing agents**: Check `.claude/agents/` first — if another agent already owns a file, don't claim it
- **Don't use placeholder file paths**: Every file in the Key Files table must be a real path confirmed by glob/ls
- **Don't skip the research step**: The agent definition quality depends on understanding the actual codebase
