import { motion } from "framer-motion";

export function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-8 sm:px-10"
    >
      <a href="#" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-foreground text-[13px] font-bold leading-none text-background">T</span>
        <span>Tappy</span>
      </a>
      <nav className="hidden items-center gap-8 text-sm text-foreground/70 md:flex">
        <a className="nav-underline" href="#features">Features</a>
        <a className="nav-underline" href="#how">How it works</a>
        <a className="nav-underline" href="#pricing">Pricing</a>
        <a className="nav-underline" href="#faq">FAQ</a>
      </nav>
      <div className="hidden md:block">
        <a href="#" className="btn-dark btn-dark-hover inline-flex items-center rounded-full px-4 py-2 text-sm font-medium">
          Get Started
        </a>
      </div>
    </motion.header>
  );
}
