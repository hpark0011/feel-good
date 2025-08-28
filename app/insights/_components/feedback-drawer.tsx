"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface FeedbackDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDrawer({ open, onOpenChange }: FeedbackDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto w-full max-w-[640px] pb-8 fixed left-1/2 -translate-x-1/2 bottom-8">
        <DrawerHeader>
          <DrawerTitle>Was this action recommendation helpful?</DrawerTitle>
          <DrawerDescription>
            Your feedback helps us improve our recommendations
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex items-center justify-center gap-0 border w-fit rounded-lg bg-neutral-100 mx-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-text-primary bg-transparent border-none hover:bg-white"
              onClick={() => {
                console.log("Feedback: Yes");
                onOpenChange(false);
              }}
            >
              Yes
            </Button>
            <div className="w-px h-4 bg-dq-gray-200" />
            <Button
              variant="outline"
              size="sm"
              className="text-text-primary bg-transparent border-none hover:bg-white"
              onClick={() => {
                console.log("Feedback: No");
                onOpenChange(false);
              }}
            >
              No
            </Button>
            <div className="w-px h-4 bg-dq-gray-200" />
            <Button
              variant="outline"
              size="sm"
              className="text-text-primary bg-transparent border-none hover:bg-white"
              onClick={() => {
                console.log("Opening detailed feedback");
                onOpenChange(false);
              }}
            >
              Provide detailed feedback
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}