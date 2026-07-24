import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { User, Bell, Check } from "lucide-react";

/**
 * Phone + NFC card floating composition. Pure CSS/SVG mock — no external assets.
 * Includes mouse parallax when hovering the hero.
 */
export function PhoneNFC({ parallaxX, parallaxY }: { parallaxX: any; parallaxY: any }) {
  return (
    <div className="relative mx-auto h-[520px] w-full max-w-[520px]">
      {/* soft glow behind */}
      <div className="pointer-events-none absolute inset-0 -z-10 blur-3xl">
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.9_0.09_260/0.9),transparent_60%)]" />
      </div>

      {/* NFC card */}
      <motion.div
        style={{ x: useTransform(parallaxX, (v: number) => v * -0.6), y: useTransform(parallaxY, (v: number) => v * -0.6) }}
        className="absolute right-[6%] top-[22%] z-0"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [8, 10, 8] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
          className="relative h-[290px] w-[186px] rounded-[22px] bg-gradient-to-br from-[#141414] via-[#1c1c1c] to-[#0a0a0a] shadow-[0_40px_60px_-20px_rgba(20,20,40,0.45)] ring-1 ring-white/5"
        >
          <div className="absolute right-4 top-4 h-8 w-8 rounded-full border border-white/15 opacity-70" />
          <div className="absolute right-6 top-6 h-4 w-4 rounded-full border border-white/25" />
          <div className="absolute bottom-5 left-5 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-white/70">
            <span className="grid h-4 w-4 place-items-center rounded-sm bg-white/10 text-[9px]">T</span>
          </div>
          <div className="absolute inset-0 rounded-[22px] bg-[linear-gradient(140deg,transparent_35%,rgba(255,255,255,0.08)_50%,transparent_65%)]" />
        </motion.div>
      </motion.div>

      {/* Phone */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute left-1/2 top-0 z-10 -translate-x-[58%]"
      >
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          className="relative h-[460px] w-[228px] rounded-[42px] bg-gradient-to-br from-[#e9ebef] via-[#f6f7fa] to-[#d9dde3] p-[6px] shadow-[0_50px_80px_-30px_rgba(30,40,80,0.35)]"
        >
          <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-white">
            {/* dynamic island */}
            <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
            {/* status bar */}
            <div className="flex items-center justify-between px-5 pt-3 text-[10px] font-semibold text-foreground/70">
              <span>9:41</span>
              <span className="opacity-0">.</span>
            </div>
            {/* profile */}
            <div className="mt-5 flex flex-col items-center">
              <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 ring-2 ring-white shadow-md">
                <User className="h-7 w-7 text-indigo-500" />
              </div>
              <div className="mt-2 text-[13px] font-semibold text-foreground">Tappy Profile</div>
              <div className="mt-3 flex items-center gap-2">
                <button className="rounded-full bg-foreground px-3 py-1 text-[10px] font-medium text-background">Save</button>
                <button className="rounded-full border border-border bg-white px-3 py-1 text-[10px] font-medium text-foreground/70">Share</button>
              </div>
            </div>
            {/* list */}
            <div className="mt-5 space-y-2 px-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-border/60 bg-white px-3 py-2">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-secondary">
                    {i === 0 ? <Check className="h-3 w-3 text-emerald-500" /> : <Bell className="h-3 w-3 text-foreground/50" />}
                  </div>
                  <div className="h-1.5 flex-1 rounded-full bg-secondary" />
                </div>
              ))}
            </div>
            {/* home indicator */}
            <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-foreground/60" />
            {/* glass reflection */}
            <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-[linear-gradient(135deg,rgba(255,255,255,0.6)_0%,transparent_30%)]" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function useMouseParallax() {
  const ref = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const y = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      mx.set(((e.clientX - cx) / r.width) * 18);
      my.set(((e.clientY - cy) / r.height) * 18);
    };
    const onLeave = () => { mx.set(0); my.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [mx, my]);

  return { ref, x, y };
}
