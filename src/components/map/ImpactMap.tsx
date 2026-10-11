"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { QUESTION_BY_ID } from "@/lib/assessment/questions";
import type { ImpactMap as ImpactMapData, MapNode } from "@/lib/engine/schema";
import { ConfidenceChip } from "../ui/Chip";

const GROUPS: { id: MapNode["group"][]; title: string; short: string }[] = [
  { id: ["capability"], title: "Capabilities", short: "What you bring" },
  { id: ["motivation", "cause"], title: "Motivations and interests", short: "What drives you" },
  { id: ["pathway"], title: "Possible pathways", short: "Hypotheses to test" },
];

const GROUP_NAME: Record<MapNode["group"], string> = {
  capability: "Capability",
  motivation: "Motivation",
  cause: "Interest",
  pathway: "Pathway hypothesis",
};

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function questionText(id: string) {
  const q = QUESTION_BY_ID[id];
  if (!q) return id;
  if (q.type === "swipe") return `“${q.statement}”`;
  if (q.type === "scenario") return `${q.title}: ${q.prompt}`;
  return q.prompt;
}

/** Box of `el` within `container`, ignoring CSS transforms so entrance animations don't skew edges. */
function offsetWithin(el: HTMLElement, container: HTMLElement): Box {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== container) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** Connect facing sides of two boxes with a smooth curve. */
function edgePath(a: Box, b: Box): string {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  if (Math.abs(bc.x - ac.x) > Math.abs(bc.y - ac.y)) {
    const [l, r] = ac.x < bc.x ? [a, b] : [b, a];
    const x1 = l.x + l.w;
    const y1 = l.y + l.h / 2;
    const x2 = r.x;
    const y2 = r.y + r.h / 2;
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  }
  const [t, btm] = ac.y < bc.y ? [a, b] : [b, a];
  const x1 = t.x + t.w / 2;
  const y1 = t.y + t.h;
  const x2 = btm.x + btm.w / 2;
  const y2 = btm.y;
  const my = (y1 + y2) / 2;
  return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
}

export function ImpactMap({
  map,
  compact = false,
  onDark = false,
  rejected = [],
  onReject,
  onRestore,
  rejectedLabels = {},
  caption,
}: {
  map: ImpactMapData;
  compact?: boolean;
  onDark?: boolean;
  rejected?: string[];
  onReject?: (id: string) => void;
  onRestore?: (id: string) => void;
  rejectedLabels?: Record<string, string>;
  caption?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const [points, setPoints] = useState<Record<string, Box>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [wide, setWide] = useState(false);
  const detailId = useId();

  // Lines only read well when groups sit side by side. When stacked (phones, the compact
  // panel), connections are shown by highlighting related items on selection instead.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const showLines = wide && !compact;

  const hasPathways = map.nodes.some((n) => n.group === "pathway");
  const groups = hasPathways ? GROUPS : GROUPS.slice(0, 2);

  const measure = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const next: Record<string, Box> = {};
    nodeRefs.current.forEach((el, id) => {
      if (el.isConnected) next[id] = offsetWithin(el, c);
    });
    setPoints(next);
    setSize({ w: c.offsetWidth, h: c.offsetHeight });
  }, []);

  useLayoutEffect(measure, [map, measure]);
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    if (selected && !map.nodes.some((n) => n.id === selected)) setSelected(null);
  }, [map, selected]);

  const related = useMemo(() => {
    if (!selected) return new Set<string>();
    const s = new Set<string>([selected]);
    map.edges.forEach((e) => {
      if (e.from === selected) s.add(e.to);
      if (e.to === selected) s.add(e.from);
    });
    return s;
  }, [selected, map.edges]);

  const selectedNode = map.nodes.find((n) => n.id === selected);
  const selectedEdges = map.edges.filter((e) => e.from === selected || e.to === selected);
  const nodeLabel = (id: string) => map.nodes.find((n) => n.id === id)?.label ?? id;

  const text = onDark ? "text-brand-on-primary" : "text-brand-text";
  const muted = onDark ? "text-brand-on-primary-muted" : "text-brand-muted";
  const lineColor = onDark ? "var(--brand-on-primary-muted)" : "var(--brand-primary)";

  return (
    <figure className={`${text} m-0`} aria-label={caption ?? "Your Impact Map"}>
      <div ref={containerRef} className="relative">
        <svg className="pointer-events-none absolute inset-0" width={size.w} height={size.h} aria-hidden>
          {showLines && map.edges.map((e) => {
            const a = points[e.from];
            const b = points[e.to];
            if (!a || !b) return null;
            const d = edgePath(a, b);
            const hypothesis = e.kind === "hypothesis";
            const active = selected ? related.has(e.from) && related.has(e.to) && (e.from === selected || e.to === selected) : false;
            const dim = selected && !active;
            return (
              <motion.path
                key={e.id}
                d={d}
                fill="none"
                stroke={hypothesis ? "var(--brand-accent)" : lineColor}
                strokeWidth={active ? 2.25 : 1.25}
                strokeDasharray={hypothesis ? "5 6" : undefined}
                // pathLength drawing would overwrite the dash pattern, so hypotheses fade in instead.
                initial={hypothesis ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
                animate={hypothesis ? { opacity: dim ? 0.12 : 0.75 } : { pathLength: 1, opacity: dim ? 0.12 : 0.45 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            );
          })}
        </svg>

        <div className={`relative grid ${compact ? "gap-y-5" : `gap-y-6 md:gap-x-10 ${groups.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}`}>
          {groups.map((g) => {
            const nodes = map.nodes.filter((n) => g.id.includes(n.group));
            return (
              <div key={g.title} className="flex flex-col">
                <p className={`type-eyebrow ${onDark ? "text-brand-accent" : "text-brand-accent-text"} ${compact ? "text-[0.6875rem]" : ""}`}>
                  {g.short}
                </p>
                <p className={`mb-3 text-sm font-semibold ${muted}`}>{g.title}</p>
                <ul className={`flex flex-wrap gap-2 ${compact ? "" : "md:flex-1 md:flex-col md:justify-around md:gap-3"}`}>
                  <AnimatePresence initial={true}>
                    {nodes.length === 0 && (
                      <li className={`text-sm italic ${muted}`}>Appears as you answer</li>
                    )}
                    {nodes.map((n) => {
                      const isSelected = selected === n.id;
                      const dim = selected && !related.has(n.id);
                      return (
                        <motion.li
                          key={n.id}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: dim ? 0.35 : 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className={compact ? "" : "md:self-start"}
                        >
                          <button
                            type="button"
                            ref={(el) => {
                              if (el) nodeRefs.current.set(n.id, el);
                              else nodeRefs.current.delete(n.id);
                            }}
                            onClick={() => setSelected(isSelected ? null : n.id)}
                            aria-pressed={isSelected}
                            aria-controls={compact ? undefined : detailId}
                            aria-label={`${n.label}. ${GROUP_NAME[n.group]}. ${
                              n.hypothesis ? "Hypothesis." : n.confidence === "strong" ? "Strong evidence." : n.confidence === "moderate" ? "Some evidence." : "Tentative."
                            }`}
                            className={`relative flex min-h-11 items-center gap-2 rounded-full border-[1.5px] text-left font-semibold leading-tight transition-colors ${
                              compact ? "px-3 py-1.5 text-[0.8125rem]" : "px-3.5 py-2 text-sm"
                            } ${n.hypothesis ? "border-dashed border-brand-accent" : onDark ? "border-white/40" : "border-brand-border-strong"} ${
                              isSelected
                                ? onDark
                                  ? "bg-brand-on-primary text-brand-primary"
                                  : "bg-brand-primary text-brand-on-primary"
                                : onDark
                                  ? "bg-brand-primary-deep hover:bg-brand-primary"
                                  : "bg-brand-background hover:bg-brand-primary-soft"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`h-2.5 w-2.5 shrink-0 ${n.group === "capability" ? "rounded-full" : n.group === "pathway" ? "rotate-45 rounded-[2px]" : "rounded-[3px]"} ${
                                n.hypothesis ? "border-[1.5px] border-brand-accent" : n.confidence === "tentative" ? "border-[1.5px] border-current" : "bg-current"
                              }`}
                            />
                            <span className={compact ? "max-w-[16ch]" : "max-w-[24ch]"}>{n.label}</span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {!compact && (
        <>
          <div className={`mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm ${muted}`}>
            {showLines && (
              <>
            <span className="flex items-center gap-2">
              <svg aria-hidden width="28" height="6">
                <line x1="0" y1="3" x2="28" y2="3" stroke={lineColor} strokeWidth="1.5" strokeOpacity="0.6" />
              </svg>
              Solid line: comes from the same answer
            </span>
            <span className="flex items-center gap-2">
              <svg aria-hidden width="28" height="6">
                <line x1="0" y1="3" x2="28" y2="3" stroke="var(--brand-accent)" strokeWidth="1.5" strokeDasharray="5 6" />
              </svg>
              Dashed: a hypothesis, not a conclusion
            </span>
              </>
            )}
            <span>Dashed outlines are hypotheses; hollow markers have little evidence so far</span>
          </div>

          <div id={detailId} aria-live="polite" className="mt-5">
            {selectedNode ? (
              <div className={`rounded-[var(--radius-card)] p-5 sm:p-6 ${onDark ? "bg-white/[0.06] ring-1 ring-white/15" : "surface-card"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`type-eyebrow ${onDark ? "text-brand-accent" : "text-brand-accent-text"}`}>{GROUP_NAME[selectedNode.group]}</span>
                  {!selectedNode.hypothesis && <ConfidenceChip confidence={selectedNode.confidence} onDark={onDark} />}
                </div>
                <h3 className="mt-2 text-xl font-bold">{selectedNode.label}</h3>
                <p className={`mt-1 ${muted}`}>{selectedNode.description}</p>

                {selectedNode.evidence.length > 0 && (
                  <>
                    <h4 className="mt-4 text-sm font-bold">What supports this</h4>
                    <ul className="mt-2 space-y-2">
                      {selectedNode.evidence.map((e, i) => (
                        <li key={i} className="text-sm">
                          <span className="font-semibold">You said {e.quote}.</span>{" "}
                          <span className={muted}>From: {questionText(e.questionId)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {selectedEdges.length > 0 && (
                  <>
                    <h4 className="mt-4 text-sm font-bold">Connected to</h4>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {selectedEdges.map((e) => (
                        <li key={e.id}>
                          <span className="font-semibold">{nodeLabel(e.from === selectedNode.id ? e.to : e.from)}</span>
                          {e.kind === "hypothesis" ? " (hypothesis)" : ""}: <span className={muted}>{e.explanation}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {selectedNode.hypothesis ? (
                  <p className={`mt-4 text-sm ${muted}`}>
                    This is a possibility suggested by the connections above, not a prediction. You&apos;ll find its assumptions and a cheap
                    way to test it in your pathways.
                  </p>
                ) : (
                  onReject && (
                    <button
                      type="button"
                      onClick={() => onReject(selectedNode.id)}
                      className={`mt-5 min-h-11 rounded-[var(--radius-button)] border px-4 py-2 text-sm font-semibold ${
                        onDark ? "border-white/40 hover:bg-white/10" : "border-brand-border-strong text-brand-primary hover:bg-brand-primary-soft"
                      }`}
                    >
                      This doesn&apos;t describe me. Remove it
                    </button>
                  )
                )}
              </div>
            ) : (
              <p className={`text-sm ${muted}`}>Select any item on the map to see where it came from and what it connects to.</p>
            )}
          </div>

          {rejected.length > 0 && onRestore && (
            <div className={`mt-4 text-sm ${muted}`}>
              <p className="font-semibold">You removed:</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {rejected.map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => onRestore(id)}
                      className="min-h-11 rounded-full border border-dashed border-current px-3 py-1.5 font-semibold underline-offset-2 hover:underline"
                    >
                      Restore {rejectedLabels[id] ?? id}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <details className={`mt-5 text-sm ${muted}`}>
            <summary className="min-h-11 cursor-pointer py-2 font-semibold">View the map as a list</summary>
            <div className="mt-2 space-y-4">
              {groups.map((g) => (
                <div key={g.title}>
                  <p className="font-bold">{g.title}</p>
                  <ul className="ml-5 list-disc">
                    {map.nodes
                      .filter((n) => g.id.includes(n.group))
                      .map((n) => (
                        <li key={n.id}>
                          {n.label}
                          {n.hypothesis ? " (hypothesis)" : ` (${n.confidence} evidence)`}
                          {map.edges.filter((e) => e.from === n.id || e.to === n.id).length > 0 &&
                            ` — connected to ${map.edges
                              .filter((e) => e.from === n.id || e.to === n.id)
                              .map((e) => nodeLabel(e.from === n.id ? e.to : e.from))
                              .join(", ")}`}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </>
      )}
    </figure>
  );
}
