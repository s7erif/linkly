"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-bg-page flex flex-col items-center justify-center p-6 text-primary-text font-sans text-center">
      <TriangleAlert className="text-red-500 text-4xl mb-4" />
      <h2 className="text-xl font-bold tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-sm text-secondary-text max-w-sm mb-6 leading-relaxed">
        We encountered an error while trying to load this digital business card.
      </p>
      <button
        onClick={() => reset()}
        className="bg-bg-elevated border border-divider hover:bg-bg-card hover:text-primary transition-colors text-primary-text rounded-xl px-6 py-3 text-sm font-bold shadow-sm active:scale-95 focus-visible:outline-2 focus-visible:outline-primary"
      >
        Try again
      </button>
    </div>
  );
}
