import React from "react";

export interface CardSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function CardSection({ title, children, className = "" }: CardSectionProps) {
  return (
    <section className={`w-full ${className}`}>
      {title && (
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4 px-1">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}
