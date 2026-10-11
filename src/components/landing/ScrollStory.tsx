"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";

// One diagram that assembles as you scroll: scattered experience, connected evidence, then
// dashed hypotheses to test. It uses the same visual grammar as the real Impact Map.
const NODES = [
  { x: 70, y: 70, label: "Operations" },
  { x: 150, y: 150, label: "Leadership" },
  { x: 60, y: 230, label: "Finance" },
  { x: 180, y: 300, label: "Explaining ideas" },
  { x: 250, y: 95, label: "Improving systems" },
  { x: 290, y: 225, label: "Acting on evidence" },
];
const EVIDENCE: [number, number][] = [
  [0, 1],
  [1, 4],
  [0, 4],
  [2, 5],
  [1, 3],
  [3, 5],
];
const PATHS = [
  { x: 430, y: 90, label: "Nonprofit operations" },
  { x: 455, y: 200, label: "Programme delivery" },
  { x: 430, y: 310, label: "Skilled advising" },
];
const HYPOTHESES: [number, number][] = [
  [4, 0],
  [0, 0],
  [5, 1],
  [1, 1],
  [3, 2],
  [5, 2],
];

const STEPS = [
  {
    kicker: "01 · Experience",
    title: "You've built more than you think.",
    body: "Years of work leave scattered strengths. On their own, they can look like just your job.",
  },
  {
    kicker: "02 · Evidence",
    title: "Your answers connect the dots.",
    body: "Each theme comes from something you said. Solid lines join themes that come from the same answer, so you can see why.",
  },
  {
    kicker: "03 · Experiments",
    title: "Then: possibilities worth testing.",
    body: "Dashed lines are hypotheses, not verdicts. Each one comes with a small experiment you can run in a week.",
  },
];

function Diagram({ progress: p, staticAll }: { progress: MotionValue<number>; staticAll: boolean }) {
  const evidence = useTransform(p, [0.3, 0.55], [0, 1]);
  const labels = useTransform(p, [0.35, 0.5], [0, 1]);
  const hypo = useTransform(p, [0.65, 0.85], [0, 1]);
  return (
    <svg viewBox="0 0 640 380" className="h-auto w-full" role="img" aria-label="Diagram: strengths connect into themes, which point to possible pathways">
      {EVIDENCE.map(([a, b], i) => (
        <motion.line
          key={`e${i}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="var(--brand-on-primary-muted)"
          strokeOpacity={0.55}
          strokeWidth={1.5}
          style={{ pathLength: staticAll ? 1 : evidence }}
        />
      ))}
      {HYPOTHESES.map(([n, t], i) => (
        <motion.line
          key={`h${i}`}
          x1={NODES[n].x}
          y1={NODES[n].y}
          x2={PATHS[t].x}
          y2={PATHS[t].y}
          stroke="var(--brand-accent)"
          strokeWidth={1.5}
          strokeDasharray="5 6"
          style={{ opacity: staticAll ? 0.8 : hypo }}
        />
      ))}
      {NODES.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={7} fill="var(--brand-on-primary)" />
          <motion.text
            x={n.x}
            y={n.y - 16}
            textAnchor="middle"
            className="fill-[var(--brand-on-primary)] text-[17px] font-semibold"
            style={{ opacity: staticAll ? 1 : labels }}
          >
            {n.label}
          </motion.text>
        </g>
      ))}
      {PATHS.map((n) => (
        <motion.g key={n.label} style={{ opacity: staticAll ? 1 : hypo }}>
          <rect x={n.x - 8} y={n.y - 8} width={16} height={16} transform={`rotate(45 ${n.x} ${n.y})`} fill="none" stroke="var(--brand-accent)" strokeWidth={2} strokeDasharray="3 3" />
          <text x={n.x + 18} y={n.y + 5} className="fill-[var(--brand-on-primary)] text-[17px] font-semibold">
            {n.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

export function ScrollStory() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(v < 0.33 ? 0 : v < 0.66 ? 1 : 2));

  if (reduced) {
    return (
      <section id="how" className="relative scroll-mt-16 py-24 text-brand-on-primary">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <ol className="space-y-10">
            {STEPS.map((s) => (
              <li key={s.kicker}>
                <p className="type-eyebrow text-brand-accent-on-dark">{s.kicker}</p>
                <h2 className="type-h2 mt-2">{s.title}</h2>
                <p className="mt-2 text-brand-on-primary-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <Diagram progress={scrollYProgress} staticAll />
        </div>
      </section>
    );
  }

  return (
    <section id="how" ref={ref} className="relative h-[300vh] scroll-mt-16 text-brand-on-primary">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-[15rem]" aria-live="polite">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.kicker}
                className="absolute inset-x-0 top-0"
                initial={false}
                animate={step === i ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: step > i ? -12 : 12, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                aria-hidden={step !== i}
              >
                <p className="type-eyebrow text-brand-accent-on-dark">{s.kicker}</p>
                <h2 className="type-h1 mt-3">{s.title}</h2>
                <p className="type-lede mt-4 max-w-md text-brand-on-primary-muted">{s.body}</p>
              </motion.div>
            ))}
          </div>
          <Diagram progress={scrollYProgress} staticAll={false} />
        </div>
      </div>
    </section>
  );
}
