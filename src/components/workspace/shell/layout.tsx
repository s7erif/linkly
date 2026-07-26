"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WorkspacePersistenceHydrator } from "@/store/use-workspace-store";

export interface WorkspaceLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Left sidebar slot */
  sidebar: ReactNode;
  /** Floating toolbar slot */
  toolbar: ReactNode;
  /** Right inspector slot */
  inspector: ReactNode;
  /** Center canvas content */
  children: ReactNode;
}

/**
 * Root 3-column flex shell for Workspace V2.
 *
 * Layout: sidebar (260px / collapsed 72px) | canvas (flex-1) | inspector (420px / collapsed 0).
 * Each region manages its own collapse state via the workspace store.
 */
export const WorkspaceLayout = forwardRef<HTMLDivElement, WorkspaceLayoutProps>(
  ({ sidebar, toolbar, inspector, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-screen w-full overflow-hidden bg-workspace-surface",
          className,
        )}
        {...props}
      >
        {/* Hydrates persisted UI state (zoom, activeSection) after SSR */}
        <WorkspacePersistenceHydrator />

        {/* Left Sidebar */}
        {sidebar}

        {/* Main area (floating toolbar + canvas) */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {/* Floating toolbar */}
          <div className="absolute top-0 z-30 px-4 pt-4 w-full flex justify-center pointer-events-none">
            <div className="pointer-events-auto max-w-full">
              {toolbar}
            </div>
          </div>

          {/* Canvas — renders page content */}
          <div className="flex-1 flex items-center justify-center">
            {children}
          </div>
        </div>

        {/* Right Inspector */}
        {inspector}
      </div>
    );
  },
);

WorkspaceLayout.displayName = "WorkspaceLayout";
