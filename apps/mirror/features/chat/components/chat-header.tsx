"use client";

import { Button } from "@feel-good/ui/primitives/button";
import { Icon } from "@feel-good/ui/components/icon";
import { cn } from "@feel-good/utils/cn";
import { MirrorAvatar } from "@/components/mirror-avatar";

type ChatHeaderProps = {
  profileName: string;
  avatarUrl: string | null;
  onBack: () => void;
  onNewConversation?: () => void;
};

export function ChatHeader({
  profileName,
  avatarUrl,
  onBack,
  onNewConversation,
}: ChatHeaderProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-start px-4 pt-2 pb-2 h-fit",
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onBack}
        className="shrink-0"
      >
        <Icon name="ArrowLeftLineIcon" className="size-5" />
      </Button>

      <div className="flex flex-col items-center">
        <MirrorAvatar
          className="shrink-0"
          avatarUrl={avatarUrl}
          profileName={profileName}
        />

        {
          /* <span className="text-sm font-medium truncate px-1.5 py-1">
          {profileName}
        </span> */
        }
      </div>

      {onNewConversation
        ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onNewConversation}
            className="shrink-0"
          >
            <Icon name="PlusIcon" className="size-5" />
          </Button>
        )
        : <div />}
    </div>
  );
}
