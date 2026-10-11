"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import type { SwipeValue } from "@/lib/assessment/types";
import { springCard } from "@/lib/design/motion";

export interface SwipeCardHandle {
  commit: (value: SwipeValue) => void;
}

const THRESHOLD = 110;
const VELOCITY = 550;

/**
 * A draggable statement card. Dragging past the threshold (or flicking) commits an answer;
 * a short drag springs back. The same commit animation runs for button and keyboard answers.
 */
export const SwipeCard = forwardRef<
  SwipeCardHandle,
  { statement: string; label: string; previous?: SwipeValue; onCommit: (value: SwipeValue) => void }
>(function SwipeCard({ statement, label, previous, onCommit }, ref) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-260, 0, 260], [-9, 0, 9]);
  const lift = useTransform(x, (v) => 1 + Math.min(Math.abs(v), 160) / 3200);
  const yesOpacity = useTransform(x, [24, THRESHOLD], [0, 1]);
  const noOpacity = useTransform(x, [-THRESHOLD, -24], [1, 0]);
  const committed = useRef(false);

  const commit = (value: SwipeValue) => {
    if (committed.current) return;
    committed.current = true;
    if ("vibrate" in navigator) navigator.vibrate?.(8);
    if (reduced) {
      onCommit(value);
      return;
    }
    const distance = Math.max(window.innerWidth, 640);
    const done = () => onCommit(value);
    if (value === "unsure") {
      animate(y, -60, { duration: 0.28, ease: "easeIn" });
      animate(opacity, 0, { duration: 0.28, ease: "easeIn" }).then(done);
    } else {
      animate(x, value === "yes" ? distance : -distance, { duration: 0.38, ease: [0.4, 0, 1, 1] }).then(done);
    }
  };

  useImperativeHandle(ref, () => ({ commit }));

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > THRESHOLD || info.velocity.x > VELOCITY) commit("yes");
    else if (info.offset.x < -THRESHOLD || info.velocity.x < -VELOCITY) commit("no");
    else animate(x, 0, springCard);
  };

  return (
    <motion.div
      drag="x"
      dragElastic={0.9}
      dragMomentum={false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onDragEnd}
      style={{ x, y, rotate, scale: lift, opacity }}
      whileTap={{ cursor: "grabbing" }}
      className="surface-card absolute inset-0 flex cursor-grab touch-pan-y select-none flex-col p-7 shadow-[var(--shadow-lifted)] sm:p-10"
      data-testid="swipe-card"
    >
      <p className="type-eyebrow text-brand-accent-text">{label}</p>
      <p className="type-card mt-auto mb-auto py-6 text-brand-primary">{statement}</p>
      {previous && (
        <p className="text-sm text-brand-muted">
          Earlier you chose: <strong>{previous === "yes" ? "Resonates" : previous === "no" ? "Doesn't resonate" : "Not sure"}</strong>
        </p>
      )}
      <motion.span
        aria-hidden
        style={{ opacity: yesOpacity }}
        className="pointer-events-none absolute bottom-6 left-6 -rotate-6 rounded-lg border-2 border-brand-success bg-brand-success-soft px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-brand-success"
      >
        ✓ Resonates
      </motion.span>
      <motion.span
        aria-hidden
        style={{ opacity: noOpacity }}
        className="pointer-events-none absolute bottom-6 right-6 rotate-6 rounded-lg border-2 border-brand-primary bg-brand-primary-soft px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-brand-primary"
      >
        ✕ Doesn&apos;t resonate
      </motion.span>
    </motion.div>
  );
});
