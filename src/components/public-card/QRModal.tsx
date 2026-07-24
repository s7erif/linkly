"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { slideUp, fadeIn } from "@/lib/motionVariants";
import QRCode from "qrcode/lib/browser";
import { FaTimes, FaCopy, FaCheck } from "react-icons/fa";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardName: string;
  cardUrl: string;
}

export function QRModal({ isOpen, onClose, cardName, cardUrl }: QRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && cardUrl) {
      const canvas = document.createElement("canvas");
      QRCode.toCanvas(canvas, cardUrl, {
        width: 280,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      })
        .then(() => setQrDataUrl(canvas.toDataURL("image/png")))
        .catch(() => setQrDataUrl(""));
    }
  }, [isOpen, cardUrl]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cardUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cardUrl]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="QR Code"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-sm mx-4 sm:mx-auto bg-bg-card border border-divider rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-elevated text-secondary-text hover:text-primary-text flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Close QR code modal"
            >
              <FaTimes size={14} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-sm font-bold text-primary-text uppercase tracking-wider">
                QR Code
              </h3>
              <p className="text-xs text-secondary-text mt-1">
                Scan to view {cardName}&rsquo;s card
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${cardName}`}
                    className="w-52 h-52"
                    width={208}
                    height={208}
                  />
                ) : (
                  <div className="w-52 h-52 bg-slate-100 rounded-xl animate-pulse" />
                )}
              </div>
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-bg-elevated border border-divider text-sm font-semibold text-primary-text hover:bg-bg-card-hover transition-colors active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-primary"
            >
              {copied ? (
                <>
                  <FaCheck className="text-emerald-500" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <FaCopy className="text-secondary-text" />
                  <span>Copy Card Link</span>
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
