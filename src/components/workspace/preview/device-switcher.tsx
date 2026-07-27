"use client";

import { memo, useState, useEffect, type ReactNode } from "react";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import type { DeviceType, CanvasBackground } from "@/types/workspace";
import { cn } from "@/lib/utils";

const BG_CLASSES: Record<CanvasBackground, string> = {
  white:   "bg-white",
  dark:    "bg-slate-900",
  grid:    "bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:24px_24px] bg-white",
  dots:    "bg-[radial-gradient(rgba(0,0,0,0.08)_1px,transparent_1px)] bg-[size:16px_16px] bg-white",
  neutral: "bg-slate-50",
};

import { Smartphone, Tablet, Monitor } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// Switcher UI — premium segmented control
// ═══════════════════════════════════════════════════════════════════════════

const DEVICES: { value: DeviceType; label: string; icon: any }[] = [
  { value: "phone", label: "Phone", icon: Smartphone },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "desktop", label: "Desktop", icon: Monitor },
];

export const DeviceSwitcherBar = memo(function DeviceSwitcherBar() {
  const deviceType = useWorkspaceStore((s) => s.deviceType);
  const setDeviceType = useWorkspaceStore((s) => s.setDeviceType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex items-center gap-2.5 h-[58px] min-w-[320px] px-2.5 rounded-full bg-white/[0.92] dark:bg-slate-900/[0.92] backdrop-blur-[18px] border border-white/70 dark:border-white/10 shadow-[0_14px_40px_rgba(0,0,0,0.1)]"
    >
      {DEVICES.map((d) => {
        const Icon = d.icon;
        const isActive = deviceType === d.value;
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => setDeviceType(d.value)}
            className={cn(
              "relative flex items-center justify-center gap-2 h-[44px] px-5 rounded-full text-[14px] font-semibold transition-colors duration-200 cursor-pointer flex-1",
              isActive 
                ? "text-white" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 dark:hover:text-white dark:hover:bg-white/5",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeDeviceTab"
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0 bg-workspace-primary rounded-full shadow-[0_2px_8px_rgba(99,102,241,0.3)] pointer-events-none"
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span>{d.label}</span>
            </span>
          </button>
        );
      })}
    </motion.div>
  );
});

import { motion } from "framer-motion";
import { AnimatedDeviceFrame } from "./device-frames";

// ═══════════════════════════════════════════════════════════════════════════
// useIsDesktop — matchMedia hook so mobile never mounts the device frame
// ═══════════════════════════════════════════════════════════════════════════

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

// ═══════════════════════════════════════════════════════════════════════════
// Preview canvas — renders the active device + background
// ═══════════════════════════════════════════════════════════════════════════

export function PreviewCanvas({ children }: { children: ReactNode }) {
  const deviceType = useWorkspaceStore((s) => s.deviceType);
  const canvasBg = useWorkspaceStore((s) => s.canvasBackground);
  const isDesktop = useIsDesktop();

  // Desktop: device frame with fixed phone/tablet/desktop bezel
  if (isDesktop) {
    return (
      <div className={cn("flex items-center justify-center w-full h-full transition-colors overflow-hidden", BG_CLASSES[canvasBg])}>
        <AnimatedDeviceFrame type={deviceType}>
          {children}
        </AnimatedDeviceFrame>
      </div>
    );
  }

  // Mobile: fluid, responsive preview — no fixed dimensions
  return (
    <div
      className="flex flex-col w-full h-full overflow-y-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="w-full flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
