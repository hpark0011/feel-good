import { cn } from "../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const BORDER_RADIUS_SMALL = 10;
const BORDER_RADIUS_MEDIUM = 10;
const BORDER_RADIUS_LARGE = 12;

const DROP_SHADOW_MEDIUM =
  "shadow-[0_12px_12px_-6px_rgba(255,255,255,0.8),_0_14px_14px_-6px_rgba(0,0,0,0.6)] hover:shadow-[0_14px_8px_-6px_rgba(255,255,255,0.9),_0_4px_4px_-4px_rgba(0,0,0,0.4)] dark:shadow-[0_14px_16px_-12px_rgba(255,255,255,0.3),_0px_10px_20px_-4px_rgba(0,0,0,0.9),_0_0_0_1px_rgba(255,255,255,0.05)] dark:border-transparent dark:hover:shadow-[0_14px_8px_-6px_rgba(255,255,255,0.2),_0px_10px_20px_-4px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(255,255,255,0.05)]";

const DROP_SHADOW_LARGE =
  "shadow-[0_20px_12px_-16px_rgba(255,255,255,0.9),_0_16px_24px_-8px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_14px_-12px_rgba(255,255,255,0.9),_0_4px_4px_-4px_rgba(0,0,0,0.4)] dark:shadow-[0_14px_16px_-12px_rgba(255,255,255,0.2),_0px_10px_20px_-4px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(255,255,255,0.05)] dark:border-transparent dark:hover:shadow-[0_24px_14px_-12px_rgba(255,255,255,0.2),_0px_10px_20px_-4px_rgba(0,0,0,0.1),_0_0_0_1px_rgba(255,255,255,0.05)]";

const buttonVariants = cva(
  `relative py-2 px-3 bg-[rgba(255,255,255,0.1)] border-[1px] border-white/5 flex overflow-hidden cursor-pointer group transition-all duration-300 ease-in-out active:scale-[0.97] active:transition-transform active:duration-150 dark:border-transparent backdrop-blur-xl text-center justify-center font-[480]`,
  {
    variants: {
      size: {
        sm:
          `py-1 px-2.5 text-[13px] rounded-[${BORDER_RADIUS_SMALL}px] ${DROP_SHADOW_MEDIUM}`,
        md:
          `py-1 px-3 text-sm rounded-[${BORDER_RADIUS_MEDIUM}px] ${DROP_SHADOW_MEDIUM}`,
        lg:
          `py-1 px-3.5 text-sm rounded-[${BORDER_RADIUS_LARGE}px] ${DROP_SHADOW_LARGE}`,
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const shadowVariants = cva(
  `absolute inset-0 inset-shadow-[0_1px_0_2px_rgba(0,0,0,0.25)] blur-[3px] dark:inset-shadow-[0_2px_0_3px_rgba(0,0,0,0.6)] rounded-[${
    BORDER_RADIUS_MEDIUM - 4
  }px] m-0.5 mt-1 group-hover:inset-shadow-[0px_0px_0_2px_rgba(0,0,0,0.2)] group-hover:blur-[2px] transition-all duration-300 ease-in-out dark:bg-gradient-to-b dark:from-white/0 dark:to-white/10`,
  {
    variants: {
      size: {
        sm: `rounded-[${BORDER_RADIUS_SMALL - 4}px]`,
        md: `rounded-[${BORDER_RADIUS_MEDIUM - 4}px]`,
        lg: `rounded-[${BORDER_RADIUS_LARGE - 4}px]`,
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface ShinyButtonProps extends VariantProps<typeof buttonVariants> {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  shadowClassName?: string;
  form?: string;
  disabled?: boolean;
}

export function ShinyButton({
  type = "button",
  children,
  onClick,
  className,
  shadowClassName,
  size,
  form,
  disabled,
}: ShinyButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ size }), className)}
      onClick={onClick}
      type={type}
      form={form}
      disabled={disabled}
    >
      {/* Shadow */}
      <div className={cn(shadowVariants({ size }), shadowClassName)} />
      {/* Hover highlight */}
      <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-gradient-to-b from-white/5 to-white/90 inset-shadow-[0_-6px_12px_rgba(255,255,255,0.9)] transition-opacity duration-300 ease-in-out dark:from-black/20 dark:to-white/20 dark:inset-shadow-[0_-2px_12px_0px_rgba(255,255,255,0.8)]" />
      {/* Label */}
      <span className="relative flex items-center justify-center text-center drop-shadow-[1px_3px_1px_rgba(0,0,0,0.3)] dark:drop-shadow-[1px_3px_1px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[1px_1px_0px_rgba(0,0,0,0.1)] dark:group-hover:drop-shadow-[1px_1px_0px_rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out text-text-primary">
        {children}
      </span>
    </button>
  );
}
