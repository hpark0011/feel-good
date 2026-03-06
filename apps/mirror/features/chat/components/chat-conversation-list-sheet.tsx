"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@feel-good/ui/primitives/sheet";
import { ConversationList } from "./conversation-list";
import type { Conversation } from "../types";
import type { Id } from "@feel-good/convex/convex/_generated/dataModel";

type ChatConversationListSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: Conversation[];
  activeConversationId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
};

export function ChatConversationListSheet({
  open,
  onOpenChange,
  conversations,
  activeConversationId,
  onSelect,
}: ChatConversationListSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[80vw] md:w-64 md:max-w-64 p-0 max-h-[60vh] rounded-2xl inset-y-auto top-[56px] shadow-2xl left-4 border border-card-border bg-card gap-0 [corner-shape:superellipse(1.2)]"
        overlayClassName="bg-transparent"
      >
        <SheetHeader className="px-3.5 py-2.5">
          <SheetTitle className="font-medium text-sm text-muted-foreground">
            Conversations
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={(id) => {
              onSelect(id);
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
