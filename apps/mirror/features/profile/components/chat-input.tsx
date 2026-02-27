"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { Icon } from "@feel-good/ui/components/icon";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@feel-good/ui/primitives/input-group";

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
  const { ref: textareaRef, resize, reset } = useAutoResizeTextarea();

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    setMessage("");
    reset();
  }, [message, reset]);

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
          exit={{ y: 20, opacity: 0 }}
          transition={springTransition}
          className="mt-auto w-full max-w-md px-2 pb-6"
        >
          <InputGroup className="rounded-2xl shadow-toast-shadow border-border-subtle">
            <InputGroupTextarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${profileName}...`}
              className="min-h-[40px] max-h-[120px] py-2 text-sm"
              rows={1}
            />

            <InputGroupAddon align="block-end" className="justify-end">
              <InputGroupButton
                type="button"
                size="icon-sm"
                className="size-8 shrink-0 rounded-full"
                disabled={!message.trim()}
                onClick={handleSend}
              >
                <Icon name="ArrowUpIcon" size="sm" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
