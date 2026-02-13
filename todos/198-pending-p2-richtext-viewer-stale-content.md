---
status: pending
priority: p2
issue_id: "198"
tags: [code-review, pr-124, editor, tiptap, react]
dependencies: []
---

# RichTextViewer can show stale content after prop updates

## Problem Statement

`RichTextViewer` initializes Tiptap with `useEditor({ content })`, but that `content` value is treated as initial content. When the same component instance receives new `content` props (for example, navigating between detail routes in a shared layout), the rendered document can remain stale.

## Findings

- **Location:** `packages/features/editor/components/rich-text-viewer.tsx:14`
- `useEditor` is initialized without dependency keys and no follow-up `setContent` sync.
- Prop updates can therefore diverge from the displayed ProseMirror document.

## Proposed Solutions

### Option A: Sync via `setContent` effect (Recommended)

Add an effect that applies incoming `content` when it changes:

```tsx
useEffect(() => {
  if (!editor) return;
  editor.commands.setContent(content);
}, [editor, content]);
```

- **Effort:** Small
- **Risk:** Low

### Option B: Recreate editor on content dependency

Pass a stable dependency key to `useEditor(..., deps)` so the editor remounts when content changes.

- **Effort:** Small
- **Risk:** Low (higher churn than Option A)

## Acceptance Criteria

- [ ] Article body updates correctly when `content` prop changes
- [ ] No stale content when navigating between detail routes
- [ ] Viewer remains read-only and behaviorally unchanged otherwise

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #124 review findings | `useEditor` initialization content is not reactive by default |
