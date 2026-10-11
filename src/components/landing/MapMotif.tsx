"use client";

import { motion } from "motion/react";

// A quiet preview of the Living Impact Map: capability, motivation and pathway nodes joined by
// lines. Solid lines are evidence, dashed lines are hypotheses, as in the real map.
const NODES = [
  { x: 60, y: 90, r: 5 },
  { x: 140, y: 40, r: 4 },
  { x: 120, y: 170, r: 6 },
  { x: 230, y: 110, r: 4 },
  { x: 300, y: 50, r: 5 },
  { x: 320, y: 190, r: 4 },
  { x: 410, y: 120, r: 8, hypothesis: true },
  { x: 470, y: 40, r: 6, hypothesis: true },
  { x: 480, y: 210, r: 6, hypothesis: true },
];
const EDGES: [number, number, boolean?][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
  [4, 6, true],
  [5, 6, true],
  [4, 7, true],
  [5, 8, true],
  [2, 5],
];

export function MapMotif() {
  return (
    <svg viewBox="0 0 540 250" className="h-full w-full" aria-hidden>
      {EDGES.map(([a, b, dashed], i) => (
        <motion.line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="var(--brand-on-primary-muted)"
          strokeOpacity={dashed ? 0.5 : 0.35}
          strokeWidth={1.2}
          strokeDasharray={dashed ? "4 5" : undefined}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.6 + i * 0.12, ease: "easeInOut" }}
        />
      ))}
      {NODES.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          fill={n.hypothesis ? "none" : "var(--brand-on-primary)"}
          fillOpacity={0.85}
          stroke={n.hypothesis ? "var(--brand-accent)" : "none"}
          strokeWidth={1.5}
          strokeDasharray={n.hypothesis ? "3 3" : undefined}
          initial={{ opacity: 0, r: 0 }}
          animate={{ opacity: 1, r: n.r }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
        />
      ))}
    </svg>
  );
}
