import React from "react";
import { BusinessCardView } from "./types";

export function BaseCard({ card }: { card: BusinessCardView }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-100 min-h-screen font-sans">
      <div className="max-w-md w-full bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-200">
        <div className="p-8 text-center relative">
          <div className="flex justify-center mb-6">
            {card.avatar ? (
              <img
                src={card.avatar}
                alt={card.name || "Avatar"}
                className="w-28 h-28 mx-auto rounded-full object-cover shadow-md border-4 border-slate-50"
              />
            ) : (
              <div className="w-28 h-28 mx-auto rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-3xl font-bold shadow-inner">
                {(card.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {card.name}
          </h1>
          <p className="text-sm font-semibold text-violet-600 mt-1 uppercase tracking-wider">
            {card.title}
          </p>
          <p className="text-sm text-slate-500 mt-1">{card.company}</p>

          {card.bio && (
            <p className="mt-6 text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">
              {card.bio}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {card.phone && (
              <a
                href={`tel:${card.phone}`}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                📞 {card.phone}
              </a>
            )}
            {card.email && (
              <a
                href={`mailto:${card.email}`}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                ✉️ {card.email}
              </a>
            )}
            {card.website && (
              <a
                href={card.website}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                🌐 {card.website}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
