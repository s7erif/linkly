"use client";

import { Search } from "lucide-react";
import type { FormEvent } from "react";
import { Button, Input } from "../components";
import { Inline } from "../primitives";
import styles from "./data-grid.module.css";

export type SearchFieldProps = {
  disabled?: boolean;
  label?: string;
  onSearch?: (value: string) => void;
  onValueChange: (value: string) => void;
  placeholder?: string;
  submitLabel?: string;
  value: string;
};

export function SearchField({
  disabled = false,
  label = "Search data",
  onSearch,
  onValueChange,
  placeholder = "Search",
  submitLabel = "Search",
  value,
}: SearchFieldProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(value);
  };

  return (
    <Inline
      as="form"
      className={styles.searchField}
      gap="sm"
      onSubmit={handleSubmit}
      role="search"
    >
      <Input
        disabled={disabled}
        label={label}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        placeholder={placeholder}
        prefix={<Search />}
        size="sm"
        type="search"
        value={value}
      />
      {onSearch ? (
        <Button disabled={disabled} size="sm" type="submit" variant="secondary">
          {submitLabel}
        </Button>
      ) : null}
    </Inline>
  );
}
