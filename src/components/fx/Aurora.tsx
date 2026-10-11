"use client";

import { motion, useReducedMotion } from "motion/react";

type Tone = "primary" | "warm" | "deep";

const GLOWS: Record<Tone, [string, string, string]> = {
  // Tints of the brand blue and the accent only; no new hues.
  // Kept dim enough that text tokens stay at AA contrast wherever a glow sits behind them.
  primary: ["oklch(0.37 0.08 250 / 0.6)", "oklch(0.33 0.07 240 / 0.55)", "oklch(0.62 0.14 60 / 0.12)"],
  warm: ["oklch(0.55 0.14 55 / 0.2)", "oklch(0.36 0.08 250 / 0.55)", "oklch(0.5 0.12 55 / 0.14)"],
  deep: ["oklch(0.32 0.06 250 / 0.6)", "oklch(0.28 0.05 245 / 0.5)", "oklch(0.6 0.13 60 / 0.08)"],
};

/**
 * Ambient backdrop for deep-blue chapters: three slow, blurred glows and a fine grain.
 * Decorative only. Static under reduced motion.
 */
export function Aurora({ tone = "primary", className = "" }: { tone?: Tone; className?: string }) {
  const reduced = useReducedMotion();
  const [a, b, c] = GLOWS[tone];
  const drift = (x: number[], y: number[], duration: number) =>
    reduced ? {} : { animate: { x, y }, transition: { duration, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as const } };

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-brand-primary ${className}`}>
      <motion.div
        className="absolute -left-[20%] -top-[30%] h-[80vmax] w-[80vmax] rounded-full blur-[90px]"
        style={{ background: `radial-gradient(closest-side, ${a}, transparent)` }}
        {...drift([0, 80, -40], [0, 60, 20], 26)}
      />
      <motion.div
        className="absolute -bottom-[35%] -right-[15%] h-[70vmax] w-[70vmax] rounded-full blur-[90px]"
        style={{ background: `radial-gradient(closest-side, ${b}, transparent)` }}
        {...drift([0, -60, 30], [0, -40, 10], 30)}
      />
      <motion.div
        className="absolute left-[45%] top-[35%] h-[40vmax] w-[40vmax] rounded-full blur-[80px]"
        style={{ background: `radial-gradient(closest-side, ${c}, transparent)` }}
        {...drift([0, -90, 40], [0, 50, -30], 22)}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.07] mix-blend-overlay">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
