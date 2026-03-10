"use client";
import "./book-flip.css";
import { cn } from "@feel-good/utils/cn";
import { GeometryScene } from "./geometry-scene";

const EMPTY_STAGE_STYLE = {} as const;

/** Book flip animation with 9 pages flipping over a circular core. */
function BookFlip({ className }: { className?: string }) {
  return (
    <GeometryScene
      slot="book-flip"
      className={cn("size-[20px]", className)}
      perspective="1200px"
      stageStyle={EMPTY_STAGE_STYLE}
    >
      <div className="book-flip-core" />
      {Array.from(
        { length: 9 },
        (_, i) => (
          <div key={i} className={`book-flip-page book-flip-page-${i + 1}`} />
        ),
      )}
    </GeometryScene>
  );
}

export { BookFlip };
