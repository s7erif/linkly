import React from "react";

export interface CoverImageProps {
  src?: string | null;
  fallbackClass?: string;
  className?: string;
}

export function CoverImage({ src, fallbackClass = "bg-slate-200", className = "" }: CoverImageProps) {
  const baseClasses = "w-full h-32 md:h-48 overflow-hidden object-cover";
  
  if (src) {
    return <img src={src} alt="Cover" className={`${baseClasses} ${className}`} />;
  }
  
  return <div className={`${baseClasses} ${fallbackClass} ${className}`} aria-hidden="true" />;
}
