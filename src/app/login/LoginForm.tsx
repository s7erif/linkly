"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Button, Input, Skeleton } from "@/design/components";
import { Checkbox, Form } from "@/design/forms";
import { ThemeSwitcher } from "@/design/navigation";
import { Heading, Inline, Stack, Surface, Text } from "@/design/primitives";
import styles from "./login.module.css";

const rememberedUsernameKey = "oi-admin-remembered-username";

function safeDestination(value: string | null) {
  return value?.startsWith("/admin") ? value : "/admin";
}

function LoginContent({ platformName }: { platformName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = safeDestination(searchParams.get("callbackUrl") ?? searchParams.get("next"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const remembered = localStorage.getItem(rememberedUsernameKey);
      if (remembered) queueMicrotask(() => {
        setUsername(remembered);
        setRemember(true);
      });
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setRecoveryMessage("");
    const result = await signIn("credentials", {
      callbackUrl: destination,
      password,
      redirect: false,
      username,
    });
    if (!result || result.error) {
      setError("The username or password is incorrect. Check your credentials and try again.");
      setLoading(false);
      return;
    }
    try {
      if (remember) localStorage.setItem(rememberedUsernameKey, username);
      else localStorage.removeItem(rememberedUsernameKey);
    } catch {
      // Authentication remains available when storage is unavailable.
    }
    router.replace(destination);
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <div aria-hidden className={styles.ambient} />
      <div className={styles.themeControl}><ThemeSwitcher label="Login theme" /></div>
      <Surface className={styles.shell} radius="xl" variant="elevated">
        <section className={styles.brandPanel} aria-labelledby="login-brand-title">
          <Stack className={styles.brandContent} gap="xl">
            <Inline align="center" gap="sm">
              <span aria-hidden className={styles.mark}>OI</span>
              <Text as="strong" variant="title">{platformName}</Text>
            </Inline>
            <Stack gap="md">
              <Text className={styles.eyebrow} tone="accent" variant="caption">ADMINISTRATION</Text>
              <Heading id="login-brand-title" level={1} variant="display">Operate with clarity.</Heading>
              <Text className={styles.brandDescription} tone="muted">A focused workspace for customers, orders, digital cards, and platform operations.</Text>
            </Stack>
            <Inline align="center" className={styles.trustSignal} gap="sm">
              <ShieldCheck aria-hidden />
              <Text tone="muted" variant="small">Protected administrative access</Text>
            </Inline>
          </Stack>
        </section>

        <section className={styles.formPanel} aria-labelledby="login-title">
          <Stack gap="xl">
            <Stack gap="xs">
              <Text tone="muted" variant="caption">WELCOME BACK</Text>
              <Heading id="login-title" level={2} variant="h2">Sign in to Admin</Heading>
              <Text tone="muted" variant="small">Use your administrator credentials to continue.</Text>
            </Stack>
            <Form className={styles.form} error={error || undefined} onSubmit={submit}>
              <Input autoComplete="username" autoFocus disabled={loading} label="Username" name="username" onChange={(event) => setUsername(event.currentTarget.value)} prefix={<UserRound aria-hidden />} required size="lg" value={username} />
              <Input
                autoComplete="current-password"
                disabled={loading}
                label="Password"
                name="password"
                onChange={(event) => setPassword(event.currentTarget.value)}
                prefix={<LockKeyhole aria-hidden />}
                required
                size="lg"
                suffix={<Button aria-label={passwordVisible ? "Hide password" : "Show password"} iconOnly leftIcon={passwordVisible ? <EyeOff /> : <Eye />} onClick={() => setPasswordVisible((visible) => !visible)} size="xs" type="button" variant="ghost" />}
                type={passwordVisible ? "text" : "password"}
                value={password}
              />
              <Inline align="center" className={styles.formOptions} justify="between">
                <Checkbox checked={remember} disabled={loading} label="Remember username" onCheckedChange={setRemember} />
                <button className={styles.forgot} onClick={() => setRecoveryMessage("Password recovery is not connected yet. Contact your platform administrator for access.")} type="button">Forgot password?</button>
              </Inline>
              {recoveryMessage ? <Text aria-live="polite" className={styles.recovery} role="status" tone="muted" variant="caption">{recoveryMessage}</Text> : null}
              <Button fullWidth loading={loading} loadingLabel="Signing in securely" rightIcon={<ArrowRight />} size="lg" type="submit">Sign in</Button>
            </Form>
          </Stack>
        </section>
      </Surface>
      <Text className={styles.footer} tone="subtle" variant="caption">Secure access · Session protected</Text>
    </main>
  );
}

function LoginFallback() {
  return (
    <main aria-busy="true" aria-label="Loading sign in" className={styles.page} role="status">
      <Surface className={styles.loadingPanel} radius="xl" variant="elevated">
        <Stack gap="lg"><Skeleton variant="title" /><Skeleton variant="text" /><Skeleton variant="card" /></Stack>
      </Surface>
    </main>
  );
}

export default function LoginForm({ platformName }: { platformName: string }) {
  return <Suspense fallback={<LoginFallback />}><LoginContent platformName={platformName} /></Suspense>;
}
