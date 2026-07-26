"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import type { DeviceType } from "@/types/workspace";
import { PhoneOuterChrome, PhoneInnerChrome } from "./phone-chrome";
import { DesktopOuterChrome } from "./desktop-chrome";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// Device frame geometries & styling
// ═══════════════════════════════════════════════════════════════════════════

const SPECS = {
  phone: {
    width: 340,
    height: 736,
    outerRadius: 48,
    innerRadius: 40,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    outerBg: "linear-gradient(150deg, #323237 0%, #1e1e22 35%, #161619 70%, #28282d 100%)",
    innerBg: "#000000",
    outerShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.15), 0 20px 40px -10px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.12), inset 0 -1px 1px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    innerShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 0 12px rgba(0, 0, 0, 0.3)"
  },
  tablet: {
    width: 520,
    height: 694,
    outerRadius: 32,
    innerRadius: 24,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
    outerBg: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.85) 100%)",
    innerBg: "#ffffff",
    outerShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.15), 0 20px 40px -10px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 1), 0 0 0 1px rgba(0, 0, 0, 0.06)",
    innerShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.05)"
  },
  desktop: {
    width: 720,
    height: 480,
    outerRadius: 12,
    innerRadius: 0, // Gets clipped by outer frame or is 0
    paddingTop: 42,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    outerBg: "#ffffff",
    innerBg: "#ffffff", // Can use bg-white dark:bg-black for content, but we animate this
    outerShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.15), 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
    innerShadow: "none"
  }
};

const TRANSITION = { duration: 0.22, ease: "easeOut" } satisfies Transition;

export function AnimatedDeviceFrame({ type, children }: { type: DeviceType; children: ReactNode }) {
  const storeZoom = useWorkspaceStore((s) => s.zoom);
  const spec = SPECS[type];
  
  // Calculate fit zoom if needed. We assume zoom is a number, but handling 'fit' just in case.
  const [fitScale, setFitScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFit = storeZoom === ("fit" as any);
  const scale = isFit ? fitScale : Number(storeZoom);

  useEffect(() => {
    if (!isFit || !containerRef.current) return;
    const calc = () => {
      const parent = containerRef.current?.parentElement;
      if (!parent) return;
      const cw = parent.clientWidth - 40;
      const ch = parent.clientHeight - 40;
      const sx = cw / spec.width;
      const sy = ch / spec.height;
      setFitScale(Math.min(sx, sy, 1.1));
    };
    calc();
    const obs = new ResizeObserver(calc);
    if (containerRef.current?.parentElement) {
      obs.observe(containerRef.current.parentElement);
    }
    return () => obs.disconnect();
  }, [isFit, spec.width, spec.height]);

  const isPhone = type === "phone";
  const isDesktop = type === "desktop";

  return (
    <div ref={containerRef} className="flex items-center justify-center w-full h-full min-h-0 select-none overflow-hidden mt-6 mb-16">
      <motion.div
        layout
        initial={false}
        animate={{
          width: spec.width,
          height: spec.height,
          borderRadius: spec.outerRadius,
          background: spec.outerBg,
          paddingTop: spec.paddingTop,
          paddingBottom: spec.paddingBottom,
          paddingLeft: spec.paddingLeft,
          paddingRight: spec.paddingRight,
          boxShadow: spec.outerShadow,
          scale,
        }}
        transition={TRANSITION}
        className="relative shrink-0 flex flex-col"
        style={{ transformOrigin: "center center" }}
      >
        {/* Outer Overlays */}
        <AnimatePresence>
          {isPhone && <PhoneOuterChrome key="phone-outer" />}
          {isDesktop && <DesktopOuterChrome key="desktop-outer" />}
        </AnimatePresence>

        {/* Inner Screen */}
        <motion.div
          layout
          initial={false}
          animate={{
            borderRadius: spec.innerRadius,
            background: spec.innerBg,
            boxShadow: spec.innerShadow,
          }}
          transition={TRANSITION}
          className="relative w-full h-full overflow-hidden flex flex-col z-10"
        >
          {/* Inner Overlays */}
          <AnimatePresence>
            {isPhone && <PhoneInnerChrome key="phone-inner" />}
          </AnimatePresence>

          {/* Persistent Content Wrapper */}
          <div className="absolute inset-0 z-0 flex flex-col">
            <div className={cn(
              "flex-1 overflow-y-auto workspace-scrollbar z-0 flex flex-col [&>div]:min-h-full [&>div]:w-full [&>div]:flex [&>div]:flex-col [&>div>div]:min-h-full [&>div>div]:w-full [&>div>div]:flex [&>div>div]:flex-col [&>div>div>div]:min-h-full [&>div>div>div]:w-full [&>div>div>div]:flex [&>div>div>div]:flex-col",
              isDesktop && "bg-white dark:bg-black" // Desktop specific inner bg content rule
            )}>
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
