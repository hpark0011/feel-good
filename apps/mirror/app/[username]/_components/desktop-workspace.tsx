"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from "react";
import { cn } from "@feel-good/utils/cn";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@feel-good/ui/primitives/resizable";
import { useWorkspaceChrome } from "../_providers/workspace-chrome-context";

const CONTENT_PANEL_TRANSITION_MS = 300;

type DesktopWorkspaceProps = {
  interaction: ReactNode;
  children: ReactNode;
};

export function DesktopWorkspace({
  interaction,
  children,
}: DesktopWorkspaceProps) {
  const {
    contentPanelId,
    contentPanelPhase,
    completeClosing,
    completeOpening,
  } = useWorkspaceChrome();
  const groupRef = useRef<ComponentRef<typeof ResizablePanelGroup>>(null);
  const contentPanelRef = useRef<ComponentRef<typeof ResizablePanel>>(null);
  const [isContentShifted, setIsContentShifted] = useState(false);

  useEffect(() => {
    const shouldShiftContent =
      contentPanelPhase === "closing" || contentPanelPhase === "closed";
    let timeoutId: number | undefined;

    if (contentPanelPhase === "opening") {
      groupRef.current?.setLayout([50, 50]);
      timeoutId = window.setTimeout(() => {
        completeOpening();
      }, CONTENT_PANEL_TRANSITION_MS);
    }

    if (contentPanelPhase === "closing") {
      timeoutId = window.setTimeout(() => {
        contentPanelRef.current?.collapse();
        completeClosing();
      }, CONTENT_PANEL_TRANSITION_MS);
    }

    const frameId = requestAnimationFrame(() => {
      setIsContentShifted(shouldShiftContent);
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [contentPanelPhase, completeClosing, completeOpening]);

  const contentPanelState = contentPanelPhase === "open"
    ? "open"
    : contentPanelPhase === "closed"
      ? "closed"
      : "transitioning";

  return (
    <main className="h-screen">
      <ResizablePanelGroup
        id="profile-workspace"
        ref={groupRef}
        direction="horizontal"
        className="h-full"
      >
        <ResizablePanel
          id="profile-workspace-interaction"
          defaultSize={50}
          minSize={25}
          maxSize={100}
        >
          {interaction}
        </ResizablePanel>

        <ResizableHandle
          className={cn(
            "bg-border-subtle data-[resize-handle-state=hover]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)] data-[resize-handle-state=drag]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)] z-30 relative transition-opacity duration-200 ease-in-out",
            contentPanelPhase === "closed" && "pointer-events-none opacity-0",
          )}
        />

        <ResizablePanel
          id="profile-workspace-content"
          ref={contentPanelRef}
          defaultSize={50}
          minSize={25}
          maxSize={80}
          collapsible
          collapsedSize={0}
        >
          <div
            id={contentPanelId}
            data-state={contentPanelState}
            data-testid="desktop-content-panel"
            aria-hidden={contentPanelPhase !== "open"}
            inert={contentPanelPhase !== "open"}
            className={cn(
              "h-full transform-gpu transition-[transform,opacity] duration-300 ease-in-out",
              contentPanelPhase !== "open" && "pointer-events-none",
              isContentShifted ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
            )}
          >
            {/*
              Keep the content subtree mounted so route and scroll state survive
              desktop panel toggles.
            */}
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
