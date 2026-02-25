"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2Icon } from "lucide-react";

import { Button } from "@feel-good/ui/primitives/button";

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

type EditActionsProps = {
  isEditing: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
};

export function EditActions({ isEditing, isSubmitting, onCancel }: EditActionsProps) {
  return (
    <AnimatePresence>
      {isEditing && (
        <motion.div {...fade} className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            data-test="edit-profile-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-profile-form"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            data-test="edit-profile-submit-button"
          >
            {isSubmitting ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
