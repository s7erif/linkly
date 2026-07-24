import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
      className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 pb-10 pt-2 text-sm text-foreground/60 sm:px-10"
    >
      <a href="#" className="flex items-center gap-2 font-semibold text-foreground">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-foreground text-[13px] font-bold leading-none text-background">T</span>
        Tappy
      </a>
      <div className="flex items-center gap-6">
        <a href="#" className="nav-underline">Links</a>
        <a href="#" className="nav-underline">About</a>
        <a href="#" className="nav-underline">Term</a>
        <a href="#" className="nav-underline">Contact</a>
      </div>
    </motion.footer>
  );
}
