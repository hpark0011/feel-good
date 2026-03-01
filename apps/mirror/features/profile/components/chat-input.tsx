"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import Link from "next/link";

import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Icon } from "@feel-good/ui/components/icon";
import { cn } from "@feel-good/utils/cn";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@feel-good/ui/primitives/input-group";

type ChatInputProps = {
  isOpen: boolean;
  profileName: string;
  chatAuthRequired?: boolean;
  isAuthenticated?: boolean;
  onSend?: (message: string) => Promise<void> | void;
};

const springTransition = {
  type: "spring",
  stiffness: 200,
  damping: 15,
} as const;

export function ChatInput({
  isOpen,
  profileName,
  chatAuthRequired,
  isAuthenticated,
  onSend,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ref: textareaRef, resize, reset } = useAutoResizeTextarea();

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      await onSend?.(trimmed);
      setMessage("");
      reset();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to send message";
      if (/rate limit/i.test(msg)) {
        setError("You're sending messages too quickly. Please wait a moment.");
      } else {
        setError(msg);
      }
    } finally {
      setIsSending(false);
    }
  }, [message, reset, onSend, isSending]);

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
      setError(null);
      resize();
    },
    [resize],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{
            y: 20,
            scale: 0.95,
            opacity: 0,
            transition: { duration: 0.15, ease: "easeOut" },
          }}
          transition={springTransition}
          className="w-full max-w-md relative"
        >
          <div className="w-full h-[40px] absolute left-0 -top-6 bg-linear-to-t from-background to-transparent" />
          {chatAuthRequired && !isAuthenticated ? (
            <div className="flex justify-center">
              <Link
                href="/sign-in"
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Sign in to chat with {profileName}
              </Link>
            </div>
          ) : (
            <>
              <InputGroup
                className={cn(
                  "shadow-chat-input-shadow hover:bg-chat-input-bg-hover",
                  "p-0",
                  "has-[[data-slot=input-group-control]:focus-visible]:border-gray-1",
                  "dark:has-[[data-slot=input-group-control]:focus-visible]:border-gray-3",
                  "has-[[data-slot=input-group-control]:focus-visible]:ring-1",
                  "has-[[data-slot=input-group-control]:focus-visible]:ring-transparent",
                  "has-[[data-slot=input-group-control]:focus-visible]:bg-white",
                  "has-[[data-slot=input-group-control]:focus-visible]:bg-gray-2",
                )}
              >
                <InputGroupTextarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  placeholder={`Message ${profileName}...`}
                  className={cn(
                    "min-h-[40px] max-h-[120px]",
                    "py-2.5 px-3.5",
                    "text-[20px] md:text-[16px]",
                    "leading-[1.3]",
                  )}
                  rows={1}
                />

                <InputGroupAddon
                  align="block-end"
                  className={cn(
                    "justify-end",
                    "[&>kbd]:rounded-full",
                    "px-2.5 pb-2.5",
                  )}
                >
                  <InputGroupButton
                    type="button"
                    size="icon-sm"
                    variant="primary"
                    className={cn(
                      "size-8 shrink-0",
                      "rounded-full [corner-shape:superellipse(1.0)]",
                    )}
                    disabled={!message.trim() || isSending}
                    onClick={handleSend}
                  >
                    <Icon name="ArrowUpIcon" className="size-6" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              {error && (
                <p className="text-xs text-destructive text-center mt-1.5 px-2">
                  {error}
                </p>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
