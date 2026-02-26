"use client";

import { XIcon } from "lucide-react";
import * as React from "react";
import { toast as sonnerToast } from "sonner";

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
          "bg-toast text-toast-foreground border-toast-border flex w-full items-center gap-4 rounded-lg border p-4 shadow-lg",
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
    <button
      data-slot="toast-action"
      className={cn(
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 shrink-0 cursor-pointer rounded-md px-3 py-1 text-sm font-semibold",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        sonnerToast.dismiss(id);
      }}
      {...props}
    >
      {children}
    </button>
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
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "children">) {
  const { id } = useToastContext();

  return (
    <button
      data-slot="toast-close"
      className={cn(
        "shrink-0 cursor-pointer rounded-md opacity-70 transition-opacity hover:opacity-100",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        sonnerToast.dismiss(id);
      }}
      {...props}
    >
      <XIcon className="size-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastHeader,
  ToastIcon,
  ToastTitle,
};
