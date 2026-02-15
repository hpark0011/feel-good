import { motion } from "framer-motion";
import { cn } from "@feel-good/ui/lib/utils";

type ArcContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function ArcContainer({ children, className }: ArcContainerProps) {
  return (
    <motion.div
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-t-full [corner-shape:superellipse(1.2)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
