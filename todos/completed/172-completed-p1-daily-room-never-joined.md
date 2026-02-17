---
status: completed
priority: p1
issue_id: "172"
tags: [code-review, bug, video-call, mirror, tavus]
dependencies: []
---

# Daily Room Never Joined — Video Call Permanently Stuck on "Connecting"

## Problem Statement

The `Conversation` component (which calls `daily.join()` and fires the `onJoined` callback) is never imported or rendered anywhere in the component tree. As a result, `startCall` dispatches `"connect"` setting state to `"connecting"`, but `daily.join()` is never called and the `"connected"` action is never dispatched. `VideoCallView` gates all video rendering on `callState.status === "connected"`, so the user sees "Connecting..." indefinitely and the video call feature is completely non-functional.

## Findings

- **Location:** `apps/mirror/features/video-call/hooks/use-video-call.ts:12-48`
- **Related:** `apps/mirror/features/video-call/components/cvi/conversation.tsx:12-49`
- **Source:** PR #133 review (cursor[bot], comment id 2815369839)
- **Severity:** High

## Proposed Solutions

Render the `Conversation` component inside the `VideoCallView` or `VideoCallModal` component tree so that `daily.join()` is actually called when the call state transitions to `"connecting"`.

- **Effort:** Low

## Acceptance Criteria

- [ ] Clicking Video button transitions through creating -> connecting -> connected
- [ ] Avatar video stream appears after connection
- [ ] User can speak and receive avatar responses

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-17 | Created from PR #133 code review | Conversation component exists but is never mounted |
| 2026-02-17 | Fixed in c08fbb3a | Rendered Conversation in VideoCallModal, made it headless (returns null) since VideoCallView handles rendering |
