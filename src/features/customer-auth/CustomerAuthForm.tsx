"use client";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
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
    {(mode === "login" || mode === "register") ? (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--oi-border-soft, #e4e4e7)" }} />
          <Text tone="muted" variant="caption">or continue with</Text>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--oi-border-soft, #e4e4e7)" }} />
        </div>
        <Button fullWidth onClick={() => signIn("google", { callbackUrl: "/workspace" })} type="button" variant="secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }} aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button>
      </>
    ) : null}
    {mode === "login" ? <><Button as="a" href="/customer/forgot-password" variant="link">Forgot password?</Button><Text tone="muted">Don&apos;t have an account? <Link href="/register">Create Account</Link></Text></> : null}
    {mode === "register" ? <Text tone="muted">Already have an account? <Link href="/login">Sign in</Link></Text> : null}
    {mode === "forgot" ? <Text tone="muted"><Link href="/login">Back to Login</Link></Text> : null}
    {mode === "reset" && ok ? <Text tone="muted"><Link href="/login">Back to Login</Link></Text> : null}
  </Stack></form>;
}
