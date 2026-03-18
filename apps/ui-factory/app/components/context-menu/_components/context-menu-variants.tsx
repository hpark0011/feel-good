"use client";

import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@feel-good/ui/primitives/context-menu";
import { useState } from "react";

function TriggerArea({ children }: { children: string }) {
  return (
    <div className="flex h-36 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function ContextMenuVariants() {
  const [showBookmarks, setShowBookmarks] = useState(true);
  const [showFullUrls, setShowFullUrls] = useState(false);
  const [person, setPerson] = useState("pedro");

  return (
    <div className="flex flex-col w-full pb-24">
      <Divider />

      <PageSection>
        <PageSectionHeader>Default</PageSectionHeader>
        <ContextMenu>
          <ContextMenuTrigger>
            <TriggerArea>Right click here</TriggerArea>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>
              Back <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Forward <ContextMenuShortcut>⌘]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Reload <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              Save As… <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Print…</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Variant: Destructive</PageSectionHeader>
        <ContextMenu>
          <ContextMenuTrigger>
            <TriggerArea>Right click here</TriggerArea>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>Edit</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>With Sub-Menu</PageSectionHeader>
        <ContextMenu>
          <ContextMenuTrigger>
            <TriggerArea>Right click here</TriggerArea>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>New Tab</ContextMenuItem>
            <ContextMenuItem>New Window</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>More Tools</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem>Developer Tools</ContextMenuItem>
                <ContextMenuItem>Task Manager</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Extensions</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem>Settings</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Checkbox Items</PageSectionHeader>
        <ContextMenu>
          <ContextMenuTrigger>
            <TriggerArea>Right click here</TriggerArea>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuLabel>Appearance</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem
              checked={showBookmarks}
              onCheckedChange={setShowBookmarks}
            >
              Show Bookmarks Bar
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={showFullUrls}
              onCheckedChange={setShowFullUrls}
            >
              Show Full URLs
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Radio Items</PageSectionHeader>
        <ContextMenu>
          <ContextMenuTrigger>
            <TriggerArea>Right click here</TriggerArea>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuLabel>People</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
              <ContextMenuRadioItem value="pedro">Pedro</ContextMenuRadioItem>
              <ContextMenuRadioItem value="colm">Colm</ContextMenuRadioItem>
              <ContextMenuRadioItem value="sofia">Sofia</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>With Labels &amp; Groups</PageSectionHeader>
        <ContextMenu>
          <ContextMenuTrigger>
            <TriggerArea>Right click here</TriggerArea>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuLabel inset>Edit</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem inset>
                Undo <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset>
                Redo <ContextMenuShortcut>⇧⌘Z</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel inset>Selection</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem inset>
                Cut <ContextMenuShortcut>⌘X</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset>
                Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset>
                Paste <ContextMenuShortcut>⌘V</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>State: Disabled</PageSectionHeader>
        <ContextMenu>
          <ContextMenuTrigger>
            <TriggerArea>Right click here</TriggerArea>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>Active Item</ContextMenuItem>
            <ContextMenuItem disabled>Disabled Item</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem checked disabled>
              Disabled Checked
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem disabled>
              Disabled Unchecked
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      </PageSection>
    </div>
  );
}
