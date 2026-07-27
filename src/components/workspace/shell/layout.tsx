"use client";

import { forwardRef, useEffect, type HTMLAttributes, type ReactNode } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
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
 * Root shell for Workspace V2.
 *
 * Desktop (≥1024px): 3-column flex — sidebar(260px) | canvas(flex-1) | inspector(420px).
 * Mobile (<1024px):  single-column — canvas fills screen, sidebar slides in as a drawer
 *                     from the left, inspector slides up as a bottom sheet.
 */
export const WorkspaceLayout = forwardRef<HTMLDivElement, WorkspaceLayoutProps>(
  ({ sidebar, toolbar, inspector, children, className, ...props }, ref) => {
    const mobileSidebarOpen = useWorkspaceStore((s) => s.mobileSidebarOpen);
    const setMobileSidebarOpen = useWorkspaceStore((s) => s.setMobileSidebarOpen);
    const mobileInspectorOpen = useWorkspaceStore((s) => s.mobileInspectorOpen);
    const setMobileInspectorOpen = useWorkspaceStore((s) => s.setMobileInspectorOpen);

    // ── Lock body scroll when mobile drawer/sheet is open ──────────────
    useEffect(() => {
      if (mobileSidebarOpen || mobileInspectorOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => { document.body.style.overflow = ""; };
    }, [mobileSidebarOpen, mobileInspectorOpen]);

    // ── Close mobile drawer on Escape ──────────────────────────────────
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setMobileSidebarOpen(false);
          setMobileInspectorOpen(false);
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [setMobileSidebarOpen, setMobileInspectorOpen]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-dvh w-full overflow-hidden bg-workspace-surface",
          className,
        )}
        {...props}
      >
        <WorkspacePersistenceHydrator />

        {/* ═══════════════════════════════════════════════════════════
            SIDEBAR — permanent on desktop, slide-out drawer on mobile
            ═══════════════════════════════════════════════════════════ */}
        {/* Desktop sidebar: normal flow, shrink-0 */}
        <div className="hidden lg:flex shrink-0 h-full">
          {sidebar}
        </div>

        {/* Mobile sidebar drawer overlay + backdrop */}
        {/* Backdrop */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm motion-safe:transition-opacity motion-safe:duration-300",
            mobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
        {/* Drawer */}
        <div
          className={cn(
            "lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] motion-safe:transition-transform motion-safe:duration-300 ease-out",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {sidebar}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MAIN AREA — toolbar + canvas
            ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {/* Floating toolbar */}
          <div className="absolute top-0 z-30 px-2 pt-4 lg:px-4 lg:pt-4 w-full flex justify-center pointer-events-none"
            style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
            <div className="pointer-events-auto max-w-full">
              {toolbar}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center">
            {children}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            INSPECTOR — permanent on desktop, bottom sheet on mobile
            ═══════════════════════════════════════════════════════════ */}
        {/* Desktop inspector: normal flow, shrink-0 */}
        <div className="hidden lg:flex shrink-0 h-full">
          {inspector}
        </div>

        {/* Mobile inspector backdrop */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm motion-safe:transition-opacity motion-safe:duration-300",
            mobileInspectorOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setMobileInspectorOpen(false)}
          aria-hidden="true"
        />
        {/* Mobile inspector bottom sheet */}
        <div
          className={cn(
            "lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl motion-safe:transition-transform motion-safe:duration-[350ms] ease-out overflow-hidden flex flex-col bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)]",
            mobileInspectorOpen ? "translate-y-0" : "translate-y-full",
          )}
          style={{ 
            height: "min(90dvh, 100%)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)" 
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Editor panel"
        >
          {/* Drag handle — visual affordance for drag-to-dismiss */}
          <div className="shrink-0 flex justify-center pt-4 pb-2 bg-white cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              // Track pointer for drag-to-dismiss
              const startY = e.clientY;
              const sheet = e.currentTarget.parentElement as HTMLElement;
              const onMove = (ev: PointerEvent) => {
                const dy = ev.clientY - startY;
                if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
              };
              const onUp = (ev: PointerEvent) => {
                const dy = ev.clientY - startY;
                document.removeEventListener("pointermove", onMove);
                document.removeEventListener("pointerup", onUp);
                if (dy > 80) setMobileInspectorOpen(false);
                else sheet.style.transform = "";
              };
              document.addEventListener("pointermove", onMove);
              document.addEventListener("pointerup", onUp);
            }}
          >
            <div className="w-10 h-1.5 rounded-full bg-slate-300" />
          </div>
          <div className="flex-1 overflow-hidden">
            {inspector}
          </div>
        </div>
      </div>
    );
  },
);

WorkspaceLayout.displayName = "WorkspaceLayout";
