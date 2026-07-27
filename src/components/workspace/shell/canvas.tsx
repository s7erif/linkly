"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface WorkspaceCanvasProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Center-stage canvas region.
 *
 * Flex-grow area between the sidebar and inspector. Accepts any content
 * (the existing page output in Phase 1, LivePhonePreview in Phase 2+).
 */
export const WorkspaceCanvas = forwardRef<HTMLElement, WorkspaceCanvasProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "flex-1 flex flex-col items-center justify-start relative overflow-x-hidden overflow-y-auto min-h-0 bg-[#FAFAFC]",
          // Layered subtle ambient light bloom
          "bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(109,93,246,0.04),transparent_60%),radial-gradient(ellipse_70%_50%_at_20%_40%,rgba(237,233,254,0.3),transparent_70%),radial-gradient(ellipse_60%_50%_at_80%_70%,rgba(243,244,246,0.5),transparent_60%)]",
          // Mobile: full-width, no extra padding
          "max-lg:p-0",
          className,
        )}
        {...props}
      >
        {children}
      </main>
    );
  },
);

WorkspaceCanvas.displayName = "WorkspaceCanvas";
