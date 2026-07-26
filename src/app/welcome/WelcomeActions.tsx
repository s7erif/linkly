"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markWelcomeSeen } from "@/features/customer-auth/welcome-actions";
import styles from "./welcome.module.css";

export function WelcomeActions({ startHref, workspaceHref }: { startHref: string; workspaceHref: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(href: string) {
    startTransition(async () => {
      await markWelcomeSeen();
      router.push(href);
    });
  }

  return (
    <>
      <button className={styles.start} disabled={pending} onClick={() => navigate(startHref)} type="button">
        Start Building →
      </button>
      <button className={styles.secondary} disabled={pending} onClick={() => navigate(workspaceHref)} type="button">
        Go to Workspace
      </button>
    </>
  );
}
