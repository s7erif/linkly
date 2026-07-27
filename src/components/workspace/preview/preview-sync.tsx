"use client";

import { useMemo } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useCardEditorStore, buildPreviewData } from "@/store/use-card-editor-store";
import {
  CardRenderer,
  resolveRendererLayout,
  type PreviewLayoutOptions,
} from "@/components/card-renderer";
import { PreviewCanvas } from "./device-switcher";
import { EmptyPreview, ThemeLoadingSkeleton } from "./preview-states";

// ═══════════════════════════════════════════════════════════════════════════
// PreviewSync — connects CardEditorStore → Preview Renderer
//
// Reads real data from the Zustand card editor store (populated by
// CardEditorProvider via the existing useWorkspaceCard hook).
//
// Flow: Inspector edit → Zustand store → PreviewSync (subscribe) →
//       PreviewRenderer → LivePhonePreview
//
// Zero API calls. Zero sample data. Pure reactive rendering.
// ═══════════════════════════════════════════════════════════════════════════

export interface PreviewSyncProps {
  layout?: Partial<PreviewLayoutOptions>;
  avatarUrl?: string | null;
}

export function PreviewSync({ layout, avatarUrl }: PreviewSyncProps) {
  const storeZoom = useWorkspaceStore((s) => s.zoom);
  const isHydrated = useCardEditorStore((s) => s.isHydrated);
  const appearance = useCardEditorStore((s) => s.appearance);
  const profile = useCardEditorStore((s) => s.profile);
  const sectionOrder = useCardEditorStore((s) => s.sectionOrder);
  const editorButtons = useCardEditorStore((s) => s.editorButtons);
  const editorSocialLinks = useCardEditorStore((s) => s.editorSocialLinks);

  // Derived from source fields — no stored previewData in the store.
  // ⚠️  Must NOT call buildPreviewData inside a Zustand selector — it returns a
  // new object every invocation, which breaks useSyncExternalStore's stability
  // contract (getSnapshot must return the same reference when state is unchanged).
  const editorBlocks = useCardEditorStore((s) => s.card?.editorBlocks ?? s.card?.blocks);
  const previewData = useMemo(
    () => buildPreviewData(profile, editorButtons, editorSocialLinks, editorBlocks),
    [profile, editorButtons, editorSocialLinks, editorBlocks],
  );

  // Layout lives in appearance.layout — persisted alongside other appearance data.
  const layoutOptions = useCardEditorStore((s) => s.appearance?.layout);

  // Avatar URL lives in the media domain — structurally separate from profile.
  const storeAvatarUrl = useCardEditorStore((s) => s.media.avatarUrl);
  const resolvedAvatarUrl = avatarUrl ?? storeAvatarUrl;

  // Coerce numeric store zoom to PreviewZoom
  const zoom = (
    storeZoom === 0.5 ? 0.5 : storeZoom === 0.75 ? 0.75 : storeZoom === 0.9 ? 0.9 : 1
  ) as 1 | 0.5 | 0.75 | 0.9;

  // Loading: not yet hydrated
  if (!isHydrated) {
    return (
      <PreviewCanvas>
        <ThemeLoadingSkeleton />
      </PreviewCanvas>
    );
  }

  // Empty: hydrated but no profile data
  if (!previewData || !profile || !appearance) {
    return (
      <PreviewCanvas>
        <EmptyPreview />
      </PreviewCanvas>
    );
  }

  // Render with real data
  return (
    <PreviewCanvas>
      <div className="w-full h-full flex flex-col">
        <CardRenderer
          data={previewData}
          appearance={appearance}
          layout={{
            ...resolveRendererLayout(appearance, sectionOrder),
            ...layout,
            ...layoutOptions,
          }}
          avatarUrl={resolvedAvatarUrl}
        />
      </div>
    </PreviewCanvas>
  );
}
