"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@feel-good/ui/primitives/drawer";
import { useState } from "react";

const PEEK_SNAP_POINT = 0.1585;
const EXPANDED_SNAP_POINT = 1;
const SHEET_SNAP_POINTS: Array<number | string> = [
  PEEK_SNAP_POINT,
  EXPANDED_SNAP_POINT,
];

type MobileProfileLayoutProps = {
  profile: React.ReactNode;
  content:
    | React.ReactNode
    | ((scrollRoot: HTMLDivElement | null) => React.ReactNode);
};

export function MobileProfileLayout({
  profile,
  content,
}: MobileProfileLayoutProps) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | string | null>(
    PEEK_SNAP_POINT,
  );
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [drawerContainer, setDrawerContainer] = useState<HTMLDivElement | null>(
    null,
  );

  const resolvedContent =
    typeof content === "function" ? content(contentElement) : content;
  const isExpanded = activeSnapPoint === EXPANDED_SNAP_POINT;

  return (
    <div className="h-dvh overflow-hidden relative">
      <div
        className="absolute inset-0 origin-center pt-24 transition-transform duration-300"
        style={{ transform: `scale(${isExpanded ? 0.8 : 1})` }}
      >
        {profile}
      </div>

      <div ref={setDrawerContainer} className="absolute inset-x-0 bottom-0 top-[48px]">
        <Drawer
          open
          modal={false}
          dismissible={false}
          scrollLockTimeout={100}
          snapPoints={SHEET_SNAP_POINTS}
          activeSnapPoint={activeSnapPoint}
          setActiveSnapPoint={setActiveSnapPoint}
          container={drawerContainer}
        >
          <DrawerContent
            role="region"
            aria-label="Articles"
            className="!absolute !inset-x-0 !bottom-0 !top-0 !mt-0 !h-full !max-h-none !rounded-t-4xl !border-t !border-border-subtle !bg-background [corner-shape:superellipse(1.1)] [&>div:first-child]:hidden"
          >
            <DrawerHeader className="sr-only">
              <DrawerTitle>Articles</DrawerTitle>
              <DrawerDescription>
                Draggable panel that contains the article list.
              </DrawerDescription>
            </DrawerHeader>

            <div className="relative flex h-full flex-col overflow-hidden">
              <div className="absolute top-[32px] z-10 left-0 w-full h-6 bg-linear-to-b from-background to-transparent" />

              <div className="flex items-center justify-center pt-3 pb-4 cursor-grab active:cursor-grabbing touch-none">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
              </div>

              <div
                ref={setContentElement}
                className="overflow-y-auto overscroll-y-contain h-[calc(100%-36px)] pt-2"
              >
                {resolvedContent}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
