"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  defaultTheme,
  isTheme,
  themeAttribute,
  themeStorageKey,
  type ResolvedTheme,
  type Theme,
} from "./theme";

type ThemeContextValue = {
  currentTheme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme?: Theme;
  storageKey?: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(storageKey: string, fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback;
  try {
    const storedTheme = localStorage.getItem(storageKey);
    return isTheme(storedTheme) ? storedTheme : fallback;
  } catch {
    return fallback;
  }
}

function getAppliedTheme(fallback: Theme): ResolvedTheme {
  if (typeof document !== "undefined") {
    const appliedTheme = document.documentElement.getAttribute(themeAttribute);
    if (appliedTheme === "light" || appliedTheme === "dark") return appliedTheme;
  }
  return fallback === "dark" ? "dark" : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

export function ThemeProvider({
  children,
  initialTheme = defaultTheme,
  storageKey = themeStorageKey,
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    initialTheme === "dark" ? "dark" : "light",
  );
  const isFirstThemeEffect = useRef(true);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // Storage can be unavailable in privacy-restricted browser contexts.
      }
      setCurrentTheme(nextTheme);
    },
    [storageKey],
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useEffect(() => {
    if (isFirstThemeEffect.current) {
      isFirstThemeEffect.current = false;
      const storedTheme = getStoredTheme(storageKey, initialTheme);
      const appliedTheme = getAppliedTheme(storedTheme);
      if (storedTheme !== currentTheme) {
        queueMicrotask(() => {
          setResolvedTheme(appliedTheme);
          setCurrentTheme(storedTheme);
        });
        return;
      }
      queueMicrotask(() => setResolvedTheme(appliedTheme));
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const nextResolvedTheme = resolveTheme(currentTheme);
      document.documentElement.setAttribute(themeAttribute, nextResolvedTheme);
      document.documentElement.style.colorScheme = nextResolvedTheme;
      setResolvedTheme(nextResolvedTheme);
    };

    applyTheme();
    if (currentTheme === "system") media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [currentTheme, initialTheme, storageKey]);

  useEffect(() => {
    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key === storageKey && isTheme(event.newValue)) {
        setCurrentTheme(event.newValue);
      }
    };
    window.addEventListener("storage", syncStoredTheme);
    return () => window.removeEventListener("storage", syncStoredTheme);
  }, [storageKey]);

  const value = useMemo(
    () => ({ currentTheme, resolvedTheme, setTheme, toggleTheme }),
    [currentTheme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
