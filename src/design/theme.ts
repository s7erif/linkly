export const themes = ["light", "dark", "system"] as const;

export type Theme = (typeof themes)[number];
export type ResolvedTheme = Exclude<Theme, "system">;

export const defaultTheme: Theme = "system";
export const themeAttribute = "data-oi-theme";
export const themeStorageKey = "oi-platform-theme";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && themes.includes(value as Theme);
}
