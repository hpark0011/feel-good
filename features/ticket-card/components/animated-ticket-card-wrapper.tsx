"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { cardVariants, getWrapperClassName } from "../utils/ticket-card.config";

const MotionWrapper = motion.div;

interface AnimatedTicketCardWrapperProps {
  children: ReactNode;
  /** Whether this is the initial page load (enables animation) */
  isInitialLoad: boolean;
  /** Whether the card is currently being dragged */
  isDragging: boolean;
  /** Card index for staggered animation delay */
  index: number;
  /** Ref callback for drag-and-drop */
  setNodeRef: (node: HTMLElement | null) => void;
  /** Inline styles from drag-and-drop */
  style: CSSProperties;
  /** Click handler for the card */
  onClick: (e: React.MouseEvent) => void;
  /** Drag handle props (attributes + listeners) */
  dragHandleProps: Record<string, unknown>;
}

/**
 * Wrapper component that conditionally applies entrance animations
 * to ticket cards based on initial load state.
 *
 * Uses Framer Motion for staggered entrance animations on page load,
 * but renders a plain div during normal interactions to avoid
 * animation overhead.
 */
export function AnimatedTicketCardWrapper({
  children,
  isInitialLoad,
  isDragging,
  index,
  setNodeRef,
  style,
  onClick,
  dragHandleProps,
}: AnimatedTicketCardWrapperProps) {
  const className = getWrapperClassName(isDragging);

  const commonProps = {
    ref: setNodeRef,
    style,
    className,
    onClick,
    ...dragHandleProps,
  } as const;

  // Only use animated wrapper for initial load (not during drag)
  if (isInitialLoad && !isDragging) {
    return (
      <MotionWrapper
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        {...commonProps}
      >
        {children}
      </MotionWrapper>
    );
  }

  // Regular non-animated wrapper for all other cases
  return <div {...commonProps}>{children}</div>;
}
