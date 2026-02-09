"use client";

import type { RefObject } from "react";
import { SheetContainer } from "../_components/sheet-container";
import { useBottomSheet } from "../_hooks/use-bottom-sheet";

type MobileProfileLayoutProps = {
  profile: React.ReactNode;
  content:
    | React.ReactNode
    | ((scrollContainerRef: RefObject<HTMLDivElement | null>) => React.ReactNode);
};

export function MobileProfileLayout({
  profile,
  content,
}: MobileProfileLayoutProps) {
  const { bgScale, sheetRef, handleRef, contentRef, isDragging, progress } =
    useBottomSheet();

  const resolvedContent =
    typeof content === "function" ? content(contentRef) : content;

  return (
    <div className="h-dvh overflow-hidden relative">
      {/* Background layer — scales with progress */}
      <div
        className="absolute inset-0 origin-center pt-24"
        style={{ transform: `scale(${bgScale})` }}
      >
        {profile}
      </div>

      {/* Sheet layer — translates up with progress */}
      <SheetContainer
        ref={sheetRef}
        handleRef={handleRef}
        contentRef={contentRef}
        isDragging={isDragging}
        style={{ transform: `translateY(${(1 - progress) * 85}%)` }}
      >
        {resolvedContent}
      </SheetContainer>
    </div>
  );
}
