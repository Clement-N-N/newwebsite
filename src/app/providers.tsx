"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { AssessmentProvider } from "@/lib/state/AssessmentProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AssessmentProvider>{children}</AssessmentProvider>
    </MotionConfig>
  );
}
