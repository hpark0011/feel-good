"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CameraIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@feel-good/ui/primitives/avatar";

import type { Profile } from "../types";
import { ProfileMedia } from "./profile-media";
import { useIsProfileOwner } from "../context/profile-context";

type EditableAvatarProps = {
  isEditing: boolean;
  profile: Profile;
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function EditableAvatar({
  isEditing,
  profile,
  avatarPreview,
  onAvatarChange,
}: EditableAvatarProps) {
  const isOwner = useIsProfileOwner();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayAvatar = avatarPreview ?? profile.avatarUrl;
  const initial = (profile.name || profile.username || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center pt-[56px]">
      <AnimatePresence mode="popLayout">
        {isEditing
          ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative size-[200px] rounded-t-full [corner-shape:superellipse(1.2)] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  data-test="edit-profile-avatar-button"
                >
                  <Avatar className="size-[200px] rounded-t-full [corner-shape:superellipse(1.2)]">
                    {displayAvatar
                      ? (
                        <AvatarImage
                          src={displayAvatar}
                          alt="Profile photo"
                          className="object-cover"
                        />
                      )
                      : null}
                    <AvatarFallback className="text-4xl rounded-t-full [corner-shape:superellipse(1.2)]">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <CameraIcon className="size-8 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                  className="hidden"
                />
              </div>
            </motion.div>
          )
          : (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {profile.media
                ? (
                  <ProfileMedia
                    video={profile.media.video}
                    poster={profile.media.poster}
                  />
                )
                : isOwner
                ? (
                  <div className="w-[200px] h-[200px] rounded-t-full [corner-shape:superellipse(1.2)] bg-black" />
                )
                : null}
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
