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
  // Defer DOM mutation to after React hydration — the server already renders
  // data-oi-theme="light", and changing it before hydration completes causes
  // a React hydration warning.  requestAnimationFrame fires after the first
  // paint, which is after React has finished hydrating the tree.
  requestAnimationFrame(() => {
    document.documentElement.setAttribute("${themeAttribute}", resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
    document.documentElement.setAttribute("data-oi-theme-init", "");
    requestAnimationFrame(() => {
      document.documentElement.removeAttribute("data-oi-theme-init");
    });
  });
})();`;

