"use client";

import {
  CheckedCircleFillIcon,
  ExclamationmarkTriangleFillIcon,
  InfoCircleFillIcon,
  XmarkIcon,
} from "@feel-good/icons";
import * as React from "react";
import { toast as sonnerToast } from "sonner";
import { Button } from "../primitives/button";

import { cn } from "../lib/utils";

interface ToastContextValue {
  id: string | number;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

function useToastContext() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("Toast sub-components must be used within <Toast>");
  }
  return context;
}

function Toast({
  id,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "id"> & { id: string | number }) {
  return (
    <ToastContext.Provider value={{ id }}>
      <div
        data-slot="toast"
        className={cn(
          "bg-toast text-toast-foreground border-toast-border flex w-full items-center gap-4 rounded-2xl border p-4 shadow-toast-shadow",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ToastContext.Provider>
  );
}

function ToastHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toast-header"
      className={cn("flex flex-1 flex-col gap-1", className)}
      {...props}
    />
  );
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="toast-title"
      className={cn(
        "text-toast-title text-sm font-medium",
        className,
      )}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="toast-description"
      className={cn("text-toast-description text-sm", className)}
      {...props}
    />
  );
}

function ToastAction({
  className,
  onClick,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { id } = useToastContext();

  return (
    <Button
      data-slot="toast-action"
      className={className}
      onClick={(e) => {
        onClick?.(e);
        sonnerToast.dismiss(id);
      }}
      size="sm"
      {...props}
    >
      {children}
    </Button>
  );
}

function ToastIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toast-icon"
      className={cn("shrink-0 [&>svg]:size-5", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "children">) {
  const { id } = useToastContext();

  return (
    <Button
      data-slot="toast-close"
      variant="ghost"
      size="icon-sm"
      onClick={() => sonnerToast.dismiss(id)}
      {...props}
    >
      <XmarkIcon className="size-4" />
      <span className="sr-only">Close</span>
    </Button>
  );
}

const toastIconMap = {
  success: {
    icon: CheckedCircleFillIcon,
    className: "text-toast-icon-success",
  },
  error: {
    icon: ExclamationmarkTriangleFillIcon,
    className: "text-toast-icon-error",
  },
  warning: {
    icon: ExclamationmarkTriangleFillIcon,
    className: "text-toast-icon-warning",
  },
  info: { icon: InfoCircleFillIcon, className: "text-toast-icon-info" },
} as const;

type ToastType = keyof typeof toastIconMap;

interface ShowToastOptions {
  type: ToastType;
  title: string;
  description?: string;
  button?: {
    label: string;
    onClick: () => void;
  };
}

function showToast({ type, title, description, button }: ShowToastOptions) {
  const { icon: IconComponent, className } = toastIconMap[type];

  return sonnerToast.custom((id) => (
    <Toast id={id}>
      <ToastIcon className={className}>
        <IconComponent />
      </ToastIcon>
      <ToastHeader>
        <ToastTitle>{title}</ToastTitle>
        {description && <ToastDescription>{description}</ToastDescription>}
      </ToastHeader>
      {button ? (
        <ToastAction onClick={button.onClick}>{button.label}</ToastAction>
      ) : (
        <ToastClose />
      )}
    </Toast>
  ));
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastHeader,
  ToastIcon,
  ToastTitle,
  showToast,
  type ToastType,
};
