"use client";

import { motion, useReducedMotion } from "motion/react";

type Tone = "primary" | "warm" | "deep";

const GLOWS: Record<Tone, [string, string, string]> = {
  // Tints of the brand blue and the accent only; no new hues.
  // Kept dim enough that text tokens stay at AA contrast wherever a glow sits behind them.
  // Soft light over HIP's hero gradient, kept dim so text tokens stay at AA contrast.
  primary: ["oklch(0.36 0.08 248 / 0.45)", "oklch(0.24 0.05 260 / 0.5)", "oklch(0.68 0.16 55 / 0.08)"],
  warm: ["oklch(0.62 0.17 50 / 0.14)", "oklch(0.32 0.07 250 / 0.45)", "oklch(0.55 0.15 45 / 0.1)"],
  deep: ["oklch(0.3 0.06 250 / 0.45)", "oklch(0.22 0.04 260 / 0.5)", "oklch(0.68 0.16 55 / 0.05)"],
};

/**
 * Ambient backdrop for deep-blue chapters: HIP's hero gradient, three slow glows and a fine grain.
 * Decorative only. Static under reduced motion.
 */
export function Aurora({ tone = "primary", className = "" }: { tone?: Tone; className?: string }) {
  const reduced = useReducedMotion();
  const [a, b, c] = GLOWS[tone];
  const drift = (x: number[], y: number[], duration: number) =>
    reduced ? {} : { animate: { x, y }, transition: { duration, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as const } };

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-brand-primary bg-hero-gradient ${className}`}>
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
