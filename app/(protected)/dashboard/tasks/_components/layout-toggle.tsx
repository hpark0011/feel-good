"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLayoutMode,
  type LayoutPreference,
} from "@/features/kanban-board";

export function LayoutToggle() {
  const { layoutPref, setLayoutPref, isMobile } = useLayoutMode();

  if (isMobile) return null;

  return (
    <Tabs
      value={layoutPref}
      onValueChange={(value) => setLayoutPref(value as LayoutPreference)}
    >
      <TabsList className="h-7 p-0.5">
        <TabsTrigger value="list" className="h-full w-8 p-0" aria-label="List view">
          <Rows3 className="size-3.5 text-icon-light" />
        </TabsTrigger>
        <TabsTrigger value="board" className="h-full w-8 p-0" aria-label="Board view">
          <LayoutGrid className="size-3.5 text-icon-light" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
