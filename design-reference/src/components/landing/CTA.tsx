import { motion } from "framer-motion";
import { Reveal } from "./Motion";

export function CTA() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10">
      <Reveal>
        <div className="feature-card relative overflow-hidden rounded-[28px] px-6 py-16 text-center sm:py-20">
          {/* aurora inner */}
          <div className="pointer-events-none absolute inset-0 -z-10 aurora-bg opacity-90" />
          {/* sparkle */}
          <motion.div
            animate={{ rotate: [0, 12, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-8 bottom-8 h-6 w-6 opacity-70"
          >
            <svg viewBox="0 0 24 24" className="h-full w-full fill-foreground/40">
              <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
            </svg>
          </motion.div>

          <h3 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground sm:text-[44px]">
            Your identity.
            <br />
            Ready in one tap.
          </h3>
          <motion.a
            href="#"
            whileHover={{ y: -1 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className="btn-dark btn-dark-hover mt-8 inline-flex items-center rounded-full px-5 py-2.5 text-[13px] font-medium"
          >
            Start with Tappy
          </motion.a>
        </div>
      </Reveal>
    </section>
  );
}
