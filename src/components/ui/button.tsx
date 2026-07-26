"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-workspace-primary text-workspace-text-inverse hover:bg-workspace-primary-hover shadow-lg shadow-workspace-primary/20 hover:shadow-xl hover:shadow-workspace-primary/25 active:scale-[0.97]",
  secondary:
    "workspace-glass text-workspace-text-primary hover:bg-white/80 hover:shadow-workspace-card active:scale-[0.97]",
  ghost:
    "text-workspace-text-secondary hover:text-workspace-primary hover:bg-workspace-primary-muted/50 active:scale-[0.97]",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:scale-[0.97]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-workspace-control",
  md: "px-5 py-2.5 text-sm gap-2 rounded-workspace-control",
  lg: "px-7 py-3 text-sm gap-2.5 rounded-workspace-card",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-workspace-primary disabled:opacity-45 disabled:pointer-events-none select-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
