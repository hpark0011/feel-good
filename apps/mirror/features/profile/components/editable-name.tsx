"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

import { cn } from "@feel-good/utils/cn";
import { Input } from "@feel-good/ui/primitives/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@feel-good/ui/primitives/form";

import { useIsProfileOwner } from "../context/profile-context";

const EDIT_SHADOW =
  "inset 0px 8px 12px 0px rgba(255,255,255,0.9), inset 0px -4px 8px 0px rgba(255,255,255,0.2), inset 0px 24px 6px -8px rgba(0,0,0,0.15), 0px 16px 24px -8px rgba(0,0,0,0.2), 0px 24px 40px -12px rgba(0,0,0,0.1), 0px 12px 12px -6px rgba(255,255,255,1), inset 0px 0px 0px 0px rgba(0,0,0,0)";

const VIEW_SHADOW =
  "inset 0px 0px 0px 0px rgba(255,255,255,0.9), inset 0px 0px 0px 0px rgba(0,0,0,0.05), inset 0px 0px 0px 0px rgba(0,0,0,0.15), 0px 0px 0px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.1), 0px 0px 0px 0px rgba(255,255,255,1), inset 0px 0px 0px 0px rgba(0,0,0,0.6)";

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
          <FormItem>
            <FormControl>
              <motion.div
                className="rounded-xl [corner-shape:superellipse(1.1)] bg-white/10"
                initial={{ boxShadow: VIEW_SHADOW }}
                animate={{
                  boxShadow: isEditing ? EDIT_SHADOW : VIEW_SHADOW,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Input
                  placeholder="Your name"
                  readOnly={!isEditing}
                  tabIndex={isEditing ? undefined : -1}
                  className={cn(
                    "text-3xl md:text-3xl font-medium text-center h-12 border-transparent bg-transparent",
                    !isEditing &&
                      "border-transparent focus-visible:ring-0 pointer-events-none hover:bg-transparent hover:border-transparent",
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
