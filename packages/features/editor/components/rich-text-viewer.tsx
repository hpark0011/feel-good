"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { cn } from "@feel-good/utils/cn";
import { createArticleExtensions } from "../lib/extensions";

type RichTextViewerProps = {
  content: JSONContent;
  className?: string;
};

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: createArticleExtensions(),
    content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) return null;

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
