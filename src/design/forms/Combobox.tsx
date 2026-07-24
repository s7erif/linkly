"use client";

import { useId, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button, Input } from "../components";
import { Icon, Stack, Surface, Text } from "../primitives";
import type { FieldPresentationProps } from "./types";
import styles from "./forms.module.css";

export type ComboboxOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type ComboboxProps = FieldPresentationProps & {
  id?: string;
  noResultsText?: string;
  inputValue: string;
  onInputValueChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  options: readonly ComboboxOption[];
  placeholder?: string;
  value?: string;
};

export function Combobox({
  description,
  disabled,
  error,
  helperText,
  id,
  label,
  loading,
  inputValue,
  noResultsText = "No options",
  onInputValueChange,
  onValueChange,
  optional,
  options,
  placeholder,
  readOnly,
  required,
  success,
  value,
  warning,
}: ComboboxProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const listId = controlId + "-listbox";
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const visibleOptions = options.filter((option) => option.label.toLocaleLowerCase().includes(inputValue.toLocaleLowerCase()));
  const unavailable = disabled || loading;

  const selectOption = (option: ComboboxOption) => {
    if (option.disabled || readOnly) return;
    onValueChange?.(option.value);
    onInputValueChange?.(option.label);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) => {
        const next = current < 0 ? (direction > 0 ? 0 : visibleOptions.length - 1) : (current + direction + visibleOptions.length) % visibleOptions.length;
        return visibleOptions.length ? next : -1;
      });
    }
    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      const option = visibleOptions[activeIndex];
      if (option) selectOption(option);
    }
  };

  return (
    <Stack className={styles.combobox} gap="xs">
      <Input
        aria-activedescendant={activeIndex >= 0 ? controlId + "-option-" + activeIndex : undefined}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        autoComplete="off"
        disabled={unavailable}
        error={error}
        helperText={warning ?? success ?? helperText}
        id={controlId}
        label={label}
        onBlur={() => setOpen(false)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onInputValueChange?.(event.currentTarget.value);
          setActiveIndex(-1);
          setOpen(true);
        }}
        onFocus={() => { if (!readOnly) setOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        role="combobox"
        success={success}
        suffix={<ChevronDown />}
        value={inputValue}
      />
      {description ? <Text tone="muted" variant="small">{description}{optional && !required ? " (Optional)" : ""}</Text> : null}
      {open && !unavailable && !readOnly ? (
        <Surface className={styles.comboboxList} id={listId} role="listbox" variant="floating">
          {visibleOptions.length ? visibleOptions.map((option, index) => (
            <Button
              aria-selected={option.value === value}
              className={styles.comboboxOption}
              disabled={option.disabled}
              id={controlId + "-option-" + index}
              key={option.value}
              leftIcon={option.value === value ? <Check /> : undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              role="option"
              size="sm"
              variant="ghost"
            >
              {option.label}
            </Button>
          )) : <Text className={styles.noResults} tone="muted" variant="small">{noResultsText}</Text>}
        </Surface>
      ) : null}
    </Stack>
  );
}
