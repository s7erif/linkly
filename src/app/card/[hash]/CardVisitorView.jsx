"use client";

import { useState } from "react";
import { generateCardDocument } from "@/lib/templates";
import { X, QrCode, Share2, Copy, Check } from "lucide-react";
import { ThemeRegistry } from "@/components/card-renderer/ThemeRegistry";
import { CardRenderer } from "@/components/card-renderer/CardRenderer";

export function CardVisitorView({ card }) {
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.href : ""
  )}`;

  const themeId = (card.templateId || "default").toLowerCase();
  const hasReactTheme = themeId in ThemeRegistry && themeId !== "default";

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans relative overflow-hidden h-full min-h-screen">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.15),rgba(255,255,255,0))] z-0"></div>

      {/* Main View Area: Render Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative">
        
        {/* Top Control Bar */}
        <div className="w-full max-w-md flex items-center justify-between mb-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-3 rounded-2xl">
          <span className="text-xs font-bold text-slate-400">Digital Business Card</span>
          <div className="flex gap-2">
            <button
              onClick={() => setQrOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl p-2.5 text-sm flex items-center justify-center active:scale-95 transition-all"
              title="Show QR Code"
            >
              <QrCode />
            </button>
            <button
              onClick={handleCopyLink}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl p-2.5 text-sm flex items-center justify-center active:scale-95 transition-all"
              title="Copy URL Link"
            >
              {copied ? <Check className="text-emerald-500" /> : <Share2 />}
            </button>
          </div>
        </div>

        {/* Mobile Device Frame */}
        <div className="w-full max-w-md aspect-[9/16] max-h-[680px] bg-slate-900 rounded-[36px] border-8 border-slate-800 shadow-2xl relative flex flex-col overflow-hidden">
          {hasReactTheme ? (
            <CardRenderer card={card} />
          ) : (
            <iframe
              title="Business Card"
              className="w-full h-full border-none bg-slate-900"
              srcDoc={generateCardDocument(card)}
              sandbox="allow-scripts"
            />
          )}
        </div>
      </div>

      {/* QR Code Sharing Overlay Dialog */}
      {qrOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center relative animate-zoom-in">
            <button
              onClick={() => setQrOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Scan QR Code</h3>
            <p className="text-xs text-slate-400 mb-6">Scan this QR code to view this digital card on your mobile phone</p>

            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="Card QR Code" className="w-48 h-48" />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="text-emerald-500" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy />
                    <span>Copy Card Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
