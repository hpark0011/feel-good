"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@feel-good/ui/primitives/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@feel-good/ui/primitives/tooltip";
import { Icon, type IconName } from "@feel-good/ui/components/icon";
import { cn } from "@feel-good/utils/cn";
import { MirrorAvatar } from "@/components/mirror-avatar";

/* Internal building-block components — not exported. */

/** Tooltip-wrapped icon button used for new-chat action. */
function ChatHeaderAction({
  tooltip,
  icon,
  className,
  ...props
}:
  & {
    tooltip: string;
    icon: IconName;
  }
  & Omit<
    React.ComponentProps<typeof Button>,
    "variant" | "size" | "children"
  >) {
  return (
    <div data-slot="chat-header-action" className="mt-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={cn("shrink-0 rounded-full", className)}
            {...props}
          >
            <Icon name={icon} className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  );
}

/** Tooltip-wrapped icon link used for the back arrow. */
function ChatHeaderBackLink({
  tooltip,
  icon,
  href,
  className,
}: {
  tooltip: string;
  icon: IconName;
  href: string;
  className?: string;
}) {
  return (
    <div data-slot="chat-header-action" className="mt-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={cn("shrink-0 rounded-full", className)}
            asChild
          >
            <Link href={href}>
              <Icon name={icon} className="size-5" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </div>
  );
}

/** Name badge displayed below the avatar. */
function ChatHeaderProfileName({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="chat-header-profile-name"
      className={cn(
        "text-[13px] font-medium truncate px-2.5 py-0.5 bg-card border border-gray-1 rounded-xl shadow-xl top-[-4px] relative min-w-[48px]",
        className,
      )}
      {...props}
    />
  );
}

/** Center column with avatar and name badge — links to the profile page. */
function ChatHeaderProfile({
  href,
  avatarUrl,
  profileName,
  className,
  ...props
}: {
  href: string;
  avatarUrl: string | null;
  profileName: string;
} & Omit<React.ComponentProps<typeof Link>, "children">) {
  return (
    <Link
      href={href}
      data-slot="chat-header-profile"
      className={cn("flex flex-col items-center relative", className)}
      {...props}
    >
      <MirrorAvatar
        className="shrink-0"
        avatarUrl={avatarUrl}
        profileName={profileName}
      />
      <ChatHeaderProfileName>{profileName}</ChatHeaderProfileName>
    </Link>
  );
}

/* Composed exports — consumed by chat-thread. */

type ChatHeaderProps = {
  profileName: string;
  avatarUrl: string | null;
  profileHref: string;
  onNewConversation?: () => void;
  onOpenConversationList?: () => void;
};

function ChatHeader({
  profileName,
  avatarUrl,
  profileHref,
  onNewConversation,
  onOpenConversationList,
}: ChatHeaderProps) {
  return (
    <div
      data-slot="chat-header"
      className="grid grid-cols-[auto_1fr_auto] items-start px-4 pt-2"
    >
      <div>
        <ChatHeaderBackLink
          tooltip="Profile"
          icon="ArrowBackwardIcon"
          href={profileHref}
        />

        <ChatHeaderAction
          tooltip="Conversations"
          icon="SidebarLeftIcon"
          onClick={onOpenConversationList}
        />
      </div>

      <ChatHeaderProfile
        href={profileHref}
        avatarUrl={avatarUrl}
        profileName={profileName}
      />

      <ChatHeaderAction
        tooltip="New chat"
        icon="PlusIcon"
        onClick={onNewConversation}
      />
    </div>
  );
}

export { ChatHeader };
export type { ChatHeaderProps };
