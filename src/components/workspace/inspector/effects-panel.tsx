"use client";

import { memo, useCallback } from "react";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import type { AppearanceSettings } from "@/types/appearance";
import {
  EFFECT_PRESETS,
  type EffectPreset,
  type ShadowStyleValue,
  type RadiusStyleValue,
} from "@/features/design-studio/effect-tokens";
import { InspectorCard } from "@/components/workspace/shared/inspector-card";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// Segmented control helper
// ═══════════════════════════════════════════════════════════════════════════

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors",
            value === o.value
              ? "bg-workspace-primary text-white"
              : "bg-workspace-surface-dim text-workspace-text-muted hover:bg-workspace-outline/20",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Effect Presets
// ═══════════════════════════════════════════════════════════════════════════

const EffectPresets = memo(function EffectPresets({
  onApply,
  activeId,
}: {
  onApply: (p: EffectPreset) => void;
  activeId: string | null;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">
        Presets
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {EFFECT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onApply(p)}
            className={cn(
              "py-2 px-1 rounded-xl text-center transition-all",
              activeId === p.id
                ? "bg-workspace-primary/10 ring-1 ring-workspace-primary/30"
                : "bg-workspace-surface-dim hover:bg-workspace-outline/20",
            )}
          >
            <div className="text-[10px] font-semibold text-workspace-text-primary">
              {p.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// Main panel
// ═══════════════════════════════════════════════════════════════════════════

const SHADOW_OPTIONS: { value: ShadowStyleValue; label: string }[] = [
  { value: "NONE", label: "None" },
  { value: "SOFT", label: "Soft" },
  { value: "MEDIUM", label: "Med" },
  { value: "LARGE", label: "Lg" },
  { value: "FLOATING", label: "Float" },
];

const RADIUS_OPTIONS: { value: RadiusStyleValue; label: string }[] = [
  { value: "SHARP", label: "Sharp" },
  { value: "SMALL", label: "S" },
  { value: "MEDIUM", label: "M" },
  { value: "LARGE", label: "L" },
  { value: "XL", label: "XL" },
  { value: "PILL", label: "Pill" },
];

const ELEVATION_OPTIONS: { value: string; label: string }[] = [
  { value: "FLAT", label: "Flat" },
  { value: "RAISED", label: "Raised" },
  { value: "ELEVATED", label: "Elevated" },
  { value: "FLOATING", label: "Float" },
];

export const EffectsPanel = memo(function EffectsPanel() {
  const appearance = useCardEditorStore((s) => s.appearance);
  const patchAppearance = useCardEditorStore((s) => s.patchAppearance);

  const handleShadowChange = useCallback((style: ShadowStyleValue) => {
    const map: Record<string, AppearanceSettings["shadow"]> = {
      NONE: "NONE", SOFT: "SMALL", MEDIUM: "MEDIUM", LARGE: "LARGE", FLOATING: "LARGE", CUSTOM: "MEDIUM",
    };
    patchAppearance("shadow", map[style] ?? "MEDIUM");
  }, [patchAppearance]);

  const handleRadiusChange = useCallback((r: number) => {
    patchAppearance("borderRadius", r);
  }, [patchAppearance]);

  const handleApplyPreset = useCallback((preset: EffectPreset) => {
    const shadowMap: Record<string, AppearanceSettings["shadow"]> = {
      NONE: "NONE", SOFT: "SMALL", MEDIUM: "MEDIUM", LARGE: "LARGE", FLOATING: "LARGE", CUSTOM: "MEDIUM",
    };
    const radiusMap: Record<string, number> = {
      SHARP: 4, SMALL: 8, MEDIUM: 16, LARGE: 24, XL: 32, PILL: 32,
    };
    patchAppearance("shadow", shadowMap[preset.shadow.style] ?? "MEDIUM");
    patchAppearance("borderRadius", radiusMap[preset.radius.style] ?? 16);
  }, [patchAppearance]);

  if (!appearance) return null;

  const { shadow, borderRadius } = appearance;

  return (
    <InspectorCard title="Visual Effects" description="Shadows, radius, and depth">
      <div className="space-y-5">
        {/* Shadow */}
        <div>
          <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">
            Shadow Depth
          </p>
          <SegmentedControl
            options={SHADOW_OPTIONS}
            value={
              shadow === "NONE" ? "NONE" :
              shadow === "SMALL" ? "SOFT" :
              shadow === "MEDIUM" ? "MEDIUM" : "LARGE"
            }
            onChange={handleShadowChange}
          />
        </div>

        {/* Corner Radius */}
        <div>
          <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">
            Corner Radius
          </p>
          <SegmentedControl
            options={RADIUS_OPTIONS}
            value={
              borderRadius >= 32 ? "PILL" :
              borderRadius >= 28 ? "XL" :
              borderRadius >= 20 ? "LARGE" :
              borderRadius >= 12 ? "MEDIUM" :
              borderRadius >= 6 ? "SMALL" : "SHARP"
            }
            onChange={(v) => {
              const map: Record<string, number> = { SHARP: 4, SMALL: 8, MEDIUM: 16, LARGE: 24, XL: 32, PILL: 32 };
              handleRadiusChange(map[v] ?? 16);
            }}
          />
          {/* Visual radius preview */}
          <div className="flex gap-2 mt-2">
            {[4, 8, 16, 24, 32].map((r) => (
              <div
                key={r}
                className={cn(
                  "w-10 h-10 bg-workspace-primary/15 border transition-all",
                  borderRadius === r
                    ? "border-workspace-primary bg-workspace-primary/25"
                    : "border-workspace-primary/10",
                )}
                style={{ borderRadius: r }}
              />
            ))}
          </div>
        </div>

        {/* Elevation */}
        <div>
          <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">
            Elevation
          </p>
          <SegmentedControl
            options={ELEVATION_OPTIONS}
            value={
              shadow === "NONE" ? "FLAT" :
              shadow === "SMALL" ? "RAISED" :
              shadow === "MEDIUM" ? "ELEVATED" : "FLOATING"
            }
            onChange={(v) => {
              const map: Record<string, AppearanceSettings["shadow"]> = {
                FLAT: "NONE", RAISED: "SMALL", ELEVATED: "MEDIUM", FLOATING: "LARGE",
              };
              patchAppearance("shadow", map[v] ?? "MEDIUM");
            }}
          />
        </div>

        {/* Presets */}
        <div className="pt-2 border-t border-workspace-outline/20">
          <EffectPresets onApply={handleApplyPreset} activeId={null} />
        </div>
      </div>
    </InspectorCard>
  );
});
