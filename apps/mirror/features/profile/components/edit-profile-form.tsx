"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { z } from "zod";
import { CameraIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@feel-good/convex/convex/_generated/api";

import { Button } from "@feel-good/ui/primitives/button";
import { Input } from "@feel-good/ui/primitives/input";
import { Textarea } from "@feel-good/ui/primitives/textarea";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@feel-good/ui/primitives/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@feel-good/ui/primitives/form";

import type { Profile } from "../lib/mock-profile";

const editProfileSchema = z.object({
  name: z.string().max(100, "Name must be at most 100 characters"),
  bio: z.string().max(300, "Bio must be at most 300 characters"),
});

type EditProfileFormProps = {
  profile: Profile;
  onClose: () => void;
};

export function EditProfileForm({ profile, onClose }: EditProfileFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const bioValue = form.watch("bio");

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(data: z.infer<typeof editProfileSchema>) {
    setIsSubmitting(true);

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
      onClose();
    } catch {
      toast.error("Failed to update profile");
      setIsSubmitting(false);
    }
  }

  const displayAvatar = avatarPreview ?? profile.avatarUrl;
  const initial = (profile.name || profile.username || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center pb-[40px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full max-w-sm flex-col items-center gap-6"
        >
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative size-24 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              data-test="edit-profile-avatar-button"
            >
              <Avatar className="size-24">
                {displayAvatar ? (
                  <AvatarImage src={displayAvatar} alt="Profile photo" />
                ) : null}
                <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <CameraIcon className="size-6 text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Click to change photo
            </p>
          </div>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your name"
                    data-test="edit-profile-name-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell people a little about yourself..."
                    maxLength={300}
                    className="min-h-[100px] resize-none"
                    data-test="edit-profile-bio-textarea"
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between">
                  <FormMessage />
                  <p className="ml-auto text-xs text-muted-foreground">
                    {bioValue.length}/300
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
              data-test="edit-profile-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting}
              data-test="edit-profile-submit-button"
            >
              {isSubmitting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
