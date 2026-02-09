"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@feel-good/ui/primitives/drawer";

export function PeekingDrawerDemo() {
  const [snap, setSnap] = React.useState<number | string | null>("80px");

  return (
    <Drawer
      snapPoints={["80px", 0.5, 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      fadeFromIndex={1}
      modal={false}
      open
      onOpenChange={() => {}}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Peeking Drawer</DrawerTitle>
          <DrawerDescription>
            Drag up to expand. Snaps at 80px, half-screen, and full-screen.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-muted-foreground text-sm">
            This drawer starts as a small peek at the bottom and can be dragged
            to larger snap points. The overlay only appears from the half-screen
            position onward.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
