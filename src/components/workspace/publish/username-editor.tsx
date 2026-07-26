"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { Button, Input } from "@/design/components";
import { slugSchema } from "@/validation/common";

export interface UsernameEditorState {
  available: boolean;
  checking: boolean;
  current: boolean;
  valid: boolean;
}

export interface UsernameEditorProps {
  cardId: string;
  currentUsername: string;
  sessionToken: string;
  value: string;
  onChange: (value: string) => void;
  onSaved: (value: string) => void;
  onStateChange?: (state: UsernameEditorState) => void;
}

type Availability =
  | { kind: "current" }
  | { kind: "invalid"; message: string }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "unavailable" }
  | { kind: "saving" }
  | { kind: "error"; message: string };

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: { message?: string };
  message?: string;
};

function stateFor(status: Availability): UsernameEditorState {
  return {
    available: status.kind === "available" || status.kind === "current",
    checking: status.kind === "checking" || status.kind === "saving",
    current: status.kind === "current",
    valid: !["invalid", "unavailable", "error"].includes(status.kind),
  };
}

function responseMessage(payload: ApiEnvelope<unknown>): string {
  return payload.error?.message ?? payload.message ?? "Unable to update the username.";
}

export function UsernameEditor({
  cardId,
  currentUsername,
  sessionToken,
  value,
  onChange,
  onSaved,
  onStateChange,
}: UsernameEditorProps) {
  const [status, setStatus] = useState<Availability>({ kind: "current" });

  const updateStatus = useCallback((next: Availability) => {
    setStatus(next);
    onStateChange?.(stateFor(next));
  }, [onStateChange]);

  const handleChange = (nextValue: string) => {
    const next = nextValue.trimStart().toLowerCase().replace(/^@/, "");
    onChange(next);
    if (next === currentUsername) {
      updateStatus({ kind: "current" });
      return;
    }
    const parsed = slugSchema.safeParse(next);
    if (!parsed.success) {
      updateStatus({ kind: "invalid", message: parsed.error.issues[0]?.message ?? "Enter a valid username." });
      return;
    }
    updateStatus({ kind: "checking" });
  };

  useEffect(() => {
    if (status.kind !== "checking") return;
    const parsed = slugSchema.safeParse(value);
    if (!parsed.success) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/cards/${cardId}/slug`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionToken, slug: parsed.data }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as ApiEnvelope<{ available: boolean }>;
        if (!response.ok || !payload.data) throw new Error(responseMessage(payload));
        updateStatus(payload.data.available ? { kind: "available" } : { kind: "unavailable" });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          updateStatus({ kind: "error", message: error instanceof Error ? error.message : "Unable to check availability." });
        }
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [cardId, sessionToken, status.kind, updateStatus, value]);

  const save = async () => {
    const parsed = slugSchema.safeParse(value);
    if (!parsed.success || status.kind !== "available") return;
    updateStatus({ kind: "saving" });
    try {
      const response = await fetch(`/cards/${cardId}/slug`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionToken, slug: parsed.data }),
      });
      const payload = (await response.json()) as ApiEnvelope<{ slug: string }>;
      if (!response.ok || !payload.data?.slug) throw new Error(responseMessage(payload));
      updateStatus({ kind: "current" });
      onSaved(payload.data.slug);
    } catch (error) {
      updateStatus({ kind: "error", message: error instanceof Error ? error.message : "Unable to update the username." });
    }
  };

  const error =
    status.kind === "invalid" || status.kind === "error"
      ? status.message
      : status.kind === "unavailable"
        ? "This username is already in use."
        : undefined;
  const success =
    status.kind === "current"
      ? "Current public username"
      : status.kind === "available"
        ? "Username is available"
        : undefined;

  return (
    <div className="space-y-3">
      <Input
        aria-label="Public username"
        autoCapitalize="none"
        autoComplete="off"
        error={error}
        helperText={status.kind === "checking" ? "Checking availability..." : "3–80 lowercase letters, numbers, and hyphens."}
        onChange={(event) => handleChange(event.currentTarget.value)}
        prefix={<span aria-hidden>@</span>}
        spellCheck={false}
        success={success}
        suffix={status.kind === "checking" || status.kind === "saving" ? <LoaderCircle className="animate-spin" size={16} /> : success ? <CheckCircle2 size={16} /> : undefined}
        value={value}
      />
      <Button
        disabled={status.kind !== "available"}
        fullWidth
        leftIcon={<Save />}
        loading={status.kind === "saving"}
        loadingLabel="Saving username"
        onClick={() => void save()}
        size="sm"
        variant="secondary"
      >
        Save username
      </Button>
    </div>
  );
}
