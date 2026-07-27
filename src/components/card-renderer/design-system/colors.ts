// Semantic color tokens mapped to purposes, not appearances
export const colors = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  
  // Surfaces
  surface: "var(--color-surface)",
  surfaceElevated: "var(--color-surface-elevated)",
  surfaceOverlay: "var(--color-surface-overlay)",
  
  // Borders
  border: "var(--color-border)",
  borderFocus: "var(--color-primary)",
  
  // Text
  text: "var(--color-text)",
  textMuted: "var(--color-text-muted)",
  textInverse: "#FFFFFF",
  
  // System / Feedback
  interactive: "var(--color-primary)",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
} as const;
