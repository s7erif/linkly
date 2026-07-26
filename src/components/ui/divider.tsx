"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type DividerOrientation = "horizontal" | "vertical";
type DividerVariant = "subtle" | "default" | "strong";

const orientationStyles: Record<DividerOrientation, string> = {
  horizontal: "w-full h-px",
  vertical: "h-full w-px",
};

const variantStyles: Record<DividerVariant, string> = {
  subtle: "bg-workspace-outline/30",
  default: "bg-workspace-outline",
  strong: "bg-workspace-outline-strong",
};

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = "horizontal", variant = "subtle", className, ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "border-0 shrink-0",
          orientationStyles[orientation],
          variantStyles[variant],
          className,
        )}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    );
  },
);

Divider.displayName = "Divider";
