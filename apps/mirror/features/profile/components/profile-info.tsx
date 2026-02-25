"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@feel-good/convex/convex/_generated/api";

import { Form } from "@feel-good/ui/primitives/form";

import type { Profile } from "../types";
import type { ProfileActionId } from "./profile-actions";
import { ProfileActions } from "./profile-actions";
import { EditableName } from "./editable-name";
import { EditableAvatar } from "./editable-avatar";
import { EditableBio } from "./editable-bio";

const editProfileSchema = z.object({
  name: z.string().max(100, "Name must be at most 100 characters"),
  bio: z.string().max(300, "Bio must be at most 300 characters"),
});

type ProfileInfoProps = {
  profile: Profile;
  isEditing: boolean;
  onEditComplete: () => void;
  onSubmittingChange?: (submitting: boolean) => void;
  onAction?: (id: ProfileActionId) => void;
};

export function ProfileInfo({
  profile,
  isEditing,
  onEditComplete,
  onSubmittingChange,
  onAction,
}: ProfileInfoProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const updateProfile = useMutation(api.users.updateProfile);
  const setAvatar = useMutation(api.users.setAvatar);
  const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl);

  const form = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profile.name ?? "",
      bio: profile.bio ?? "",
    },
    mode: "onChange",
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(data: z.infer<typeof editProfileSchema>) {
    onSubmittingChange?.(true);

    try {
      if (avatarFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": avatarFile.type },
          body: avatarFile,
        });
        const { storageId } = await result.json();
        await setAvatar({ storageId });
      }

      await updateProfile({
        name: data.name,
        bio: data.bio,
      });

      toast.success("Profile updated");
      onEditComplete();
    } catch {
      toast.error("Failed to update profile");
      onSubmittingChange?.(false);
    }
  }

  const content = (
    <>
      <EditableName isEditing={isEditing} name={profile.name} />
      <EditableAvatar
        isEditing={isEditing}
        profile={profile}
        avatarPreview={avatarPreview}
        onAvatarChange={handleAvatarChange}
      />
      <div className="mt-[20px]">
        <ProfileActions onAction={onAction} />
      </div>
      <div className="mt-[64px]">
        <EditableBio isEditing={isEditing} bio={profile.bio} />
      </div>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center pb-[40px]">
      <Form {...form}>
        {isEditing ? (
          <form
            id="edit-profile-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center w-full"
          >
            {content}
          </form>
        ) : (
          <div className="flex flex-col items-center w-full">
            {content}
          </div>
        )}
      </Form>
    </div>
  );
}
