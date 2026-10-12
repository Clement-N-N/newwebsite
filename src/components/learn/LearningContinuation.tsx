"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  FlaskConical,
  HandCoins,
  type LucideIcon,
  MessagesSquare,
  Rocket,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MODE_LABELS } from "@/lib/assessment/labels";
import type { Mode } from "@/lib/assessment/types";
import { track } from "@/lib/analytics";
import { exitSubtle, rise, stagger } from "@/lib/design/motion";
import { SOURCES } from "@/lib/knowledge/sources";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { ChapterIntro } from "../journey/ChapterIntro";
import { Button, LinkButton } from "../ui/Button";

const LESSON_ID = "foundations-1";

type Level = 0 | 1 | 2;
const LENS = [
  { key: "scale", name: "Scale", question: "How big is the problem?", levels: ["Small", "Significant", "Vast"] },
  { key: "neglect", name: "Neglectedness", question: "How few resources already go to it?", levels: ["Crowded", "Some attention", "Neglected"] },
  { key: "tract", name: "Tractability", question: "Would more effort make progress?", levels: ["Stuck", "Some levers", "Clear levers"] },
] as const;

function lensVerdict(levels: Level[]): { title: string; body: string } {
  const total = levels.reduce<number>((a, b) => a + b, 0);
  if (levels.includes(0)) {
    return {
      title: "Probably not the best place for one more person, yet.",
      body: "When any one factor is very low, extra effort tends to go less far, however strong the others are.",
    };
  }
  if (total >= 5) return { title: "A promising place for one more person.", body: "Large, neglected and solvable problems are where extra effort usually goes furthest." };
  if (total >= 4) return { title: "Worth a closer look.", body: "Strong on some factors. Find out what would change the weaker one." };
  return { title: "Mixed.", body: "Reasonable people could disagree here. Look at the reasoning, not just the verdict." };
}

function ProblemLens() {
  const [levels, setLevels] = useState<Level[]>([2, 1, 1]);
  const verdict = lensVerdict(levels);
  return (
    <div className="mt-8 rounded-[var(--radius-card)] bg-brand-primary p-5 text-brand-on-primary sm:p-7">
      <p className="type-eyebrow text-brand-accent-on-dark">Try it: the problem lens</p>
      <p className="mt-2 text-brand-on-primary-muted">Imagine a problem you care about. Set each factor and see how the judgement changes.</p>
      <div className="mt-6 grid gap-6">
        {LENS.map((f, fi) => (
          <fieldset key={f.key}>
            <legend className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-bold">{f.name}</span>
              <span className="text-sm text-brand-on-primary-muted">{f.question}</span>
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl bg-white/[0.06] p-1.5">
              {f.levels.map((label, li) => {
                const on = levels[fi] === li;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setLevels((l) => l.map((v, i) => (i === fi ? (li as Level) : v)))}
                    className={`relative min-h-11 rounded-lg px-2 text-sm font-semibold transition-[color] duration-150 ${on ? "text-brand-primary" : "text-brand-on-primary-muted hover:text-brand-on-primary"}`}
                  >
                    {on && (
                      <motion.span layoutId={`lens-${f.key}`} className="absolute inset-0 rounded-lg bg-brand-on-primary" transition={{ type: "spring", duration: 0.3, bounce: 0 }} />
                    )}
                    <span className="relative">{label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div aria-live="polite" className="mt-6 rounded-xl bg-brand-accent p-5 text-brand-primary">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={verdict.title} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={exitSubtle} transition={{ duration: 0.3 }}>
            <p className="text-lg font-bold">{verdict.title}</p>
            <p className="mt-1">{verdict.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-3 text-xs text-brand-on-primary-muted">A thinking aid with three categories, not a calculator. Real comparisons need research.</p>
    </div>
  );
}

const ROUTES: { mode: Mode; icon: LucideIcon; body: string }[] = [
  { mode: "direct", icon: Target, body: "Research, policy, delivery or advocacy on the problem itself." },
  { mode: "enabling", icon: Building2, body: "Operations, finance, people and systems that let effective teams do more." },
  { mode: "resources", icon: HandCoins, body: "Giving, advising, or shifting what your current organisation does." },
];

function Routes({ topMode }: { topMode: Mode | null }) {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-3">
      {ROUTES.map(({ mode, icon: Icon, body }) => {
        const yours = mode === topMode;
        return (
          <li key={mode} className={`relative rounded-[var(--radius-card)] p-5 ${yours ? "bg-brand-primary text-brand-on-primary" : "surface-card"}`}>
            {yours && (
              <span className="absolute right-4 top-4 rounded-full bg-brand-accent px-2.5 py-1 text-xs font-bold text-brand-primary">You ranked this first</span>
            )}
            <Icon size={28} strokeWidth={1.5} absoluteStrokeWidth className={yours ? "text-brand-accent-on-dark" : "text-brand-accent-text"} aria-hidden />
            <h3 className="mt-4 font-bold">{MODE_LABELS[mode]}</h3>
            <p className={`mt-1 text-sm ${yours ? "text-brand-on-primary-muted" : "text-brand-muted"}`}>{body}</p>
          </li>
        );
      })}
    </ul>
  );
}

const LADDER: { icon: LucideIcon; title: string; cost: string; learn: string }[] = [
  { icon: BookOpen, title: "Read about it", cost: "An evening", learn: "Whether the problem and the work hold your interest." },
  { icon: MessagesSquare, title: "Talk to two people doing it", cost: "Two short calls", learn: "What the work is really like, and what they wish they'd known." },
  { icon: FlaskConical, title: "Do a small piece of real work", cost: "A weekend or a few evenings", learn: "Whether you're good at it and enjoy it, from evidence rather than hope." },
  { icon: Rocket, title: "Try a longer trial", cost: "Weeks to months", learn: "Whether to commit, with most of the risk already gone." },
];

function Ladder({ experiment }: { experiment: string | null }) {
  const [active, setActive] = useState(1);
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
      <ol className="flex flex-col-reverse gap-2" aria-label="Ladder of tests, cheapest at the bottom">
        {LADDER.map((r, i) => {
          const on = active === i;
          const Icon = r.icon;
          return (
            <li key={r.title}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setActive(i)}
                className={`flex min-h-14 w-full items-center gap-4 rounded-2xl px-4 py-3 text-left font-semibold transition-[background-color,box-shadow,scale] duration-150 ease-out active:scale-[0.96] ${
                  on ? "bg-brand-primary text-brand-on-primary shadow-[var(--shadow-lifted)]" : "surface-card hover:shadow-[var(--shadow-border-hover)]"
                }`}
                style={{ marginInlineStart: `${i * 0.75}rem` }}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${on ? "bg-brand-accent text-brand-primary" : "bg-brand-primary-soft text-brand-primary"}`}>
                  <Icon size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wider opacity-70">Rung {i + 1}</span>
                  {r.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div aria-live="polite" className="rounded-[var(--radius-card)] bg-brand-surface p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={active} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={exitSubtle} transition={{ duration: 0.3 }}>
            <p className="type-eyebrow text-brand-accent-text">Rung {active + 1}</p>
            <h3 className="type-h2 mt-2 text-brand-primary">{LADDER[active].title}</h3>
            <dl className="mt-4 grid gap-3">
              <div>
                <dt className="text-sm font-semibold text-brand-muted">What it costs</dt>
                <dd className="text-lg">{LADDER[active].cost}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-brand-muted">What you learn</dt>
                <dd className="text-lg">{LADDER[active].learn}</dd>
              </div>
            </dl>
          </motion.div>
        </AnimatePresence>
        {experiment && (
          <p className="mt-6 rounded-xl bg-brand-background p-4 text-sm shadow-[var(--shadow-border)]">
            <strong>Your seven-day experiment</strong>, “{experiment}”, sits on the lower rungs: cheap enough that a “no” costs little.
          </p>
        )}
      </div>
    </div>
  );
}

const SECTIONS = [
  {
    title: "What makes a career high-impact?",
    body: [
      "A useful way to think about it: the good a career does depends on the problem you work on, the approach you take to it, and how well you personally fit the work.",
      "Small differences in each can compound. A strong fit with a modest problem, or a pressing problem with a poor fit, both leave a lot on the table.",
    ],
  },
  {
    title: "Why some problems may be especially pressing",
    body: [
      "People who compare global problems often ask three questions: how big is it, how neglected is it, and how tractable is it? A large, neglected, solvable problem is usually a better place for one more person than a crowded one.",
    ],
    widget: "lens",
  },
  {
    title: "Different ways professionals can contribute",
    body: ["None of these routes is automatically better. Which is best for you depends on the opportunities in front of you and where your skills are rare."],
    widget: "routes",
  },
  {
    title: "Why fit and effectiveness both matter",
    body: [
      "An effective organisation with a role you'd be mediocre at may do less good than a slightly less effective one where you'd excel and stay for years.",
      "Fit is also something you learn by trying, which is why the last section matters most.",
    ],
  },
  {
    title: "How to test a career-impact hypothesis",
    body: ["Treat each pathway as a hypothesis, then climb a ladder of cheap tests. Each rung should be cheap enough that a “no” costs you little."],
    widget: "ladder",
  },
] as const;

const CHECK = {
  q: "Two problems seem equally important. Which is usually the better place for one more person, all else being equal?",
  options: [
    { id: "crowded", label: "The one that already receives a lot of funding and talent", correct: false },
    { id: "neglected", label: "The one that receives far less attention", correct: true },
    { id: "same", label: "It makes no difference", correct: false },
  ],
  explanation: "Extra effort usually goes further where fewer people are already working, as long as progress is possible. It's a rule of thumb, not a law.",
};

export function LearningContinuation() {
  const { responses, report, selectedPathwayId, lessonsCompleted, completeLesson } = useAssessment();
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const done = lessonsCompleted.includes(LESSON_ID);
  const total = SECTIONS.length + 1;

  useEffect(() => {
    track("learning_started");
  }, []);

  const contribution = responses.contribution;
  const topMode = contribution?.type === "rank" ? (contribution.order[0] as Mode) : null;
  const experiment = report ? (report.pathways.find((p) => p.id === selectedPathwayId) ?? report.pathways[0])?.experiment.title ?? null : null;

  const finish = () => {
    completeLesson(LESSON_ID);
    track("learning_completed");
  };

  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const section = SECTIONS[step];

  return (
    <div className="min-h-dvh bg-brand-surface pb-16 pt-24">
      <ChapterIntro chapterId="learn" />
      <div className="container-page grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="type-eyebrow text-brand-accent-text">Lesson 1 · Foundations</p>
            <ol className="mt-4 space-y-1">
              {[...SECTIONS.map((s) => s.title), "Check your thinking"].map((t, i) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={i === step ? "step" : undefined}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-[background-color,color] duration-150 ${
                      i === step ? "bg-brand-background font-bold text-brand-primary shadow-[var(--shadow-border)]" : "text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        i < step || done ? "bg-brand-primary text-brand-on-primary" : i === step ? "bg-brand-accent text-brand-primary" : "bg-brand-primary-soft"
                      }`}
                    >
                      {i < step || done ? <Check size={12} strokeWidth={2.5} absoluteStrokeWidth aria-hidden /> : i + 1}
                    </span>
                    {t}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="min-w-0">
          <h1 className="type-h1 text-brand-primary">Judging whether a career path is high-impact</h1>
          <p className="mt-3 text-brand-muted">About ten minutes. Five short sections, three things to try, and one question.</p>
          <div role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(step + 1, total)} className="mt-6 flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full transition-[background-color] duration-300 ${i <= step ? "bg-brand-accent" : "bg-brand-border"}`} />
            ))}
          </div>

          <div className="surface-card mt-6 p-6 sm:p-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial="hidden" animate="visible" exit={exitSubtle} variants={stagger}>
                {section ? (
                  <>
                    <motion.p variants={rise} className="text-sm font-semibold text-brand-muted">
                      Section {step + 1} of {SECTIONS.length}
                    </motion.p>
                    <motion.h2 variants={rise} className="type-h2 mt-2 text-brand-primary">
                      {section.title}
                    </motion.h2>
                    <motion.div variants={rise} className="mt-4 max-w-2xl space-y-4 text-lg">
                      {section.body.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </motion.div>
                    <motion.div variants={rise}>
                      {"widget" in section && section.widget === "lens" && <ProblemLens />}
                      {"widget" in section && section.widget === "routes" && <Routes topMode={topMode} />}
                      {"widget" in section && section.widget === "ladder" && <Ladder experiment={experiment} />}
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.p variants={rise} className="text-sm font-semibold text-brand-muted">
                      Check your thinking
                    </motion.p>
                    <motion.fieldset variants={rise} className="mt-2">
                      <legend className="type-h2 text-brand-primary">{CHECK.q}</legend>
                      <div className="mt-5 grid gap-2">
                        {CHECK.options.map((o) => (
                          <label
                            key={o.id}
                            className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 transition-[background-color,border-color] duration-150 ${
                              answer === o.id ? "border-brand-primary bg-brand-primary-soft" : "border-brand-border-strong"
                            }`}
                          >
                            <input type="radio" name="check" checked={answer === o.id} onChange={() => setAnswer(o.id)} className="h-4 w-4 accent-[var(--brand-primary)]" />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    </motion.fieldset>
                    {answer && (
                      <p role="status" className="mt-4 rounded-xl bg-brand-surface p-4">
                        <strong>{CHECK.options.find((o) => o.id === answer)?.correct ? "That's the usual answer." : "Not quite."}</strong> {CHECK.explanation}
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-between gap-3 border-t border-brand-border pt-6">
              <Button variant="ghost" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0} className="ps-3 pe-4">
                <ArrowLeft size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden /> Previous
              </Button>
              {step < SECTIONS.length ? (
                <Button variant="secondary" onClick={() => go(step + 1)} className="ps-4 pe-3.5">
                  Next <ArrowRight size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
                </Button>
              ) : (
                <Button onClick={finish} disabled={!answer || done}>
                  {done ? "Lesson complete" : "Mark lesson complete"}
                </Button>
              )}
            </div>
          </div>

          {done && (
            <motion.section initial="hidden" animate="visible" variants={stagger} className="mt-10" aria-live="polite">
              <motion.div variants={rise} className="flex items-center gap-4">
                <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
                  <circle cx="28" cy="28" r="26" fill="var(--brand-success)" />
                  <motion.path
                    d="M17 29l7 7 15-16"
                    fill="none"
                    stroke="var(--brand-on-primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                  />
                </svg>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-brand-success">Foundations · Lesson 1 complete</p>
                  <h2 className="type-h2 text-brand-primary">Where to go from here</h2>
                </div>
              </motion.div>
              <motion.p variants={rise} className="mt-4 max-w-2xl text-brand-muted">
                These are High Impact Professionals&apos; own resources. Impact Career Compass can&apos;t enrol you in anything or add you to the Talent
                Directory. You choose whether to take those steps.
              </motion.p>
              <motion.ul variants={rise} className="mt-6 grid gap-3 sm:grid-cols-3">
                {(["hip-resources", "hip-iap", "hip-home"] as const).map((id) => (
                  <li key={id}>
                    <a
                      href={SOURCES[id].url}
                      target="_blank"
                      rel="noreferrer"
                      className="surface-card flex h-full flex-col p-5 transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-lifted)]"
                    >
                      <span className="font-bold text-brand-primary">{SOURCES[id].title}</span>
                      <span className="mt-1 text-sm text-brand-muted">{SOURCES[id].supports}</span>
                      <span className="mt-3 text-sm font-semibold text-brand-info">Visit HIP ↗</span>
                    </a>
                  </li>
                ))}
              </motion.ul>
              <motion.div variants={rise} className="mt-6 flex flex-wrap gap-3">
                <LinkButton href="/passport" variant="ghost">
                  Back to your Impact Passport
                </LinkButton>
                <Link href="/" className="inline-flex min-h-11 items-center px-2 font-semibold text-brand-primary underline underline-offset-4">
                  Return to the start
                </Link>
              </motion.div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}
