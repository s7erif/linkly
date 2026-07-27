export const typography = {
  // Editorial sizes (mapped away from raw Tailwind values)
  hero: {
    mobile: { fontSize: "26px", lineHeight: "1.1", tracking: "-0.02em" },
    tablet: { fontSize: "28px", lineHeight: "1.1", tracking: "-0.02em" },
    desktop: { fontSize: "30px", lineHeight: "1.1", tracking: "-0.02em" },
    weight: 700,
  },
  body: {
    mobile: { fontSize: "14px", lineHeight: "1.5", tracking: "0em" },
    desktop: { fontSize: "15px", lineHeight: "1.5", tracking: "0em" },
    weight: 500,
  },
  label: {
    mobile: { fontSize: "11.5px", lineHeight: "1.2", tracking: "0.05em" },
    desktop: { fontSize: "12px", lineHeight: "1.2", tracking: "0.05em" },
    weight: 600,
    transform: "uppercase",
  },
  micro: {
    mobile: { fontSize: "10px", lineHeight: "1.2", tracking: "0.05em" },
    desktop: { fontSize: "11px", lineHeight: "1.2", tracking: "0.05em" },
    weight: 600,
    transform: "uppercase",
  },
} as const;
