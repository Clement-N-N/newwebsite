"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { REQUIRED_QUESTION_IDS } from "@/lib/assessment/questions";
import { track } from "@/lib/analytics";
import { motionEmphasis } from "@/lib/design/motion";
import { extractProfile, isAnswered } from "@/lib/engine/extract";
import type { Report } from "@/lib/engine/schema";
import { useEnsureReport } from "@/lib/hooks/useEnsureReport";
import { ImpactMap } from "../map/ImpactMap";
import { Button, LinkButton } from "../ui/Button";
import { Chip, ConfidenceChip } from "../ui/Chip";
import { EvidenceToggle } from "./Evidence";
import { ReportStatusNotice } from "./ReportStatusNotice";

const BASIS_LABEL = { demonstrated: "From what you've done", stated: "From what you told us you prefer", both: "From your experience and preferences" };

function SlideHeading({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <>
      <p className="type-eyebrow text-brand-accent">{eyebrow}</p>
      <h2 tabIndex={-1} data-slide-heading className="type-h1 mt-4 max-w-4xl outline-none">
        {children}
      </h2>
    </>
  );
}

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { ...motionEmphasis, delay: 0.25 + i * 0.12 },
});

function buildSlides(report: Report, ctx: SlideContext): { id: string; render: () => ReactNode }[] {
  return [
    {
      id: "story",
      render: () => (
        <>
          <SlideHeading eyebrow="Your professional story">{report.story.headline}</SlideHeading>
          <div className="mt-10 max-w-3xl space-y-6">
            {report.story.paragraphs.map((p, i) => (
              <motion.div key={i} {...stagger(i)}>
                {p.evidence[0]?.questionId === "proud" ? (
                  <blockquote className="type-h2 border-l-4 border-brand-accent pl-5 font-semibold">{p.text}</blockquote>
                ) : (
                  <>
                    <p className="type-lede text-brand-on-primary">{p.text}</p>
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
      render: () => (
        <>
          <SlideHeading eyebrow="Your hidden professional capital">Here are the capabilities that keep showing up in your work.</SlideHeading>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {report.strengths.map((s, i) => (
              <motion.li key={s.id} {...stagger(i)} className="rounded-[var(--radius-card)] bg-white/[0.06] p-6 ring-1 ring-white/15">
                <span className="font-display text-sm font-extrabold text-brand-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="type-card mt-2">{s.label}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ConfidenceChip confidence={s.confidence} onDark />
                  <Chip tone="onDark">{BASIS_LABEL[s.basis]}</Chip>
                </div>
                <p className="mt-3 text-brand-on-primary-muted">{s.description}</p>
                <EvidenceToggle evidence={s.evidence} onDark label="See the evidence" />
              </motion.li>
            ))}
          </ol>
        </>
      ),
    },
    {
      id: "drives",
      render: () => {
        const backed = report.motivations.filter((m) => m.basis === "both");
        const stated = report.motivations.filter((m) => m.basis !== "both");
        return (
          <>
            <SlideHeading eyebrow="What drives you">These are the problems and contributions that seem to matter to you.</SlideHeading>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[
                { title: "Backed by your experience", note: "You said these matter, and things you've done point the same way.", items: backed },
                { title: "What you say matters", note: "Stated preferences. Worth testing against real work.", items: stated },
              ].map((col, ci) => (
                <motion.section key={col.title} {...stagger(ci)} className="rounded-[var(--radius-card)] bg-white/[0.06] p-6 ring-1 ring-white/15">
                  <h3 className="text-xl font-bold">{col.title}</h3>
                  <p className="mt-1 text-sm text-brand-on-primary-muted">{col.note}</p>
                  {col.items.length ? (
                    <ul className="mt-4 space-y-4">
                      {col.items.map((m) => (
                        <li key={m.id}>
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
            <motion.div {...stagger(2)} className="mt-8 grid gap-6 lg:grid-cols-2">
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
        );
      },
    },
    {
      id: "map",
      render: () => (
        <>
          <SlideHeading eyebrow="Your Impact Map">How your capabilities, motivations and possible pathways connect.</SlideHeading>
          <motion.div {...stagger(0)} className="mt-8 rounded-[var(--radius-card)] bg-brand-primary-deep/60 p-5 ring-1 ring-white/10 sm:p-8">
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
      render: () => (
        <>
          <SlideHeading eyebrow="Possibilities you may not have considered">Your experience may open doors you haven&apos;t explored.</SlideHeading>
          <p className="type-lede mt-4 max-w-2xl text-brand-on-primary-muted">Three hypotheses to test, not matches or predictions.</p>
          <ol className="mt-8 grid gap-4 lg:grid-cols-3">
            {report.pathways.map((p, i) => (
              <motion.li key={p.id} {...stagger(i)} className="flex flex-col rounded-[var(--radius-card)] bg-brand-on-primary p-6 text-brand-text">
                <Chip tone="accent" className="self-start">
                  {p.roleLabel}
                </Chip>
                <h3 className="type-card mt-4 text-brand-primary">{p.title}</h3>
                <p className="mt-3 flex-1 text-brand-muted">{p.why.text}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-brand-muted">Skill fit</dt>
                    <dd className="font-bold">{p.fit.skill}</dd>
                  </div>
                  <div>
                    <dt className="text-brand-muted">Feasibility now</dt>
                    <dd className="font-bold">{p.fit.feasibility}</dd>
                  </div>
                </dl>
              </motion.li>
            ))}
          </ol>
          <div className="mt-6">
            <LinkButton href="/pathways" variant="onDarkGhost">
              Explore and compare these pathways
            </LinkButton>
          </div>
        </>
      ),
    },
    {
      id: "unknowns",
      render: () => (
        <>
          <SlideHeading eyebrow="The important unknowns">Good decisions begin with better questions.</SlideHeading>
          <ul className="mt-10 grid max-w-4xl gap-4">
            {report.unknowns.map((u, i) => (
              <motion.li key={i} {...stagger(i)} className="flex gap-4 rounded-[var(--radius-card)] bg-white/[0.06] p-5 ring-1 ring-white/15">
                <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand-accent font-bold text-brand-accent">
                  ?
                </span>
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
      render: () => {
        const chosen = report.pathways.find((p) => p.id === ctx.selectedPathwayId) ?? report.pathways[0];
        return (
          <>
            <SlideHeading eyebrow="Your next chapter">You don&apos;t need to decide your future today. You can test a possibility.</SlideHeading>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <motion.div {...stagger(0)} className="rounded-[var(--radius-card)] bg-brand-on-primary p-6 text-brand-text sm:p-8">
                <p className="type-eyebrow text-brand-accent-text">Your seven-day experiment</p>
                <h3 className="type-card mt-2 text-brand-primary">{chosen.experiment.title}</h3>
                <p className="mt-1 text-brand-muted">To test: {chosen.title}</p>
                <ol className="mt-5 space-y-3">
                  {chosen.experiment.steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-primary text-sm font-bold text-brand-on-primary">
                        {i + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
              <motion.div {...stagger(1)}>
                <fieldset>
                  <legend className="font-bold">Test a different pathway instead</legend>
                  <div className="mt-3 grid gap-2">
                    {report.pathways.map((p) => (
                      <label
                        key={p.id}
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-4 py-3 ring-1 ${
                          chosen.id === p.id ? "bg-white/15 ring-brand-accent" : "ring-white/20 hover:bg-white/5"
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
                <div className="mt-6 flex flex-col gap-3">
                  <LinkButton href="/pathways" variant="onDark">
                    Explore your pathways
                  </LinkButton>
                  <LinkButton href="/passport" variant="primary">
                    Open your Impact Passport
                  </LinkButton>
                </div>
              </motion.div>
            </div>
          </>
        );
      },
    },
  ];
}

interface SlideContext {
  rejectedThemes: string[];
  rejectTheme: (id: string) => void;
  restoreTheme: (id: string) => void;
  labels: Record<string, string>;
  selectedPathwayId: string | null;
  selectPathway: (id: string) => void;
}

function Slides({ report, ctx, header }: { report: Report; ctx: SlideContext; header: ReactNode }) {
  const slides = buildSlides(report, ctx);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const go = (next: number) => {
    if (next < 0 || next >= slides.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  useEffect(() => {
    track("results_viewed", { slide: slides[index].id });
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    const t = window.setTimeout(() => containerRef.current?.querySelector<HTMLElement>("[data-slide-heading]")?.focus({ preventScroll: true }), 50);
    return () => window.clearTimeout(t);
  }, [index, slides, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || document.querySelector("dialog[open]")) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div ref={containerRef} className="flex min-h-dvh flex-col bg-brand-primary pt-16 text-brand-on-primary">
      <div className="container-page flex flex-1 flex-col">
        <div className="pt-4">{header}</div>
        <section aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`} className="relative flex-1 py-10">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={slides[index].id}
              custom={direction}
              initial={{ opacity: 0, x: 48 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 * direction }}
              transition={motionEmphasis}
            >
              {slides[index].render()}
            </motion.div>
          </AnimatePresence>
        </section>

        <nav aria-label="Results navigation" className="sticky bottom-0 -mx-4 bg-brand-primary/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0 pb-safe">
          <div className="flex items-center justify-between gap-3">
            <Button variant="onDarkGhost" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide" className="whitespace-nowrap">
              ←<span className="hidden sm:inline"> Back</span>
            </Button>
            <p className="text-sm font-semibold tabular-nums text-brand-on-primary-muted sm:hidden" aria-hidden>
              {index + 1} / {slides.length}
            </p>
            <ol className="hidden items-center gap-1.5 sm:flex">
              {slides.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index ? "step" : undefined}
                    className="grid h-11 w-6 place-items-center sm:w-7"
                  >
                    <span className={`block h-2 rounded-full transition-all ${i === index ? "w-6 bg-brand-accent" : "w-2 bg-white/40"}`} />
                  </button>
                </li>
              ))}
            </ol>
            {index < slides.length - 1 ? (
              <Button variant="onDark" onClick={() => go(index + 1)} className="whitespace-nowrap">
                Next →
              </Button>
            ) : (
              <LinkButton href="/passport" variant="primary" className="whitespace-nowrap">
                Passport →
              </LinkButton>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-brand-on-primary-muted">
            Slide {index + 1} of {slides.length} · Use ← → to move between slides
          </p>
        </nav>
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

  if (!a.hydrated) return <div className="min-h-dvh bg-brand-primary" />;

  if (!a.complete) {
    const missing = REQUIRED_QUESTION_IDS.filter((id) => !isAnswered(a.responses, id)).length;
    return (
      <div className="flex min-h-dvh items-center bg-brand-primary pt-16 text-brand-on-primary">
        <div className="container-page max-w-2xl py-16">
          <p className="type-eyebrow text-brand-accent">Your results</p>
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
            <Button
              variant="onDarkGhost"
              size="lg"
              onClick={() => {
                a.loadSample("amara");
              }}
            >
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
      <div className="flex min-h-dvh items-center bg-brand-primary pt-16 text-brand-on-primary">
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
              <svg aria-hidden viewBox="0 0 120 40" className="h-10 w-32">
                {[10, 60, 110].map((cx, i) => (
                  <motion.circle
                    key={cx}
                    cx={cx}
                    cy={20}
                    r={6}
                    fill="var(--brand-accent)"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
                <line x1="16" y1="20" x2="54" y2="20" stroke="var(--brand-on-primary-muted)" strokeOpacity="0.5" />
                <line x1="66" y1="20" x2="104" y2="20" stroke="var(--brand-on-primary-muted)" strokeOpacity="0.5" strokeDasharray="4 4" />
              </svg>
              <h1 className="type-h1 mt-6">Connecting the dots…</h1>
              <p className="type-lede mt-4 text-brand-on-primary-muted">Building your results from your answers.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const updating = a.reportStatus.state === "loading";

  return (
    <Slides
      report={shown}
      ctx={{
        rejectedThemes: a.rejectedThemes,
        rejectTheme: a.rejectTheme,
        restoreTheme: a.restoreTheme,
        labels,
        selectedPathwayId: a.selectedPathwayId,
        selectPathway: a.selectPathway,
      }}
      header={
        <div className="flex flex-col gap-2">
          <ReportStatusNotice report={shown} status={a.reportStatus} sampleId={a.sampleId} onDark />
          {updating && (
            <p role="status" className="text-sm text-brand-accent">
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
