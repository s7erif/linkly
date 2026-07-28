"use client";

import { useMemo } from "react";
import { ButtonRenderer } from "./button-renderer";
import { IconRenderer } from "./icon-renderer";
import type { PreviewButton } from "../types";

// ═══════════════════════════════════════════════════════════════════════════
// LinksRenderer — rendering pipeline for all card links.
//
// Responsibilities:
//  1. Group incoming PreviewButton[] by displayMode
//  2. Delegate each group to the appropriate renderer
//  3. Unknown displayMode values fall back to BUTTON
//
// This component NEVER knows about platforms, the registry, or individual
// link types.  It only understands the displayMode contract.
//
// Future renderers (GlassButtonRenderer, CardRenderer, CompactRenderer)
// are added here WITHOUT touching PreviewRenderer or any upstream code.
// ═══════════════════════════════════════════════════════════════════════════

export interface LinksRendererProps {
  buttons: ReadonlyArray<PreviewButton>;
}

export function LinksRenderer({ buttons }: LinksRendererProps) {
  // Group buttons by displayMode (memoized — only recomputes when buttons change)
  const groups = useMemo(() => {
    const buttons_: PreviewButton[] = [];
    const icons: PreviewButton[] = [];
    for (const b of buttons) {
      if (b.displayMode === "ICON") {
        icons.push(b);
      } else {
        buttons_.push(b); // default to BUTTON
      }
    }
    return { buttons: buttons_, icons };
  }, [buttons]);

  if (buttons.length === 0) return null;

  return (
    <div className="links-renderer-inner flex flex-col gap-3 md:gap-4 w-full">
      {/* Button-style links */}
      {groups.buttons.map((b, i) => (
        <ButtonRenderer key={b.id} button={b} primary={i === 0} />
      ))}

      {/* Icon-style links */}
      {groups.icons.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {groups.icons.map((b) => (
            <IconRenderer key={b.id} button={b} />
          ))}
        </div>
      )}
    </div>
  );
}
