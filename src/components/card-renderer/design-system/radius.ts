export const radius = {
  none: "0px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
  full: "9999px",
  
  // Semantic mappings
  button: "var(--radius-button, 28px)",
  card: "var(--radius-card, 32px)",
  avatar: "var(--radius-avatar, 50%)",
} as const;
