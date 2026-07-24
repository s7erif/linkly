"use client";

import React from "react";
import { ThemeRegistry } from "./ThemeRegistry";
import { normalizeCard } from "./adapters/card.adapter";

interface CardRendererProps {
  card: unknown;
  /**
   * If true, forces the new React-based renderer regardless of the template string.
   * If false or not provided, we can dynamically decide whether to render via
   * the legacy HTML string (using iframe) or the new React components.
   */
  forceReact?: boolean;
}

export function CardRenderer({ card, forceReact = true }: CardRendererProps) {
  console.log("[CardRenderer] input card templateId:", (card as any)?.templateId);

  // Normalize legacy and external formats into a safe, strict object
  const normalizedCard = normalizeCard(card);
  
  console.log("[CardRenderer] normalizedCard templateId:", normalizedCard.templateId);

  // If we decide to support legacy inline strings, we'd do a check here.
  // For the new React renderer, we look up the templateId in our registry.
  // We'll normalize the template ID to lowercase for lookups.
  const themeId = normalizedCard.templateId.toLowerCase() || "default";
  
  console.log("[CardRenderer] final themeId for registry lookup:", themeId);
  
  // Try to find the specific React theme, fallback to BaseCard if missing.
  const ThemeComponent = ThemeRegistry[themeId] || ThemeRegistry["default"];

  return (
    <div className="react-card-renderer w-full h-full relative z-10 overflow-auto">
      <ThemeComponent card={normalizedCard} />
    </div>
  );
}
