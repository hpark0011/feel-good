"use client";

import { LayoutGrid, Rows3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useTaskLayoutMode,
  type LayoutPreference,
} from "../_hooks/use-task-layout-mode";

export function LayoutToggle() {
  const { layoutPref, setLayoutPref, isMobile } = useTaskLayoutMode();

  if (isMobile) return null;

  return (
    <Tabs
      value={layoutPref}
      onValueChange={(value) => setLayoutPref(value as LayoutPreference)}
    >
      <TabsList className="h-7 p-0.5">
        <TabsTrigger value="list" className="h-6 w-7 p-0" aria-label="List view">
          <Rows3 className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="board" className="h-6 w-7 p-0" aria-label="Board view">
          <LayoutGrid className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
