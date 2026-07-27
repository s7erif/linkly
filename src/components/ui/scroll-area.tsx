"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ScrollableAreaProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
}

export const ScrollableArea = forwardRef<HTMLDivElement, ScrollableAreaProps>(
  ({ orientation = "vertical", className, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "workspace-scrollbar overscroll-contain",
          orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
          orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
          orientation === "both" && "overflow-auto",
          className,
        )}
        style={{ WebkitOverflowScrolling: "touch", ...style }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ScrollableArea.displayName = "ScrollableArea";
