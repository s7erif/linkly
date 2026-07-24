import React from "react";

export interface SocialButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function SocialButton({ href, icon, label, className = "" }: SocialButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center w-12 h-12 rounded-full transition-transform hover:scale-110 active:scale-95 ${className}`}
      aria-label={label}
      title={label}
    >
      {icon}
    </a>
  );
}
