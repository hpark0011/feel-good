"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type InteractionPaneAnimatorProps = {
  children: ReactNode;
};

export function InteractionPaneAnimator({
  children,
}: InteractionPaneAnimatorProps) {
  const segment = useSelectedLayoutSegment();
  const isChat = segment === "chat";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={isChat ? "chat" : "profile"}
        initial={{ opacity: 0, x: isChat ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isChat ? 20 : -20 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
