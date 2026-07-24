import { motion } from "framer-motion";
import { UserPlus, CheckCircle2, CreditCard, Briefcase, Power, Share2 } from "lucide-react";
import { Reveal } from "./Motion";
import type { LucideIcon } from "lucide-react";

type Step = { icon: LucideIcon; label: string };

function StepRow({ steps }: { steps: Step[] }) {
  return (
    <div className="mt-6 flex items-start justify-between gap-2">
      {steps.map((s, i) => (
        <div key={s.label} className="flex flex-1 items-start">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.22, 0.61, 0.36, 1] }}
            className="flex flex-col items-center gap-2"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-white/70 text-foreground/70 shadow-sm">
              <s.icon className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-foreground/70">{s.label}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <div className="relative mt-4 h-px flex-1 bg-border/70">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.15 * i + 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                style={{ transformOrigin: "left center" }}
                className="absolute inset-0 bg-gradient-to-r from-indigo-300/60 via-sky-300/60 to-transparent"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function EverythingCards() {
  const digital: Step[] = [
    { icon: UserPlus, label: "Register" },
    { icon: CheckCircle2, label: "Choose Plan" },
    { icon: CreditCard, label: "Payment" },
    { icon: Briefcase, label: "Workspace" },
  ];
  const nfc: Step[] = [
    { icon: Power, label: "Activate" },
    { icon: Briefcase, label: "Workspace" },
    { icon: Share2, label: "Share" },
  ];

  return (
    <section id="features" className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-28">
      <Reveal className="text-center">
        <h2 className="font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground sm:text-[46px]">
          Everything you need.
          <br />
          Nothing you don&apos;t.
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Reveal delay={0.05}>
          <div className="feature-card feature-card-hover rounded-3xl p-7">
            <div className="text-[17px] font-semibold tracking-tight text-foreground">Digital</div>
            <StepRow steps={digital} />
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="feature-card feature-card-hover rounded-3xl p-7">
            <div className="text-[17px] font-semibold tracking-tight text-foreground">NFC Card</div>
            <StepRow steps={nfc} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
