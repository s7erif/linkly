"use client";

import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import {
  deriveSemanticColors,
  COLOR_PALETTES,
  getRecentColors,
  addRecentColor,
  contrastStatus,
} from "@/features/design-studio/color-system";
import { InspectorCard } from "@/components/workspace/shared/inspector-card";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// Single color row with picker
// ═══════════════════════════════════════════════════════════════════════════

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const ColorField = memo(function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);

  const handleOpen = () => {
    setInput(value);
    setOpen(true);
  };

  const handleConfirm = () => {
    const hex = input.startsWith("#") ? input : `#${input}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange(hex);
      addRecentColor(hex);
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") setOpen(false);
  };

  const contrast = contrastStatus(value, "#FFFFFF");

  return (
    <div className="flex items-center gap-3 py-1.5">
      {/* Label */}
      <span className="text-xs font-medium text-workspace-text-primary w-20 shrink-0">
        {label}
      </span>

      {/* Color swatch — clickable */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-8 h-8 rounded-lg ring-1 ring-workspace-outline/40 shadow-sm shrink-0 hover:scale-105 transition-transform"
        style={{ background: value }}
        title={`${label}: ${value}`}
      />

      {/* HEX value */}
      <span className="text-[11px] font-mono text-workspace-text-muted w-16">
        {value}
      </span>

      {/* Contrast badge */}
      {contrast !== "pass" && (
        <span className={cn(
          "text-[9px] font-semibold px-1.5 py-0.5 rounded",
          contrast === "fail" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600",
        )}>
          {contrast === "fail" ? "Low" : "AA"}
        </span>
      )}

      {/* Inline color picker */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 p-4 rounded-2xl bg-white border border-workspace-outline/20 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={value}
                onChange={(e) => setInput(e.target.value)}
                className="absolute inset-0 opacity-0 w-10 h-10 cursor-pointer"
              />
              <div className="w-10 h-10 rounded-xl ring-1 ring-workspace-outline/40" style={{ background: input }} />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider block">HEX</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2.5 py-1.5 rounded-lg bg-workspace-surface-dim border border-workspace-outline/30 text-xs font-mono focus:outline-none focus:border-workspace-primary/50"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3 py-1.5 rounded-lg bg-workspace-primary text-white text-xs font-semibold"
            >
              OK
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText(value); }}
              className="text-[10px] text-workspace-text-muted hover:text-workspace-primary"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={async () => {
                try { const text = await navigator.clipboard.readText(); if (/^#[0-9a-fA-F]{6}$/.test(text)) { setInput(text); onChange(text); addRecentColor(text); setOpen(false); } } catch {}
              }}
              className="text-[10px] text-workspace-text-muted hover:text-workspace-primary"
            >
              Paste
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// Color palettes — click to apply colors only
// ═══════════════════════════════════════════════════════════════════════════

const ColorPalettes = memo(function ColorPalettes({
  onApply,
}: {
  onApply: (colors: { primary: string; accent: string; text: string; mutedText: string }) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">
        Palettes
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {COLOR_PALETTES.map((palette) => (
          <button
            key={palette.id}
            type="button"
            onClick={() => onApply(palette.colors)}
            title={palette.name}
            className="flex flex-col gap-0.5 p-1.5 rounded-xl hover:bg-workspace-surface-dim transition-colors"
          >
            <div className="flex gap-px h-5 rounded-md overflow-hidden">
              <div className="flex-1" style={{ background: palette.colors.primary }} />
              <div className="flex-1" style={{ background: palette.colors.accent }} />
              <div className="flex-[0.5]" style={{ background: palette.colors.text }} />
              <div className="flex-[0.5]" style={{ background: palette.colors.mutedText }} />
            </div>
            <span className="text-[9px] text-workspace-text-muted text-center">{palette.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// Recent colors
// ═══════════════════════════════════════════════════════════════════════════

const RecentColors = memo(function RecentColors({
  onSelect,
}: {
  onSelect: (color: string) => void;
}) {
  const recent = getRecentColors();
  if (recent.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider shrink-0">Recent</span>
      {recent.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className="w-5 h-5 rounded-md ring-1 ring-workspace-outline/30 hover:scale-110 transition-transform"
          style={{ background: c }}
          title={c}
        />
      ))}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// Main editor panel
// ═══════════════════════════════════════════════════════════════════════════

const FIELD_LABELS: Record<string, string> = {
  primary: "Primary",
  accent: "Accent",
  text: "Text",
  mutedText: "Muted",
};

export const ColorEditorPanel = memo(function ColorEditorPanel() {
  const appearance = useCardEditorStore((s) => s.appearance);
  const patchAppearance = useCardEditorStore((s) => s.patchAppearance);

  const handleApplyPalette = useCallback(
    (paletteColors: { primary: string; accent: string; text: string; mutedText: string }) => {
      patchAppearance("colors", { ...paletteColors });
    },
    [patchAppearance],
  );

  if (!appearance) return null;

  const colors = appearance.colors;
  const semantic = deriveSemanticColors(colors);

  const setColor = (key: keyof typeof colors, value: string) => {
    patchAppearance("colors", { ...colors, [key]: value });
  };

  const editableFields = Object.keys(FIELD_LABELS) as (keyof typeof colors)[];

  const derivedFields = [
    { key: "secondary", label: "Secondary", value: semantic.secondary },
    { key: "background", label: "Background", value: semantic.background },
    { key: "surface",    label: "Surface",    value: semantic.surface },
    { key: "border",     label: "Border",     value: semantic.border },
    { key: "success",    label: "Success",    value: semantic.success },
    { key: "warning",    label: "Warning",    value: semantic.warning },
    { key: "danger",     label: "Danger",     value: semantic.danger },
  ];

  return (
    <div className="space-y-1 relative">
      {/* Base colors — editable */}
      {editableFields.map((key) => (
        <ColorField
          key={key}
          label={FIELD_LABELS[key]}
          value={colors[key]}
          onChange={(hex) => setColor(key, hex)}
        />
      ))}

      {/* Divider */}
      <div className="my-3 border-t border-workspace-outline/20" />

      {/* Derived tokens — read-only */}
      {derivedFields.map(({ key, label, value }) => (
        <div key={key} className="flex items-center gap-3 py-1.5">
          <span className="text-xs font-medium text-workspace-text-muted/70 w-20 shrink-0">{label}</span>
          <div className="w-6 h-6 rounded-md ring-1 ring-workspace-outline/20 shrink-0 opacity-70" style={{ background: value }} />
          <span className="text-[10px] font-mono text-workspace-text-muted/50">{value}</span>
          <span className="text-[9px] text-workspace-text-muted/40">auto</span>
        </div>
      ))}

      {/* Recent colors */}
      <div className="mt-4">
        <RecentColors onSelect={(hex) => {}} />
      </div>

      {/* Palettes */}
      <div className="mt-4">
        <ColorPalettes onApply={handleApplyPalette} />
      </div>
    </div>
  );
});
