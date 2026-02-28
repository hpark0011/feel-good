---
title: "feat: Add Markdown Viewer with Tiptap"
type: feat
date: 2026-02-19
scope: packages/features/editor + apps/greyboard-desktop
brainstorm: docs/brainstorms/2026-02-19-markdown-viewer-tiptap-brainstorm.md
---

# feat: Add Markdown Viewer with Tiptap

## Overview

Replace the raw `<pre>` tag in greyboard-desktop's document-view route with a `MarkdownViewer` component powered by tiptap + `tiptap-markdown`. The viewer renders `.md` files with proper prose styling, reusing the existing editor infrastructure from `@feel-good/features/editor/`.

This is Phase 1 (viewer only). The tiptap pipeline is chosen to enable Phase 2 editing with minimal rework (`editable: true` + toolbar + `editor.storage.markdown.getMarkdown()`).

## Problem Statement

Users currently see raw markdown text in a monospace `<pre>` tag when opening `.md` files in greyboard-desktop. Headings, lists, code blocks, and links are all rendered as plain text — unusable for document review.

## Proposed Solution

Build a `MarkdownViewer` component in `@feel-good/features/editor/` that:
- Takes a raw markdown string as input
- Uses tiptap with the `tiptap-markdown` extension to parse it
- Renders with the existing `tiptap-content.css` prose styles
- Follows the same patterns as the existing `RichTextViewer` (which takes JSONContent)

Wire greyboard-desktop to use this component by adding `@feel-good/features` as a dependency and integrating the typography styles.

## Open Questions Resolved

| Question | Decision | Rationale |
|----------|----------|-----------|
| Shared vs separate extension factory? | Separate `createMarkdownExtensions()` | Article viewer doesn't need markdown parsing; heading levels differ |
| Heading levels? | `[1, 2, 3, 4, 5, 6]` | Markdown files commonly use h1; no article-title reservation needed |
| Code syntax highlighting? | Defer to Phase 2 | StarterKit's `codeBlock` renders monospace — functional, not beautiful |
| Frontmatter stripping? | Defer — render as-is for Phase 1 | Low-priority UX polish; can add a strip utility later |
| GFM tables/task lists? | Defer — Phase 1 ships without | Requires additional tiptap extensions; document as known limitation |
| Images in markdown? | Disable all markdown images in Phase 1 | Avoid outbound requests from untrusted markdown; design local image support in Phase 2 |

## Technical Considerations

### Security: HTML in Markdown

Tiptap only renders node types it has extensions for. `<script>`, `<iframe>`, and event-handler attributes are silently dropped because no corresponding extension is loaded. This is sanitization-by-omission — the same approach the existing `RichTextViewer` relies on (plus explicit `sanitizeContent()` for JSONContent). For raw markdown → tiptap parsing, the extension whitelist is the security boundary.

**Verification step:** Test with a markdown file containing `<script>alert('xss')</script>` to confirm it's stripped.

### Security: Link Clicks in Electron

The existing `Link.configure({ openOnClick: true, target: "_blank" })` is designed for browser contexts (mirror app). In Electron, `target="_blank"` behavior is undefined without explicit `webContents` handling.

**Decision:** Set `openOnClick: false` in the markdown extension factory. Links render as styled text but don't navigate. Phase 2 can add a `shell.openExternal()` handler via IPC for safe external link opening.

### Security: Remote Image Requests in Electron

Markdown image syntax can cause network requests when rendering remote URLs. In desktop, that leaks reading behavior/IP metadata to third-party hosts if users open untrusted files.

**Decision:** Do not register the `Image` extension for markdown in Phase 1. This blocks both remote and local markdown images by default. Phase 2 can add an explicit allowlist + safe local file handling via IPC.

### Dependency: `next` Peer Dependency

`@feel-good/features` declares `next: ^16.0.0` as a peerDependency. greyboard-desktop doesn't use Next.js. pnpm will warn about the missing peer.

**Decision:** Check if the root `.npmrc` already has `strict-peer-dependencies=false`. If so, the warning is non-blocking. If strict, add a `peerDependencyRules.allowedVersions` or `ignoreMissing` entry in greyboard-desktop's `package.json`. This is a one-line config, not a structural change.

### Dependency: Transitive Dependencies

Adding `@feel-good/features` brings convex, better-auth, and other auth-related packages into greyboard-desktop's dependency tree. These are unused but harmless — they don't affect the bundle (only editor sub-path is imported). Acceptable for Phase 1; extracting the editor into its own package is a separate refactor.

## Acceptance Criteria

- [x] Opening a `.md` file in greyboard-desktop renders formatted markdown (headings, lists, bold, italic, code blocks, links)
- [x] The rendered output uses the same prose styling as mirror's article viewer
- [x] Markdown with raw HTML tags does not execute scripts or render unsafe elements
- [x] Links in markdown are visible but non-clickable (Phase 1)
- [x] Markdown images (remote and local) are not rendered in Phase 1
- [x] Empty markdown files render without errors
- [x] Navigation between different `.md` files updates the viewer content correctly
- [x] `pnpm build` passes for all apps (greyboard, mirror, ui-factory, greyboard-desktop)
- [x] No regressions in mirror's `RichTextViewer`

## Implementation Plan

### Phase 1: Package-Level Changes (`packages/features/`)

#### 1.1 Install `tiptap-markdown`

**File:** `packages/features/package.json`

Add `tiptap-markdown` to dependencies. Verify compatibility with `@tiptap/core: ^3.19.0`.

```bash
cd packages/features && pnpm add tiptap-markdown
```

#### 1.2 Create `createMarkdownExtensions()` Factory

**File:** `packages/features/editor/lib/extensions.ts`

Add a new factory function alongside the existing `createArticleExtensions()`:

```typescript
// packages/features/editor/lib/extensions.ts

import { Markdown } from "tiptap-markdown";

export function createMarkdownExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
    }),
    Link.configure({
      openOnClick: false, // Electron safety — no navigation in viewer
      HTMLAttributes: {
        rel: "noopener noreferrer nofollow",
      },
    }),
    Markdown.configure({
      html: false, // Strip raw HTML from markdown for security
    }),
  ];
}
```

Key differences from `createArticleExtensions()`:
- All heading levels `[1, 2, 3, 4, 5, 6]`
- `openOnClick: false` on Link (Electron safety)
- No `Image` extension in Phase 1 (blocks markdown image rendering by default)
- No `target: "_blank"` (not applicable in read-only viewer)
- `Markdown` extension added with `html: false` (security hardening)

#### 1.3 Create `MarkdownViewer` Component

**File:** `packages/features/editor/components/markdown-viewer.tsx`

Follow the exact patterns from `rich-text-viewer.tsx`:

```typescript
// packages/features/editor/components/markdown-viewer.tsx
"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { cn } from "@feel-good/utils/cn";
import { createMarkdownExtensions } from "../lib/extensions";

const MARKDOWN_EXTENSIONS = createMarkdownExtensions();

type MarkdownViewerProps = {
  content: string;
  className?: string;
};

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const editor = useEditor({
    extensions: MARKDOWN_EXTENSIONS,
    content,
    editable: false,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div
        className={cn(
          "tiptap-content prose dark:prose-invert max-w-none min-h-[200px]",
          className,
        )}
      />
    );
  }

  return (
    <EditorContent
      editor={editor}
      className={cn(
        "tiptap-content prose dark:prose-invert max-w-none",
        className,
      )}
    />
  );
}
```

Key differences from `RichTextViewer`:
- Takes `content: string` (not `JSONContent`)
- No `sanitizeContent()` call (tiptap-markdown handles parsing; `html: false` is the security layer)
- No `useMemo` wrapping (string input, no deep object to memoize)
- `useEffect` for content updates follows the same proven pattern

#### 1.4 Update Barrel Exports

**File:** `packages/features/editor/components/index.ts`

```typescript
export { RichTextViewer } from "./rich-text-viewer";
export { MarkdownViewer } from "./markdown-viewer";
```

**File:** `packages/features/editor/index.ts`

```typescript
export { RichTextViewer } from "./components/rich-text-viewer";
export { MarkdownViewer } from "./components/markdown-viewer";
export { createArticleExtensions, createMarkdownExtensions } from "./lib/extensions";
export { getPlainText } from "./lib/get-plain-text";
export type { JSONContent } from "./types";
```

**File:** `packages/features/editor/lib/index.ts`

```typescript
export { createArticleExtensions, createMarkdownExtensions } from "./extensions";
export { getPlainText } from "./get-plain-text";
export { sanitizeContent } from "./sanitize-content";
```

### Phase 2: App-Level Changes (`apps/greyboard-desktop/`)

#### 2.1 Add Dependencies

**File:** `apps/greyboard-desktop/package.json`

```json
{
  "dependencies": {
    "@feel-good/features": "workspace:*"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.19"
  }
}
```

Handle `next` peer dependency warning — check `.npmrc` for `strict-peer-dependencies` setting first. If strict, add to greyboard-desktop's `package.json`:

```json
{
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": ["next"]
    }
  }
}
```

Then run `pnpm install` from root.

#### 2.2 Wire Styles

**File:** `apps/greyboard-desktop/styles/globals.css`

Add three directives:

```css
@import "@feel-good/features/editor/styles/tiptap-content.css";
@plugin "@tailwindcss/typography";
@source "../node_modules/@feel-good/features";
```

Follow the same pattern as mirror's `globals.css`.

#### 2.3 Replace `<pre>` with `MarkdownViewer`

**File:** `apps/greyboard-desktop/src/features/documents/components/document-view-content.tsx`

Replace the `<pre>` block in the success state:

```diff
- <pre className="whitespace-pre-wrap break-words p-6 text-sm leading-relaxed text-foreground font-mono">
-   {content}
- </pre>
+ <div className="p-6">
+   <MarkdownViewer content={content ?? ""} />
+ </div>
```

Import at the top:

```typescript
import { MarkdownViewer } from "@feel-good/features/editor/components";
```

### Phase 3: Verification & Regression Checks

#### 3.1 Build and Type Validation

Run from repo root:

```bash
pnpm install
pnpm build
```

This validates:
- New dependency graph resolves in all workspaces
- No build regressions in mirror from editor package changes
- desktop app still builds after importing `@feel-good/features/editor`

#### 3.2 Manual Security and Rendering Fixture Checks

Create or reuse markdown fixtures and verify in desktop:

- `basic.md`: headings, lists, inline code, fenced code block, links
- `empty.md`: empty file
- `xss.md`: includes `<script>alert('xss')</script>`, `<iframe src="..."></iframe>`, and inline event handlers
- `images.md`: includes `![remote](https://example.com/test.png)` and `![local](./image.png)`

Expected outcomes:
- `basic.md` renders with prose styling
- `empty.md` shows blank viewer without stale previous content
- `xss.md` does not execute JS and unsafe HTML is not rendered as active elements
- Links are styled but non-clickable
- Images are not rendered (both remote and local) in Phase 1

#### 3.3 Mirror Regression Smoke Check

Verify existing mirror viewer still works:

- Run `pnpm build --filter=@feel-good/mirror`
- Open an existing article page that uses `RichTextViewer` and confirm headings, links, and images still render as before

## Known Limitations (Phase 1)

| Limitation | Workaround | Phase 2? |
|-----------|-----------|----------|
| No code syntax highlighting | Monospace code blocks render correctly, just no color | Yes |
| No GFM tables | Tables render as text | Yes (add `@tiptap/extension-table`) |
| No task lists (`- [x]`) | Render as regular list items | Yes (add `@tiptap/extension-task-list`) |
| Markdown images disabled | Remote and local image syntax are ignored | Yes (safe allowlist + local file resolution) |
| Links non-clickable | Styled as links but no navigation | Yes (`shell.openExternal()` handler) |
| Frontmatter rendered as content | YAML block visible to user | Yes (strip utility) |
| No file-change watching | Must navigate away and back to see updates | Yes (fs.watch IPC) |

## Success Metrics

- Markdown files render with correct heading hierarchy, lists, code blocks, blockquotes, bold/italic, and links
- Markdown images are blocked by default in desktop Phase 1
- No visual regressions in mirror's article viewer
- Build passes across all apps
- No security vulnerabilities from rendered markdown content

## References

### Internal

- `packages/features/editor/components/rich-text-viewer.tsx` — pattern to follow
- `packages/features/editor/lib/extensions.ts` — extension factory pattern
- `packages/features/editor/styles/tiptap-content.css` — prose styles
- `apps/greyboard-desktop/src/features/documents/components/document-view-content.tsx` — replace `<pre>` here
- `apps/mirror/styles/globals.css` — reference for style wiring pattern

### External

- [tiptap-markdown](https://github.com/aguingand/tiptap-markdown) — markdown extension for tiptap
- [tiptap v3 docs](https://tiptap.dev/docs) — editor framework

### Brainstorm

- `docs/brainstorms/2026-02-19-markdown-viewer-tiptap-brainstorm.md`
