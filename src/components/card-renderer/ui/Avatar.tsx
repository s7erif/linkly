import React from "react";

export interface AvatarProps {
  src?: string | null;
  fallback: string;
  className?: string;
  alt?: string;
}

export function Avatar({ src, fallback, className = "", alt = "Avatar" }: AvatarProps) {
  const baseClasses =
    "relative flex shrink-0 overflow-hidden items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold";
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
      ) : (
        <span className="uppercase tracking-widest">{fallback.charAt(0)}</span>
      )}
    </div>
  );
}
