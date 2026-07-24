import { motion } from "framer-motion";
import { UserPlus, CheckCircle2, CreditCard, Briefcase, User, Bell, Check } from "lucide-react";
import { Reveal } from "./Motion";

const steps = [
  { icon: UserPlus, label: "Register" },
  { icon: CheckCircle2, label: "Choose Plan" },
  { icon: CreditCard, label: "Payment" },
  { icon: Briefcase, label: "Workspace" },
];

export function Timeline() {
  return (
    <section id="how" className="relative mx-auto w-full max-w-6xl px-6 py-8 sm:px-10">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div>
            <h3 className="text-[22px] font-semibold tracking-tight text-foreground">Digital</h3>
            <div className="mt-6 flex items-start justify-between gap-2">
              {steps.map((s, i) => (
                <div key={s.label} className="flex flex-1 items-start">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.22, 0.61, 0.36, 1] }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-white/80 text-foreground/70 shadow-sm">
                      <s.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-medium text-foreground/70">{s.label}</span>
                  </motion.div>
                  {i < steps.length - 1 && (
                    <div className="relative mt-5 h-px flex-1 bg-border/70">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.15 * i + 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                        style={{ transformOrigin: "left center" }}
                        className="absolute inset-0 bg-gradient-to-r from-indigo-300/70 via-sky-300/70 to-transparent"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mx-auto h-[380px] w-full max-w-[420px]">
            {/* floating side chips */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-2 top-6 rounded-xl border border-border/70 bg-white/80 p-2 shadow-md backdrop-blur"
            >
              <div className="h-3 w-3 rounded-sm bg-foreground/80" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-2 top-24 rounded-xl border border-border/70 bg-white/80 p-2 shadow-md backdrop-blur"
            >
              <div className="h-3 w-3 rounded-sm bg-foreground/60" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-4 bottom-16 rounded-xl border border-border/70 bg-white/80 p-2 shadow-md backdrop-blur"
            >
              <div className="h-3 w-3 rounded-sm bg-foreground/70" />
            </motion.div>

            {/* Dark phone */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-0 h-[360px] w-[190px] -translate-x-1/2 rounded-[38px] bg-gradient-to-br from-[#1a1a1c] via-[#242427] to-[#0f0f11] p-[5px] shadow-[0_40px_80px_-30px_rgba(20,20,40,0.55)]"
            >
              <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-[#0f0f11]">
                <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
                <div className="mt-8 flex flex-col items-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-indigo-500/30 to-sky-400/30 ring-2 ring-white/10">
                    <User className="h-5 w-5 text-white/80" />
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-white/90">Tappy Profile</div>
                </div>
                <div className="mt-4 space-y-1.5 px-3">
                  {[0,1,2,3].map((i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
                      <div className="grid h-5 w-5 place-items-center rounded-full bg-white/10">
                        {i === 0 ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Bell className="h-2.5 w-2.5 text-white/50" />}
                      </div>
                      <div className="h-1 flex-1 rounded-full bg-white/10" />
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-2 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-white/40" />
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
