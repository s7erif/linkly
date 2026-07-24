import { motion } from "framer-motion";
import { PhoneNFC, useMouseParallax } from "./PhoneNFC";

const ease = [0.22, 0.61, 0.36, 1] as const;

export function Hero() {
  const { ref, x, y } = useMouseParallax();

  const title = ["One Tap.", "Endless Connections."];

  return (
    <section ref={ref} className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pt-14 pb-8 sm:px-10 lg:grid-cols-2 lg:pt-20 lg:pb-14">
      <div className="relative z-10">
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } }}
          className="font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-[56px] lg:text-[64px]"
        >
          {title.map((line, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
                show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease } },
              }}
              className="block"
            >
              {line}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease, delay: 0.55 }}
          className="mt-6 max-w-md text-[15px] leading-relaxed text-foreground/60"
        >
          Create your digital identity once.
          <br />
          Share it anywhere with a single tap.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.75 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a href="#" className="btn-dark btn-dark-hover inline-flex items-center rounded-xl px-5 py-3 text-[14px] font-medium">
            Get Started
          </a>
          <a href="#" className="btn-light btn-light-hover inline-flex items-center rounded-xl px-5 py-3 text-[14px] font-medium">
            Watch Demo
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, filter: "blur(14px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease, delay: 0.2 }}
        className="relative"
      >
        <PhoneNFC parallaxX={x} parallaxY={y} />
      </motion.div>
    </section>
  );
}
