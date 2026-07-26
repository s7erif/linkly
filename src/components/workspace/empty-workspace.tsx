"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
// Inline SVG icons — no external icon library dependency
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createDigitalCardAction, type CustomerOnboardingResult } from "@/features/customer-onboarding/actions";
import { storeEditorSession } from "@/features/appearance/workspace-session-client";
import { buildWorkspaceBuilderPath } from "@/lib/public-links";
import { cn } from "@/lib/utils";

/**
 * Premium empty state shown when the user has no cards.
 * Allows creating a new digital card.
 */
export function EmptyWorkspace() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const createCard = () => {
    setError("");
    startTransition(async () => {
      const result: CustomerOnboardingResult = await createDigitalCardAction();
      if (!result.ok || !result.cardId || !result.slug || !result.editorToken || !result.editorExpiresAt) {
        setError(result.message);
        return;
      }
      storeEditorSession(result.cardId, result.editorToken, result.editorExpiresAt, result.slug);
      router.push(buildWorkspaceBuilderPath(result.slug));
    });
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      <motion.div
        className="flex flex-col items-center text-center max-w-md gap-8 px-8"
        initial={reduced ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-workspace-primary-muted/50 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-workspace-primary">
            <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <span className="studio-stamp">Get Started</span>
          <h2 className="text-2xl font-bold text-workspace-text-primary tracking-tight">
            Create Your First Card
          </h2>
          <p className="text-sm text-workspace-text-muted leading-relaxed max-w-sm">
            Build a stunning digital profile in under a minute. Share your card with anyone, anywhere.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-64">
          <Button
            variant="primary"
            size="lg"
            onClick={createCard}
            disabled={pending}
            className="rounded-2xl"
          >
            {pending ? "Creating…" : "Create Your First Card"}
          </Button>

          {error && (
            <p className="text-xs text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
