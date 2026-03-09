"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@feel-good/ui/primitives/resizable";
import {
  CONTENT_PANEL_ID,
  WorkspaceChromeProvider,
} from "../_providers/workspace-chrome-context";

type DesktopWorkspaceProps = {
  interaction: ReactNode;
  children: ReactNode;
};

export function DesktopWorkspace({
  interaction,
  children,
}: DesktopWorkspaceProps) {
  const groupRef = useRef<ComponentRef<typeof ResizablePanelGroup>>(null);
  const contentPanelRef = useRef<ComponentRef<typeof ResizablePanel>>(null);
  const [isContentPanelCollapsed, setIsContentPanelCollapsed] = useState(false);

  const handleContentPanelCollapse = useCallback(() => {
    setIsContentPanelCollapsed(true);
  }, []);

  const handleContentPanelExpand = useCallback(() => {
    setIsContentPanelCollapsed(false);
  }, []);

  const toggleContentPanel = useCallback(() => {
    if (isContentPanelCollapsed) {
      groupRef.current?.setLayout([50, 50]);
      return;
    }

    contentPanelRef.current?.collapse();
  }, [isContentPanelCollapsed]);

  const handleResizePointerDownCapture = useCallback(() => {
    if (!isContentPanelCollapsed) return;
    groupRef.current?.setLayout([50, 50]);
  }, [isContentPanelCollapsed]);

  const workspaceChromeValue = useMemo(
    () => ({
      contentPanelId: CONTENT_PANEL_ID,
      isContentPanelCollapsed,
      toggleContentPanel,
    }),
    [isContentPanelCollapsed, toggleContentPanel],
  );

  return (
    <WorkspaceChromeProvider value={workspaceChromeValue}>
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
            className="bg-border-subtle data-[resize-handle-state=hover]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)] data-[resize-handle-state=drag]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)] z-30 relative"
            onPointerDownCapture={handleResizePointerDownCapture}
          />

          <ResizablePanel
            id="profile-workspace-content"
            ref={contentPanelRef}
            defaultSize={50}
            minSize={25}
            maxSize={80}
            collapsible
            collapsedSize={0}
            className="min-w-0 overflow-hidden"
            onCollapse={handleContentPanelCollapse}
            onExpand={handleContentPanelExpand}
          >
            <div
              id={CONTENT_PANEL_ID}
              data-state={isContentPanelCollapsed ? "closed" : "open"}
              data-testid="desktop-content-panel"
              aria-hidden={isContentPanelCollapsed}
              inert={isContentPanelCollapsed}
              className="h-full"
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
    </WorkspaceChromeProvider>
  );
}
