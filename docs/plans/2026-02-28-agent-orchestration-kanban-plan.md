# Agent Orchestration Kanban — Implementation Plan

## Context

The greyboard-desktop Electron app is being evolved from a basic kanban task manager into an agent orchestration platform. Users will manage work as kanban tickets and assign AI agents (Claude Code, OpenAI Codex, Gemini Pro) to execute and validate tasks via CLI subprocesses. The app supports pause/resume with context preservation, auto-cascading dependencies, auto-triggered validation, a dedicated session view with live terminal output, and an insights dashboard.

**Brainstorm document:** `docs/brainstorms/2026-02-28-agent-orchestration-kanban-brainstorm.md`

---

## Phase 1: TaskWorkspace Decomposition + Extended Types (L)

**Why:** The current `task-workspace.tsx` is a 1228-line monolith. All subsequent phases need composable hooks and components to build on.

### 1a. Extract utility functions
Create `packages/greyboard-core/src/workspace/utils/board-utils.ts`:
- Move pure functions: `normalizeBoard`, `serializeBoard`, `normalizeTicket`, `normalizeSubTasks`, `normalizeTimeEntries`, `moveTicketToColumn`, `findColumn`, `generateId`, `asDate`, `asOptionalDate`, `createSnapshotWithBoard`

### 1b. Extract hooks
- `packages/greyboard-core/src/workspace/hooks/use-workspace-state.ts` — Board state, refs, persistBoard, load, CRUD callbacks
- `packages/greyboard-core/src/workspace/hooks/use-workspace-dnd.ts` — DnD sensors, handleDragStart/Over/End, cross-column ref tracking
- `packages/greyboard-core/src/workspace/hooks/use-workspace-dialog.ts` — Dialog state, openCreate/Edit, closeDialog, subTask CRUD

### 1c. Extract components
- `packages/greyboard-core/src/workspace/components/column-board.tsx`
- `packages/greyboard-core/src/workspace/components/sortable-ticket-card.tsx`
- `packages/greyboard-core/src/workspace/components/ticket-dialog.tsx`
- `packages/greyboard-core/src/workspace/components/workspace-toolbar.tsx`

### 1d. Extend type system
- Modify `packages/greyboard-core/src/types/board.types.ts`:
  - Extend `ColumnId` union: add `"in-review"` and `"done"`
  - Add optional agent fields to `Ticket` (ownerAgent, validationAgent, priority, taskType, blockedBy, validationGates, sessions) — all optional for backward compat
- Create `packages/greyboard-core/src/types/agent.types.ts`: `AgentType`, `AgentSession`, `ValidationGate`, `Priority`, `TaskType`
- Modify `packages/greyboard-core/src/config/board.config.ts`: Add 5th column `"in-review"` and rename `"complete"` → `"done"` in COLUMNS + INITIAL_BOARD_STATE

### 1e. Slim down task-workspace.tsx
Refactor to ~100 lines composing extracted hooks and components.

**Modify:** `packages/greyboard-core/src/index.ts`, `packages/greyboard-core/package.json` (new exports)

**Verify:** `pnpm build` passes. Desktop app renders same board. Web greyboard unchanged.

---

## Phase 2: Snapshot V3 + Migration (M)

**Why:** The new ticket fields and 5th column require a new snapshot version with backward-compatible migration.

### Files to modify
- `packages/utils/src/greyboard-snapshot.ts`:
  - Add `GreyboardSnapshotV3` type (version: 3, 5-column board, agent ticket fields, session references)
  - Add `migrateV2ToV3()`: maps `"complete"` → `"done"`, sets defaults (priority: "p2", taskType: "chore", ownerAgent: null, etc.)
  - Update `deserializeSnapshot()` to detect V3 and chain migrations (V1 → V2 → V3)
  - Update `serializeSnapshot()` for V3

- `apps/greyboard-desktop/electron/ipc/state.ts`: Read path runs migration; write path always writes V3
- `apps/greyboard-desktop/electron/lib/desktop-api.ts`: Update types to V3
- `apps/greyboard-desktop/electron/preload.ts`: Update type reference
- `apps/greyboard-desktop/src/lib/ipc/client.ts`: Update types

**Verify:** Load a V2 snapshot file → tickets appear in 5-column board with `"complete"` mapped to `"done"`. Save + reload persists as V3. Web greyboard still builds.

---

## Phase 3: Agent IPC Bridge + Process Manager (XL)

**Why:** Core infrastructure for spawning, managing, and communicating with CLI agent subprocesses from the Electron main process.

### 3a. Agent adapters
Create `apps/greyboard-desktop/electron/agent/adapters/`:
- `types.ts` — `AgentAdapter` interface: `buildCommand()`, `buildResumeCommand()`, `parseOutput()`, `getStopSignal()`
- `claude-adapter.ts` — `claude` CLI, `--resume` for resume, SIGINT for graceful stop
- `codex-adapter.ts` — `codex` CLI, tool-specific pause/resume
- `gemini-adapter.ts` — `gemini` CLI, tool-specific pause/resume

### 3b. Process manager
- `apps/greyboard-desktop/electron/agent/agent-runner.ts` — `AgentRunner` class: spawn, pause, resume, stop, kill. Emits stdout/stderr/exit/error events. State machine: running → paused → running → completed/failed
- `apps/greyboard-desktop/electron/agent/agent-registry.ts` — Tracks active runners by session ID. Prevents duplicate runs per ticket
- `apps/greyboard-desktop/electron/agent/prompt-builder.ts` — Serializes ticket → structured prompt text
- `apps/greyboard-desktop/electron/agent/session-storage.ts` — Manages `userData/sessions/session-{id}.log` files

### 3c. IPC bridge
- Extend `electron/lib/channels.ts`: `AGENT_START`, `AGENT_PAUSE`, `AGENT_RESUME`, `AGENT_STOP`, `AGENT_GET_STATUS`, `AGENT_ON_OUTPUT`, `AGENT_ON_STATUS_CHANGE`
- Create `electron/ipc/agent.ts`: IPC handlers using `ipcMain.handle()` + `webContents.send()` for streaming
- Extend `electron/preload.ts`: Expose `agent` namespace (start, pause, resume, stop, getStatus, onOutput, onStatusChange)
- Extend `electron/lib/desktop-api.ts` + `src/lib/ipc/client.ts`: Typed agent API
- Extend `electron/lib/validators.ts`: Zod schemas for agent payloads
- Modify `electron/ipc/index.ts`: Register agent handlers

**Verify:** Mock agent (echo command) via `desktopAPI.agent.start()` → output streams back → session log file created. Existing IPC still works.

---

## Phase 4: Session View + Terminal (L)

**Why:** Users need to see live agent output and control agent execution.

**Dependency:** xterm.js (`@xterm/xterm` + `@xterm/addon-fit`)

### Files to create in `apps/greyboard-desktop/src/features/session/`
- `components/session-view.tsx` — Split layout: ticket panel (left) + terminal (right)
- `components/session-terminal.tsx` — xterm.js wrapper, subscribes to `desktopAPI.agent.onOutput()`
- `components/session-ticket-panel.tsx` — Ticket details, subtasks, validation gates, agent badges
- `components/session-toolbar.tsx` — Play/Pause/Stop buttons, status indicator, duration timer
- `components/session-history.tsx` — Past sessions list, click to load historical log
- `hooks/use-session.ts` — Session state, output stream subscription
- `hooks/use-agent-controls.ts` — Agent IPC calls with loading/error states

### Other modifications
- `src/router.tsx`: Add `/session/:ticketId` route
- `src/features/header/main-header.tsx`: Back navigation when viewing session
- Ticket cards: Add play button (to-do status) and "view session" action

**Verify:** Navigate to `/session/<ticketId>` → terminal renders live output with ANSI colors. Pause/Resume/Stop work. Past session logs load. Terminal auto-fits on resize.

---

## Phase 5: Dependencies + Cascade + Auto-Validation (M)

**Why:** Blocked-by dependencies enable automated pipelines where completing one ticket unblocks and starts the next.

### Core logic
- `packages/greyboard-core/src/workspace/utils/dependency-graph.ts` — Pure functions: `getBlockedTickets()`, `areAllBlockersResolved()`, `detectCircularDependency()`, `getCascadeCandidates()`

### Desktop-only orchestration
- `apps/greyboard-desktop/electron/agent/cascade-engine.ts` — On ticket completion: find unblocked tickets → move to "to-do" → persist
- `apps/greyboard-desktop/electron/agent/validation-engine.ts` — On move to "in-review": spawn validation agent → check gates → auto-move to "done" or back to "in-progress"

### UI components
- `src/features/dependencies/components/dependency-picker.tsx` — Searchable ticket selector in ticket dialog
- `src/features/dependencies/components/dependency-badges.tsx` — Blocked/blocking indicators on cards
- Column board: Dimmed/locked visual for blocked tickets

**Verify:** Ticket B blocked by A → B shows blocked indicator. Complete A → B auto-moves to "to-do". Ticket with validation agent moves to "in-review" → validation auto-triggers. Circular dependency detected and prevented.

---

## Phase 6: Notifications (S)

**Why:** Users need to know when agents complete/fail without watching the terminal.

- `apps/greyboard-desktop/electron/agent/notification-service.ts` — Maps agent events → Electron `Notification` API
- `src/features/notifications/components/notification-badge.tsx` — In-app badge on tickets with recent changes
- `src/features/notifications/components/notification-toast.tsx` — In-app toast using existing UI primitives
- `src/features/notifications/hooks/use-agent-notifications.ts` — Subscribe to agent status events

**Verify:** Agent completes → OS notification appears. Agent fails → notification with error summary. In-app badges appear and fade.

---

## Phase 7: Insights Dashboard (L)

**Why:** Users need visibility into agent performance, project velocity, and cost to optimize their workflow.

### Metrics logic
- `packages/greyboard-core/src/utils/agent-insights-utils.ts` — Pure functions: `getAgentSuccessRate()`, `getAvgCompletionTime()`, `getValidationPassRate()`, `getCostByAgent()`, `getProjectVelocity()`, `getCycleTime()`, `getBottleneckColumn()`

### Dashboard UI in `apps/greyboard-desktop/src/features/insights/`
- `insights-dashboard.tsx` — Main layout with sections
- `agent-performance-chart.tsx` — Success rate, avg time per agent (Recharts)
- `velocity-chart.tsx` — Tickets completed per day/week
- `cost-tracking-table.tsx` — Token usage + cost estimates per session
- `bottleneck-analysis.tsx` — Time-in-column visualization
- `hooks/use-insights-data.ts` — Derives metrics from board state + sessions

### Other modifications
- `src/router.tsx`: Add `/insights` route
- `src/features/header/main-header.tsx`: Nav link to insights
- Add `recharts` dependency

**Verify:** Dashboard renders with correct data from completed sessions. Handles edge cases (no sessions, null cost data).

---

## Phase Dependency Graph

```
Phase 1 (Decomposition + Types)
  ↓
Phase 2 (Snapshot V3)
  ↓
Phase 3 (Agent IPC + Process Manager) ──→ Phase 6 (Notifications)
  ↓                                              ↓
Phase 4 (Session View)              Phase 5 (Dependencies + Cascade)
  ↓                                              ↓
Phase 7 (Insights Dashboard) ←───────────────────┘
```

Phases 4 and 5 can run in parallel after Phase 3. Phase 6 is best after Phase 5.

---

## Key Architectural Notes

1. **Backward compat:** All changes to `board.types.ts` are additive (optional fields, extended unions). Web greyboard continues to build without changes.
2. **Agent capabilities gated by IPC:** Agent features only work in desktop (Electron main process). The core package stays renderer-agnostic via an optional `agentAdapter` prop.
3. **Sandbox constraint:** All process spawning in main process only. Renderer communicates exclusively through IPC bridge.
4. **Session storage:** Log files in `userData/sessions/`, not inline in snapshot. Snapshot stores `sessionId` references only.
5. **Column rename:** `"complete"` → `"done"` handled in migration. Both values accepted during normalization, normalized to `"done"` in V3.

---

## Verification Strategy

Each phase has its own verification, plus end-to-end:
1. `pnpm build` passes after every phase
2. Web greyboard still works after every phase
3. Desktop app functional after every phase
4. Full flow test after Phase 5: Create tickets with dependencies → assign agents → start execution → auto-cascade → auto-validate → complete pipeline
