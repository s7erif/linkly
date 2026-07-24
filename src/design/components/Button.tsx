import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { Box, Icon, Inline } from "../primitives";
import { cx } from "../primitives/utils";
import styles from "./components.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "glass" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

type ButtonBehaviorProps = {
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type ButtonContentProps =
  | {
      "aria-label": string;
      children?: never;
      iconOnly: true;
      leftIcon: ReactElement;
      rightIcon?: never;
    }
  | {
      "aria-label"?: string;
      children: ReactNode;
      iconOnly?: false;
      leftIcon?: ReactElement;
      rightIcon?: ReactElement;
    };

type ButtonCommonProps = ButtonBehaviorProps & ButtonContentProps;

type NativeButtonProps = ButtonCommonProps & {
  as?: "button";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonCommonProps | "style" | "color">;

type AnchorButtonProps = ButtonCommonProps & {
  as: "a";
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonCommonProps | "style" | "color">;

export type ButtonProps = NativeButtonProps | AnchorButtonProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  ghost: styles.buttonGhost,
  danger: styles.buttonDanger,
  glass: styles.buttonGlass,
  link: styles.buttonLink,
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: styles.buttonXs,
  sm: styles.buttonSm,
  md: styles.buttonMd,
  lg: styles.buttonLg,
};

export function Button({
  as = "button",
  children,
  className,
  disabled = false,
  fullWidth = false,
  iconOnly = false,
  leftIcon,
  loading = false,
  loadingLabel = "Loading",
  rightIcon,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  const unavailable = disabled || loading;
  const classNames = cx(
    styles.button,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && styles.buttonFull,
    iconOnly && styles.buttonIconOnly,
    loading && styles.buttonLoading,
    unavailable && styles.buttonUnavailable,
    className,
  );

  const content = (
    <Inline
      align="center"
      className={styles.buttonContent}
      gap={iconOnly ? "none" : "sm"}
      justify="center"
    >
      {loading ? <Box aria-hidden className={styles.spinner} /> : leftIcon ? <Icon size={size === "lg" ? "md" : "sm"}>{leftIcon}</Icon> : null}
      {!iconOnly ? children : null}
      {!loading && rightIcon && !iconOnly ? <Icon size={size === "lg" ? "md" : "sm"}>{rightIcon}</Icon> : null}
    </Inline>
  );

  const accessibleLabel = loading ? loadingLabel : props["aria-label"];

  if (as === "a") {
    const anchorProps = props as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "style" | "color">;
    return (
      <a
        {...anchorProps}
        aria-busy={loading || undefined}
        aria-disabled={unavailable || undefined}
        aria-label={accessibleLabel}
        className={classNames}
        tabIndex={unavailable ? -1 : anchorProps.tabIndex}
      >
        {content}
      </a>
    );
  }

  const buttonProps = props as Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style" | "color">;
  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      aria-label={accessibleLabel}
      className={classNames}
      disabled={unavailable}
      type={buttonProps.type ?? "button"}
    >
      {content}
    </button>
  );
}
