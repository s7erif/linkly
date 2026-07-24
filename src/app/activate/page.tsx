import { redirect } from "next/navigation";
import { Button, Card, Input } from "@/design/components";
import { Heading, Stack, Text } from "@/design/primitives";
import { buildActivationPath } from "@/lib/public-links";
import styles from "@/features/activation/activation.module.css";
export const metadata = { title: "Activate your NFC card" };
export default async function ActivatePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token?.trim().toUpperCase();
  if (token) redirect(buildActivationPath(token));
  return <main className={styles.page}><Card className={styles.card} variant="elevated"><Stack gap="lg"><Stack align="center" gap="sm"><Text tone="accent" variant="caption">NFC activation</Text><Heading level={1} variant="h1">Activate your card</Heading><Text className={styles.intro} tone="muted">Tap your NFC card again or enter the activation token supplied with it.</Text></Stack><form className={styles.form}><Input autoComplete="off" label="Activation token" maxLength={10} minLength={8} name="token" required/><Button fullWidth type="submit">Continue</Button></form></Stack></Card></main>;
}
