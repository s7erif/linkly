import { motion } from "framer-motion";

const logos = [
  { name: "stripe", label: (<span className="font-semibold italic tracking-tight">stripe</span>) },
  { name: "Linear", label: (<span className="inline-flex items-center gap-1.5"><span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-foreground/80"><span className="h-1.5 w-1.5 rounded-full bg-white/70" /></span>Linear</span>) },
  { name: "Notion", label: (<span className="inline-flex items-center gap-1.5"><span className="grid h-3.5 w-3.5 place-items-center rounded-[3px] border border-foreground/70 text-[9px] font-bold">N</span>Notion</span>) },
  { name: "Vercel", label: (<span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" className="h-3 w-3 fill-foreground"><path d="M12 2 22 20H2z"/></svg>Vercel</span>) },
  { name: "Framer", label: (<span className="inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-foreground"><path d="M4 2h16v7h-8l8 7v6h-8l-8-7V9h8L4 2z"/></svg>Framer</span>) },
  { name: "Figma", label: (<span className="inline-flex items-center gap-1.5"><span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-foreground"><span className="h-1.5 w-1.5 rounded-full bg-white" /></span>Figma</span>) },
];

export function Logos() {
  return (
    <div className="relative z-10 mx-auto -mt-2 w-full max-w-4xl px-6 sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        className="glass-pill flex flex-wrap items-center justify-between gap-x-8 gap-y-3 rounded-2xl px-6 py-4 sm:px-10"
      >
        {logos.map((l, i) => (
          <motion.span
            key={l.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.22, 0.61, 0.36, 1] }}
            className="text-[15px] font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            {l.label}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
