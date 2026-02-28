---
id: FG_039
title: "Integrate Chat Thread with Profile Shell Layout"
date: 2026-02-28
type: feature
status: to-do
priority: p2
description: "Integrate the `ChatThread` over the `profile-shell.tsx` with animated framer-motion transitions and conditional active view state."
dependencies:
  - "FG_038"
parent_plan_id: docs/plans/2026-02-28-feat-chat-thread-digital-clone-plan.md
acceptance_criteria:
  - "`profile-shell.tsx` manages an `activeView` instead of `chatOpen`"
  - "Profile view transitions to Chat View with a `framer-motion` collapse/reveal animated effect"
  - "On mobile screen sizes, `ChatThread` renders entirely full screen and hides the base `MobileProfileLayout`"
  - "Chat input on the default profile triggers `handleFirstMessage` logic, switching state seamlessly"
owner_agent: "Frontend Engineer"
---

# Integrate Chat Thread with Profile Shell Layout

## Context

With `features/chat/` fully implemented components, the user needs a seamless way to enter chat context. Upon a user sending a message via the input at the bottom of the article view (in `ProfileShell`), the layout needs to slide away the profile information using `framer-motion` and reveal the `ChatThread`.

## Goal

Create smooth transitions between `ProfileInfo` contents and `ChatThread` rendering locally within `apps/mirror/app/[username]/_components/profile-shell.tsx`.

## Scope

- Manage `activeView: "profile" | "chat"` state in profile orchestrator.
- Adjust existing Profile `chat-input.tsx` allowing an `onSend` callback.
- Add Desktop and Mobile logic rules defining responsive states.

## Out of Scope

- Edits to chat components themselves.

## Approach

Animate switching states via Context wrappers using standard React state combined with `framer-motion`'s `AnimatePresence`. 

- **Effort:** Small
- **Risk:** Medium

## Implementation Steps

1. Open `apps/mirror/app/[username]/_components/profile-shell.tsx`. Refactor `chatOpen` boolean hook into `useState<"profile" | "chat">` bindings and add `activeConversationId`.
2. Add the `onSend` property hook injection to `apps/mirror/features/profile/components/chat-input.tsx`.
3. Wire the initial profile component `ChatInput` to use `onSend` callback setting the `conversationId` and shifting `activeView` to `"chat"`.
4. Wrap the left panel view contents inside `profile-shell.tsx` with an `<AnimatePresence>` evaluating Desktop dimensions via tailwind CSS hooks or useMediaQuery, shifting views.
5. Create mobile overrides inside `profile-shell.tsx` bypassing `MobileProfileLayout` when active view equates chat, directly pushing `ChatThread`.
6. Ensure Back/New handlers mapped inside `ChatThread` update the shell states accurately.

## Constraints

- Visual glitches / layout shifts during animation must be minimized (`layout` props usually resolve this natively).
- The Back button must keep the previous `activeConversationId` loaded so returning resumes.

## Resources

- [Plan Draft](docs/plans/2026-02-28-feat-chat-thread-digital-clone-plan.md)
