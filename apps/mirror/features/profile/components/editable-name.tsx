"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

import { cn } from "@feel-good/utils/cn";
import { Input } from "@feel-good/ui/primitives/input";
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

type EditableNameProps = {
  isEditing: boolean;
  name: string;
};

export function EditableName({ isEditing, name }: EditableNameProps) {
  const isOwner = useIsProfileOwner();
  const { control } = useFormContext();

  if (!isEditing && !name && !isOwner) return null;

  return (
    <div className="text-3xl font-medium text-center">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="gap-1.5">
            <FormLabel>
              <motion.div
                className={cn(
                  "px-1.5 text-muted-foreground",
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: isEditing ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 300, damping: 40 }}
              >
                Name
              </motion.div>
            </FormLabel>
            <FormControl>
              <motion.div
                className="rounded-xl [corner-shape:superellipse(1.1)]"
                initial={{ boxShadow: VIEW_SHADOW }}
                animate={{
                  boxShadow: isEditing ? EDIT_SHADOW : VIEW_SHADOW,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 40 }}
              >
                <Input
                  placeholder="Your name"
                  readOnly={!isEditing}
                  tabIndex={isEditing ? undefined : -1}
                  className={cn(
                    "text-3xl md:text-3xl font-medium text-center h-13 bg-transparent rounded-xl focus-visible:border-transparent focus-visible:bg-gray-1/80 p-1 border-transparent [text-shadow:0px_1px_2px_rgba(0,0,0,0.3)] focus-visible:ring-0",
                    !isEditing &&
                      "border-transparent focus-visible:ring-0 pointer-events-none hover:bg-transparent hover:border-transparent [text-shadow:0px_0px_0px_rgba(0,0,0,0.2)]",
                  )}
                  data-test="edit-profile-name-input"
                  {...field}
                />
              </motion.div>
            </FormControl>
            {isEditing && <FormMessage />}
          </FormItem>
        )}
      />
    </div>
  );
}
