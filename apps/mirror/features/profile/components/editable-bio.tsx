"use client";

import { useFormContext } from "react-hook-form";

import { cn } from "@feel-good/utils/cn";
import { Textarea } from "@feel-good/ui/primitives/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@feel-good/ui/primitives/form";

import { useIsProfileOwner } from "../context/profile-context";

type EditableBioProps = {
  isEditing: boolean;
  bio: string;
};

export function EditableBio({ isEditing, bio }: EditableBioProps) {
  const isOwner = useIsProfileOwner();
  const { control, watch } = useFormContext();
  const bioValue = watch("bio");

  if (!isEditing && !bio && !isOwner) return null;

  return (
    <div className="text-lg text-center max-w-md mx-auto leading-[1.3] w-full">
      <FormField
        control={control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                placeholder="Tell your story..."
                maxLength={300}
                readOnly={!isEditing}
                tabIndex={isEditing ? undefined : -1}
                className={cn(
                  "text-lg md:text-lg text-center leading-[1.3] bg-transparent shadow-none p-0 min-h-[80px] resize-none w-full border transition-[border-color] duration-300 ease-in-out",
                  !isEditing &&
                    "border-transparent focus-visible:ring-0 pointer-events-none hover:bg-transparent hover:border-transparent",
                )}
                data-test="edit-profile-bio-textarea"
                {...field}
              />
            </FormControl>
            {isEditing && (
              <div className="flex items-center justify-between">
                <FormMessage />
                <p className="ml-auto text-xs text-muted-foreground">
                  {bioValue?.length ?? 0}/300
                </p>
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
