---
id: FG_064
title: "Mock chat mode accessible in production via query param"
date: 2026-03-10
type: fix
status: to-do
priority: p2
description: "The mockChat query parameter activates mock chat mode without any environment guard. Anyone in production can append this param to get a fake chat experience with hardcoded responses, which is confusing and potentially brand-damaging."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "grep -n 'NODE_ENV' apps/mirror/features/chat/components/chat-thread.tsx returns at least one match"
  - "Mock chat mode is not activatable when NODE_ENV is production"
  - "pnpm build --filter=@feel-good/mirror completes without errors"
owner_agent: "Feature flag enforcer"
---

# Mock chat mode accessible in production via query param

## Context

Discovered during architecture review of `feat-rag` branch. In `apps/mirror/features/chat/components/chat-thread.tsx:18`, the mock mode check is a simple query param read with no environment guard. In production, any user can append `?mockChat=1` to a profile URL and see a fake chat with hardcoded responses.

## Goal

Mock chat mode is only available in development, not in production builds.

## Scope

- Add `process.env.NODE_ENV !== "production"` guard to the mock check

## Out of Scope

- Feature flag infrastructure
- Removing mock chat entirely

## Approach

Guard the check with environment. Next.js dead-code eliminates the entire mock branch in production builds.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. In `chat-thread.tsx`, update the isMock check to include the env guard
2. Run `pnpm build --filter=@feel-good/mirror` to verify the production build still works
3. Verify mock code is tree-shaken in production build (optional)

## Constraints

- Must not affect development workflow

## Resources

- Architecture strategist review finding
