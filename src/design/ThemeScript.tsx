import { defaultTheme, themeAttribute, themeStorageKey } from "./theme";

export const themeBootstrapScript = `(() => {
  const themes = ["light", "dark", "system"];
  let currentTheme = "${defaultTheme}";
  try {
    const storedTheme = localStorage.getItem("${themeStorageKey}");
    if (themes.includes(storedTheme)) currentTheme = storedTheme;
  } catch {}
  const resolvedTheme = currentTheme === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : currentTheme;
  document.documentElement.setAttribute("${themeAttribute}", resolvedTheme);
  document.documentElement.style.colorScheme = resolvedTheme;
  document.documentElement.setAttribute("data-oi-theme-init", "");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.removeAttribute("data-oi-theme-init");
  }));
})();`;

