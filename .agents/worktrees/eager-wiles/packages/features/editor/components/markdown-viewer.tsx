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
