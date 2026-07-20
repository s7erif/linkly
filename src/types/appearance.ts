export type BackgroundStyle = "SOLID" | "GRADIENT";
export type TypographyStyle = "SYSTEM" | "SANS" | "SERIF";
export type ButtonStyle = "SOLID" | "OUTLINE" | "SOFT";
export type ShadowStyle = "NONE" | "SMALL" | "MEDIUM" | "LARGE";

export interface AppearanceSettings {
  colors: { primary: string; accent: string; text: string; mutedText: string };
  background: { style: BackgroundStyle; color: string; gradientFrom: string; gradientTo: string };
  typography: TypographyStyle;
  buttonStyle: ButtonStyle;
  borderRadius: number;
  shadow: ShadowStyle;
  sections: { profile: boolean; bio: boolean; contact: boolean; buttons: boolean; socialLinks: boolean };
}
