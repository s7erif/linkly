"use client";

import { useState } from "react";
import { Share2, Check, LinkIcon } from "lucide-react";

interface ShareButtonProps {
  cardUrl?: string;
  cardName?: string;
  className?: string;
}

export function ShareButton({ cardUrl, cardName, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const url = cardUrl || (typeof window !== "undefined" ? window.location.href : "");
  const title = cardName ? `${cardName}'s Business Card` : "Digital Business Card";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch (err) {
        // Fallback to copy if user cancels or it fails
        if ((err as Error).name !== "AbortError") {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center justify-center gap-2 p-3.5 bg-bg-elevated border border-divider rounded-2xl text-primary-text font-semibold hover:bg-bg-card hover:text-primary transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-primary ${className}`}
      aria-label="Share Card"
      title="Share Card"
    >
      {copied ? <Check className="text-emerald-500 text-lg" /> : <Share2 className="text-lg" />}
    </button>
  );
}
