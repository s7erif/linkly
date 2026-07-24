import React from "react";

export interface ActionGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function ActionGrid({ children, className = "", columns = 2 }: ActionGridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  return (
    <div className={`grid gap-3 ${colClasses[columns]} ${className}`}>
      {children}
    </div>
  );
}
