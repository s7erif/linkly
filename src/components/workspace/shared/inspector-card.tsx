"use client";

import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";

import type { HTMLMotionProps } from "framer-motion";

export interface InspectorCardProps extends Omit<HTMLMotionProps<"div">, "title" | "children" | "summary" | "defaultExpanded"> {
  title: string;
  icon?: ReactNode;
  description?: string;
  summary?: ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
  delay?: number; // for stagger
  children?: ReactNode;
}

export const InspectorCard = forwardRef<HTMLDivElement, InspectorCardProps>(
  (
    {
      title,
      icon,
      description,
      summary,
      defaultExpanded = false,
      badge,
      delay = 0,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "bg-white rounded-[20px] border border-workspace-outline/30 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden transition-colors duration-normal flex flex-col",
          className,
        )}
        {...props}
      >
        {/* Header (Clickable) */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex items-start gap-4 p-5 text-left hover:bg-workspace-surface-dim/40 transition-colors group cursor-pointer"
          aria-expanded={expanded}
        >
          {icon && (
            <span className="shrink-0 text-workspace-text-muted mt-0.5">{icon}</span>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-workspace-text-primary tracking-tight">
                {title}
              </h4>
              {badge && (
                <span className="studio-stamp">{badge}</span>
              )}
            </div>
            
            {description && (
              <p className="text-xs text-workspace-text-muted mt-1 leading-relaxed">
                {description}
              </p>
            )}

            {/* Summary (Only shown when collapsed) */}
            <AnimatePresence initial={false}>
              {!expanded && summary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-3"
                >
                  <div className="text-xs text-workspace-text-muted font-medium space-y-1">
                    {summary}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="shrink-0 pt-0.5">
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-workspace-surface-dim group-hover:bg-workspace-outline/20 text-workspace-text-muted transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
        </button>

        {/* Expandable Content Area */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="p-5 pt-0">
                <div className="h-px w-full bg-workspace-outline/20 mb-4" />
                <div className="flex flex-col gap-1">
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

InspectorCard.displayName = "InspectorCard";

