"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

import { Icon } from "@feel-good/ui/components/icon";
import { Button } from "@feel-good/ui/primitives/button";
import { Textarea } from "@feel-good/ui/primitives/textarea";
import { cn } from "@feel-good/utils/cn";

type ChatInputProps = {
  isOpen: boolean;
  profileName: string;
};

const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 40,
} as const;

export function ChatInput({ isOpen, profileName }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    setMessage("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      // Auto-expand textarea
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    },
    [],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={springTransition}
          className="mt-auto w-full max-w-md px-2 pb-6"
        >
          <div
            className={cn(
              "flex items-end gap-2 rounded-2xl [corner-shape:superellipse(1.2)]",
              "border bg-gray-2 p-2 shadow-lg",
            )}
          >
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${profileName}...`}
              className="min-h-[40px] max-h-[120px] resize-none border-transparent bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent py-2 text-sm"
              rows={1}
            />

            <Button
              type="button"
              size="icon"
              className="size-8 shrink-0 rounded-full"
              disabled={!message.trim()}
              onClick={handleSend}
            >
              <Icon name="ArrowUpIcon" size="sm" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
