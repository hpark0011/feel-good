"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

import { cn } from "@feel-good/utils/cn";
import { Textarea } from "@feel-good/ui/primitives/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@feel-good/ui/primitives/form";

import { useIsProfileOwner } from "../context/profile-context";

const EDIT_SHADOW =
  "0px 120px 80px 0px rgba(0,0,0,0.09), 0px 40px 27px 0px rgba(0,0,0,0.06), 0px 20px 12px 0px rgba(0,0,0,0.06), 0px 12px 8px 0px rgba(0,0,0,0.06), 0px 24px 6px -16px rgba(255,255,255,1), inset 0px 0.5px 0px 0.5px rgba(255,255,255,0.1), inset 0px -4px 20px 2px rgba(255,255,255,0.6)";

const VIEW_SHADOW =
  "0px 0px 0px 0px rgba(0,0,0,0.03), 0px 0px 0px 0px rgba(0,0,0,0.03), 0px 0px 0px 0px rgba(0,0,0,0.06), 0px 0px 0px 0px rgba(0,0,0,0.03), 0px 0px 0px 0px rgba(255,255,255,1), inset 0px 0px 0px 0px rgba(255,255,255,0.5), inset 0px 0px 0px 0px rgba(255,255,255,0.1)";

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
    <div className="text-lg text-center max-w-md mx-auto leading-[1.3] w-full flex">
      <FormField
        control={control}
        name="bio"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isEditing ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 300, damping: 40 }}
                className="text-muted-foreground px-2"
              >
                Bio
              </motion.div>
            </FormLabel>
            <FormControl>
              <motion.div
                className="rounded-xl [corner-shape:superellipse(1.1)] w-full"
                initial={{ boxShadow: VIEW_SHADOW }}
                animate={{
                  boxShadow: isEditing ? EDIT_SHADOW : VIEW_SHADOW,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 40 }}
              >
                <Textarea
                  placeholder="Tell your story..."
                  maxLength={300}
                  readOnly={!isEditing}
                  tabIndex={isEditing ? undefined : -1}
                  className={cn(
                    "text-lg md:text-lg text-center leading-[1.3] bg-transparent min-h-[66px] resize-none border-transparent ring-0 shadow-transparent rounded-xl hover:bg-gray-1 focus-visible:bg-gray-1/80 focus-visible:border-transparent w-full [text-shadow:0px_1px_1px_rgba(0,0,0,0.1)] focus-visible:ring-0 placeholder:text-gray-11",
                    !isEditing &&
                      "border-transparent focus-visible:ring-0 pointer-events-none hover:bg-transparent hover:border-transparent [text-shadow:0px_0px_0px_rgba(0,0,0,0.2)]",
                  )}
                  data-test="edit-profile-bio-textarea"
                  {...field}
                />
              </motion.div>
            </FormControl>
            {isEditing && (
              <div className="flex items-center justify-between px-1.5">
                <FormMessage />
                <p className="ml-auto text-[13px] text-green-11">
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
