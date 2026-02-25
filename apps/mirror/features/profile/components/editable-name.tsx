"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

import { Input } from "@feel-good/ui/primitives/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@feel-good/ui/primitives/form";

import { useIsProfileOwner } from "../context/profile-context";

type EditableNameProps = {
  isEditing: boolean;
  name: string;
};

export function EditableName({ isEditing, name }: EditableNameProps) {
  const isOwner = useIsProfileOwner();
  const { control } = useFormContext();

  return (
    <div className="text-3xl font-medium text-center">
      <motion.div
        key={isEditing ? "edit" : "view"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {isEditing ? (
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Your name"
                    className="text-3xl md:text-3xl font-medium text-center border-none bg-transparent shadow-none focus-visible:ring-0 p-0 h-auto"
                    data-test="edit-profile-name-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <>
            {name || (isOwner && (
              <span className="text-muted-foreground">Your name</span>
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}
