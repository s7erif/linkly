"use client";

import { type KeyboardEvent } from "react";
import { Button } from "../components";
import { Inline, Stack } from "../primitives";
import { Description } from "./Description";
import { ErrorMessage } from "./ErrorMessage";
import { HelperText } from "./HelperText";
import { RequiredIndicator } from "./RequiredIndicator";
import type { ChoiceOption, FieldPresentationProps } from "./types";
import { fieldMessage, fieldStatus } from "./types";
import styles from "./forms.module.css";

export type ToggleGroupProps = FieldPresentationProps & {
  multiple?: boolean;
  onValuesChange?: (values: readonly string[]) => void;
  options: readonly ChoiceOption[];
  values?: readonly string[];
};

export function ToggleGroup({
  description,
  disabled,
  error,
  helperText,
  label,
  loading,
  multiple = false,
  onValuesChange,
  optional,
  options,
  readOnly,
  required,
  success,
  values = [],
  warning,
}: ToggleGroupProps) {
  const message = fieldMessage({ error, success, warning, helperText });
  const status = fieldStatus({ error, success, warning });
  const unavailable = disabled || loading;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const enabled = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
    const currentIndex = enabled.indexOf(event.target as HTMLButtonElement);
    if (currentIndex < 0) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let nextIndex = currentIndex;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = enabled.length - 1;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + (rtl ? -1 : 1) + enabled.length) % enabled.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex + (rtl ? 1 : -1) + enabled.length) % enabled.length;
    event.preventDefault();
    enabled[nextIndex]?.focus();
  };

  const toggle = (value: string) => {
    if (readOnly) return;
    if (!multiple) return onValuesChange?.([value]);
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    onValuesChange?.(next);
  };

  return (
    <Stack aria-busy={loading || undefined} className={styles.choiceField} data-status={status} gap="xs">
      {label ? <span className={styles.groupLegend}>{label} {required || optional ? <RequiredIndicator optional={optional && !required} /> : null}</span> : null}
      {description ? <Description>{description}</Description> : null}
      <Inline aria-label={typeof label === "string" ? label : "Toggle options"} className={styles.toggleGroup} gap="xs" onKeyDown={handleKeyDown} role="group" wrap>
        {options.map((option) => {
          const pressed = values.includes(option.value);
          return (
            <Button
              aria-pressed={pressed}
              className={styles.toggleButton}
              disabled={unavailable || option.disabled}
              key={option.value}
              onClick={() => toggle(option.value)}
              size="sm"
              variant={pressed ? "primary" : "secondary"}
            >
              {option.label}
            </Button>
          );
        })}
      </Inline>
      {message ? status === "error" ? <ErrorMessage>{message}</ErrorMessage> : <HelperText tone={status === "default" ? "muted" : status}>{message}</HelperText> : null}
      {loading ? <HelperText>Loading</HelperText> : null}
    </Stack>
  );
}
