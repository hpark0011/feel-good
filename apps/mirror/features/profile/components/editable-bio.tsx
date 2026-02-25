"use client";

import { useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";

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

  return (
    <div className="text-lg text-center max-w-md mx-auto leading-[1.3]">
      <AnimatePresence mode="popLayout">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <FormField
              control={control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Tell your story..."
                      maxLength={300}
                      className="text-lg text-center leading-[1.3] border-none bg-transparent shadow-none focus-visible:ring-0 p-0 min-h-[80px] resize-none"
                      data-test="edit-profile-bio-textarea"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <p className="ml-auto text-xs text-muted-foreground">
                      {bioValue?.length ?? 0}/300
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {bio || (isOwner && (
              <span className="text-muted-foreground">Tell your story...</span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
