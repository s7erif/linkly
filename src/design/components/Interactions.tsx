"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../primitives/utils";
import styles from "./interactions.module.css";

export type TabItem = {
  content: ReactNode;
  disabled?: boolean;
  id: string;
  label: ReactNode;
};

export type TabsProps = {
  defaultValue?: string;
  items: readonly TabItem[];
  label?: string;
};

export function Tabs({
  defaultValue,
  items,
  label = "Tabs",
}: TabsProps) {
  const idPrefix = useId();
  const enabledItems = items.filter((item) => !item.disabled);
  const initialItem =
    enabledItems.find((item) => item.id === defaultValue) ?? enabledItems[0];
  const [active, setActive] = useState(initialItem?.id ?? "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (currentIndex: number, direction: number) => {
    if (enabledItems.length === 0) return;

    let nextIndex = currentIndex;
    for (let attempts = 0; attempts < items.length; attempts += 1) {
      nextIndex = (nextIndex + direction + items.length) % items.length;
      const nextItem = items[nextIndex];
      if (nextItem && !nextItem.disabled) {
        setActive(nextItem.id);
        tabRefs.current[nextIndex]?.focus();
        return;
      }
    }
  };

  const selectBoundary = (fromStart: boolean) => {
    const nextIndex = fromStart
      ? items.findIndex((item) => !item.disabled)
      : items.findLastIndex((item) => !item.disabled);

    if (nextIndex >= 0) {
      setActive(items[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={styles.tabs}>
      <div aria-label={label} role="tablist">
        {items.map((item, index) => {
          const selected = active === item.id;
          const tabId = `${idPrefix}-${item.id}-tab`;
          const panelId = `${idPrefix}-${item.id}-panel`;

          return (
            <button
              aria-controls={panelId}
              aria-selected={selected}
              disabled={item.disabled}
              id={tabId}
              key={item.id}
              onClick={() => setActive(item.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  select(index, 1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  select(index, -1);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  selectBoundary(true);
                }
                if (event.key === "End") {
                  event.preventDefault();
                  selectBoundary(false);
                }
              }}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          aria-labelledby={`${idPrefix}-${item.id}-tab`}
          hidden={active !== item.id}
          id={`${idPrefix}-${item.id}-panel`}
          key={item.id}
          role="tabpanel"
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

export type AccordionItem = {
  content: ReactNode;
  id: string;
  title: ReactNode;
};

export type AccordionProps = {
  items: readonly AccordionItem[];
};

export function Accordion({ items }: AccordionProps) {
  return (
    <div className={styles.accordion}>
      {items.map((item) => (
        <details key={item.id}>
          <summary>{item.title}</summary>
          <div>{item.content}</div>
        </details>
      ))}
    </div>
  );
}

export type DropdownProps = {
  align?: "start" | "end";
  children: ReactNode;
  label: ReactNode;
};

export function Dropdown({
  align = "start",
  children,
  label,
}: DropdownProps) {
  const ref = useRef<HTMLDetailsElement>(null);

  return (
    <details
      className={cx(styles.dropdown, align === "end" && styles.alignEnd)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && ref.current?.open) {
          event.preventDefault();
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}
      ref={ref}
    >
      <summary>{label}</summary>
      <div role="menu">{children}</div>
    </details>
  );
}

export type PopoverProps = {
  children: ReactNode;
  label?: string;
  trigger: ReactNode;
};

export function Popover({
  children,
  label = "Popover",
  trigger,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span className={styles.popover} ref={rootRef}>
      <button
        aria-controls={id}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        type="button"
      >
        {trigger}
      </button>
      {open ? (
        <span aria-label={label} className={styles.popoverPanel} id={id} role="dialog">
          {children}
        </span>
      ) : null}
    </span>
  );
}

export type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
};

export function Tooltip({ children, content }: TooltipProps) {
  const id = useId();

  return (
    <span aria-describedby={id} className={styles.tooltip}>
      {children}
      <span id={id} role="tooltip">
        {content}
      </span>
    </span>
  );
}

export type ToastTone = "neutral" | "success" | "warning" | "danger";

export type ToastProps = {
  children: ReactNode;
  tone?: ToastTone;
} & HTMLAttributes<HTMLDivElement>;

export function Toast({
  children,
  className,
  tone = "neutral",
  ...props
}: ToastProps) {
  return (
    <div
      aria-atomic="true"
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={cx(styles.toast, styles[`toast${tone}`], className)}
      role={tone === "danger" ? "alert" : "status"}
      {...props}
    >
      {children}
    </div>
  );
}

export type ModalProps = {
  children: ReactNode;
  label: string;
  onClose: () => void;
  open: boolean;
};

export function Modal({
  children,
  label,
  onClose,
  open,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      aria-label={label}
      className={styles.modal}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      ref={ref}
    >
      {children}
    </dialog>
  );
}

export type OTPInputProps = {
  label?: string;
  length?: number;
  name: string;
  onChange?: (value: string) => void;
};

export function OTPInput({
  label = "Verification code",
  length = 6,
  name,
  onChange,
}: OTPInputProps) {
  const [digits, setDigits] = useState(() => Array.from({ length }, () => ""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const visibleDigits = Array.from(
    { length },
    (_, index) => digits[index] ?? "",
  );

  const commit = (next: string[]) => {
    setDigits(next);
    onChange?.(next.join(""));
  };

  const update = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...visibleDigits];
    next[index] = digit;
    commit(next);
    if (digit) refs.current[index + 1]?.focus();
  };

  const handleKey = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !visibleDigits[index]) {
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft") refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight") refs.current[index + 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    const next = Array.from({ length }, (_, index) => pasted[index] ?? "");
    commit(next);
    refs.current[Math.min(pasted.length, length) - 1]?.focus();
  };

  return (
    <fieldset className={styles.otp}>
      <legend>{label}</legend>
      <div>
        {visibleDigits.map((digit, index) => (
          <input
            aria-label={`Digit ${index + 1} of ${length}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            inputMode="numeric"
            key={index}
            maxLength={1}
            onChange={(event) => update(index, event.currentTarget.value)}
            onKeyDown={(event) => handleKey(event, index)}
            onPaste={handlePaste}
            pattern="[0-9]*"
            ref={(node) => {
              refs.current[index] = node;
            }}
            value={digit}
          />
        ))}
      </div>
      <input name={name} type="hidden" value={visibleDigits.join("")} />
    </fieldset>
  );
}
