"use client";

import { memo } from "react";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import type { AppearanceSettings, BackgroundStyle, TypographyStyle, ButtonStyle } from "@/types/appearance";
import { ThemeGallery } from "./theme-gallery";
import { ThemeStatusBar } from "./theme-status-bar";
import { ColorEditorPanel } from "./color-editor-panel";
import { EffectsPanel } from "./effects-panel";
import { ComponentStylePanel } from "./component-style-panel";
import { LayoutStudio } from "./layout-studio";
import { InspectorCard } from "@/components/workspace/shared/inspector-card";
import { Divider } from "@/components/ui/divider";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function useAppearanceField<K extends keyof AppearanceSettings>() {
  const value = useCardEditorStore((s) => s.appearance);
  const patch = useCardEditorStore((s) => s.patchAppearance);
  return { value, patch };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Background style
// ═══════════════════════════════════════════════════════════════════════════

const BG_STYLES: { value: BackgroundStyle; label: string }[] = [
  { value: "SOLID", label: "Solid" },
  { value: "GRADIENT", label: "Gradient" },
];

export const BackgroundEditor = memo(function BackgroundEditor() {
  const appearance = useCardEditorStore((s) => s.appearance);
  const patch = useCardEditorStore((s) => s.patchAppearance);

  if (!appearance) return null;

  return (
    <div className="space-y-4">
      {/* Style toggle */}
      <div className="flex gap-2">
        {BG_STYLES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => patch("background", { ...appearance.background, style: s.value })}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-fast",
              appearance.background.style === s.value
                ? "bg-workspace-primary text-white shadow-sm"
                : "bg-workspace-surface-dim text-workspace-text-muted hover:bg-workspace-outline/20",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <ColorSwatch
          label={appearance.background.style === "GRADIENT" ? "From" : "Color"}
          value={appearance.background.color}
          onChange={(v) => patch("background", { ...appearance.background, color: v })}
        />
        {appearance.background.style === "GRADIENT" && (
          <>
            <ColorSwatch
              label="To"
              value={appearance.background.gradientTo}
              onChange={(v) => patch("background", { ...appearance.background, gradientTo: v })}
            />
            <ColorSwatch
              label="Grad. From"
              value={appearance.background.gradientFrom}
              onChange={(v) => patch("background", { ...appearance.background, gradientFrom: v })}
            />
          </>
        )}
      </div>
    </div>
  );
});

function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer" aria-label={label} />
          <div className="w-8 h-8 rounded-lg ring-1 ring-workspace-outline/40" style={{ background: value }} />
        </div>
        <span className="text-[10px] font-mono text-workspace-text-muted">{value}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Typography
// ═══════════════════════════════════════════════════════════════════════════

const FONTS: { value: TypographyStyle; label: string; preview: string }[] = [
  { value: "SANS", label: "Inter", preview: "Modern, clean sans-serif" },
  { value: "SYSTEM", label: "System", preview: "Native OS font stack" },
  { value: "SERIF", label: "Georgia", preview: "Classic editorial serif" },
];

export const TypographyEditor = memo(function TypographyEditor() {
  const appearance = useCardEditorStore((s) => s.appearance);
  const patch = useCardEditorStore((s) => s.patchAppearance);

  if (!appearance) return null;

  return (
    <div className="space-y-3">
      {FONTS.map((font) => (
        <button
          key={font.value}
          type="button"
          onClick={() => patch("typography", font.value)}
          className={cn(
            "w-full p-3 rounded-xl text-left transition-all duration-fast",
            appearance.typography === font.value
              ? "bg-workspace-primary-muted/60 ring-1 ring-workspace-primary/20"
              : "bg-workspace-surface-dim hover:bg-workspace-outline/10",
          )}
        >
          <p className="text-sm font-semibold text-workspace-text-primary">{font.label}</p>
          <p className="text-[11px] text-workspace-text-muted mt-0.5">{font.preview}</p>
        </button>
      ))}
      {/* Font preview */}
      <div className="flex items-baseline gap-3 pt-2">
        <span className="text-2xl font-light text-workspace-text-muted/30">Aa</span>
        <span className="text-2xl font-medium text-workspace-text-primary">Aa</span>
        <span className="text-2xl font-bold text-workspace-primary">Aa</span>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Button Styles
// ═══════════════════════════════════════════════════════════════════════════

const BTN_STYLES: { value: ButtonStyle; label: string; desc: string }[] = [
  { value: "SOLID", label: "Filled", desc: "Solid color background" },
  { value: "OUTLINE", label: "Outlined", desc: "Border with transparency" },
  { value: "SOFT", label: "Soft", desc: "Tinted background" },
];

export const ButtonStyleEditor = memo(function ButtonStyleEditor() {
  const appearance = useCardEditorStore((s) => s.appearance);
  const patch = useCardEditorStore((s) => s.patchAppearance);

  if (!appearance) return null;

  return (
    <div className="space-y-3">
      {BTN_STYLES.map((bs) => (
        <button
          key={bs.value}
          type="button"
          onClick={() => patch("buttonStyle", bs.value)}
          className={cn(
            "w-full p-3 rounded-xl text-left transition-all duration-fast flex items-center gap-3",
            appearance.buttonStyle === bs.value
              ? "bg-workspace-primary-muted/60 ring-1 ring-workspace-primary/20"
              : "bg-workspace-surface-dim hover:bg-workspace-outline/10",
          )}
        >
          {/* Style preview */}
          <div
            className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
            style={{
              background: bs.value === "SOLID" ? appearance.colors.primary
                : bs.value === "SOFT" ? `${appearance.colors.primary}20`
                : "transparent",
              border: bs.value === "OUTLINE" ? `1.5px solid ${appearance.colors.primary}` : "none",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: appearance.colors.primary }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-workspace-text-primary">{bs.label}</p>
            <p className="text-[10px] text-workspace-text-muted">{bs.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// Design Studio Section — composes all editors
// ═══════════════════════════════════════════════════════════════════════════

export function DesignStudioSection() {
  const isHydrated = useCardEditorStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-4 w-20 bg-workspace-outline/20 rounded" />
        <div className="h-32 bg-workspace-outline/10 rounded-2xl" />
        <div className="h-24 bg-workspace-outline/10 rounded-2xl" />
        <div className="h-20 bg-workspace-outline/10 rounded-2xl" />
        <div className="h-20 bg-workspace-outline/10 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <span className="studio-stamp">Visual Language</span>
        <p className="text-sm text-workspace-text-secondary leading-relaxed">
          Customize the look and feel — themes, colors, typography, and effects.
        </p>
      </div>

      <Divider variant="subtle" />

      <ThemeStatusBar />
      <ThemeGallery />
      <ColorEditorPanel />
      <BackgroundEditor />
      <TypographyEditor />
      <EffectsPanel />
      <ComponentStylePanel />
      <LayoutStudio />
      <ButtonStyleEditor />
    </>
  );
}
