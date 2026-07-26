"use client";

import { useState, type ReactNode, type HTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InspectorSettingRowProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value?: ReactNode;
  icon?: ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export function InspectorSettingRow({
  title,
  value,
  icon,
  expandable = false,
  defaultExpanded = false,
  onClick,
  children,
  className,
  ...props
}: InspectorSettingRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isInteractive = !!onClick || expandable;

  const handleClick = () => {
    if (onClick) onClick();
    if (expandable) setExpanded((prev) => !prev);
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div
        role={isInteractive ? "button" : "presentation"}
        onClick={isInteractive ? handleClick : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-fast text-left group",
          isInteractive ? "hover:bg-workspace-surface-dim hover:scale-[0.99] active:scale-[0.98] cursor-pointer" : "cursor-default"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-workspace-text-muted">{icon}</span>}
          <span className="text-sm font-semibold text-workspace-text-primary">
            {title}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {value && (
            <span className="text-[11px] font-medium text-workspace-text-muted group-hover:text-workspace-text-primary transition-colors line-clamp-1 max-w-[120px] text-right">
              {value}
            </span>
          )}
          
          {isInteractive && (
            <motion.div
              animate={{ rotate: expanded && expandable ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-workspace-text-muted/50 group-hover:text-workspace-text-muted shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.div>
          )}
        </div>
      </div>

      {expandable && children && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 pt-1">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
