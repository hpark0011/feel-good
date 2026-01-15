import type { Variants } from "framer-motion";

/**
 * Animation variants for ticket card entrance/exit animations
 */
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.05,
      type: "spring" as const,
      damping: 20,
      stiffness: 300,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

/**
 * Status-specific styling for ticket cards
 */
export const statusStyles = {
  backlog: "",
  "to-do": "",
  "in-progress":
    "shadow-[0_8px_8px_-4px_rgba(255,255,255,0.9),_0_12px_12px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_24px_24px_-12px_rgba(255,255,255,0.9),_0_24px_24px_-12px_rgba(19, 10, 10, 0.3)] dark:shadow-[0_8px_12px_-4px_rgba(0,0,0,0.12),_0_12px_12px_-6px_rgba(0,0,0,0.9)] dark:hover:shadow-[0_24px_24px_-12px_rgba(255,255,255,0.15),_0_24px_24px_-12px_rgba(19, 10, 10, 0.3)] hover:bg-base",
  complete:
    "bg-white/80 dark:bg-card border-white/30 dark:border-white/2 row-span-full row-start-1 hidden border-x bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 md:col-start-3 md:block dark:[--pattern-fg:var(--color-white)]/5",
};
