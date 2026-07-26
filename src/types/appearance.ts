export type BackgroundStyle = "SOLID" | "GRADIENT";
export type TypographyStyle = "SYSTEM" | "SANS" | "SERIF";
export type ButtonStyle = "SOLID" | "OUTLINE" | "SOFT";
export type ShadowStyle = "NONE" | "SMALL" | "MEDIUM" | "LARGE";

export interface AppearanceSettings {
  colors: { primary: string; accent: string; text: string; mutedText: string };
  background: { style: BackgroundStyle; color: string; gradientFrom: string; gradientTo: string };
  typography: TypographyStyle;
  buttonStyle: ButtonStyle;
  /** Card corner radius in px — does NOT control avatar shape. */
  borderRadius: number;
  /** Avatar corner radius override. null = derive from borderRadius (backward compat). 32 = circle. */
  avatarBorderRadius: number | null;
  shadow: ShadowStyle;
  sections: { profile: boolean; bio: boolean; contact: boolean; buttons: boolean; socialLinks: boolean };
  /** Layout options — persisted alongside appearance. */
  layout: {
    alignment: "LEFT" | "CENTER" | "RIGHT";
    width: "NARROW" | "MEDIUM" | "WIDE" | "FULL";
    spacing: "COMPACT" | "COMFORTABLE" | "SPACIOUS";
    position: "TOP" | "INSIDE_HERO" | "FLOATING" | "COMPACT";
    container: "FLAT" | "CARD" | "FLOATING_CARD" | "GLASS_CARD";
  };
}
