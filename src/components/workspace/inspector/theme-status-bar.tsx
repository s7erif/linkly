"use client";

import { memo, useCallback, useMemo } from "react";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import { THEME_BY_ID, toAppearanceSettings } from "@/features/design-studio/theme-registry";
import type { AppearanceSettings } from "@/types/appearance";

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

/** Deep-compare two appearance objects field-by-field. Returns true if any field differs. */
function appearanceDiffers(a: AppearanceSettings, b: AppearanceSettings): boolean {
  if (a.colors.primary !== b.colors.primary) return true;
  if (a.colors.accent !== b.colors.accent) return true;
  if (a.colors.text !== b.colors.text) return true;
  if (a.colors.mutedText !== b.colors.mutedText) return true;
  if (a.background.style !== b.background.style) return true;
  if (a.background.color !== b.background.color) return true;
  if (a.background.gradientFrom !== b.background.gradientFrom) return true;
  if (a.background.gradientTo !== b.background.gradientTo) return true;
  if (a.typography !== b.typography) return true;
  if (a.buttonStyle !== b.buttonStyle) return true;
  if (a.borderRadius !== b.borderRadius) return true;
  if (a.shadow !== b.shadow) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// ThemeStatusBar
// ═══════════════════════════════════════════════════════════════════════════

export const ThemeStatusBar = memo(function ThemeStatusBar() {
  const appearance = useCardEditorStore((s) => s.appearance);
  const baseThemeId = useCardEditorStore((s) => s.baseThemeId);
  const applyTheme = useCardEditorStore((s) => s.applyTheme);

  const baseTheme = baseThemeId ? THEME_BY_ID[baseThemeId] ?? null : null;

  const isCustomized = useMemo(() => {
    if (!appearance || !baseTheme) return false;
    const baseSettings = toAppearanceSettings(baseTheme.settings);
    return appearanceDiffers(appearance, baseSettings);
  }, [appearance, baseTheme]);

  const handleResetToTheme = useCallback(() => {
    if (!baseTheme) return;
    applyTheme(baseTheme.id, toAppearanceSettings(baseTheme.settings));
  }, [baseTheme, applyTheme]);

  if (!baseTheme) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-workspace-surface-dim border border-workspace-outline/20">
      {/* Theme indicator dot */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: baseTheme.settings.background.style === "GRADIENT"
          ? undefined
          : baseTheme.settings.background.color
        }}>
          <div className="w-4 h-4 rounded-md" style={{ background: baseTheme.settings.colors.primary }} />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-workspace-text-primary truncate">
          {baseTheme.name}
        </p>
        <p className="text-[10px] text-workspace-text-muted mt-0.5">
          {isCustomized ? `Customized from ${baseTheme.name}` : "Original"}
        </p>
      </div>

      {/* Status badge + actions */}
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          isCustomized
            ? "bg-amber-50 text-amber-700 border border-amber-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}>
          {isCustomized ? "Customized" : "Original"}
        </span>

        {isCustomized && (
          <button
            type="button"
            onClick={handleResetToTheme}
            className="text-[10px] font-semibold text-workspace-primary hover:underline whitespace-nowrap"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
});
