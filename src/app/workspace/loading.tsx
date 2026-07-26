"use client";

import { ThemeLoadingSkeleton } from "@/components/workspace/preview/preview-states";

/**
 * Route-level loading fallback for workspace navigation.
 *
 * Renders inside the layout's children slot — the sidebar, toolbar, and
 * inspector (which live in the persistent layout shell) remain visible and
 * interactive during card switches.  Only the canvas area shows a skeleton.
 *
 * Reuses the existing ThemeLoadingSkeleton shimmer — the same component
 * users already see during initial hydration — for visual continuity.
 */
export default function WorkspaceLoading() {
  return (
    <div className="flex-1 flex items-center justify-center w-full h-full min-h-0">
      <div className="w-full max-w-[380px]">
        <ThemeLoadingSkeleton />
      </div>
    </div>
  );
}
