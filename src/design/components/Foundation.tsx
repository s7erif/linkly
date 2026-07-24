import Image from "next/image";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../primitives/utils";
import { Card } from "./Card";
import styles from "./foundation.module.css";

export type AvatarProps = {
  alt: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  src?: string;
  status?: "online" | "away" | "offline";
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

const avatarSizes = {
  sm: "2rem",
  md: "2.5rem",
  lg: "3rem",
  xl: "4rem",
} as const;

export function Avatar({
  alt,
  className,
  fallback,
  size = "md",
  src,
  status,
  ...props
}: AvatarProps) {
  const initials =
    fallback ??
    alt
      .split(/\s+/)
      .map((value) => value[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <span
      aria-label={status ? `${alt}, ${status}` : alt}
      className={cx(styles.avatar, styles[`avatar${size.toUpperCase()}`], className)}
      role="img"
      {...props}
    >
      {src ? (
        <Image alt="" fill sizes={avatarSizes[size]} src={src} />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
      {status ? <i aria-hidden className={styles[`status${status}`]} /> : null}
    </span>
  );
}

export type ChipProps = {
  children: ReactNode;
  selected?: boolean;
} & HTMLAttributes<HTMLSpanElement>;

export function Chip({ children, className, selected, ...props }: ChipProps) {
  return (
    <span
      className={cx(styles.chip, selected && styles.chipSelected, className)}
      data-selected={selected || undefined}
      {...props}
    >
      {children}
    </span>
  );
}

export type AlertTone = "info" | "success" | "warning" | "danger" | "neutral";

export type AlertProps = {
  actions?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
  tone?: AlertTone;
} & HTMLAttributes<HTMLDivElement>;

export function Alert({
  actions,
  className,
  description,
  icon,
  title,
  tone = "neutral",
  ...props
}: AlertProps) {
  return (
    <div
      className={cx(styles.alert, styles[`alert${tone}`], className)}
      role={tone === "danger" ? "alert" : "status"}
      {...props}
    >
      {icon ? <span className={styles.alertIcon}>{icon}</span> : null}
      <span className={styles.alertContent}>
        {title ? <strong>{title}</strong> : null}
        {description ? <span>{description}</span> : null}
      </span>
      {actions ? <span className={styles.alertActions}>{actions}</span> : null}
    </div>
  );
}

export type BannerProps = AlertProps;

export function Banner({ className, ...props }: BannerProps) {
  return <Alert {...props} className={cx(styles.banner, className)} />;
}

export type ProgressProps = {
  label: string;
  max?: number;
  value: number;
} & HTMLAttributes<HTMLDivElement>;

export function Progress({
  className,
  label,
  max = 100,
  value,
  ...props
}: ProgressProps) {
  const safeMaximum = Math.max(0, max);
  const safeValue = Math.max(0, Math.min(value, safeMaximum));
  const percentage = safeMaximum > 0 ? (safeValue / safeMaximum) * 100 : 0;

  return (
    <div className={cx(styles.progress, className)} {...props}>
      <span>
        <span>{label}</span>
        <strong>{Math.round(percentage)}%</strong>
      </span>
      <div
        aria-label={label}
        aria-valuemax={safeMaximum}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className={styles.progressTrack}
        role="progressbar"
      >
        <i style={{ "--oi-progress-scale": percentage / 100 } as CSSProperties} />
      </div>
    </div>
  );
}

export type SpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
} & HTMLAttributes<HTMLSpanElement>;

export function Spinner({
  className,
  label = "Loading",
  size = "md",
  ...props
}: SpinnerProps) {
  return (
    <span
      aria-label={label}
      className={cx(styles.loader, styles[`loader${size.toUpperCase()}`], className)}
      role="status"
      {...props}
    />
  );
}

export type LoaderProps = SpinnerProps;
export const Loader = Spinner;

export type GlassLevel = "xs" | "sm" | "md" | "lg" | "xl";

export type GlassCardProps = {
  level?: GlassLevel;
} & HTMLAttributes<HTMLDivElement>;

export function GlassCard({
  className,
  level = "md",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cx(styles.glassCard, `oi-glass-${level}`, className)}
      {...props}
    />
  );
}

export type ProductCardProps = {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

function ProductCard({
  actions,
  className,
  description,
  eyebrow,
  footer,
  icon,
  title,
  ...props
}: ProductCardProps) {
  return (
    <Card className={cx(styles.productCard, className)} variant="interactive" {...props}>
      <div className={styles.productHeading}>
        {icon ? <span className={styles.productIcon}>{icon}</span> : null}
        <div>
          {eyebrow ? <small>{eyebrow}</small> : null}
          <h3>{title}</h3>
        </div>
      </div>
      {description ? <div className={styles.productDescription}>{description}</div> : null}
      {actions ? <div className={styles.productActions}>{actions}</div> : null}
      {footer ? <div className={styles.productFooter}>{footer}</div> : null}
    </Card>
  );
}

export type FeatureCardProps = ProductCardProps;
export type DashboardCardProps = ProductCardProps;
export type QuickActionCardProps = ProductCardProps;
export type StepCardProps = ProductCardProps;

export const FeatureCard = ProductCard;
export const DashboardCard = ProductCard;
export const QuickActionCard = ProductCard;
export const StepCard = ProductCard;

export type PricingCardProps = ProductCardProps & {
  featured?: boolean;
};

export function PricingCard({
  className,
  featured = false,
  ...props
}: PricingCardProps) {
  return (
    <ProductCard
      {...props}
      className={cx(styles.pricingCard, featured && styles.featured, className)}
    />
  );
}

export type StatCardProps = {
  description?: ReactNode;
  label: ReactNode;
  value: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function StatCard({
  className,
  description,
  label,
  value,
  ...props
}: StatCardProps) {
  return (
    <Card className={cx(styles.statCard, className)} {...props}>
      <small>{label}</small>
      <strong>{value}</strong>
      {description ? <span>{description}</span> : null}
    </Card>
  );
}

export type ProgressCardProps = ProgressProps;

export function ProgressCard({
  className,
  label,
  max = 100,
  value,
  ...props
}: ProgressCardProps) {
  return (
    <Card className={cx(styles.progressCard, className)} {...props}>
      <Progress label={label} max={max} value={value} />
    </Card>
  );
}
