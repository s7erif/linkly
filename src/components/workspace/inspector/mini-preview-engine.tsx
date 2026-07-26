"use client";

import { useMemo } from "react";
import type { AppearanceSettings } from "@/types/appearance";
import { resolveTokens } from "@/components/card-renderer";

export interface MiniPreviewEngineProps {
  kind: "card" | "button" | "avatar";
  appearance: AppearanceSettings;
  presetValue?: string;
}

export function MiniPreviewEngine({ kind, appearance, presetValue }: MiniPreviewEngineProps) {
  switch (kind) {
    case "card":   return <CardSample appearance={appearance} presetValue={presetValue} />;
    case "button": return <ButtonSample appearance={appearance} presetValue={presetValue} />;
    case "avatar": return <AvatarSample appearance={appearance} presetValue={presetValue} />;
  }
}

// ── Card Surface Material Preview ───────────────────────────────────────────

function CardSample({ appearance, presetValue }: { appearance: AppearanceSettings; presetValue?: string }) {
  const t = useMemo(() => resolveTokens(appearance), [appearance]);

  const isGlass = presetValue === "GLASS" || appearance.shadow === "SMALL";
  const isFlat = presetValue === "FLAT" || appearance.shadow === "NONE";
  const isFloating = presetValue === "FLOATING" || appearance.shadow === "LARGE";

  return (
    <div
      style={{
        width: 60,
        height: 48,
        borderRadius: appearance.borderRadius > 16 ? 14 : appearance.borderRadius > 8 ? 10 : 6,
        background: isGlass
          ? "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(241,245,249,0.5))"
          : "#FFFFFF",
        boxShadow: isFlat
          ? "none"
          : isFloating
            ? "0 12px 28px -4px rgba(15, 23, 42, 0.16), 0 4px 10px -2px rgba(15, 23, 42, 0.08)"
            : isGlass
              ? "0 2px 10px rgba(0,0,0,0.04)"
              : "0 6px 18px -2px rgba(0,0,0,0.08), 0 2px 6px -1px rgba(0,0,0,0.04)",
        border: isGlass
          ? "1.5px solid rgba(255, 255, 255, 0.8)"
          : isFlat
            ? "1px solid rgba(226, 232, 240, 0.9)"
            : "1px solid rgba(241, 245, 249, 0.9)",
      }}
    />
  );
}

// ── Button Material Preview ──────────────────────────────────────────────────

function ButtonSample({ appearance, presetValue }: { appearance: AppearanceSettings; presetValue?: string }) {
  const style = presetValue ?? appearance.buttonStyle;

  if (style === "SOLID") {
    return (
      <div
        className="w-16 h-6.5 rounded-full bg-slate-900 shadow-2xs"
        style={{ borderRadius: 999 }}
      />
    );
  }

  if (style === "OUTLINE") {
    return (
      <div
        className="w-16 h-6.5 rounded-full border-[1.5px] border-slate-300/90 bg-white"
        style={{ borderRadius: 999 }}
      />
    );
  }

  if (style === "SOFT") {
    return (
      <div
        className="w-16 h-6.5 rounded-full bg-slate-200/70"
        style={{ borderRadius: 999 }}
      />
    );
  }

  // Gradient / Glass fallback
  return (
    <div
      className="w-16 h-6.5 rounded-full bg-gradient-to-r from-indigo-100/90 via-purple-100/90 to-pink-100/90 border border-white/80"
      style={{ borderRadius: 999 }}
    />
  );
}

// ── Avatar Shape Geometry Preview ────────────────────────────────────────────

function AvatarSample({ appearance, presetValue }: { appearance: AppearanceSettings; presetValue?: string }) {
  let radius = appearance.borderRadius;
  if (presetValue === "CIRCLE") radius = 9999;
  if (presetValue === "SQUIRCLE") radius = 18;
  if (presetValue === "ROUNDED") radius = 12;
  if (presetValue === "SQUARE") radius = 4;

  return (
    <div
      className="w-[46px] h-[46px] bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200/60 shadow-2xs"
      style={{ borderRadius: radius }}
    />
  );
}
