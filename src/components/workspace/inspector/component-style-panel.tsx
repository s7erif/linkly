"use client";

import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import type { AppearanceSettings } from "@/types/appearance";
import { InspectorCard } from "@/components/workspace/shared/inspector-card";
import { MiniPreviewEngine } from "./mini-preview-engine";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// Presets matching the Inspector Design System specification & user mockup
// ═══════════════════════════════════════════════════════════════════════════

interface StylePresetCard<T extends string> {
  value: T;
  label: string;
  appearanceOverride: Partial<AppearanceSettings>;
}

const CARD_STYLES: StylePresetCard<"FLAT" | "ELEVATED" | "GLASS" | "FLOATING">[] = [
  {
    value: "FLAT",
    label: "Flat",
    appearanceOverride: { shadow: "NONE", borderRadius: 6 },
  },
  {
    value: "ELEVATED",
    label: "Elevated",
    appearanceOverride: { shadow: "MEDIUM", borderRadius: 16 },
  },
  {
    value: "GLASS",
    label: "Glass",
    appearanceOverride: { shadow: "SMALL", borderRadius: 24 },
  },
  {
    value: "FLOATING",
    label: "Floating",
    appearanceOverride: { shadow: "LARGE", borderRadius: 24 },
  },
];

const BUTTON_STYLES: StylePresetCard<"SOLID" | "OUTLINE" | "SOFT" | "GRADIENT">[] = [
  {
    value: "SOLID",
    label: "Filled",
    appearanceOverride: { buttonStyle: "SOLID" },
  },
  {
    value: "OUTLINE",
    label: "Outline",
    appearanceOverride: { buttonStyle: "OUTLINE" },
  },
  {
    value: "SOFT",
    label: "Soft",
    appearanceOverride: { buttonStyle: "SOFT" },
  },
  {
    value: "GRADIENT",
    label: "Gradient",
    appearanceOverride: { buttonStyle: "SOFT" },
  },
];

const AVATAR_STYLES: StylePresetCard<"CIRCLE" | "ROUNDED" | "SQUIRCLE" | "SQUARE">[] = [
  {
    value: "CIRCLE",
    label: "Circle",
    appearanceOverride: { avatarBorderRadius: 32 },
  },
  {
    value: "ROUNDED",
    label: "Rounded",
    appearanceOverride: { avatarBorderRadius: 12 },
  },
  {
    value: "SQUIRCLE",
    label: "Squircle",
    appearanceOverride: { avatarBorderRadius: 20 },
  },
  {
    value: "SQUARE",
    label: "Square",
    appearanceOverride: { avatarBorderRadius: 4 },
  },
];

function SliderControl({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white">
          {value}{unit ?? ""}
        </span>
      </div>
      <div className="relative h-6 flex items-center cursor-pointer">
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

export const ComponentStylePanel = memo(function ComponentStylePanel() {
  const appearance = useCardEditorStore((s) => s.appearance);
  const patchAppearance = useCardEditorStore((s) => s.patchAppearance);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const apply = useCallback(
    <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
      patchAppearance(key, value);
    },
    [patchAppearance],
  );

  if (!appearance) return null;

  const currentCardPreset =
    CARD_STYLES.find(
      (p) =>
        p.appearanceOverride.shadow === appearance.shadow &&
        p.appearanceOverride.borderRadius === appearance.borderRadius,
    )?.value ?? "ELEVATED";

  const currentAvatarPreset =
    AVATAR_STYLES.find((p) => p.appearanceOverride.avatarBorderRadius === appearance.avatarBorderRadius)?.value ??
    "CIRCLE";

  return (
    <>
      <div className="space-y-7 select-none">
        {/* ── CARDS ─────────────────────────────────────────────────── */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Cards
          </h4>
          <div className="grid grid-cols-2 gap-3.5">
            {CARD_STYLES.map((preset) => {
              const active = currentCardPreset === preset.value;
              const mergedAppearance: AppearanceSettings = {
                ...appearance,
                ...preset.appearanceOverride,
              };

              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    if (preset.appearanceOverride.shadow) apply("shadow", preset.appearanceOverride.shadow);
                    if (preset.appearanceOverride.borderRadius !== undefined)
                      apply("borderRadius", preset.appearanceOverride.borderRadius);
                  }}
                  className={cn(
                    "relative flex flex-col items-center justify-between min-h-[114px] p-3 rounded-2xl border transition-all duration-200 text-center cursor-pointer active:scale-[0.98]",
                    active
                      ? "border-indigo-600/90 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/10 font-bold"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-xs",
                  )}
                >
                  {/* Selected Badge */}
                  {active && (
                    <div className="absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs z-10">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 w-full flex items-center justify-center pt-1">
                    <MiniPreviewEngine kind="card" appearance={mergedAppearance} presetValue={preset.value} />
                  </div>
                  <span className={cn("text-xs font-semibold tracking-tight", active ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400")}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── BUTTONS ────────────────────────────────────────────────── */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Buttons
          </h4>
          <div className="grid grid-cols-2 gap-3.5">
            {BUTTON_STYLES.map((preset) => {
              const active =
                preset.value === "GRADIENT"
                  ? appearance.buttonStyle === "SOFT"
                  : appearance.buttonStyle === preset.value;
              const mergedAppearance: AppearanceSettings = {
                ...appearance,
                ...preset.appearanceOverride,
              };

              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    if (preset.appearanceOverride.buttonStyle)
                      apply("buttonStyle", preset.appearanceOverride.buttonStyle);
                  }}
                  className={cn(
                    "relative flex flex-col items-center justify-between min-h-[114px] p-3 rounded-2xl border transition-all duration-200 text-center cursor-pointer active:scale-[0.98]",
                    active
                      ? "border-indigo-600/90 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/10 font-bold"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-xs",
                  )}
                >
                  {/* Selected Badge */}
                  {active && (
                    <div className="absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs z-10">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 w-full flex items-center justify-center pt-1">
                    <MiniPreviewEngine kind="button" appearance={mergedAppearance} presetValue={preset.value} />
                  </div>
                  <span className={cn("text-xs font-semibold tracking-tight", active ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400")}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── AVATAR ─────────────────────────────────────────────────── */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Avatar
          </h4>
          <div className="grid grid-cols-2 gap-3.5">
            {AVATAR_STYLES.map((preset) => {
              const active = currentAvatarPreset === preset.value;
              const mergedAppearance: AppearanceSettings = {
                ...appearance,
                ...preset.appearanceOverride,
              };

              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    if (preset.appearanceOverride.avatarBorderRadius !== undefined)
                      apply("avatarBorderRadius", preset.appearanceOverride.avatarBorderRadius);
                  }}
                  className={cn(
                    "relative flex flex-col items-center justify-between min-h-[114px] p-3 rounded-2xl border transition-all duration-200 text-center cursor-pointer active:scale-[0.98]",
                    active
                      ? "border-indigo-600/90 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/10 font-bold"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-xs",
                  )}
                >
                  {/* Selected Badge */}
                  {active && (
                    <div className="absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs z-10">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 w-full flex items-center justify-center pt-1">
                    <MiniPreviewEngine kind="avatar" appearance={mergedAppearance} presetValue={preset.value} />
                  </div>
                  <span className={cn("text-xs font-semibold tracking-tight", active ? "text-slate-900 dark:text-white font-bold" : "text-slate-600 dark:text-slate-400")}>
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ADVANCED TUNING ────────────────────────────────────────── */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between py-1 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <span>Advanced Tuning</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={cn("transition-transform duration-150", showAdvanced && "rotate-180")}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden space-y-4 pt-3"
              >
                <SliderControl
                  label="Corner Radius"
                  value={appearance.borderRadius}
                  min={0}
                  max={32}
                  unit="px"
                  onChange={(v) => apply("borderRadius", v)}
                />
                <SliderControl
                  label="Shadow Depth"
                  value={
                    appearance.shadow === "NONE"
                      ? 0
                      : appearance.shadow === "SMALL"
                        ? 1
                        : appearance.shadow === "MEDIUM"
                          ? 2
                          : 3
                  }
                  min={0}
                  max={3}
                  onChange={(v) => {
                    const map = ["NONE", "SMALL", "MEDIUM", "LARGE"] as const;
                    apply("shadow", map[v] ?? "MEDIUM");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
});
