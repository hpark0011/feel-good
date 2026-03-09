"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  DEFAULT_PROFILE_CONTENT_KIND,
  getContentHref,
} from "@/features/content";
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
  hasContentRoute: boolean;
  interaction: ReactNode;
  children: ReactNode;
};

export function DesktopWorkspace({
  hasContentRoute,
  interaction,
  children,
}: DesktopWorkspaceProps) {
  const params = useParams<{ username: string | string[] }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupRef = useRef<ComponentRef<typeof ResizablePanelGroup>>(null);
  const contentPanelRef = useRef<ComponentRef<typeof ResizablePanel>>(null);
  const isPendingNavigationRef = useRef(false);
  const previousHasContentRouteRef = useRef(hasContentRoute);
  const [isContentPanelCollapsed, setIsContentPanelCollapsed] = useState(
    () => !hasContentRoute,
  );
  const username = Array.isArray(params.username)
    ? params.username[0]
    : params.username;
  const defaultContentHref = useMemo(() => {
    if (!username) return null;

    const href = getContentHref(username, DEFAULT_PROFILE_CONTENT_KIND);
    const queryString = searchParams.toString();
    return queryString ? `${href}?${queryString}` : href;
  }, [searchParams, username]);

  const handleContentPanelCollapse = useCallback(() => {
    setIsContentPanelCollapsed(true);
  }, []);

  const handleContentPanelExpand = useCallback(() => {
    setIsContentPanelCollapsed(false);
  }, []);

  const openDefaultContentRoute = useCallback(() => {
    if (!defaultContentHref) return;

    isPendingNavigationRef.current = true;
    router.push(defaultContentHref);
  }, [defaultContentHref, router]);

  const toggleContentPanel = useCallback(() => {
    if (isPendingNavigationRef.current) return;

    if (isContentPanelCollapsed) {
      if (!hasContentRoute) {
        openDefaultContentRoute();
        return;
      }

      groupRef.current?.setLayout([50, 50]);
      return;
    }

    contentPanelRef.current?.collapse();
  }, [hasContentRoute, isContentPanelCollapsed, openDefaultContentRoute]);

  const handleResizePointerDownCapture = useCallback((event: ReactPointerEvent) => {
    if (!isContentPanelCollapsed) return;

    event.preventDefault();
    event.stopPropagation();

    if (isPendingNavigationRef.current) return;

    if (!hasContentRoute) {
      openDefaultContentRoute();
      return;
    }

    groupRef.current?.setLayout([50, 50]);
  }, [
    hasContentRoute,
    isContentPanelCollapsed,
    openDefaultContentRoute,
  ]);

  useLayoutEffect(() => {
    const previousHasContentRoute = previousHasContentRouteRef.current;
    previousHasContentRouteRef.current = hasContentRoute;

    if (previousHasContentRoute === hasContentRoute) {
      return;
    }

    if (hasContentRoute) {
      isPendingNavigationRef.current = false;
      groupRef.current?.setLayout([50, 50]);
      return;
    }

    contentPanelRef.current?.collapse();
  }, [hasContentRoute]);

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
            defaultSize={hasContentRoute ? 50 : 100}
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
            defaultSize={hasContentRoute ? 50 : 0}
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
