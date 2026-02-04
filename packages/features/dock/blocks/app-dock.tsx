"use client";

import { cn } from "@feel-good/utils/cn";

import {
  DockRoot,
  DockContainer,
  DockItem,
  DockIcon,
} from "../components";
import { DockProvider, useDock } from "../providers";
import { useDockVisibility, useDockConfig } from "../hooks";
import type { DockConfig } from "../lib/types";

export interface AppDockProps {
  config: DockConfig;
  onAppClick?: (appId: string) => void;
  className?: string;
}

interface AppDockContentProps {
  onAppClick?: (appId: string) => void;
  className?: string;
}

function AppDockContent({ onAppClick, className }: AppDockContentProps) {
  const { state, setActiveAppId } = useDock();
  const { isVisible, handlers } = useDockVisibility();
  const { sortedApps } = useDockConfig();

  const handleAppClick = (appId: string) => {
    setActiveAppId(appId);
    onAppClick?.(appId);
  };

  return (
    <DockRoot>
      <div
        className="absolute inset-x-0 bottom-0 h-[72px]"
        onMouseEnter={handlers.onActivationZoneEnter}
      />
      <DockContainer
        isVisible={isVisible}
        className={className}
        onMouseLeave={handlers.onDockLeave}
      >
        {sortedApps.map((app) => (
          <DockItem
            key={app.id}
            label={app.name}
            isActive={state.activeAppId === app.id}
            onClick={() => handleAppClick(app.id)}
          >
            <DockIcon
              icon={app.icon}
              isActive={state.activeAppId === app.id}
            />
          </DockItem>
        ))}
      </DockContainer>
    </DockRoot>
  );
}

export function AppDock({ config, onAppClick, className }: AppDockProps) {
  return (
    <DockProvider config={config}>
      <AppDockContent onAppClick={onAppClick} className={className} />
    </DockProvider>
  );
}
