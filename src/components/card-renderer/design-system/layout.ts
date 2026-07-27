export const layout = {
  // Container boundaries
  contentWidth: {
    mobile: "94vw",
    tablet: "480px",
    desktop: "540px",
  },
  
  // Padding & Margin configurations
  pagePadding: {
    mobile: "16px",
    desktop: "24px",
  },
  surfacePadding: {
    compact: "12px",
    standard: "20px",
    relaxed: "24px",
  },
  
  // Rhythmic spacing
  sectionSpacing: {
    mobile: "24px",
    desktop: "32px",
  },
  stackSpacing: "12px",
  cardGap: "12px",
  
  // Advanced boundaries
  safeArea: "env(safe-area-inset-bottom, 20px)",
} as const;
