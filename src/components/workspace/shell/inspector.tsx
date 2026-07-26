"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { cn } from "@/lib/utils";
import { ScrollableArea } from "@/components/ui/scroll-area";

export interface WorkspaceInspectorProps extends HTMLAttributes<HTMLElement> {
  /** Inspector title */
  title?: string;
  /** Inspector subtitle / description */
  description?: string;
  /** Optional badge to display next to title */
  badge?: string;
  /** Content to render inside the inspector body */
  children?: ReactNode;
  /** Callback when the inspector close button is clicked */
  onClose?: () => void;
}

export const WorkspaceInspector = forwardRef<HTMLElement, WorkspaceInspectorProps>(
  (
    {
      title = "Properties",
      description,
      badge,
      children,
      onClose,
      className,
      ...props
    },
    ref,
  ) => {
    const collapsed = useWorkspaceStore((s) => s.collapsedInspector);
    const toggleInspector = useWorkspaceStore((s) => s.toggleInspector);

    const handleClose = () => {
      if (onClose) {
        onClose();
      } else {
        toggleInspector();
      }
    };

    if (collapsed) {
      return (
        <aside
          ref={ref}
          className={cn(
            "w-8 flex flex-col items-center justify-center border-l border-workspace-outline/20 bg-white transition-all duration-slow",
            className,
          )}
          {...props}
        >
          <button
            type="button"
            onClick={handleClose}
            className="w-6 h-12 rounded-l-lg bg-workspace-surface-dim border border-workspace-outline/20 border-r-0 flex items-center justify-center hover:bg-workspace-primary-muted/30 text-workspace-text-muted hover:text-workspace-primary transition-all"
            aria-label="Open inspector"
            title="Open inspector"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </aside>
      );
    }

    return (
      <aside
        ref={ref}
        className={cn(
          "w-[420px] h-full bg-white border-l border-workspace-outline/20 flex flex-col z-20 shrink-0",
          className,
        )}
        {...props}
      >
        {/* Header */}
        <div className="p-8 pb-4 flex items-start justify-between shrink-0">
          <div className="flex flex-col gap-1">
            {badge && (
              <span className="studio-stamp inline-block self-start">{badge}</span>
            )}
            <h2 className="text-xl font-bold text-workspace-text-primary tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-workspace-text-muted leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-workspace-surface-dim transition-colors text-workspace-text-muted"
            aria-label="Close inspector"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <ScrollableArea className="flex-1 px-8 pb-12">
          <div className="space-y-8">
            {children}
          </div>
        </ScrollableArea>
      </aside>
    );
  },
);

WorkspaceInspector.displayName = "WorkspaceInspector";
