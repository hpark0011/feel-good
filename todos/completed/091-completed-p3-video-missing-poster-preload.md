---
status: completed
priority: p3
issue_id: "091"
tags: [code-review, performance, mirror]
dependencies: ["087"]
---

# Video Element Missing Poster Image and Preload Strategy

## Problem Statement

The profile video (`portrait-video.mp4`, 1.1MB) has `autoPlay` with no `preload` attribute and no `poster` image. The browser eagerly downloads the entire video immediately, competing with critical resources and delaying LCP.

## Findings

- **Source:** performance-oracle agent
- **Location:** `apps/mirror/app/(protected)/dashboard/_components/profile-media.tsx`
- **Evidence:** 1.1MB video starts downloading immediately. Five image variants exist in `public/` (rr.webp at 56KB) that could serve as poster images.

## Proposed Solutions

### Option A: Add poster and preload="metadata" (Recommended)
```typescript
<video
  src="/portrait-video.mp4"
  poster="/rr.webp"
  preload="metadata"
  autoPlay
  loop
  muted
  playsInline
/>
```
- **Pros:** Faster LCP (poster shows immediately), reduced bandwidth contention
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [x] Video has `poster` attribute pointing to an image
- [x] Video has `preload="metadata"` or `preload="none"`
- [x] LCP is not blocked by video download

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | Video poster + preload strategy critical for LCP |
| 2026-02-09 | Completed: added poster="/rr.webp" and preload="metadata" | File was renamed from profile-image.tsx to profile-media.tsx |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
