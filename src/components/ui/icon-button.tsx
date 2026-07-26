"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type IconButtonSize = "sm" | "md" | "lg";
type IconButtonVariant = "ghost" | "outlined" | "filled";

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "w-8 h-8 rounded-lg",
  md: "w-10 h-10 rounded-xl",
  lg: "w-12 h-12 rounded-xl",
};

const variantStyles: Record<IconButtonVariant, string> = {
  ghost:
    "text-workspace-text-secondary hover:text-workspace-primary hover:bg-workspace-primary-muted/50",
  outlined:
    "text-workspace-text-secondary border border-workspace-outline hover:text-workspace-primary hover:border-workspace-primary/40 hover:bg-workspace-primary-muted/20",
  filled:
    "text-white bg-workspace-primary hover:bg-workspace-primary-hover shadow-sm",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  label: string; // required for a11y
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = "md", variant = "ghost", label, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-fast active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-workspace-primary disabled:opacity-45 disabled:pointer-events-none",
          sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
