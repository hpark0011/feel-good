"use client";

import { Divider } from "@/components/divider";
import { Icon } from "@feel-good/ui/components/icon";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";
import { AppDock } from "@feel-good/features/dock/blocks";
import type { DockConfig } from "@feel-good/features/dock/lib";
import {
  AqiHighIcon,
  BubbleLeftFillIcon,
  CheckListIcon,
  DocFillIcon,
} from "@feel-good/icons";

const DocIcon = () => <DocFillIcon />;
const ThreadIcon = () => <BubbleLeftFillIcon />;
const TaskIcon = () => <CheckListIcon />;
const AgentIcon = () => <AqiHighIcon />;

const dockConfig: DockConfig = {
  placement: "bottom",
  defaultAppId: "docs",
  apps: [
    { id: "docs", name: "Doc Viewer", icon: DocIcon, route: "/docs", order: 0 },
    {
      id: "threads",
      name: "Threads",
      icon: ThreadIcon,
      route: "/threads",
      order: 1,
    },
    {
      id: "tasks",
      name: "Task Board",
      icon: TaskIcon,
      route: "/tasks",
      order: 2,
    },
    {
      id: "agents",
      name: "Agent Book",
      icon: AgentIcon,
      route: "/agents",
      order: 3,
    },
  ],
};

export function DockView() {
  return (
    <div className="flex flex-col w-full">
      <Divider />
      <PageSection>
        <PageSectionHeader>App Dock</PageSectionHeader>
        <Icon name="ArrowDownIcon" />
        <p className="text-sm text-muted-foreground w-full">
          Hover near the bottom of the screen to reveal the dock.
        </p>
      </PageSection>

      <AppDock
        config={dockConfig}
        onAppClick={(appId) => console.log("Clicked:", appId)}
      />
    </div>
  );
}
