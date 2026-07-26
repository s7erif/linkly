"use client";

import { memo, useState } from "react";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { ScrollableArea } from "@/components/ui/scroll-area";
import { InspectorCard, InspectorSettingRow } from "@/components/workspace/shared";

// Editors
import { ThemeGallery } from "./theme-gallery";
import { ColorEditorPanel } from "./color-editor-panel";
import { TypographyEditor, BackgroundEditor, ButtonStyleEditor } from "./design-studio";
import { ComponentStylePanel } from "./component-style-panel";
import { LayoutStudio } from "./layout-studio";
import { THEME_REGISTRY } from "@/features/design-studio/theme-registry";

// ═══════════════════════════════════════════════════════════════════════════
// Search
// ═══════════════════════════════════════════════════════════════════════════

function InspectorSearch() {
  const [query, setQuery] = useState("");
  
  return (
    <div className="relative sticky top-0 z-20 px-8 pt-6 pb-4 bg-white/80 backdrop-blur-md">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-workspace-text-muted/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search design settings..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-workspace-surface-dim/50 border border-workspace-outline/20 text-xs font-medium focus:outline-none focus:border-workspace-primary/30 focus:bg-white transition-all shadow-inner shadow-black/[0.02]"
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Inspector Shell
// ═══════════════════════════════════════════════════════════════════════════

export const InspectorShell = memo(function InspectorShell() {
  const appearance = useCardEditorStore((s) => s.appearance);
  
  if (!appearance) return null;

  // Helpers for summary text
  const currentTheme = THEME_REGISTRY.find(t => t.id === useCardEditorStore.getState().baseThemeId)?.name ?? "Custom";
  const paletteLabel = Object.values(appearance.colors).some(c => c.toLowerCase() === "#a855f7") ? "Purple Palette" : "Custom Palette";
  const fontLabel = appearance.typography === "SANS" ? "Inter" : appearance.typography === "SERIF" ? "Georgia" : "System";
  
  const cardStyleLabel = appearance.shadow === "NONE" ? "Flat" : appearance.shadow === "LARGE" ? "Floating" : appearance.shadow === "SMALL" ? "Glass" : "Elevated";
  const buttonStyleLabel = appearance.buttonStyle === "SOLID" ? "Filled" : appearance.buttonStyle === "OUTLINE" ? "Outline" : "Soft";
  
  const alignLabel = appearance.layout?.alignment === "CENTER" ? "Center" : appearance.layout?.alignment === "RIGHT" ? "Right" : "Left";
  const widthLabel = appearance.layout?.width === "WIDE" ? "Wide" : appearance.layout?.width === "FULL" ? "Full" : "Narrow";

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <InspectorSearch />

      <ScrollableArea className="flex-1 px-8 pb-12">
        <div className="space-y-8 mt-2">
          
          {/* ── APPEARANCE ────────────────────────────────────────────── */}
          <InspectorCard
            title="Appearance"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            }
            summary={
              <>
                <p>{currentTheme} Theme</p>
                <p>{paletteLabel}</p>
              </>
            }
            defaultExpanded={true}
            delay={0}
          >
            <InspectorSettingRow title="Theme Gallery" value={`Current: ${currentTheme}`} expandable>
              <ThemeGallery />
            </InspectorSettingRow>
            <div className="h-px w-full bg-workspace-outline/10 my-1" />
            <InspectorSettingRow title="Colors" value={paletteLabel} expandable>
              <ColorEditorPanel />
            </InspectorSettingRow>
            <div className="h-px w-full bg-workspace-outline/10 my-1" />
            <InspectorSettingRow title="Typography" value={`${fontLabel} / Medium`} expandable>
              <TypographyEditor />
            </InspectorSettingRow>
            <div className="h-px w-full bg-workspace-outline/10 my-1" />
            <InspectorSettingRow title="Background" value={appearance.background.style === "SOLID" ? "Solid" : "Gradient"} expandable>
              <BackgroundEditor />
            </InspectorSettingRow>
          </InspectorCard>

          {/* ── COMPONENTS ────────────────────────────────────────────── */}
          <InspectorCard
            title="Components"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            }
            summary={
              <>
                <p>{cardStyleLabel} Cards</p>
                <p>{buttonStyleLabel} Buttons</p>
              </>
            }
            delay={0.05}
          >
            <InspectorSettingRow title="Component Styles" value="Cards & Avatars" expandable>
              <ComponentStylePanel />
            </InspectorSettingRow>
            <div className="h-px w-full bg-workspace-outline/10 my-1" />
            <InspectorSettingRow title="Buttons" value={buttonStyleLabel} expandable>
              <ButtonStyleEditor />
            </InspectorSettingRow>
          </InspectorCard>

          {/* ── LAYOUT ────────────────────────────────────────────── */}
          <InspectorCard
            title="Layout"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            }
            summary={
              <>
                <p>{alignLabel} Aligned</p>
                <p>{widthLabel} Width</p>
              </>
            }
            delay={0.1}
          >
            <InspectorSettingRow title="Layout Studio" value="Order & Alignment" expandable>
              <LayoutStudio />
            </InspectorSettingRow>
          </InspectorCard>

          {/* ── ADVANCED (theme import/export removed — dead code) ──── */}

        </div>
      </ScrollableArea>
    </div>
  );
});
