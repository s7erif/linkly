import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { RadioTower } from "lucide-react";
import { GlassCard } from "@/design/components";
import { Box, Heading, Stack, Text } from "@/design/primitives";
import { ActivationExperience } from "@/features/activation/ActivationExperience";
import { getActivationService } from "@/lib/composition-root";
import { buildProfileUrl } from "@/lib/public-links";
import styles from "@/features/activation/activation.module.css";

export const metadata = { title: "Activate Your Card", robots: { index: false, follow: false } };

export default async function ShortActivationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const service = getActivationService();
  let card;
  try { card = await service.validate(token); } catch { notFound(); }
  if (!card) notFound();
  if (card.status === "ACTIVATED") {
    // The NFC URL (/a/{token}) is permanent. Once a card is activated, this route
    // only resolves the linked workspace/card and 302-redirects to the canonical
    // public profile (/@username) — it never shows the activation page again.
    if (card.workspaceSlug) redirect(buildProfileUrl(card.workspaceSlug));
    redirect("/workspace");
  }
  if (card.status !== "AVAILABLE" && card.status !== "RESERVED") notFound();

  const session = (await cookies()).get("oi_customer_session")?.value;
  const account = session ? await service.accountForSession(session) : null;

  return (
    <main className={styles.page}>
      <GlassCard className={styles.card} level="lg">
        <Stack gap="xl">
          <Stack align="center" className={styles.hero} gap="sm">
            <Box aria-hidden className={styles.icon}><RadioTower /></Box>
            <Text className={styles.eyebrow} tone="accent" variant="caption">OI NFC activation</Text>
            <Heading level={1} variant="display">Make this card yours.</Heading>
            <Text className={styles.intro} tone="muted">Securely connect your NFC card to your account, then continue to the Card Builder to make it yours.</Text>
          </Stack>
          <ol aria-label="Activation progress" className={styles.steps}>
            <li aria-current="step"><span>1</span><small>Account</small></li>
            <li><span>2</span><small>Activate</small></li>
            <li><span>3</span><small>Builder</small></li>
          </ol>
          <ActivationExperience activationToken={token.toUpperCase()} authenticated={Boolean(account)} />
        </Stack>
      </GlassCard>
    </main>
  );
}
