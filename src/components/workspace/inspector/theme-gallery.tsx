"use client";

import { memo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import {
  THEME_REGISTRY,
  toAppearanceSettings,
  type ThemePreset,
} from "@/features/design-studio/theme-registry";
import { cn } from "@/lib/utils";
import { InspectorCard } from "@/components/workspace/shared/inspector-card";

// ═══════════════════════════════════════════════════════════════════════════
// Single theme card
// ═══════════════════════════════════════════════════════════════════════════

const ThemeCard = memo(function ThemeCard({
  theme,
  isActive,
  onApply,
  index,
  reduced,
}: {
  theme: ThemePreset;
  isActive: boolean;
  onApply: (theme: ThemePreset) => void;
  index: number;
  reduced: boolean;
}) {
  const s = theme.settings;

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduced ? undefined : { y: -3 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
    >
      <button
        type="button"
        onClick={() => onApply(theme)}
        className={cn(
          "w-full text-left rounded-2xl overflow-hidden transition-all duration-200 ease-out",
          "bg-white border shadow-sm",
          "hover:shadow-lg hover:border-workspace-primary/30",
          isActive
            ? "ring-2 ring-workspace-primary border-workspace-primary/40 shadow-md"
            : "border-workspace-outline/20",
        )}
      >
        {/* Preview strip — 3 color swatches showing the theme palette */}
        <div
          className="h-16 flex"
          style={{
            background: s.background.style === "GRADIENT"
              ? `linear-gradient(145deg, ${s.background.gradientFrom}, ${s.background.gradientTo})`
              : s.background.color,
          }}
        >
          <div className="flex-1 flex items-end gap-1.5 p-3">
            <div className="w-5 h-5 rounded-md shadow-sm" style={{ background: s.colors.primary }} />
            <div className="w-5 h-5 rounded-md shadow-sm" style={{ background: s.colors.accent }} />
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: s.colors.text }} />
          </div>
          {isActive && (
            <div className="flex items-start p-3">
              <span className="px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-workspace-primary shadow-sm">
                Active
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-workspace-text-primary">
              {theme.name}
            </p>
            {isActive && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-workspace-primary">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <p className="text-[11px] text-workspace-text-muted leading-relaxed">
            {theme.description}
          </p>
        </div>
      </button>
    </motion.div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// Theme Gallery — grid of theme cards
// ═══════════════════════════════════════════════════════════════════════════

export const ThemeGallery = memo(function ThemeGallery() {
  const appearance = useCardEditorStore((s) => s.appearance);
  const baseThemeId = useCardEditorStore((s) => s.baseThemeId);
  const applyTheme = useCardEditorStore((s) => s.applyTheme);
  const resetAppearance = useCardEditorStore((s) => s.resetAppearance);
  const reduced = useReducedMotion() ?? false;

  // Which theme in the gallery matches the current baseThemeId
  const activeId = baseThemeId;

  const handleApply = useCallback((theme: ThemePreset) => {
    applyTheme(theme.id, toAppearanceSettings(theme.settings));
  }, [applyTheme]);

  const handleReset = useCallback(() => {
    resetAppearance();
  }, [resetAppearance]);

  return (
    <div className="flex flex-col">
      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {THEME_REGISTRY.map((theme, i) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={activeId === theme.id}
            onApply={handleApply}
            index={i}
            reduced={reduced}
          />
        ))}
      </div>

      {/* Reset */}
      <div className="mt-4 pt-3 border-t border-workspace-outline/20">
        <button
          type="button"
          onClick={handleReset}
          className="w-full py-2 rounded-xl text-xs font-semibold text-workspace-text-muted hover:text-workspace-primary hover:bg-workspace-surface-dim transition-all"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
});
