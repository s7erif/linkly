import React from "react";

export interface FooterBrandProps {
  companyName?: string;
  logoSrc?: string;
  poweredByText?: string;
  className?: string;
}

export function FooterBrand({
  companyName = "Platform",
  logoSrc,
  poweredByText = "Powered by",
  className = "",
}: FooterBrandProps) {
  return (
    <footer className={`flex flex-col items-center justify-center p-8 text-center opacity-70 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wider mb-2">{poweredByText}</p>
      {logoSrc ? (
        <img src={logoSrc} alt={companyName} className="h-6 object-contain" />
      ) : (
        <span className="font-bold text-sm tracking-tight">{companyName}</span>
      )}
    </footer>
  );
}
