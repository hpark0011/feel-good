---
id: FG_067
title: "Send animation key never expires, replays on React reconciliation"
date: 2026-03-10
type: fix
status: to-do
priority: p3
description: "The sendAnimationKey state is never cleared after the CSS animation completes. If React reconciles and re-mounts the message item (e.g., during a Convex query re-page), the 400ms pop-in animation replays as if the message was just sent."
dependencies:
  - FG_060
parent_plan_id:
acceptance_criteria:
  - "grep -n 'setSendAnimationKey(null)' apps/mirror/features/chat/hooks/use-chat.ts returns a match in a timeout or animationend effect"
  - "The animation key is cleared within 500ms of being set"
  - "pnpm build --filter=@feel-good/mirror completes without errors"
owner_agent: "React animation lifecycle fixer"
---

# Send animation key never expires, replays on React reconciliation

## Context

Discovered during frontend races review of `feat-rag` branch. The `animate-message-send` CSS animation is 400ms with `both` fill mode. The `sendAnimationKey` state persists indefinitely after being set — there is no cleanup effect to clear it. If React reconciles and re-mounts the `ChatMessageItem` (e.g., during a Convex query re-pagination or a key change), the `animateSend` prop will still be `true`, replaying the pop-in animation as if the message was just sent.

## Goal

The animation key is automatically cleared after the animation completes, preventing replays on reconciliation.

## Scope

- Add an effect that clears `sendAnimationKey` after 500ms (slightly longer than the 400ms animation)

## Out of Scope

- Using `animationend` DOM events (adds complexity for marginal benefit)
- Changes to the CSS animation itself

## Approach

Add a simple cleanup effect in `useChat`:

```typescript
useEffect(() => {
  if (!sendAnimationKey) return;
  const timer = setTimeout(() => setSendAnimationKey(null), 500);
  return () => clearTimeout(timer);
}, [sendAnimationKey]);
```

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Add the expiry effect in `use-chat.ts` after the existing animation effects
2. Add the same pattern in `use-mock-chat.ts` for consistency
3. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- The timeout must be longer than the 400ms CSS animation duration
- Must clean up on unmount

## Resources

- Frontend races reviewer finding
