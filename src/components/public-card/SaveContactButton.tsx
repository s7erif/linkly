"use client";

import { UserPlus } from "lucide-react";
import { downloadVCard } from "@/lib/vcf";
import type { BusinessCardView } from "@/components/card-renderer/types";

interface SaveContactButtonProps {
  card: BusinessCardView;
  className?: string;
}

export function SaveContactButton({ card, className = "" }: SaveContactButtonProps) {
  const handleSave = () => {
    downloadVCard(card);
  };

  return (
    <button
      onClick={handleSave}
      className={`flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-btn-text font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-primary ${className}`}
      aria-label="Save Contact"
    >
      <UserPlus className="text-lg" />
      <span>Save Contact</span>
    </button>
  );
}
