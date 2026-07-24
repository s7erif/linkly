import styles from "./primitives.module.css";
import type { Align, Gap, Justify, Tone } from "./types";

export const gapClasses: Record<Gap, string> = {
  none: styles.gapNone, xs: styles.gapXs, sm: styles.gapSm, md: styles.gapMd,
  lg: styles.gapLg, xl: styles.gapXl, "2xl": styles.gap2xl,
};

export const responsiveGapClasses = {
  sm: { none: styles.gapSmNone, xs: styles.gapSmXs, sm: styles.gapSmSm, md: styles.gapSmMd, lg: styles.gapSmLg, xl: styles.gapSmXl, "2xl": styles.gapSm2xl },
  md: { none: styles.gapMdNone, xs: styles.gapMdXs, sm: styles.gapMdSm, md: styles.gapMdMd, lg: styles.gapMdLg, xl: styles.gapMdXl, "2xl": styles.gapMd2xl },
  lg: { none: styles.gapLgNone, xs: styles.gapLgXs, sm: styles.gapLgSm, md: styles.gapLgMd, lg: styles.gapLgLg, xl: styles.gapLgXl, "2xl": styles.gapLg2xl },
} satisfies Record<"sm" | "md" | "lg", Record<Gap, string>>;

export const alignClasses: Record<Align, string> = {
  start: styles.alignStart, center: styles.alignCenter, end: styles.alignEnd,
  stretch: styles.alignStretch, baseline: styles.alignBaseline,
};

export const justifyClasses: Record<Justify, string> = {
  start: styles.justifyStart, center: styles.justifyCenter, end: styles.justifyEnd,
  between: styles.justifyBetween, around: styles.justifyAround, evenly: styles.justifyEvenly,
};

export const toneClasses: Record<Tone, string> = {
  default: styles.toneDefault, muted: styles.toneMuted, subtle: styles.toneSubtle,
  accent: styles.toneAccent, success: styles.toneSuccess, warning: styles.toneWarning,
  danger: styles.toneDanger, info: styles.toneInfo,
};
