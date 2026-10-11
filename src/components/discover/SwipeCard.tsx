"use client";

import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type PanInfo } from "motion/react";
import { Check, HelpCircle, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import type { SwipeValue } from "@/lib/assessment/types";
import { springCard } from "@/lib/design/motion";

export interface SwipeCardHandle {
  commit: (value: SwipeValue) => void;
}

const THRESHOLD = 110;
const VELOCITY = 550;

/**
 * A statement card that behaves like a physical object: it tilts toward the pointer under a
 * moving light, follows a drag with rotation and a colour wash, and flies off when committed.
 * Button and keyboard answers run the same commit animation.
 */
export const SwipeCard = forwardRef<
  SwipeCardHandle,
  {
    statement: string;
    label: string;
    index: number;
    previous?: SwipeValue;
    onCommit: (value: SwipeValue) => void;
    children?: ReactNode;
  }
>(function SwipeCard({ statement, label, index, previous, onCommit }, ref) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-260, 0, 260], [-9, 0, 9]);
  const yesOpacity = useTransform(x, [24, THRESHOLD], [0, 1]);
  const noOpacity = useTransform(x, [-THRESHOLD, -24], [1, 0]);

  // Pointer tilt and light, on fine pointers only.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 200, damping: 24, bounce: 0 });
  const tiltY = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 200, damping: 24, bounce: 0 });
  const lightX = useTransform(px, (v) => `${v * 100}%`);
  const lightY = useTransform(py, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(420px circle at ${lightX} ${lightY}, oklch(1 0 0 / 0.65), transparent 60%)`;
  const committed = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const commit = (value: SwipeValue) => {
    if (committed.current) return;
    committed.current = true;
    if ("vibrate" in navigator) navigator.vibrate?.(8);
    if (reduced) {
      animate(opacity, 0, { duration: 0.15 }).then(() => onCommit(value));
      return;
    }
    const distance = Math.max(window.innerWidth, 640);
    const done = () => onCommit(value);
    if (value === "unsure") {
      animate(y, -80, { duration: 0.3, ease: "easeIn" });
      animate(opacity, 0, { duration: 0.3, ease: "easeIn" }).then(done);
    } else {
      animate(x, value === "yes" ? distance : -distance, { duration: 0.4, ease: [0.4, 0, 1, 1] }).then(done);
    }
  };

  useImperativeHandle(ref, () => ({ commit }));

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > THRESHOLD || info.velocity.x > VELOCITY) commit("yes");
    else if (info.offset.x < -THRESHOLD || info.velocity.x < -VELOCITY) commit("no");
    else animate(x, 0, springCard);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || reduced) return;
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onPointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      drag="x"
      dragElastic={0.9}
      dragMomentum={false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onDragEnd}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x, y, rotate, rotateX: tiltX, rotateY: tiltY, opacity, transformPerspective: 1100 }}
      className="surface-card absolute inset-0 flex cursor-grab touch-pan-y select-none flex-col overflow-hidden p-7 shadow-[var(--shadow-lifted)] active:cursor-grabbing sm:p-10"
      data-testid="swipe-card"
    >
      {/* Colour wash that tells you which way the card will go. */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-success-soft" style={{ opacity: yesOpacity }} />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-primary-soft" style={{ opacity: noOpacity }} />
      {!reduced && <motion.div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: light }} />}

      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-2 select-none font-display text-[11rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_var(--brand-primary-soft)] sm:text-[14rem]"
      >
        {String(index).padStart(2, "0")}
      </span>

      <p className="type-eyebrow relative text-brand-accent-text">{label}</p>
      <p className="type-card relative my-auto py-6 text-[clamp(1.5rem,1.1rem+1.8vw,2.375rem)] text-brand-primary">{statement}</p>
      {previous && (
        <p className="relative text-sm text-brand-muted">
          Earlier you chose: <strong>{previous === "yes" ? "Resonates" : previous === "no" ? "Doesn't resonate" : "Not sure"}</strong>
        </p>
      )}

      <motion.span
        aria-hidden
        style={{ opacity: yesOpacity }}
        className="pointer-events-none absolute bottom-6 left-6 flex -rotate-6 items-center gap-1.5 rounded-lg border-2 border-brand-success bg-brand-background px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-brand-success"
      >
        <Check size={16} strokeWidth={2.5} absoluteStrokeWidth /> Resonates
      </motion.span>
      <motion.span
        aria-hidden
        style={{ opacity: noOpacity }}
        className="pointer-events-none absolute bottom-6 right-6 flex rotate-6 items-center gap-1.5 rounded-lg border-2 border-brand-primary bg-brand-background px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-brand-primary"
      >
        <X size={16} strokeWidth={2.5} absoluteStrokeWidth /> Doesn&apos;t resonate
      </motion.span>
    </motion.div>
  );
});

export const SWIPE_ICONS = { yes: Check, no: X, unsure: HelpCircle };
