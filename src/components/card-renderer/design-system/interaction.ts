// Unified Interaction System (Motion + States)
export const interaction = {
  // Motion primitives
  transitions: {
    instant: { duration: 0 },
    rapid: { duration: 0.1, ease: "easeOut" },
    standard: { duration: 0.2, ease: "easeOut" },
    pageFade: { duration: 0.15, ease: "easeOut" },
    springCriticallyDamped: { type: "spring", stiffness: 500, damping: 45, mass: 1 },
  },
  
  // State definitions mapped to physics
  states: {
    default: {
      scale: 1,
      opacity: 1,
    },
    hover: {
      scale: 1.005,
      transition: { duration: 0.15, ease: "easeOut" },
    },
    pressed: {
      scale: 0.98,
      transition: { type: "spring", stiffness: 500, damping: 45, mass: 1 },
    },
    disabled: {
      opacity: 0.5,
      pointerEvents: "none",
    },
    loading: {
      opacity: 0.7,
      pointerEvents: "none",
    }
  }
} as const;
