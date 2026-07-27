"use client";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/design/components";
import { Stack, Text } from "@/design/primitives";
import { useLanguage } from "@/i18n/context";
import { customerLoginAction, customerRegisterAction, requestPasswordResetAction, resetPasswordAction, type AuthResult } from "./actions";

type Mode = "register" | "login" | "forgot" | "reset";
type Field = "firstName" | "lastName" | "email" | "password" | "confirmPassword";

export function CustomerAuthForm({ mode, token = "" }: { mode: Mode; token?: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pendingReview, setPendingReview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, startTransition] = useTransition();
  const clear = (field: Field) => setFieldErrors(current => ({ ...current, [field]: undefined }));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Prevent double-submission while a Server Action is in flight.
    // Without this guard, pressing Enter or clicking the button again
    // starts a second concurrent transition that duplicates requests.
    if (pending) return;
    const form = new FormData(event.currentTarget);
    if (token) form.set("token", token);
    startTransition(async () => {
      let result: AuthResult;
      if (mode === "register") result = await customerRegisterAction(form);
      else if (mode === "login") result = await customerLoginAction(form);
      else if (mode === "forgot") result = await requestPasswordResetAction(form);
      else result = await resetPasswordAction(form);
      setMessage(result.message);
      setOk(result.ok);
      setPendingReview(Boolean(result.pending));
      setFieldErrors(result.fieldErrors ?? {});
      if (result.ok && mode === "login") router.replace("/workspace");
      if (result.ok && mode === "register") router.replace("/workspace");
    });
  }
  return <form className="authForm" noValidate method="POST" onSubmit={submit}><Stack gap="md">
    {mode === "register" ? <><Input variant="glass" autoComplete="given-name" error={fieldErrors.firstName} label={t("register.firstName", "auth") || "First Name"} name="firstName" onChange={() => clear("firstName")} required/><Input variant="glass" autoComplete="family-name" error={fieldErrors.lastName} label={t("register.lastName", "auth") || "Last Name"} name="lastName" onChange={() => clear("lastName")} required/></> : null}
    <Input variant="glass" autoComplete="email" error={fieldErrors.email} label={t("login.email", "auth")} name="email" onChange={() => clear("email")} required type="email"/>
    {mode !== "forgot" ? <Input variant="glass" autoComplete={mode === "login" ? "current-password" : "new-password"} error={fieldErrors.password} helperText={mode === "register" ? t("register.passwordHint", "auth") || "Use uppercase, lowercase and a number." : undefined} label={mode === "login" ? t("login.password", "auth") : t("register.newPassword", "auth") || "New password"} minLength={8} name="password" onChange={() => clear("password")} required type="password"/> : null}
    {mode === "reset" || mode === "register" ? <Input variant="glass" autoComplete="new-password" error={fieldErrors.confirmPassword} label={t("register.confirmPassword", "auth") || "Confirm password"} minLength={8} name="confirmPassword" onChange={() => clear("confirmPassword")} required type="password"/> : null}
    {mode === "login" ? <label className="remember-me"><input name="rememberMe" type="checkbox"/> {t("login.rememberMe", "auth") || "Remember me"}</label> : null}
    {message ? <Text aria-live="polite" tone={ok || pendingReview ? "muted" : "danger"}>{message}</Text> : null}
    <Button fullWidth loading={pending} type="submit">{mode === "register" ? t("register.submit", "auth") : mode === "login" ? t("login.submit", "auth") : mode === "forgot" ? t("login.sendReset", "auth") || "Send reset link" : t("login.resetPassword", "auth") || "Reset password"}</Button>
    {mode === "login" ? <div style={{ textAlign: 'center', marginTop: '0.5rem' }}><Link href="/customer/forgot-password" className="forgot-password-link">{t("login.forgotPassword", "auth")}</Link></div> : null}
    {mode === "forgot" ? <div style={{ textAlign: 'center', marginTop: '0.5rem' }}><Link href="/login" className="forgot-password-link">{t("login.backToLogin", "auth") || "Back to Login"}</Link></div> : null}
    {mode === "reset" && ok ? <div style={{ textAlign: 'center', marginTop: '0.5rem' }}><Link href="/login" className="forgot-password-link">{t("login.backToLogin", "auth") || "Back to Login"}</Link></div> : null}
  </Stack></form>;
}
