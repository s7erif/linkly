"use client";

import { useCallback, useState } from "react";
import type { ProfileFields, ProfileFieldKey } from "@/validation/fields";
import { validateProfileFields, normalizeProfileFields } from "@/validation/fields";

export type FieldErrors = Partial<Record<ProfileFieldKey, string>>;

/**
 * Client-side validation hook.
 *
 * Validates profile fields using the SAME Zod schemas as the server.
 * Website URLs are auto-normalized (https:// prepended) before validation.
 * Country codes are auto-uppercased.
 *
 * Returns null if valid, or a field→error map if invalid.
 */
export function useValidation() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorSummary, setErrorSummary] = useState("");

  const validate = useCallback((profile: Partial<ProfileFields>): ProfileFields | null => {
    // Normalize first (website https:// prepend, country code uppercase)
    const normalized = normalizeProfileFields(profile as Record<string, unknown>) as ProfileFields;
    const errors = validateProfileFields(normalized);
    if (errors) {
      setFieldErrors(errors);
      const count = Object.keys(errors).length;
      setErrorSummary(count === 1 ? `Please fix the highlighted field.` : `Please fix the ${count} highlighted fields.`);
      return null;
    }
    setFieldErrors({});
    setErrorSummary("");
    return normalized;
  }, []);

  /** Map server Zod issues to field errors — identical format to client validation */
  const applyServerErrors = useCallback((issues: Array<{ path: (string | number)[]; message: string }>) => {
    const errors: FieldErrors = {};
    for (const issue of issues) {
      // Server path is ["profile", "fieldName"] or just ["fieldName"]
      const key = (issue.path[issue.path.length - 1]) as ProfileFieldKey;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    setFieldErrors(errors);
    setErrorSummary("Please fix the highlighted fields.");
  }, []);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setErrorSummary("");
  }, []);

  /** Clear error for a specific field when user starts typing */
  const clearFieldError = useCallback((field: ProfileFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      if (!Object.keys(next).length) setErrorSummary("");
      return next;
    });
  }, []);

  return { fieldErrors, errorSummary, validate, applyServerErrors, clearErrors, clearFieldError };
}
