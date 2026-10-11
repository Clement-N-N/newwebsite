"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { motionEmphasis } from "@/lib/design/motion";

/** Every route enters with a short fade and rise, so moving between stages never hard-cuts. */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={motionEmphasis}>
      {children}
    </motion.div>
  );
}
