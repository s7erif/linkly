"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motionVariants";
import type { BusinessCardView } from "@/components/card-renderer/types";
import { SaveContactButton } from "./SaveContactButton";
import { ShareButton } from "./ShareButton";
import { QrCode, Ellipsis } from "lucide-react";

interface ActionBarProps {
  card: BusinessCardView;
  onQROpen: () => void;
}

export function ActionBar({ card, onQROpen }: ActionBarProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="fixed bottom-6 left-0 right-0 px-4 z-40 pointer-events-none flex justify-center"
    >
      <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-3xl bg-bg-card/80 backdrop-blur-xl border border-divider shadow-2xl shadow-black/20">
        <SaveContactButton card={card} className="flex-1 min-w-[160px]" />
        
        <ShareButton cardName={card.name} />
        
        <button
          onClick={onQROpen}
          className="flex items-center justify-center p-3.5 bg-bg-elevated border border-divider rounded-2xl text-primary-text font-semibold hover:bg-bg-card hover:text-primary transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="Show QR Code"
          title="Show QR Code"
        >
          <QrCode className="text-lg" />
        </button>

        <button
          className="flex items-center justify-center p-3.5 bg-bg-elevated border border-divider rounded-2xl text-secondary-text font-semibold hover:bg-bg-card hover:text-primary-text transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-primary"
          aria-label="More Options"
          title="More Options"
        >
          <Ellipsis className="text-lg" />
        </button>
      </div>
    </motion.div>
  );
}
