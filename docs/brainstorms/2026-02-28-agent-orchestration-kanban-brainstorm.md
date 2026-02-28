# Agent Orchestration Kanban — Brainstorm

**Date:** 2026-02-28
**Status:** Draft
**Approach:** Extend existing `@feel-good/greyboard-core`

---

## What We're Building

A desktop-native agent orchestration platform built into greyboard-desktop. Users manage work as kanban tickets and assign AI agents (Claude Code, OpenAI Codex, Gemini Pro) to execute and validate tasks. The app spawns CLI subprocesses for each agent, streams their output into a dedicated session view, and supports pause/resume with context preservation.

### Core Capabilities

1. **5-column kanban board** — Backlog, To-Do, In Progress, In Review, Done
2. **Agent-aware tickets** — Each ticket has an owner agent (executor) and validation agent
3. **CLI subprocess execution** — Agents run as local CLI processes in the ticket's project directory
4. **Graceful pause/resume** — Stop agent gracefully, save context, re-launch with context on resume
5. **Auto-cascade dependencies** — When a blocker completes + passes validation, dependent tickets auto-advance
6. **Auto-triggered validation** — Moving to "In Review" automatically starts the validation agent
7. **Insights dashboard** — Agent performance, project velocity, and cost/token tracking
8. **File system storage** — All state persisted locally, no cloud dependency

---

## Why This Approach (Extend Greyboard Core)

The existing `@feel-good/greyboard-core` already provides:
- Drag-and-drop kanban with @dnd-kit
- Ticket CRUD with subtasks
- Snapshot-based persistence with storage adapter pattern
- Desktop IPC for atomic file writes

Extending this avoids duplicating board infrastructure and lets the web app benefit from shared type improvements. Agent-specific logic (subprocess spawning, session management) lives in the Electron main process, keeping the core renderer-agnostic.

---

## Key Decisions

### Agent Execution
- **CLI subprocesses** spawned from Electron main process via `child_process.spawn()`
- Each agent type has a known CLI command: `claude` (Claude Code), `codex` (Codex), `gemini` (Gemini CLI)
- Agent launched with ticket's project directory as `cwd`
- Ticket context (title, description, subtasks, validation gates) serialized as the initial prompt/instruction

### Pause/Resume
- **Graceful stop + resume context**: Send a stop command to the agent, capture its current state/output
- On resume, re-launch the agent with the saved context so it can continue where it left off
- Progress tracked via subtask checkboxes — completed items aren't re-done

### Validation Flow
- **Auto-trigger on column move**: When ticket lands in "In Review", validation agent starts automatically
- Validation agent receives the ticket's validation gates as acceptance criteria
- If all gates pass → ticket moves to Done automatically
- If validation fails → ticket moves back to In Progress with failure notes

### Dependency Cascade
- **Auto-cascade**: When blocking ticket completes + passes validation, blocked tickets move to To-Do
- If blocked ticket has a play-on-ready flag, it can auto-start execution
- Circular dependency detection prevents infinite loops

### Agent Output Visibility
- **Dedicated session view**: Clicking a running ticket opens a split view
- Left panel: ticket details, subtasks, validation gates
- Right panel: live terminal stream of agent stdout/stderr
- Session history preserved even after agent completes

### Project Model
- **Directory path**: A project = a folder on disk
- User configures projects in a settings/project list
- Agent `cwd` is set to the project directory
- Project name derived from directory name (or user-specified)

### Insights Dashboard
- **Agent performance**: Success rate, avg completion time, validation pass rate per agent
- **Project velocity**: Tickets completed per day/week, cycle time, bottleneck analysis
- **Cost tracking**: Token usage and estimated cost per agent run (parsed from CLI output or API metrics)
- Data derived from ticket history stored in the snapshot

---

## Ticket Data Model (Extended)

```typescript
interface AgentTicket {
  id: string
  title: string
  description: string
  status: "backlog" | "to-do" | "in-progress" | "in-review" | "done"
  priority: "p0" | "p1" | "p2" | "p3"
  taskType: "feature" | "fix" | "improvement" | "chore"

  // Agent assignment
  ownerAgent: AgentType | null    // "claude-code" | "codex" | "gemini-pro"
  validationAgent: AgentType | null

  // Work items
  subtasks: SubTask[]             // { id, title, completed }
  validationGates: ValidationGate[] // { id, description, passed }

  // Dependencies
  blockedBy: string[]             // Other ticket IDs

  // Project
  projectPath: string | null      // Absolute directory path

  // Session tracking
  sessions: AgentSession[]        // History of agent runs

  // Timestamps
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

type AgentType = "claude-code" | "codex" | "gemini-pro"

interface AgentSession {
  id: string
  agent: AgentType
  role: "execution" | "validation"
  status: "running" | "paused" | "completed" | "failed"
  startedAt: string
  endedAt: string | null
  resumeContext: string | null    // Saved state for pause/resume
  output: string                  // Terminal output log
  tokenUsage: number | null
  costEstimate: number | null
}

interface ValidationGate {
  id: string
  description: string
  passed: boolean | null          // null = not yet checked
}
```

---

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│  Renderer (React + Vite)                        │
│  ├── Kanban Board (extended greyboard-core)     │
│  ├── Session View (terminal + ticket details)   │
│  ├── Insights Dashboard                         │
│  └── Settings (projects, agent configs)         │
├─────────────────────────────────────────────────┤
│  IPC Bridge (contextBridge)                     │
│  ├── Existing: state.load/save/import/export    │
│  ├── New: agent.start/pause/resume/stop         │
│  ├── New: agent.onOutput (streaming)            │
│  └── New: agent.onStatusChange                  │
├─────────────────────────────────────────────────┤
│  Main Process (Electron)                        │
│  ├── State Manager (existing, extended)         │
│  ├── Agent Runner Service (new)                 │
│  │   ├── Process Manager (spawn/kill/signal)    │
│  │   ├── Context Serializer (ticket → prompt)   │
│  │   ├── Output Parser (stdout → structured)    │
│  │   └── Cost Tracker (token counting)          │
│  └── Cascade Engine (dependency resolution)     │
└─────────────────────────────────────────────────┘
```

---

## Resolved Questions

1. **Gemini CLI availability**: Confirmed — Google ships a `gemini` CLI tool. All three agents (claude, codex, gemini) are CLI-spawnable.
2. **Resume context format**: Tool-specific adapters. Each agent type gets its own adapter that knows how to pause/resume that specific CLI tool (e.g., Claude Code's `--resume` flag). Native mechanisms preferred over generic re-prompting.
3. **Cost tracking accuracy**: Best-effort from CLI output initially. Can add API key config for precise tracking later.
4. **Concurrent agent limit**: No limit. Users manage their own system resources.

---

## Additional Design Notes (from review)

### Validation Failure Handling
When validation fails, ticket moves back to In Progress with failure notes attached. The user decides next action — they can manually re-assign the owner agent to fix the issues, edit the ticket, or reassign to a different agent. No automatic retry loop (prevents runaway agent cycles).

### Agent Crash / Unexpected Exit
If a CLI process exits with a non-zero code or is killed by the OS:
- Session status set to "failed" with the exit code and last output captured
- Ticket stays in its current column (doesn't auto-move)
- User gets an Electron notification with the failure summary
- User can retry manually via the play button

### User Notifications
- **Electron native notifications** for: agent completed, agent failed, validation passed/failed, blocked ticket unblocked
- **In-app badge/indicator** on tickets with recent status changes
- Notification preferences configurable in settings

### Session Output Storage
Terminal output stored as separate files in the app's userData directory (not inline in the snapshot JSON). The snapshot stores file references (paths) to session logs. This prevents the main state file from growing unbounded.

```
~/.greyboard-desktop/
├── greyboard-state.json          # Board state (tickets, projects, config)
└── sessions/
    ├── session-abc123.log        # Raw terminal output
    └── session-def456.log
```

### Snapshot Migration (V2 → V3)
The existing GreyboardSnapshotV2 has 4 columns. V3 adds:
- "in-review" column to the board
- Extended ticket fields (ownerAgent, validationAgent, priority, taskType, etc.)
- Projects list at the snapshot level
- Sessions reference array on each ticket

Migration: V2 tickets get default values for new fields (null agents, "p2" priority, "chore" type). The "complete" column maps to "done".

### Prompt Construction
Each agent adapter is responsible for constructing the CLI invocation. The general pattern:

```
<agent-cli> [flags] "prompt string"
```

The prompt string is a structured text block containing:
- Ticket title and description
- Subtasks with completion status
- Validation gates (for validation runs)
- Project context (directory, any relevant config)
- Resume context (if resuming a paused session)

Each adapter may format this differently based on what the CLI tool accepts (e.g., stdin, --prompt flag, file argument).

---

## Out of Scope (for v1)

- Cloud sync / multi-device
- Custom agent types beyond the three listed
- Git integration (branch creation, PR management)
- Real-time collaboration
- Mobile companion app
