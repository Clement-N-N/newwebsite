import type { Transition } from "motion/react";

/** Motion tokens, mirrored from --motion-* in globals.css for use with Motion for React. */
export const ease = {
  standard: [0.2, 0.8, 0.2, 1] as const,
  emphasis: [0.16, 1, 0.3, 1] as const,
};

export const motionStandard: Transition = { duration: 0.24, ease: ease.standard };
export const motionEmphasis: Transition = { duration: 0.64, ease: ease.emphasis };
export const springCard: Transition = { type: "spring", stiffness: 380, damping: 32 };

export const enterUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: motionEmphasis,
};
