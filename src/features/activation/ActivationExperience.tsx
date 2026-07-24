"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogIn, UserPlus } from "lucide-react";
import { Button, Input } from "@/design/components";
import { Heading, Stack, Text } from "@/design/primitives";
import { storeEditorSession } from "@/features/appearance/workspace-session-client";
import { continueActivationAction, loginAndActivateAction, registerAndActivateAction, type CustomerActivationResult } from "@/features/activation/actions";
import { buildWorkspaceBuilderPath } from "@/lib/public-links";
import styles from "./activation.module.css";

type Field = "firstName" | "lastName" | "email" | "phone" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<Field, string>>;

function clientErrors(values: { firstName?: string; lastName?: string; email?: string; password?: string; confirmPassword?: string }, register: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (register && !values.firstName?.trim()) errors.firstName = "First name is required.";
  if (register && !values.lastName?.trim()) errors.lastName = "Last name is required.";
  if (!values.email?.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.password) errors.password = "Password is required.";
  else if (values.password.length < 8) errors.password = "Password must contain at least 8 characters.";
  if (register && values.password !== values.confirmPassword) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function ActivationExperience({ activationToken, authenticated }: { activationToken: string; authenticated: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  const clearField = (field: Field) => setFieldErrors((current) => ({ ...current, [field]: undefined }));
  const finish = (result: CustomerActivationResult) => {
    if (!result.ok || !result.cardId || !result.slug || !result.editorToken || !result.editorExpiresAt) {
      setFieldErrors(result.fieldErrors ?? {});
      setError(result.message);
      return;
    }
    storeEditorSession(result.cardId, result.editorToken, result.editorExpiresAt, result.slug);
    router.replace(buildWorkspaceBuilderPath(result.slug));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const values = {
      firstName: String(form.get("firstName") ?? ""), lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
    };
    const errors = clientErrors(values, mode === "register");
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    startTransition(async () => finish(mode === "register"
      ? await registerAndActivateAction({ activationToken, firstName: values.firstName, lastName: values.lastName, email: values.email, phone: String(form.get("phone") ?? "").trim(), password: values.password, confirmPassword: values.confirmPassword })
      : await loginAndActivateAction({ activationToken, email: values.email, password: values.password, rememberMe: form.get("rememberMe") === "on" })));
  };

  if (authenticated) {
    const activate = () => {
      setError("");
      setFieldErrors({});
      startTransition(async () => finish(await continueActivationAction(activationToken)));
    };
    return <Stack align="center" className={styles.authenticated} gap="md"><CheckCircle2 aria-hidden /><Heading level={2} variant="title">Ready to activate</Heading><Text tone="muted">Your customer session is active. Activate this card to link it to your Workspace.</Text>{error ? <p className={styles.error} role="alert">{error}</p> : null}<Button loading={pending} loadingLabel="Activating card" onClick={activate}>Activate Card</Button></Stack>;
  }

  return <Stack gap="lg"><div aria-label="Customer account option" className={styles.mode} role="tablist"><button aria-selected={mode === "register"} onClick={() => { setMode("register"); setError(""); setFieldErrors({}); }} role="tab" type="button"><UserPlus />Create account</button><button aria-selected={mode === "login"} onClick={() => { setMode("login"); setError(""); setFieldErrors({}); }} role="tab" type="button"><LogIn />Sign in</button></div><form className={styles.form} noValidate onSubmit={submit}>{mode === "register" ? <><Input autoComplete="given-name" error={fieldErrors.firstName} label="First Name" name="firstName" onChange={() => clearField("firstName")} required /><Input autoComplete="family-name" error={fieldErrors.lastName} label="Last Name" name="lastName" onChange={() => clearField("lastName")} required /></> : null}<Input autoComplete="email" error={fieldErrors.email} label="Email" name="email" onChange={() => clearField("email")} required type="email" />{mode === "register" ? <Input autoComplete="tel" error={fieldErrors.phone} label="Phone (optional)" name="phone" onChange={() => clearField("phone")} type="tel" /> : null}<Input autoComplete={mode === "register" ? "new-password" : "current-password"} error={fieldErrors.password} helperText={mode === "register" ? "Use at least 8 characters." : undefined} label="Password" minLength={8} name="password" onChange={() => clearField("password")} required type="password" />{mode === "register" ? <Input autoComplete="new-password" error={fieldErrors.confirmPassword} label="Confirm Password" name="confirmPassword" onChange={() => clearField("confirmPassword")} required type="password" /> : null}{mode === "login" ? <label><input name="rememberMe" type="checkbox" /> Remember me</label> : null}{error && !Object.keys(fieldErrors).length ? <p className={styles.error} role="alert">{error}</p> : null}<Button fullWidth loading={pending} loadingLabel="Activating card" type="submit">{mode === "register" ? "Create Account & Activate" : "Sign In & Activate"}</Button></form></Stack>;
}
