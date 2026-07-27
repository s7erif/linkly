export const elevation = {
  level0: "none",
  level1: "var(--shadow-card)",       // Base cards
  level2: "var(--shadow-button)",     // Interactive elements
  level3: "var(--shadow-elevated)",   // Hover states, dropdowns
  level4: "0 12px 48px rgba(0,0,0,0.12)", // Modals, Dialogs
} as const;
