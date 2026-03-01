"use client";

import { Button } from "@feel-good/ui/primitives/button";
import { Icon } from "@feel-good/ui/components/icon";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@feel-good/ui/primitives/avatar";
import { cn } from "@feel-good/utils/cn";
import { getProfileInitials } from "@/features/profile/lib/get-profile-initials";

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
  const initials = getProfileInitials(profileName);

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-start px-4 py-3 h-12",
        "border-b border-border-subtle",
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

      <div className="flex flex-col items-center gap-2">
        <Avatar className="size-8 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={profileName} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <span className="text-sm font-medium truncate">
          {profileName}
        </span>
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
