"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CreditCard, Link2, ShoppingBag, Sparkles } from "lucide-react";
import { Button, GlassCard, Spinner } from "@/design/components";
import { Box, Heading, Stack, Text } from "@/design/primitives";
import { hasReusableEditorSession, storeEditorSession } from "@/features/appearance/workspace-session-client";
import { buildWorkspaceBuilderPath } from "@/lib/public-links";
import { createDigitalCardAction, openCustomerCardAction, type CustomerOnboardingResult } from "./actions";
import styles from "./customer-onboarding.module.css";

type CustomerCard = { id: string; name: string; slug: string };

function useBuilderHandoff() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const finish = useCallback((result: CustomerOnboardingResult) => {
    if (!result.ok || !result.cardId || !result.slug || !result.editorToken || !result.editorExpiresAt) {
      setError(result.message);
      return;
    }
    storeEditorSession(result.cardId, result.editorToken, result.editorExpiresAt, result.slug);
    router.replace(buildWorkspaceBuilderPath(result.slug));
  }, [router]);

  const open = useCallback((card: CustomerCard) => {
    setError("");
    if (hasReusableEditorSession(card.id)) {
      router.replace(buildWorkspaceBuilderPath(card.slug));
      return;
    }
    startTransition(async () => finish(await openCustomerCardAction(card.id)));
  }, [finish, router]);

  return { error, finish, open, pending, setError, startTransition };
}

export function WorkspaceWelcome({ displayName }: { displayName: string }) {
  const { error, finish, pending, setError, startTransition } = useBuilderHandoff();

  const create = () => {
    setError("");
    startTransition(async () => finish(await createDigitalCardAction()));
  };

  return (
    <section aria-labelledby="onboarding-title" className={styles.welcome}>
      <Stack align="center" className={styles.welcomeCopy} gap="md">
        <Box aria-hidden className={styles.welcomeIcon}><Sparkles /></Box>
        <Text className={styles.eyebrow} tone="accent" variant="caption">Begin your OI journey</Text>
        <Heading id="onboarding-title" level={1} variant="display">Welcome, {displayName}</Heading>
        <Text className={styles.intro} tone="muted">Choose how you want to begin. Your first digital identity is only a moment away.</Text>
      </Stack>
      <div className={styles.choiceGrid}>
        <GlassCard className={styles.choice} level="lg">
          <Box aria-hidden className={styles.choiceIcon}><Link2 /></Box>
          <Stack gap="sm">
            <Heading level={2} variant="h3">Create Your Digital Link</Heading>
            <Text tone="muted">Create your digital profile and begin sharing it immediately.</Text>
          </Stack>
          <Button fullWidth loading={pending} loadingLabel="Creating your link" onClick={create} rightIcon={<ArrowRight />} size="lg">Create My Link</Button>
        </GlassCard>
        <GlassCard className={styles.choice} level="lg">
          <Box aria-hidden className={styles.choiceIcon}><ShoppingBag /></Box>
          <Stack gap="sm">
            <Heading level={2} variant="h3">Browse NFC Cards</Heading>
            <Text tone="muted">Discover premium NFC business cards.</Text>
          </Stack>
          <Button as="a" fullWidth href="/register" rightIcon={<ArrowRight />} size="lg">Browse Store</Button>
        </GlassCard>
      </div>
      {error ? <Text aria-live="polite" className={styles.error} role="alert" tone="danger">{error}</Text> : null}
    </section>
  );
}

export function WorkspaceCardLauncher({ cards }: { cards: readonly CustomerCard[] }) {
  const started = useRef(false);
  const { error, open, pending } = useBuilderHandoff();

  useEffect(() => {
    if (cards.length === 1 && !started.current) {
      started.current = true;
      open(cards[0]!);
    }
  }, [cards, open]);

  if (cards.length === 1) {
    return (
      <GlassCard aria-live="polite" className={styles.handoff} level="md">
        <Spinner label="Opening your Card Builder" />
        <Stack gap="xs">
          <Heading level={2} variant="title">Opening your Card Builder</Heading>
          <Text tone="muted" variant="small">{pending ? "Preparing your secure editing session…" : error || "Your card is ready."}</Text>
        </Stack>
        {error ? <Button onClick={() => open(cards[0]!)} size="sm">Try Again</Button> : null}
      </GlassCard>
    );
  }

  return (
    <section aria-labelledby="workspace-cards-title">
      <Stack gap="md">
        <Stack gap="xs">
          <Text className={styles.eyebrow} tone="accent" variant="caption">Customer Workspace</Text>
          <Heading id="workspace-cards-title" level={1} variant="h1">Choose a card</Heading>
          <Text tone="muted">Open the profile you want to manage in the Card Builder.</Text>
        </Stack>
        <div className={styles.cardGrid}>
          {cards.map((card) => (
            <GlassCard className={styles.card} key={card.id} level="md">
              <Box aria-hidden className={styles.cardIcon}><CreditCard /></Box>
              <Stack gap="xs">
                <Heading level={2} variant="title">{card.name}</Heading>
                <Text tone="muted" variant="caption">/@{card.slug}</Text>
              </Stack>
              <Button disabled={pending} onClick={() => open(card)} rightIcon={<ArrowRight />} size="sm">Open Builder</Button>
            </GlassCard>
          ))}
        </div>
        {error ? <Text aria-live="polite" className={styles.error} role="alert" tone="danger">{error}</Text> : null}
      </Stack>
    </section>
  );
}
