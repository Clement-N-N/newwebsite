import type { Transition, Variants } from "motion/react";

/** Motion tokens, mirrored from --motion-* in globals.css for use with Motion for React. */
export const ease = {
  standard: [0.2, 0.8, 0.2, 1] as const,
  emphasis: [0.16, 1, 0.3, 1] as const,
  /** better-ui's curve for cross-fades and icon swaps. */
  crossfade: [0.2, 0, 0, 1] as const,
};

export const motionStandard: Transition = { duration: 0.24, ease: ease.standard };
export const motionEmphasis: Transition = { duration: 0.64, ease: ease.emphasis };
/** Springs never bounce. */
export const springCard: Transition = { type: "spring", stiffness: 380, damping: 32, bounce: 0 };
export const springSnappy: Transition = { type: "spring", duration: 0.3, bounce: 0 };

/** Staged entrance: semantic chunks 100ms apart, each with opacity, 4px blur and 12px rise over 300ms. */
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
export const rise: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } },
};
/** Exits are shorter and smaller than entrances. */
export const exitSubtle = { opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.15, ease: "easeOut" } } as const;

export const enterUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: motionEmphasis,
};
