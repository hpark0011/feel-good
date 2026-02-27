"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePreloadedQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import { toast } from "sonner";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastHeader,
  ToastTitle,
} from "@feel-good/ui/components/toast";
import type { api } from "@feel-good/convex/convex/_generated/api";
import type { Profile } from "@/features/profile";
import {
  ChatInput,
  EditActions,
  EditProfileButton,
  MobileProfileLayout,
  ProfileInfo,
  ProfileProvider,
} from "@/features/profile";
import type { ProfileActionId } from "@/features/profile";
import {
  ArticleWorkspaceProvider,
  ScrollRootProvider,
} from "@/features/articles";
import type { Article } from "@/features/articles/types";
import { useIsMobile } from "@feel-good/ui/hooks/use-mobile";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@feel-good/ui/primitives/resizable";
import { WorkspaceNavbar } from "@/components/workspace-navbar";
import {
  ToolbarSlotProvider,
  ToolbarSlotTarget,
} from "@/components/workspace-toolbar-slot";
import { useProfileNavigationEffects } from "@/hooks/use-profile-navigation-effects";

const VideoCallModal = dynamic(
  () => import("@/features/video-call").then((m) => m.VideoCallModal),
  { ssr: false },
);

type ProfileShellProps = {
  profile: Profile;
  preloadedProfile: Preloaded<typeof api.users.queries.getByUsername>;
  preloadedArticles: Preloaded<typeof api.articles.queries.getByUsername>;
  isOwner: boolean;
  children: React.ReactNode;
};

export function ProfileShell(
  { profile: initialProfile, preloadedProfile, preloadedArticles, isOwner, children }:
    ProfileShellProps,
) {
  // Subscribe to reactive profile data from Convex
  const reactiveRaw = usePreloadedQuery(preloadedProfile);

  // Subscribe to reactive article data from Convex
  const reactiveArticles = usePreloadedQuery(preloadedArticles);
  const articles: Article[] = (reactiveArticles ?? []) as Article[];
  const profile: Profile = reactiveRaw
    ? {
      _id: reactiveRaw._id,
      authId: reactiveRaw.authId,
      username: reactiveRaw.username ?? initialProfile.username,
      name: reactiveRaw.name ?? "",
      bio: reactiveRaw.bio ?? "",
      avatarUrl: reactiveRaw.avatarUrl,
    }
    : initialProfile;

  const isMobile = useIsMobile();
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mobileScrollRoot, setMobileScrollRoot] = useState<
    HTMLDivElement | null
  >(null);
  const [desktopScrollRoot, setDesktopScrollRoot] = useState<
    HTMLDivElement | null
  >(null);

  useProfileNavigationEffects({
    mobile: mobileScrollRoot,
    desktop: desktopScrollRoot,
  });

  const contextValue = useMemo(
    () => ({ isOwner }),
    [isOwner],
  );

  const handleProfileAction = useCallback((id: ProfileActionId) => {
    if (id === "video") {
      setVideoCallOpen(true);
    } else if (id === "text") {
      setChatOpen(true);
    } else {
      toast.custom((t) => (
        <Toast id={t}>
          <ToastHeader>
            <ToastTitle>Coming soon</ToastTitle>
            <ToastDescription>
              {`${id.charAt(0).toUpperCase() + id.slice(1)} conversations are not yet available.`}
            </ToastDescription>
          </ToastHeader>
          <ToastClose />
        </Toast>
      ));
    }
  }, []);

  const handleChatClose = useCallback(() => setChatOpen(false), []);

  const handleEditComplete = useCallback(() => {
    setIsEditing(false);
    setIsSubmitting(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setIsSubmitting(false);
  }, []);

  const editButton = isOwner && (
    <div
      className={isMobile
        ? "absolute top-0 right-5 z-10"
        : "absolute top-4 right-4"}
    >
      {isEditing
        ? (
          <EditActions
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
          />
        )
        : (
          <EditProfileButton
            onClick={() => setIsEditing(true)}
          />
        )}
    </div>
  );

  const profilePanel = (
    <ProfileInfo
      profile={profile}
      isEditing={isEditing}
      chatOpen={chatOpen}
      onEditComplete={handleEditComplete}
      onSubmittingChange={setIsSubmitting}
      onAction={handleProfileAction}
    />
  );

  return (
    <ProfileProvider value={contextValue}>
      <ArticleWorkspaceProvider articles={articles} username={profile.username}>
        {isMobile
          ? (
            <main className="h-screen">
              <ToolbarSlotProvider>
                <WorkspaceNavbar className="fixed top-0 inset-x-0" />
                <MobileProfileLayout
                  profile={
                    <div className="relative h-full flex flex-col">
                      {editButton}
                      {profilePanel}
                      <ChatInput isOpen={chatOpen} profileName={profile.name} onClose={handleChatClose} />
                    </div>
                  }
                  content={() => (
                    <div className="flex h-full min-h-0 flex-col">
                      <ToolbarSlotTarget />
                      <div className="flex-1 min-h-0 *:h-full">
                        <div
                          ref={setMobileScrollRoot}
                          className="overflow-y-auto overscroll-y-contain h-full px-3"
                        >
                          <ScrollRootProvider value={mobileScrollRoot}>
                            {children}
                          </ScrollRootProvider>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </ToolbarSlotProvider>
            </main>
          )
          : (
            <main className="h-screen">
              {/* Profile interaction view */}
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={50} minSize={25} maxSize={80}>
                  <div className="relative z-20 h-full flex flex-col justify-start items-center px-6 pt-[88px]">
                    {editButton}
                    {profilePanel}
                    <ChatInput isOpen={chatOpen} profileName={profile.name} onClose={handleChatClose} />
                  </div>
                </ResizablePanel>

                <ResizableHandle className="bg-border-subtle data-[resize-handle-state=hover]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)] data-[resize-handle-state=drag]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)] z-30 relative" />

                {/* Content view */}
                <ResizablePanel defaultSize={50} minSize={25} maxSize={80}>
                  <ToolbarSlotProvider>
                    <div className="relative h-full min-w-0 flex flex-col">
                      <WorkspaceNavbar />
                      <ToolbarSlotTarget />
                      <div className="flex-1 min-h-0 *:h-full relative">
                        <div className="w-full absolute top-0 bg-linear-to-b from-background to-transparent max-h-[24px] z-10" />
                        <div
                          ref={setDesktopScrollRoot}
                          className="overflow-y-auto h-full px-4 pb-[64px] pt-8"
                        >
                          {children}
                        </div>
                      </div>
                    </div>
                  </ToolbarSlotProvider>
                </ResizablePanel>
              </ResizablePanelGroup>
            </main>
          )}
      </ArticleWorkspaceProvider>
      {videoCallOpen && (
        <VideoCallModal
          articles={articles}
          onClose={() => setVideoCallOpen(false)}
        />
      )}
    </ProfileProvider>
  );
}
