import React from "react";

export interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContainer({ children, className = "" }: CardContainerProps) {
  return (
    <div className={`w-full max-w-md mx-auto overflow-hidden relative ${className}`}>
      {children}
    </div>
  );
}
