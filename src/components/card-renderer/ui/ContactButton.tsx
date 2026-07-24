import React from "react";

export interface ContactButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  value?: string;
  className?: string;
}

export function ContactButton({ href, icon, label, value, className = "" }: ContactButtonProps) {
  const isExternal = href.startsWith("http");
  
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${className}`}
      aria-label={label}
    >
      <div className="shrink-0 text-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col text-left overflow-hidden w-full">
        <span className="text-xs uppercase tracking-wider opacity-70 font-medium">{label}</span>
        {value && <span className="text-sm font-semibold truncate">{value}</span>}
      </div>
    </a>
  );
}
