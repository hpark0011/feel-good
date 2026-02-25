"use client";

import { useFormContext } from "react-hook-form";

import { cn } from "@feel-good/utils/cn";
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

  if (!isEditing && !name && !isOwner) return null;

  return (
    <div className="text-3xl font-medium text-center">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder="Your name"
                readOnly={!isEditing}
                tabIndex={isEditing ? undefined : -1}
                className={cn(
                  "text-3xl md:text-3xl font-medium text-center bg-transparent shadow-none h-12 border rounded-xl [corner-shape:superellipse(1.1)] transition-all duration-100 ease-out",
                  isEditing
                    ? ""
                    : "border-transparent focus-visible:ring-0 pointer-events-none hover:bg-transparent hover:border-transparent",
                )}
                data-test="edit-profile-name-input"
                {...field}
              />
            </FormControl>
            {isEditing && <FormMessage />}
          </FormItem>
        )}
      />
    </div>
  );
}
