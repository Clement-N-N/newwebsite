"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { site } from "@/content/site";

// Pinned section: vertical scroll drives the stages horizontally.
export function Journey() {
  const { journey } = site;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${((journey.stages.length - 1) / journey.stages.length) * 100}%`]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={ref}
      id="prototype"
      style={{ height: `${journey.stages.length * 80}vh` }}
      className="relative"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
          <p className="kicker">{journey.kicker}</p>
          <h2 className="mt-3 font-display text-4xl sm:text-6xl">{journey.title}</h2>
          <p className="mt-3 text-muted">{journey.intro}</p>
          <div className="mt-6 h-px w-full bg-line">
            <motion.div style={{ width: progress }} className="h-px bg-gradient-to-r from-accent to-signal" />
          </div>
        </div>

        <div className="mt-10 overflow-visible">
          <motion.ol
            style={{ x, width: `${journey.stages.length * 100}%` }}
            className="flex"
          >
            {journey.stages.map((stage, i) => (
              <li key={stage.step} className="w-full px-4 sm:px-8">
                <div className="mx-auto max-w-6xl">
                  <article className="card grid gap-8 p-8 sm:grid-cols-[auto_1fr] sm:p-12">
                    <span className="font-display text-7xl leading-none text-accent/80 sm:text-9xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="kicker">{stage.step}</p>
                      <h3 className="mt-2 font-display text-3xl sm:text-4xl">{stage.title}</h3>
                      <p className="mt-4 max-w-xl text-lg text-muted">{stage.body}</p>
                      <p className="mt-6 inline-flex rounded-full border border-signal/40 px-3 py-1 text-sm text-signal">
                        Measures: {stage.metric}
                      </p>
                    </div>
                  </article>
                </div>
              </li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
