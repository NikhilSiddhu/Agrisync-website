"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const blocks = [
  "Real-time Soil Telemetry. Millimeter-accurate data ingestion from localized hardware nodes.",
  "Algorithmic Processing. AI calculates precise chemical requirements down to the individual plant.",
  "Targeted Chemical Distribution. Eliminating pesticide waste. Maximizing crop yield.",
];

export function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const opacity1 = useTransform(scrollYProgress, [0, 0.14, 0.3, 0.4], [0, 1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.45, 0.62, 0.74], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.62, 0.76, 0.98], [0, 1, 1]);

  return (
    <section ref={sectionRef} className="relative min-h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center px-6 md:px-10 lg:px-16">
        <div className="w-full md:max-w-xl">
          <div className="mx-auto text-center md:mx-0 md:text-left">
            <p className="mb-5 text-xs tracking-[0.3em] text-zinc-500">THE PROCESS</p>
            <div className="relative min-h-[180px]">
              <motion.p style={{ opacity: opacity1 }} className="absolute inset-0 text-xl font-semibold leading-relaxed text-zinc-100 md:text-2xl">
                {blocks[0]}
              </motion.p>
              <motion.p style={{ opacity: opacity2 }} className="absolute inset-0 text-xl font-semibold leading-relaxed text-zinc-100 md:text-2xl">
                {blocks[1]}
              </motion.p>
              <motion.p style={{ opacity: opacity3 }} className="absolute inset-0 text-xl font-semibold leading-relaxed text-zinc-100 md:text-2xl">
                {blocks[2]}
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
