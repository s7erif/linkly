"use client";

import { useEffect, useRef } from "react";
import styles from "./data-grid.module.css";

type SelectionCheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function SelectionCheckbox({
  checked,
  disabled = false,
  indeterminate = false,
  label,
  onChange,
}: SelectionCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      aria-label={label}
      checked={checked}
      className={styles.selectionCheckbox}
      disabled={disabled}
      onChange={(event) => onChange(event.currentTarget.checked)}
      ref={inputRef}
      type="checkbox"
    />
  );
}
