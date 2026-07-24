import type { HTMLAttributes, ReactNode } from "react";
import { Text } from "../primitives";

export type HelperTextProps = {
  children: ReactNode;
  tone?: "muted" | "success" | "warning";
} & Omit<HTMLAttributes<HTMLSpanElement>, "style" | "color">;

export function HelperText({ children, tone = "muted", ...props }: HelperTextProps) {
  return <Text as="span" role={tone === "muted" ? undefined : "status"} tone={tone} variant="small" {...props}>{children}</Text>;
}
