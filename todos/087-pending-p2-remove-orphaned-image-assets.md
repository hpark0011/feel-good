---
status: pending
priority: p2
issue_id: "087"
tags: [code-review, cleanup, mirror]
dependencies: []
---

# 5 Orphaned Image Files (~744KB) in Mirror Public Directory

## Problem Statement

Five image files were added during profile image prototyping (commits `6fc3087e` and `0020d75f`) but became orphaned when the implementation switched to a video element (commit `1b60d364`). None are referenced in any source file.

## Findings

- **Source:** git-history-analyzer, architecture-strategist, performance-oracle agents
- **Location:** `apps/mirror/public/`
- **Evidence:**
  - `rr-2x.jpeg` (380KB) -- unreferenced
  - `rr-hq.jpeg` (164KB) -- unreferenced
  - `rr.jpeg` (52KB) -- unreferenced
  - `rr.webp` (56KB) -- unreferenced
  - `rr.avif` (92KB) -- unreferenced
  - Total: ~744KB of dead weight
  - Only `portrait-video.mp4` (1.1MB) is actually used by `profile-image.tsx`

## Proposed Solutions

### Option A: Remove all 5 unused images (Recommended)
- Delete `rr.jpeg`, `rr-2x.jpeg`, `rr-hq.jpeg`, `rr.avif`, `rr.webp`
- **Pros:** Clean repo, no dead assets
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

### Option B: Keep one as video poster image
- Wire up `rr.webp` (56KB) or `rr.avif` (92KB) as `poster` attribute on the video
- Delete the remaining 4
- **Pros:** Faster LCP (poster shows before video loads), keeps useful asset
- **Cons:** Slightly more work
- **Effort:** Small
- **Risk:** None

## Recommended Action

Option B -- keep `rr.webp` as poster, remove the rest.

## Technical Details

- **Affected files:**
  - Delete: `apps/mirror/public/rr.jpeg`, `rr-2x.jpeg`, `rr-hq.jpeg`, `rr.avif`
  - Optionally keep: `apps/mirror/public/rr.webp` (as poster)
  - Update: `apps/mirror/app/(protected)/dashboard/_components/profile-image.tsx` (add `poster` prop)

## Acceptance Criteria

- [ ] Unused image files removed from `apps/mirror/public/`
- [ ] Video element optionally has a poster image
- [ ] Build passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | Prototyping artifacts should be cleaned up before PR |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
