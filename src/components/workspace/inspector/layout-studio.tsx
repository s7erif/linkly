"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCardEditorStore } from "@/store/use-card-editor-store";
import type { AppearanceSettings } from "@/types/appearance";
import { SECTION_REGISTRY } from "@/features/design-studio/section-registry";
import {
  type ProfileAlignment,
  type ProfilePosition,
  type SectionWidth,
  type SpacingScale,
  type ContainerStyle,
} from "@/features/design-studio/layout-tokens";
import { InspectorCard } from "@/components/workspace/shared/inspector-card";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// Drag-and-drop section list
// ═══════════════════════════════════════════════════════════════════════════

function SectionOrderEditor({
  order,
  onReorder,
  sections,
  onToggle,
}: {
  order: readonly string[];
  onReorder: (newOrder: readonly string[]) => void;
  sections: AppearanceSettings["sections"];
  onToggle: (kind: string) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      setOverIndex(index);
    }
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, moved);
    onReorder(newOrder);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const visibleMap = (kind: string) => {
    const key = kind === "header" ? "profile" as const :
      kind === "bio" ? "bio" :
      kind === "buttons" ? "buttons" :
      kind === "socialLinks" ? "socialLinks" : "profile";
    return sections[key as keyof typeof sections] ?? true;
  };

  return (
    <div className="space-y-1">
      {order.map((kind, i) => {
        const def = SECTION_REGISTRY.find((s) => s.kind === kind);
        if (!def) return null;
        const visible = visibleMap(kind);
        const isDragging = dragIndex === i;
        const isOver = overIndex === i;

        return (
          <motion.div
            key={kind}
            layout={!reduced}
            transition={{ duration: 0.15 }}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all select-none",
              "border cursor-grab active:cursor-grabbing",
              isDragging ? "opacity-50 scale-95 border-workspace-primary/30 bg-workspace-primary/5" :
              isOver ? "border-workspace-primary/40 bg-workspace-primary/5 -translate-y-0.5" :
              "border-transparent hover:bg-workspace-surface-dim hover:border-workspace-outline/20",
            )}
          >
            {/* Drag handle */}
            <div className="flex flex-col gap-0.5 text-workspace-text-muted/40 shrink-0">
              <div className="w-4 h-0.5 rounded-full bg-current" />
              <div className="w-4 h-0.5 rounded-full bg-current" />
              <div className="w-4 h-0.5 rounded-full bg-current" />
            </div>

            {/* Label */}
            <span className={cn(
              "text-xs font-medium flex-1",
              visible ? "text-workspace-text-primary" : "text-workspace-text-muted/40",
            )}>
              {def.label}
            </span>

            {/* Visibility toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={visible}
              onClick={(e) => { e.stopPropagation(); onToggle(kind); }}
              className={cn(
                "relative w-9 h-5 rounded-full transition-colors shrink-0",
                visible ? "bg-workspace-primary" : "bg-workspace-outline/30",
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                visible ? "left-4" : "left-0.5",
              )} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Segmented control
// ═══════════════════════════════════════════════════════════════════════════

function SegmentedControl<T extends string>({
  options, value, onChange,
}: { options: readonly { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn("flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors",
            value === o.value ? "bg-workspace-primary text-white" : "bg-workspace-surface-dim text-workspace-text-muted hover:bg-workspace-outline/20")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main panel
// ═══════════════════════════════════════════════════════════════════════════

const ALIGN_OPTIONS: { value: ProfileAlignment; label: string }[] = [
  { value: "LEFT", label: "Left" }, { value: "CENTER", label: "Center" }, { value: "RIGHT", label: "Right" },
];
const POSITION_OPTIONS: { value: ProfilePosition; label: string }[] = [
  { value: "TOP", label: "Top" }, { value: "INSIDE_HERO", label: "Hero" }, { value: "FLOATING", label: "Float" }, { value: "COMPACT", label: "Compact" },
];
const WIDTH_OPTIONS: { value: SectionWidth; label: string }[] = [
  { value: "NARROW", label: "Narrow" }, { value: "MEDIUM", label: "Med" }, { value: "WIDE", label: "Wide" }, { value: "FULL", label: "Full" },
];
const SPACING_OPTIONS: { value: SpacingScale; label: string }[] = [
  { value: "COMPACT", label: "Compact" }, { value: "COMFORTABLE", label: "Comfort" }, { value: "SPACIOUS", label: "Spacious" },
];
const CONTAINER_OPTIONS: { value: ContainerStyle; label: string }[] = [
  { value: "FLAT", label: "Flat" }, { value: "CARD", label: "Card" }, { value: "FLOATING_CARD", label: "Float" }, { value: "GLASS_CARD", label: "Glass" },
];

export const LayoutStudio = memo(function LayoutStudio() {
  const appearance = useCardEditorStore((s) => s.appearance);
  const patchAppearance = useCardEditorStore((s) => s.patchAppearance);
  const sectionOrder = useCardEditorStore((s) => s.sectionOrder);
  const setSectionOrder = useCardEditorStore((s) => s.setSectionOrder);
  const layoutOptions = useCardEditorStore((s) => s.appearance?.layout) ?? { alignment: "CENTER" as const, width: "MEDIUM" as const, spacing: "COMFORTABLE" as const, position: "TOP" as const, container: "FLAT" as const };
  const setLayoutOption = useCallback((key: string, value: string) => {
    patchAppearance("layout", { ...layoutOptions, [key]: value } as AppearanceSettings["layout"]);
  }, [layoutOptions, patchAppearance]);

  const sections = useMemo(
    () => appearance?.sections ?? { profile: true, bio: true, contact: true, buttons: true, socialLinks: true },
    [appearance?.sections],
  );

  const toggleSection = useCallback((kind: string) => {
    const key = kind === "header" ? "profile" as const :
      kind === "bio" ? "bio" as const :
      kind === "buttons" ? "buttons" as const : "socialLinks" as const;
    patchAppearance("sections", { ...sections, [key]: !sections[key] });
  }, [sections, patchAppearance]);

  if (!appearance) return null;

  return (
    <div className="space-y-5">
      {/* Section Order + Visibility */}
      <div>
        <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">
          Section Order
        </p>
        <SectionOrderEditor
          order={sectionOrder}
          onReorder={setSectionOrder}
          sections={sections}
          onToggle={toggleSection}
        />
      </div>

      {/* Alignment */}
      <div>
        <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">Alignment</p>
        <SegmentedControl options={ALIGN_OPTIONS} value={layoutOptions.alignment} onChange={(v) => setLayoutOption("alignment", v)} />
      </div>

      {/* Position */}
      <div>
        <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">Profile Position</p>
        <SegmentedControl options={POSITION_OPTIONS} value={layoutOptions.position} onChange={(v) => setLayoutOption("position", v)} />
      </div>

      {/* Width */}
      <div>
        <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">Content Width</p>
        <SegmentedControl options={WIDTH_OPTIONS} value={layoutOptions.width} onChange={(v) => setLayoutOption("width", v)} />
      </div>

      {/* Spacing */}
      <div>
        <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">Spacing</p>
        <SegmentedControl options={SPACING_OPTIONS} value={layoutOptions.spacing} onChange={(v) => setLayoutOption("spacing", v)} />
      </div>

      {/* Container */}
      <div>
        <p className="text-[10px] font-bold text-workspace-text-muted uppercase tracking-wider mb-2">Container</p>
        <SegmentedControl options={CONTAINER_OPTIONS} value={layoutOptions.container} onChange={(v) => setLayoutOption("container", v)} />
      </div>
    </div>
  );
});
