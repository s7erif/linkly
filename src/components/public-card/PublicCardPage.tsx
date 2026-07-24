"use client";

import { useState } from "react";
import type { BusinessCardView } from "@/components/card-renderer/types";
import { CardRenderer } from "@/components/card-renderer/CardRenderer";
import { ActionBar } from "./ActionBar";
import { QRModal } from "./QRModal";

interface PublicCardPageProps {
  card: BusinessCardView;
}

export function PublicCardPage({ card }: PublicCardPageProps) {
  const [isQROpen, setIsQROpen] = useState(false);

  console.log("[PublicCardPage] received card templateId:", card?.templateId);

  // Fallback URL for client-rendered QR
  const cardUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <CardRenderer card={card} />

      <ActionBar card={card} onQROpen={() => setIsQROpen(true)} />

      <QRModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        cardName={card.name}
        cardUrl={cardUrl}
      />
    </>
  );
}
