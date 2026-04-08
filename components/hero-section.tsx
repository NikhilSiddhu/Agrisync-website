"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="flex min-h-screen items-center justify-center px-6 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="mx-auto max-w-4xl"
      >
        <h1 className="text-balance text-4xl font-black tracking-tight text-zinc-100 md:text-6xl">Precision Agriculture. Driven by AI.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-zinc-300 md:text-lg">
          Autonomous sensor networks mapping soil health for localized fertilizer and pesticide deployment.
        </p>
        <a
          href="#waitlist"
          className="mt-10 inline-flex rounded-full border border-[#00FF41] px-7 py-3 font-semibold text-[#00FF41] transition-colors hover:bg-[#00FF41] hover:text-black"
        >
          Deploy the System
        </a>
      </motion.div>
    </section>
  );
}
