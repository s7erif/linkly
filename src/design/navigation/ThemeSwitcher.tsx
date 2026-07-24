"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import type { ReactElement } from "react";
import { Button } from "../components";
import { Inline } from "../primitives";
import { useTheme } from "../ThemeProvider";
import { themes, type Theme } from "../theme";
import styles from "./navigation.module.css";

const themeDetails: Record<Theme, { label: string; icon: ReactElement }> = {
  light: { label: "Use light theme", icon: <Sun /> },
  dark: { label: "Use dark theme", icon: <Moon /> },
  system: { label: "Use system theme", icon: <Monitor /> },
};

export type ThemeSwitcherProps = {
  label?: string;
};

export function ThemeSwitcher({ label = "Theme" }: ThemeSwitcherProps) {
  const { currentTheme, setTheme } = useTheme();
  const currentIndex = themes.indexOf(currentTheme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  return (
    <fieldset className={styles.themeSwitcher}>
      <legend className={styles.visuallyHidden}>{label}</legend>
      <Inline className={styles.themeOptions} gap="xs">
        {themes.map((theme) => (
          <Button
            aria-label={themeDetails[theme].label}
            aria-pressed={currentTheme === theme}
            className={styles.themeOption}
            iconOnly
            key={theme}
            leftIcon={themeDetails[theme].icon}
            onClick={() => setTheme(theme)}
            size="sm"
            title={themeDetails[theme].label}
            variant={currentTheme === theme ? "secondary" : "ghost"}
          />
        ))}
      </Inline>
      <Button aria-label={`${label}. Current selection: ${currentTheme}. Activate to use ${nextTheme}.`} className={styles.themeCompact} iconOnly leftIcon={themeDetails[currentTheme].icon} onClick={() => setTheme(nextTheme)} size="sm" title={`${label}: ${currentTheme}`} variant="ghost" />
    </fieldset>
  );
}
