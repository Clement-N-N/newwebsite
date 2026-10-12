"use client";

import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, CircleHelp, FlaskConical, Pause, Play, Quote, Scale } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { REQUIRED_QUESTION_IDS } from "@/lib/assessment/questions";
import { track } from "@/lib/analytics";
import { rise, stagger } from "@/lib/design/motion";
import { extractProfile, isAnswered } from "@/lib/engine/extract";
import { buildPlan } from "@/lib/engine/report";
import type { Report } from "@/lib/engine/schema";
import { SOURCES, isSourceId } from "@/lib/knowledge/sources";
import { useEnsureReport } from "@/lib/hooks/useEnsureReport";
import { Aurora } from "../fx/Aurora";
import { WordReveal } from "../fx/WordReveal";
import { ImpactMap } from "../map/ImpactMap";
import { Button, LinkButton } from "../ui/Button";
import { Chip, ConfidenceChip } from "../ui/Chip";
import { EvidenceToggle } from "./Evidence";
import { ReportStatusNotice } from "./ReportStatusNotice";

const BASIS_LABEL = { demonstrated: "From what you've done", stated: "From what you told us you prefer", both: "From your experience and preferences" };
const AUTOPLAY_MS = 9000;
/** Index of the final slide: a cover plus nine numbered slides. */
const LAST_SLIDE = 9;

type Tone = "primary" | "warm" | "deep";
interface Slide {
  id: string;
  tone: Tone;
  render: () => ReactNode;
}

interface SlideContext {
  rejectedThemes: string[];
  rejectTheme: (id: string) => void;
  restoreTheme: (id: string) => void;
  labels: Record<string, string>;
  selectedPathwayId: string | null;
  selectPathway: (id: string) => void;
  begin: () => void;
}

function Heading({ eyebrow, text, highlight }: { eyebrow: string; text: string; highlight?: string[] }) {
  return (
    <>
      <motion.p variants={rise} className="type-eyebrow text-brand-accent-on-dark">
        {eyebrow}
      </motion.p>
      <WordReveal as="h2" tabIndex={-1} text={text} highlight={highlight} className="type-h1 mt-4 max-w-4xl outline-none" delay={0.1} />
    </>
  );
}

/** Cards dealt in with a short flip; reduced motion turns this into a fade via MotionConfig. */
const deal = (i: number) => ({
  initial: { opacity: 0, rotateY: -35, y: 24, filter: "blur(4px)" },
  animate: { opacity: 1, rotateY: 0, y: 0, filter: "blur(0px)" },
  transition: { type: "spring" as const, duration: 0.7, bounce: 0, delay: 0.45 + i * 0.12 },
});

function buildSlides(report: Report, ctx: SlideContext): Slide[] {
  const themes = [...report.strengths.map((s) => s.label), ...report.causes.map((c) => c.label), ...report.motivations.slice(0, 2).map((m) => m.label)];
  const chosen = report.pathways.find((p) => p.id === ctx.selectedPathwayId) ?? report.pathways[0];
  const backed = report.motivations.filter((m) => m.basis === "both");
  const stated = report.motivations.filter((m) => m.basis !== "both");
  const plan = chosen.id === report.experiment.pathwayId ? report.plan : buildPlan(chosen.experiment, chosen.title, report.plan.mode === "weekly");
  const followOn = report.learning.followOn && isSourceId(report.learning.followOn) ? SOURCES[report.learning.followOn] : null;

  return [
    {
      id: "cover",
      tone: "primary",
      render: () => (
        <div className="relative flex min-h-[60dvh] flex-col justify-center">
          {/* The participant's own themes, drifting in: a preview made of real data. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
            {themes.slice(0, 7).map((t, i) => {
              const pos = [
                [62, 6],
                [80, 22],
                [70, 44],
                [86, 62],
                [60, 78],
                [78, 88],
                [92, 40],
              ][i];
              return (
                <motion.span
                  key={t}
                  className="absolute whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold text-brand-on-primary shadow-[var(--shadow-on-dark)] backdrop-blur"
                  style={{ left: `${pos[0]}%`, top: `${pos[1]}%`, background: "oklch(1 0 0 / 0.08)" }}
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: [0, -6, 0] }}
                  transition={{
                    opacity: { delay: 0.6 + i * 0.15, duration: 0.5 },
                    scale: { delay: 0.6 + i * 0.15, type: "spring", duration: 0.6, bounce: 0 },
                    filter: { delay: 0.6 + i * 0.15, duration: 0.5 },
                    y: { delay: 1.5 + i * 0.2, duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  {t}
                </motion.span>
              );
            })}
          </div>
          <motion.p variants={rise} className="type-eyebrow text-brand-accent-on-dark">
            Your Impact Career Compass
          </motion.p>
          <WordReveal
            as="h2"
            tabIndex={-1}
            text="Here's what your experience could make possible."
            highlight={["possible."]}
            className="type-display mt-5 max-w-[14ch] outline-none"
            delay={0.15}
          />
          <motion.p variants={rise} className="type-lede mt-6 max-w-xl text-brand-on-primary-muted">
            Nine short slides, built only from your answers. Every insight shows its evidence, and nothing here is a verdict.
          </motion.p>
          <motion.div variants={rise} className="mt-10">
            <Button size="lg" onClick={ctx.begin} className="ps-6 pe-5">
              <Play size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
              Play your results
            </Button>
          </motion.div>
        </div>
      ),
    },
    {
      id: "story",
      tone: "primary",
      render: () => (
        <>
          <Heading eyebrow="01 · Your impact discovery" text={report.story.headline} />
          <motion.p variants={rise} className="type-lede mt-6 max-w-3xl text-brand-on-primary-muted">
            {report.story.discovery}
          </motion.p>
          <div className="mt-10 max-w-3xl space-y-8">
            {report.story.paragraphs.map((p, i) => (
              <motion.div key={i} variants={rise}>
                {p.evidence[0]?.questionId === "proud" ? (
                  <blockquote className="relative pl-12">
                    <Quote size={32} strokeWidth={2} absoluteStrokeWidth className="absolute left-0 top-1 text-brand-accent-on-dark" aria-hidden />
                    <p className="type-h2">{p.text.replace(/^In your own words: /, "")}</p>
                    <footer className="mt-2 text-sm text-brand-on-primary-muted">In your own words</footer>
                  </blockquote>
                ) : (
                  <>
                    <p className="type-lede">{p.text}</p>
                    <EvidenceToggle evidence={p.evidence} onDark />
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "strengths",
      tone: "deep",
      render: () => (
        <>
          <Heading eyebrow="02 · Your hidden professional capital" text="Here are the capabilities that keep showing up in your work." />
          <ol className="mt-10 grid gap-4 [perspective:1200px] md:grid-cols-2 xl:grid-cols-3">
            {report.strengths.map((s, i) => (
              // Impact Compass §16.2: what it is, the evidence, why it is useful elsewhere, and confidence.
              <motion.li key={s.id} {...deal(i)} className="surface-dark flex flex-col p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="type-card">{s.label}</h3>
                  <span className="font-display text-4xl font-extrabold leading-none text-white/15" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ConfidenceChip confidence={s.confidence} onDark />
                  <Chip tone="onDark">{s.evidenceType ?? BASIS_LABEL[s.basis]}</Chip>
                </div>
                <p className="mt-4 text-brand-on-primary-muted">{s.description}</p>
                {s.transfer && (
                  <p className="mt-3 flex-1 border-l-2 border-brand-accent pl-3 text-sm">
                    <span className="font-semibold">Why it travels: </span>
                    <span className="text-brand-on-primary-muted">{s.transfer}</span>
                  </p>
                )}
                <EvidenceToggle evidence={s.evidence} onDark label="See the evidence" />
              </motion.li>
            ))}
          </ol>
        </>
      ),
    },
    {
      id: "drives",
      tone: "primary",
      render: () => (
        <>
          <Heading eyebrow="03 · What drives you" text="These are the problems and contributions that seem to matter to you." />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {[
              { title: "Backed by your experience", note: "You said these matter, and things you've done point the same way.", items: backed },
              { title: "What you say matters", note: "Stated preferences. Worth testing against real work.", items: stated },
            ].map((col, ci) => (
              <motion.section key={col.title} {...deal(ci)} className="surface-dark p-6">
                <h3 className="text-xl font-bold">{col.title}</h3>
                <p className="mt-1 text-sm text-brand-on-primary-muted">{col.note}</p>
                {col.items.length ? (
                  <ul className="mt-5 space-y-4">
                    {col.items.map((m) => (
                      <li key={m.id} className="border-l-2 border-brand-accent pl-4">
                        <p className="font-semibold">{m.label}</p>
                        <p className="text-brand-on-primary-muted">{m.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-brand-on-primary-muted">Nothing here yet. That is useful to know, not a gap.</p>
                )}
              </motion.section>
            ))}
          </div>
          <motion.div variants={rise} className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-bold">Problems you want to learn about</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.causes.length ? (
                  report.causes.map((c) => (
                    <Chip key={c.id} tone="onDark">
                      {c.label}
                    </Chip>
                  ))
                ) : (
                  <p className="text-brand-on-primary-muted">You haven&apos;t chosen one yet, which is a perfectly good place to start.</p>
                )}
              </div>
            </div>
            {report.constraints.length > 0 && (
              <div>
                <h3 className="font-bold">What you&apos;re weighing</h3>
                <ul className="mt-3 space-y-1 text-brand-on-primary-muted">
                  {report.constraints.map((c) => (
                    <li key={c.id}>
                      <span className="font-semibold text-brand-on-primary">{c.label}.</span> A real consideration, not a lack of commitment.
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </>
      ),
    },
    {
      id: "map",
      tone: "deep",
      render: () => (
        <>
          <Heading eyebrow="04 · Your Impact Map" text="How your capabilities, motivations and possible pathways connect." />
          <motion.div variants={rise} className="surface-dark mt-8 p-5 sm:p-8">
            <ImpactMap
              map={report.map}
              onDark
              rejected={ctx.rejectedThemes}
              onReject={ctx.rejectTheme}
              onRestore={ctx.restoreTheme}
              rejectedLabels={ctx.labels}
            />
          </motion.div>
        </>
      ),
    },
    {
      id: "possibilities",
      tone: "warm",
      render: () => (
        <>
          <Heading eyebrow="05 · Possibilities you may not have considered" text="Your experience may open doors you haven't explored." />
          <motion.p variants={rise} className="type-lede mt-4 max-w-2xl text-brand-on-primary-muted">
            {report.pathways.length === 1 ? "One hypothesis" : `${report.pathways.length === 2 ? "Two" : "Three"} hypotheses`} to test, not
            matches or predictions. Priorities reflect fit, motivation, feasibility and how easy each is to test.
          </motion.p>
          <ol className="mt-10 grid gap-5 lg:grid-cols-3 lg:gap-0 lg:px-6">
            {report.pathways.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 60, rotate: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, rotate: [-3, 0, 3][i], filter: "blur(0px)" }}
                whileHover={{ rotate: 0, y: -10, zIndex: 10 }}
                transition={{ type: "spring", duration: 0.7, bounce: 0, delay: 0.5 + i * 0.15 }}
                className="relative flex flex-col rounded-[var(--radius-card)] bg-brand-on-primary p-6 text-brand-text shadow-[var(--shadow-lifted)] lg:-mx-2 lg:p-7"
              >
                <div className="flex flex-wrap gap-2">
                  <Chip tone="accent">{p.roleLabel}</Chip>
                  <Chip tone="primary">{p.fit.priority}</Chip>
                </div>
                <h3 className="type-card mt-4 text-brand-primary">{p.title}</h3>
                <p className="mt-3 flex-1 text-brand-muted">{p.why.text}</p>
                <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-brand-border pt-4 text-sm">
                  <div>
                    <dt className="text-brand-muted">Skill fit</dt>
                    <dd className="font-bold">{p.fit.skill.short}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-muted">Motivation</dt>
                    <dd className="font-bold">{p.fit.motivation.short}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-muted">Feasibility now</dt>
                    <dd className="font-bold">{p.fit.feasibility.short}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-muted">Evidence base</dt>
                    <dd className="font-bold">{p.fit.evidence}</dd>
                  </div>
                </dl>
              </motion.li>
            ))}
          </ol>
          <motion.div variants={rise} className="mt-10">
            <LinkButton href="/pathways" variant="onDarkGhost" className="ps-4 pe-3.5">
              Explore and compare these pathways <ArrowRight size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
            </LinkButton>
          </motion.div>
        </>
      ),
    },
    {
      id: "tradeoffs",
      tone: "primary",
      render: () => (
        <>
          <Heading eyebrow="06 · The trade-offs" text="Every path asks something different of you." highlight={["different"]} />
          {report.tradeoffs.length ? (
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {report.tradeoffs.map((t, i) => (
                <motion.li key={t.dimension} {...deal(i)} className="surface-dark flex gap-4 p-5">
                  <Scale size={24} strokeWidth={1.5} absoluteStrokeWidth className="mt-0.5 shrink-0 text-brand-accent-on-dark" aria-hidden />
                  <div>
                    <h3 className="font-bold">{t.dimension}</h3>
                    <p className="mt-1 text-brand-on-primary-muted">{t.text}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <motion.p variants={rise} className="type-lede mt-8 max-w-2xl text-brand-on-primary-muted">
              With one pathway to test, the main trade-off is between trying it now and waiting. The experiment on the next slides keeps that cheap.
            </motion.p>
          )}
        </>
      ),
    },
    {
      id: "unknowns",
      tone: "deep",
      render: () => (
        <>
          <Heading eyebrow="07 · The important unknowns" text="Good decisions begin with better questions." highlight={["questions."]} />
          <ul className="mt-10 grid max-w-4xl gap-4">
            {report.unknowns.map((u, i) => (
              <motion.li key={i} {...deal(i)} className="surface-dark flex gap-4 p-5">
                <CircleHelp size={28} strokeWidth={1.5} absoluteStrokeWidth className="shrink-0 text-brand-accent-on-dark" aria-hidden />
                <div>
                  <p className="text-lg">{u.text}</p>
                  <EvidenceToggle evidence={u.evidence} sources={u.sources} onDark />
                </div>
              </motion.li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "next",
      tone: "warm",
      render: () => (
        <>
          <Heading eyebrow="08 · Your next chapter" text="You don't need to decide your future today. You can test a possibility." />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <motion.div {...deal(0)} className="rounded-[var(--radius-card)] bg-brand-on-primary p-6 text-brand-text shadow-[var(--shadow-lifted)] sm:p-8">
              <p className="type-eyebrow flex items-center gap-2 text-brand-accent-text">
                <FlaskConical size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden /> Your seven-day experiment
              </p>
              <h3 className="type-card mt-3 text-brand-primary">{chosen.experiment.title}</h3>
              <p className="mt-1 text-brand-muted">To test: {chosen.title}</p>
              <p className="mt-4">
                <span className="font-semibold text-brand-primary">Hypothesis: </span>
                {chosen.experiment.hypothesis}
              </p>
              <ol className="mt-5 space-y-3">
                {plan.steps.map((s) => (
                  <li key={s.when} className="flex gap-4">
                    <span className="w-24 shrink-0 pt-0.5 text-sm font-bold text-brand-accent-text">{s.when}</span>
                    <span>{s.task}</span>
                  </li>
                ))}
              </ol>
              <dl className="mt-6 grid gap-4 border-t border-brand-border pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-brand-primary">Effort</dt>
                  <dd className="text-brand-muted">{chosen.experiment.effort}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-primary">Decision rule</dt>
                  <dd className="text-brand-muted">{chosen.experiment.decisionRule}</dd>
                </div>
              </dl>
            </motion.div>
            <motion.div variants={rise}>
              <fieldset>
                <legend className="font-bold">Test a different pathway instead</legend>
                <div className="mt-3 grid gap-2">
                  {report.pathways.map((p) => (
                    <label
                      key={p.id}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-[background-color,box-shadow] duration-150 ${
                        chosen.id === p.id ? "bg-white/15 shadow-[0_0_0_1.5px_var(--brand-accent)]" : "shadow-[var(--shadow-on-dark)] hover:bg-white/5"
                      }`}
                    >
                      <input
                        type="radio"
                        name="experiment"
                        className="h-4 w-4 accent-[var(--brand-accent)]"
                        checked={chosen.id === p.id}
                        onChange={() => ctx.selectPathway(p.id)}
                      />
                      <span className="text-sm font-semibold">{p.title}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </motion.div>
          </div>
        </>
      ),
    },
    {
      id: "learn",
      tone: "deep",
      render: () => (
        <>
          <Heading eyebrow="09 · Keep learning" text="One lesson, one question, and the next step is yours." highlight={["yours."]} />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <motion.div {...deal(0)} className="surface-dark flex flex-col p-6 sm:p-8">
              <p className="type-eyebrow flex items-center gap-2 text-brand-accent-on-dark">
                <BookOpen size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden /> Your next learning step
              </p>
              <h3 className="type-card mt-3">{report.learning.lesson}</h3>
              <p className="mt-2 flex-1 text-brand-on-primary-muted">{report.learning.why}</p>
              {followOn && (
                <p className="mt-4 text-sm text-brand-on-primary-muted">
                  Then:{" "}
                  <a href={followOn.url} target="_blank" rel="noreferrer" className="font-semibold text-brand-on-primary underline underline-offset-2">
                    {followOn.publisher}: {followOn.title}
                  </a>
                </p>
              )}
              <div className="mt-6">
                <LinkButton href={report.learning.href} variant="onDark">
                  Start the lesson
                </LinkButton>
              </div>
            </motion.div>
            <motion.div {...deal(1)} className="rounded-[var(--radius-card)] bg-brand-on-primary p-6 text-brand-text shadow-[var(--shadow-lifted)] sm:p-8">
              <p className="type-eyebrow text-brand-accent-text">A question to sit with</p>
              <p className="type-card mt-3 text-brand-primary">{report.reflectiveQuestion}</p>
            </motion.div>
          </div>
          <motion.div variants={rise} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/passport" variant="primary">
              Open your Impact Passport
            </LinkButton>
            <LinkButton href="/pathways" variant="onDark">
              Explore your pathways
            </LinkButton>
          </motion.div>
        </>
      ),
    },
  ];
}

function Slides({ report, ctx, header }: { report: Report; ctx: Omit<SlideContext, "begin">; header: ReactNode }) {
  const isSample = report.meta.sample;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const go = useCallback(
    (next: number) => {
      setIndex((current) => {
        if (next < 0 || next > LAST_SLIDE) return current;
        setDirection(next > current ? 1 : -1);
        return next;
      });
    },
    [],
  );
  const slides = useMemo(() => buildSlides(report, { ...ctx, begin: () => go(1) }), [report, ctx, go]);
  const last = slides.length - 1;

  useEffect(() => {
    track("results_viewed", { slide: slides[index].id });
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    const t = window.setTimeout(() => containerRef.current?.querySelector<HTMLElement>("[data-slide-heading]")?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(t);
  }, [index, slides, reduced]);

  // Optional auto-play, started only by the participant and stopped by any navigation.
  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, last, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || document.querySelector("dialog[open]")) return;
      if (e.key === "ArrowRight") {
        setPlaying(false);
        go(index + 1);
      }
      if (e.key === "ArrowLeft") {
        setPlaying(false);
        go(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  // Phones: swipe sideways or tap the edges, as in a story. Never on interactive elements.
  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 70 || Math.abs(info.offset.x) < Math.abs(info.offset.y) * 1.5) return;
    setPlaying(false);
    go(info.offset.x < 0 ? index + 1 : index - 1);
  };
  const onTap = (e: React.MouseEvent) => {
    if (window.matchMedia("(pointer: fine)").matches) return;
    if ((e.target as HTMLElement).closest("a,button,input,label,summary,select,textarea,[role=button]")) return;
    const x = e.clientX / window.innerWidth;
    if (x < 0.25) go(index - 1);
    else if (x > 0.75) go(index + 1);
  };

  const slide = slides[index];

  return (
    <div ref={containerRef} className="relative isolate flex min-h-dvh flex-col bg-brand-primary pt-16 text-brand-on-primary">
      <AnimatePresence initial={false}>
        <motion.div key={slide.tone} className="fixed inset-0 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          <Aurora tone={slide.tone} className="!fixed" />
        </motion.div>
      </AnimatePresence>

      <div className="container-page flex flex-1 flex-col">
        {index > 0 && (
          <div className="flex items-center gap-3 pt-3">
            <ol className="flex flex-1 gap-1.5" aria-label="Results progress">
              {slides.slice(1).map((s, i) => {
                const n = i + 1;
                return (
                  <li key={s.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPlaying(false);
                        go(n);
                      }}
                      aria-label={`Go to slide ${n}`}
                      aria-current={n === index ? "step" : undefined}
                      className="block w-full py-3"
                    >
                      <span className="block h-1 overflow-hidden rounded-full bg-white/20">
                        <motion.span
                          className="block h-full rounded-full bg-brand-on-primary"
                          initial={false}
                          animate={{ width: n < index ? "100%" : n === index ? (playing ? "100%" : "100%") : "0%" }}
                          transition={n === index && playing ? { duration: AUTOPLAY_MS / 1000, ease: "linear" } : { duration: 0.3, ease: "easeOut" }}
                          style={n === index && !playing ? { background: "var(--brand-accent)" } : undefined}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={playing}
              aria-label={playing ? "Pause auto-play" : "Auto-play slides"}
              className="grid h-11 w-11 place-items-center rounded-full shadow-[var(--shadow-on-dark)] transition-[background-color,scale] duration-150 ease-out hover:bg-white/10 active:scale-[0.96]"
            >
              {playing ? <Pause size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden /> : <Play size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden />}
            </button>
          </div>
        )}
        {index === 0 || index === last ? (
          <div className="pt-3">{header}</div>
        ) : (
          isSample && (
            <p className="pt-1 text-xs font-semibold text-brand-accent-on-dark">Fictional sample profile · not a real person</p>
          )
        )}

        <motion.section
          aria-roledescription="slide"
          aria-label={index === 0 ? "Introduction" : `${index} of ${last}`}
          className="relative flex-1 touch-pan-y py-10"
          onPanEnd={onPanEnd}
          onClick={onTap}
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={slide.id}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -24 * direction, filter: "blur(4px)", transition: { duration: 0.15, ease: "easeOut" } }}
              variants={stagger}
            >
              {slide.render()}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {index > 0 && (
          <nav
            aria-label="Results navigation"
            className="sticky bottom-0 -mx-4 bg-gradient-to-t from-brand-primary-deep via-brand-primary-deep/85 to-transparent px-4 pb-safe pt-10 sm:-mx-8 sm:px-8"
          >
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="onDarkGhost"
                onClick={() => {
                  setPlaying(false);
                  go(index - 1);
                }}
                aria-label="Previous slide"
                className="whitespace-nowrap ps-3 pe-4 backdrop-blur"
              >
                <ArrowLeft size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <p className="text-sm font-semibold tabular-nums text-brand-on-primary-muted">
                {index} / {last}
                <span className="hidden sm:inline"> · ← → to move</span>
              </p>
              {index < last ? (
                <Button
                  variant="onDark"
                  onClick={() => {
                    setPlaying(false);
                    go(index + 1);
                  }}
                  className="whitespace-nowrap"
                >
                  Next →
                </Button>
              ) : (
                <LinkButton href="/passport" variant="primary" className="whitespace-nowrap">
                  Passport →
                </LinkButton>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export function ResultsReveal() {
  const a = useEnsureReport();
  const [shown, setShown] = useState<Report | null>(a.report);
  useEffect(() => {
    if (a.report) setShown(a.report);
  }, [a.report]);

  const labels = useMemo(() => {
    const p = extractProfile(a.responses);
    return Object.fromEntries([...p.capabilities, ...p.motivations, ...p.causes].map((t) => [t.id, t.label]));
  }, [a.responses]);

  const { rejectedThemes, rejectTheme, restoreTheme, selectedPathwayId, selectPathway, markChapterSeen } = a;
  const ctx = useMemo(
    () => ({ rejectedThemes, rejectTheme, restoreTheme, labels, selectedPathwayId, selectPathway }),
    [rejectedThemes, rejectTheme, restoreTheme, labels, selectedPathwayId, selectPathway],
  );

  useEffect(() => {
    if (shown) markChapterSeen("reveal");
    // Seeing results counts as reaching the chapter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(shown)]);

  if (!a.hydrated) return <div className="min-h-dvh bg-brand-primary" />;

  if (!a.complete) {
    const missing = REQUIRED_QUESTION_IDS.filter((id) => !isAnswered(a.responses, id)).length;
    return (
      <div className="relative isolate flex min-h-dvh items-center bg-brand-primary pt-16 text-brand-on-primary">
        <Aurora tone="deep" />
        <div className="container-page max-w-2xl py-16">
          <p className="type-eyebrow text-brand-accent-on-dark">Your results</p>
          <h1 className="type-h1 mt-4">Your results need a few more answers.</h1>
          <p className="type-lede mt-4 text-brand-on-primary-muted">
            {missing === REQUIRED_QUESTION_IDS.length
              ? "You haven't started the assessment yet. It takes about 10 to 15 minutes."
              : `${missing} required question${missing === 1 ? " is" : "s are"} still unanswered. We only show results we can support with your answers.`}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/discover" size="lg">
              {missing === REQUIRED_QUESTION_IDS.length ? "Start the assessment" : "Continue the assessment"}
            </LinkButton>
            <Button variant="onDarkGhost" size="lg" onClick={() => a.loadSample("amara")}>
              View a sample profile instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!shown) {
    const failed = a.reportStatus.state === "error";
    return (
      <div className="relative isolate flex min-h-dvh items-center bg-brand-primary pt-16 text-brand-on-primary">
        <Aurora tone="primary" />
        <div className="container-page max-w-2xl py-16" role="status" aria-live="polite">
          {failed ? (
            <>
              <h1 className="type-h1">We couldn&apos;t build your results.</h1>
              <p className="type-lede mt-4 text-brand-on-primary-muted">{a.reportStatus.state === "error" && a.reportStatus.message}</p>
              <div className="mt-8 flex gap-3">
                <Button onClick={() => void a.requestReport()}>Try again</Button>
                <LinkButton href="/impact-map" variant="onDarkGhost">
                  Review your answers
                </LinkButton>
              </div>
            </>
          ) : (
            <>
              <h1 className="type-h1">Connecting the dots…</h1>
              <p className="type-lede mt-4 text-brand-on-primary-muted">Building your results from your answers.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <Slides
      report={shown}
      ctx={ctx}
      header={
        <div className="flex flex-col gap-2">
          <ReportStatusNotice report={shown} status={a.reportStatus} sampleId={a.sampleId} onDark />
          {a.reportStatus.state === "loading" && (
            <p role="status" className="text-sm text-brand-accent-on-dark">
              Updating your results…
            </p>
          )}
          {a.sampleId && (
            <p className="text-sm text-brand-on-primary-muted">
              <Link href="/discover" onClick={() => a.reset()} className="font-semibold text-brand-on-primary underline underline-offset-2">
                Start your own assessment
              </Link>
            </p>
          )}
        </div>
      }
    />
  );
}
