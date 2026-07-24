"use client";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/design/components";
import { Stack, Text } from "@/design/primitives";
import { customerLoginAction, customerRegisterAction, requestPasswordResetAction, resetPasswordAction, type AuthResult } from "./actions";

type Mode = "register" | "login" | "forgot" | "reset";
type Field = "firstName" | "lastName" | "email" | "password" | "confirmPassword";

export function CustomerAuthForm({ mode, token = "" }: { mode: Mode; token?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pendingReview, setPendingReview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, startTransition] = useTransition();
  const clear = (field: Field) => setFieldErrors(current => ({ ...current, [field]: undefined }));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      if (result.ok && mode === "login") router.replace(result.showWelcome ? "/welcome" : "/workspace");
      if (result.ok && mode === "register") router.replace("/workspace");
    });
  }
  return <form noValidate onSubmit={submit}><Stack gap="md">
    {mode === "register" ? <><Input autoComplete="given-name" error={fieldErrors.firstName} label="First Name" name="firstName" onChange={() => clear("firstName")} required/><Input autoComplete="family-name" error={fieldErrors.lastName} label="Last Name" name="lastName" onChange={() => clear("lastName")} required/></> : null}
    <Input autoComplete="email" error={fieldErrors.email} label="Email" name="email" onChange={() => clear("email")} required type="email"/>
    {mode !== "forgot" ? <Input autoComplete={mode === "login" ? "current-password" : "new-password"} error={fieldErrors.password} helperText={mode === "register" ? "Use uppercase, lowercase and a number." : undefined} label={mode === "login" ? "Password" : "New password"} minLength={8} name="password" onChange={() => clear("password")} required type="password"/> : null}
    {mode === "reset" || mode === "register" ? <Input autoComplete="new-password" error={fieldErrors.confirmPassword} label="Confirm password" minLength={8} name="confirmPassword" onChange={() => clear("confirmPassword")} required type="password"/> : null}
    {mode === "login" ? <label><input name="rememberMe" type="checkbox"/> Remember me</label> : null}
    {message ? <Text aria-live="polite" tone={ok || pendingReview ? "muted" : "danger"}>{message}</Text> : null}
    <Button fullWidth loading={pending} type="submit">{mode === "register" ? "Create account" : mode === "login" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Reset password"}</Button>
    {mode === "login" ? <><Button as="a" href="/customer/forgot-password" variant="link">Forgot password?</Button><Text tone="muted">Don&apos;t have an account? <Link href="/register">Create Account</Link></Text></> : null}
    {mode === "register" ? <Text tone="muted">Already have an account? <Link href="/customer/login">Sign in</Link></Text> : null}
    {mode === "forgot" ? <Text tone="muted"><Link href="/customer/login">Back to Login</Link></Text> : null}
    {mode === "reset" && ok ? <Text tone="muted"><Link href="/customer/login">Back to Login</Link></Text> : null}
  </Stack></form>;
}
