import type { JSONContent } from "@tiptap/core";

/**
 * Recursively extracts all text content from a Tiptap JSONContent tree.
 * Used for search indexing and plain-text representations.
 */
export function getPlainText(content: JSONContent): string {
  if (content.text) {
    return content.text;
  }

  if (!content.content) {
    return "";
  }

  return content.content
    .map((node) => {
      const text = getPlainText(node);

      // Add newlines after block-level nodes for readable output
      const isBlock =
        node.type === "paragraph" ||
        node.type === "heading" ||
        node.type === "blockquote" ||
        node.type === "codeBlock" ||
        node.type === "bulletList" ||
        node.type === "orderedList" ||
        node.type === "listItem" ||
        node.type === "horizontalRule";

      return isBlock ? `${text}\n` : text;
    })
    .join("")
    .trim();
}
