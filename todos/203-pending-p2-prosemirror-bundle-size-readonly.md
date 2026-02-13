---
status: pending
priority: p2
issue_id: "203"
tags: [code-review, pr-124, performance, bundle-size, editor, tiptap]
dependencies: []
---

# Full ProseMirror bundle loaded for read-only viewer

## Problem Statement

`RichTextViewer` loads the full Tiptap/ProseMirror stack (~80-120KB gzipped) even though the component is read-only (`editable: false`). For a blogging platform where most visitors are readers (not editors), this is a significant bundle cost that impacts page load performance.

## Findings

- **Location:** `packages/features/editor/components/rich-text-viewer.tsx`
- Dependencies: `@tiptap/core`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`, `@tiptap/extension-image`, `@tiptap/extension-link`
- `editable: false` still loads the full editor infrastructure
- The viewer is used on the article detail page — a high-traffic public route
- Next.js dynamic imports could lazy-load the viewer below the fold

## Proposed Solutions

### Option A: Dynamic import with next/dynamic (Recommended — Short Term)

Lazy-load `RichTextViewer` so ProseMirror doesn't block initial page render:

```tsx
const RichTextViewer = dynamic(
  () => import("@feel-good/features/editor/components").then(m => m.RichTextViewer),
  { ssr: false, loading: () => <ArticleSkeleton /> }
);
```

- **Effort:** Small
- **Risk:** Low — slight layout shift on load

### Option B: Static HTML renderer (Long Term)

For read-only, render JSONContent to static HTML server-side using `generateHTML()` from `@tiptap/html`, avoiding the full ProseMirror client bundle entirely.

- **Effort:** Large
- **Risk:** Medium — requires server-side rendering approach

### Option C: Lighter alternative library

Use a lightweight JSON-to-HTML renderer like `tiptap-render` instead of the full editor for read-only views.

- **Effort:** Medium
- **Risk:** Medium — new dependency, style parity needed

## Acceptance Criteria

- [ ] Article detail page does not load ProseMirror on initial page render (or loads it lazily)
- [ ] Lighthouse performance score is not degraded by rich text viewer
- [ ] Visual rendering of articles is unchanged

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #124 performance review | Full ProseMirror is ~80-120KB gzipped — heavy for read-only content |
