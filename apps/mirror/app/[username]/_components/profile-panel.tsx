"use client";

import { VinylRecord } from "@/components/animated-geometries/vinyl-record";
import { cn } from "@feel-good/utils/cn";
import {
  EditActions,
  EditProfileButton,
  ProfileInfo,
} from "@/features/profile";
import { useChatSearchParams } from "@/hooks/use-chat-search-params";
import { useIsMobile } from "@feel-good/ui/hooks/use-mobile";
import { useCallback, useState } from "react";
import { useProfileRouteData } from "../_providers/profile-route-data-context";
import {
  useOptionalWorkspaceChrome,
} from "../_providers/workspace-chrome-context";

type DesktopContentPanelToggleProps = {
  contentPanelId: string;
  isContentPanelCollapsed: boolean;
  toggleContentPanel: () => void;
};

function DesktopContentPanelToggle({
  contentPanelId,
  isContentPanelCollapsed,
  toggleContentPanel,
}: DesktopContentPanelToggleProps) {
  const buttonLabel = isContentPanelCollapsed
    ? "Show Artifacts"
    : "Hide Artifacts";

  return (
    <button
      type="button"
      aria-controls={contentPanelId}
      aria-expanded={!isContentPanelCollapsed}
      aria-label={buttonLabel}
      data-state={isContentPanelCollapsed ? "closed" : "open"}
      className="absolute top-1/2 right-0 group h-10 w-[136px] -translate-y-full cursor-pointer z-40 pointer-events-auto"
      onClick={toggleContentPanel}
    >
      <div
        className={cn(
          "absolute top-2 flex items-center gap-2 transition-all duration-200 ease-in-out",
          isContentPanelCollapsed
            ? "right-3"
            : "-right-5 group-hover:right-3",
        )}
      >
        <div
          className={cn(
            "text-xs leading-[1.1] text-muted-foreground transition-opacity duration-200 ease-in-out",
            "opacity-0 group-hover:opacity-100",
          )}
        >
          {buttonLabel}
        </div>
        <VinylRecord />
      </div>
    </button>
  );
}

export function ProfilePanel() {
  const { profile, isOwner, setVideoCallOpen } = useProfileRouteData();
  const { openChat } = useChatSearchParams();
  const workspaceChrome = useOptionalWorkspaceChrome();
  const isMobile = useIsMobile();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClose = useCallback(() => {
    setIsEditing(false);
    setIsSubmitting(false);
  }, []);

  const editButtonClassName = isMobile
    ? "absolute top-0 right-5 z-10"
    : "absolute top-3 right-3";

  return (
    <div
      className={isMobile
        ? "relative h-full"
        : "relative z-20 h-full flex flex-col justify-start items-center px-6 py-[120px]"}
    >
      {isOwner && (
        <div className={editButtonClassName}>
          {isEditing
            ? (
              <EditActions
                isEditing={isEditing}
                isSubmitting={isSubmitting}
                onCancel={handleEditClose}
              />
            )
            : <EditProfileButton onClick={() => setIsEditing(true)} />}
        </div>
      )}

      {workspaceChrome && (
        <DesktopContentPanelToggle
          contentPanelId={workspaceChrome.contentPanelId}
          isContentPanelCollapsed={workspaceChrome.isContentPanelCollapsed}
          toggleContentPanel={workspaceChrome.toggleContentPanel}
        />
      )}

      <ProfileInfo
        profile={profile}
        isEditing={isEditing}
        onEditComplete={handleEditClose}
        onSubmittingChange={setIsSubmitting}
        onOpenChat={openChat}
        onOpenVideoCall={() => setVideoCallOpen(true)}
      />
    </div>
  );
}
