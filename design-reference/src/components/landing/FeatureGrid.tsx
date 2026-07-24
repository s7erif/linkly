import { motion } from "framer-motion";
import { User, Wifi, QrCode, BarChart3, Folder, Contact, Palette, Link2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Motion";

const features: { icon: LucideIcon; label: string }[] = [
  { icon: User, label: "Public Profile" },
  { icon: Wifi, label: "NFC Sharing" },
  { icon: QrCode, label: "QR Code" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Folder, label: "Portfolio" },
  { icon: Contact, label: "Contacts" },
  { icon: Palette, label: "Themes" },
  { icon: Link2, label: "Social Links" },
];

export function FeatureGrid() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
      <Reveal className="text-center">
        <h2 className="font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground sm:text-[46px]">
          Everything you need.
          <br />
          Nothing you don&apos;t.
        </h2>
      </Reveal>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
        className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {features.map((f) => (
          <motion.div
            key={f.label}
            variants={{
              hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] } },
            }}
            className="feature-card feature-card-hover group relative flex aspect-[1.15/1] flex-col items-center justify-center gap-3 rounded-2xl p-6 text-center"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-white/70 shadow-sm transition-transform duration-500 group-hover:scale-105">
              <f.icon className="h-4 w-4 text-foreground/80" />
            </div>
            <span className="text-[13px] font-medium text-foreground/80">{f.label}</span>
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(140deg, rgba(255,255,255,0.65) 0%, transparent 40%)" }} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
