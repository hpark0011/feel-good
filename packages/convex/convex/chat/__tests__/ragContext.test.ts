import { describe, expect, it } from "vitest";
import {
  buildRagContext,
  RAG_CHUNK_MAX_CHARS,
  RAG_CONTEXT_MAX_CHARS,
} from "../actions";

describe("buildRagContext (FR-08)", () => {
  it("truncates a single chunk whose text exceeds RAG_CHUNK_MAX_CHARS", () => {
    const longText = "x".repeat(RAG_CHUNK_MAX_CHARS + 500);
    const result = buildRagContext([{ title: "Post", chunkText: longText }]);

    // The truncated chunk should contribute at most RAG_CHUNK_MAX_CHARS of body.
    // We check that the raw 'x' run in the output is bounded.
    const xRun = result.match(/x+/);
    expect(xRun).not.toBeNull();
    expect(xRun![0].length).toBe(RAG_CHUNK_MAX_CHARS);
  });

  it("caps total ragContext at RAG_CONTEXT_MAX_CHARS with 5 max-size chunks", () => {
    const bigChunk = "a".repeat(RAG_CHUNK_MAX_CHARS);
    const chunks = Array.from({ length: 5 }, (_, i) => ({
      title: `Post ${i}`,
      chunkText: bigChunk,
    }));

    const result = buildRagContext(chunks);
    expect(result.length).toBeLessThanOrEqual(RAG_CONTEXT_MAX_CHARS);
  });

  it("preserves input order deterministically", () => {
    const chunks = [
      { title: "First", chunkText: "alpha" },
      { title: "Second", chunkText: "beta" },
      { title: "Third", chunkText: "gamma" },
    ];
    const result = buildRagContext(chunks);

    const firstIdx = result.indexOf("First");
    const secondIdx = result.indexOf("Second");
    const thirdIdx = result.indexOf("Third");

    expect(firstIdx).toBeGreaterThanOrEqual(0);
    expect(secondIdx).toBeGreaterThan(firstIdx);
    expect(thirdIdx).toBeGreaterThan(secondIdx);
  });

  it("returns empty string when no chunks", () => {
    expect(buildRagContext([])).toBe("");
  });
});
