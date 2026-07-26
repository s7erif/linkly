"use client";

import { type ReactNode, useCallback } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { ErrorBoundary } from "./shared/error-boundary";
import {
  WorkspaceLayout,
  WorkspaceSidebar,
  WorkspaceToolbar,
  WorkspaceCanvas,
  WorkspaceInspector,
} from "./shell";
import { InspectorCard } from "./shared";
import { Divider } from "@/components/ui/divider";
import { IdentityEditorSection } from "./inspector/identity-editor";
import { InspectorShell } from "./inspector/inspector-shell";
import { LinksEditor } from "./inspector/links-editor";
import { DeviceSwitcherBar } from "./preview/device-switcher";
import { useWorkspaceKeyboard } from "./use-workspace-keyboard";
import { SaveAnnouncer } from "./save-announcer";
import { AutoSaveIndicator } from "./auto-save-indicator";
import { AutoSaveConflictBanner } from "./auto-save-conflict-banner";
import { useAutoSave } from "@/features/design-studio/use-auto-save";
import { PublishReview } from "./publish";
import type { WorkspaceSection } from "@/types/workspace";

// Placeholder section for Content
function ContentInspector() {
  return (
    <>
      <div className="space-y-3">
        <span className="studio-stamp">Content Blocks</span>
        <p className="text-sm text-workspace-text-secondary leading-relaxed">
          Compose your page with modular blocks — gallery, video, FAQ, and more.
        </p>
      </div>
      <Divider variant="subtle" />
      <InspectorCard title="Available Blocks">
        <div className="grid grid-cols-2 gap-3">
          {["Gallery", "Video", "FAQ", "Map"].map((block) => (
            <div
              key={block}
              className="p-3 rounded-xl border border-workspace-outline/30 bg-workspace-surface-dim cursor-pointer hover:border-workspace-primary/40 transition-all text-center"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{block}</span>
            </div>
          ))}
        </div>
      </InspectorCard>
    </>
  );
}

const INSPECTOR_CONTENT: Record<WorkspaceSection, ReactNode> = {
  identity: <IdentityEditorSection />,
  design: <InspectorShell />,
  links: <LinksEditor />,
  content: <ContentInspector />,
  publish: <PublishReview />,
};

const SECTION_TITLES: Record<WorkspaceSection, { title: string; description: string; badge: string }> = {
  identity: { title: "Identity Editor", description: "Your digital persona, refined for a premium presence.", badge: "Properties" },
  design: { title: "Design Atelier", description: "Craft the visual language of your card.", badge: "Global Styles" },
  links: { title: "Links Manager", description: "Curate your digital footprint.", badge: "Editor Mode" },
  content: { title: "Content Studio", description: "Build modular content blocks for your page.", badge: "Composer" },
  publish: { title: "Publish", description: "Review and push your card live.", badge: "Release" },
};

// ── Shell wrapper ─────────────────────────────────────────────────────
export interface WorkspaceShellProps {
  children: ReactNode;
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const activeSection = useWorkspaceStore((s) => s.activeSection);
  const setActiveSection = useWorkspaceStore((s) => s.setActiveSection);
  const sectionMeta = SECTION_TITLES[activeSection];
  const saveState = useCardEditorStore((s) => s.saveState);
  const isHydrated = useCardEditorStore((s) => s.isHydrated);
  const isHydrating = !isHydrated;
  const slug = useCardEditorStore((s) => s.slug);
  const undo = useCardEditorStore((s) => s.undo);
  const redo = useCardEditorStore((s) => s.redo);
  const canUndo = useCardEditorStore((s) => s.canUndo);
  const canRedo = useCardEditorStore((s) => s.canRedo);
  const cardName = useCardEditorStore((s) => s.card?.name ?? s.profile?.fullName);

  // Hide editor chrome when in card picker mode (no slug selected)
  const isPicker = slug === "";

  // Auto-save engine — debounced, queued, with offline support and retry
  const { conflict, dismissConflict } = useAutoSave();

  const handlePublish = useCallback(() => {
    setActiveSection("publish");
  }, [setActiveSection]);

  // Wire global keyboard shortcuts
  useWorkspaceKeyboard();

  if (isPicker) {
    return (
      <div className="min-h-screen w-full bg-workspace-surface text-slate-900 overflow-x-hidden flex flex-col relative">
        {children}
        <SaveAnnouncer />
      </div>
    );
  }

  return (
    <WorkspaceLayout
      sidebar={<WorkspaceSidebar />}
      toolbar={
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <WorkspaceToolbar
              isLoading={isHydrating}
              cardName={cardName ?? undefined}
              saving={saveState === "saving"}
              lastSaved={saveState === "saved" ? "just now" : undefined}
              onPublish={handlePublish}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <AutoSaveIndicator />
          </div>
          <AutoSaveConflictBanner
            visible={conflict !== null}
            onReload={() => window.location.reload()}
            onDismiss={dismissConflict ?? (() => {})}
          />
        </div>
      }
      inspector={
        <WorkspaceInspector
          title={sectionMeta.title}
          description={sectionMeta.description}
          badge={sectionMeta.badge}
        >
          <ErrorBoundary
            fallback={(error, reset) => (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 space-y-3" role="alert">
                <p className="text-sm font-semibold text-red-700">This panel encountered an unexpected error.</p>
                <p className="text-xs text-red-600">{error.message}</p>
                <div className="flex gap-2">
                  <button onClick={reset} className="rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-bold hover:bg-red-700 transition-colors">Retry</button>
                  <button onClick={() => { reset(); useWorkspaceStore.getState().setActiveSection("identity"); }} className="rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors">Switch to Identity</button>
                </div>
              </div>
            )}
          >
            {INSPECTOR_CONTENT[activeSection]}
          </ErrorBoundary>
        </WorkspaceInspector>
      }
    >
      <WorkspaceCanvas>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <DeviceSwitcherBar />
        </div>
        <ErrorBoundary
          fallback={(error, reset) => (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-4" role="alert">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <span className="text-2xl">⚠</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Preview unavailable</p>
                <p className="text-xs text-slate-500 mt-1">Your edits are still safe — only the preview is affected.</p>
              </div>
              <button onClick={reset} className="rounded-xl bg-workspace-primary text-white px-5 py-2.5 text-xs font-bold hover:opacity-90 transition-opacity">Retry</button>
            </div>
          )}
        >
          {children}
        </ErrorBoundary>
      </WorkspaceCanvas>
      <SaveAnnouncer />
    </WorkspaceLayout>
  );
}
