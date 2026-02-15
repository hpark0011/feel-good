---
status: pending
priority: p2
issue_id: "214"
tags: [code-review, security, greyboard-desktop, validation]
dependencies: []
---

# Notification Handler Skips Existing Zod Validation

## Problem Statement

`notificationPayloadSchema` is defined in `validators.ts` but never used. The notification handler accepts raw strings without validation, inconsistent with the export handler which validates via `exportBoardPayloadSchema.safeParse()`. Dead validation code that should be wired up.

## Findings

- **Dead code:** `apps/greyboard-desktop/electron/lib/validators.ts:5-8` (schema defined but never imported)
- **Handler:** `apps/greyboard-desktop/electron/ipc/notifications.ts:4-9` (no validation)
- **Contrast:** `apps/greyboard-desktop/electron/ipc/files.ts:26-29` (validates with Zod)
- **Flagged by:** Security, TypeScript, Pattern Recognition, Simplicity reviewers

## Proposed Solutions

Either wire up the existing schema in the handler, or remove the dead schema entirely. Wiring it up is preferred for consistency with the file export handler pattern.

- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Either `notificationPayloadSchema` is used in the handler, or the dead code is removed
- [ ] All IPC handlers that accept renderer arguments validate consistently

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | IPC boundary validation should be consistent across handlers |
