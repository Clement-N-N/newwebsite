"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { MODE_LABELS } from "@/lib/assessment/labels";
import type { Mode } from "@/lib/assessment/types";
import { track } from "@/lib/analytics";
import { motionEmphasis } from "@/lib/design/motion";
import { SOURCES } from "@/lib/knowledge/sources";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { Button, LinkButton } from "../ui/Button";

const LESSON_ID = "foundations-1";

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
      "People who compare global problems often ask three questions. How big is the problem? How neglected is it, meaning how few resources are already going to it? And how tractable is it: would extra effort actually make progress?",
      "A problem that is large, neglected and tractable is usually a better place for one more person than one that is already crowded. Reasonable people disagree about the answers, which is why it's worth looking at the reasoning, not just the rankings.",
    ],
  },
  {
    title: "Different ways professionals can contribute",
    body: [
      "Direct work means working on the problem itself. Enabling work means building and running the organisations that do it. And influence or resources means using your position, network or money to support the work.",
      "None is automatically better. Which is best for you depends on the opportunities in front of you and where your skills are rare.",
    ],
    personal: true,
  },
  {
    title: "Why fit and effectiveness both matter",
    body: [
      "An effective organisation with a role you'd be mediocre at may do less good than a slightly less effective one where you'd excel and stay for years.",
      "Fit is also something you learn by trying. That's why the next section matters.",
    ],
  },
  {
    title: "How to test a career-impact hypothesis",
    body: [
      "Treat each pathway as a hypothesis. Then climb a ladder of cheap tests: read about it, talk to two people doing it, do a small piece of real work, and only then consider a longer trial or a move.",
      "Each step should be cheap enough that a “no” costs you little, and informative enough that a “yes” is worth something.",
    ],
  },
];

const CHECK = {
  q: "Two problems seem equally important. Which is usually the better place for one more person, all else being equal?",
  options: [
    { id: "crowded", label: "The one that already receives a lot of funding and talent", correct: false },
    { id: "neglected", label: "The one that receives far less attention", correct: true },
    { id: "same", label: "It makes no difference", correct: false },
  ],
  explanation:
    "Extra effort usually goes further where fewer people are already working, as long as progress is possible. It's a rule of thumb, not a law.",
};

export function LearningContinuation() {
  const { responses, lessonsCompleted, completeLesson, hydrated } = useAssessment();
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const done = lessonsCompleted.includes(LESSON_ID);
  const total = SECTIONS.length + 1;

  useEffect(() => {
    track("learning_started");
  }, []);

  const contribution = responses.contribution;
  const topMode = contribution?.type === "rank" ? (contribution.order[0] as Mode) : null;

  const finish = () => {
    completeLesson(LESSON_ID);
    track("learning_completed");
  };

  const section = SECTIONS[step];

  return (
    <div className="min-h-dvh bg-brand-surface pb-16 pt-24">
      <div className="container-page max-w-3xl">
        <p className="type-eyebrow text-brand-accent-text">Lesson 1 · Foundations</p>
        <h1 className="type-h1 mt-3 text-brand-primary">Judging whether a career path is high-impact</h1>
        <p className="mt-3 text-brand-muted">About ten minutes. Five short sections and one question.</p>

        <div
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={Math.min(step + 1, total)}
          className="mt-6 flex gap-1.5"
        >
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-brand-accent" : "bg-brand-border"}`} />
          ))}
        </div>

        <div className="surface-card mt-6 p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={motionEmphasis}>
              {section ? (
                <>
                  <p className="text-sm font-semibold text-brand-muted">
                    Section {step + 1} of {SECTIONS.length}
                  </p>
                  <h2 className="type-h2 mt-2 text-brand-primary">{section.title}</h2>
                  <div className="mt-4 space-y-4 text-lg">
                    {section.body.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                  {section.personal && hydrated && topMode && (
                    <p className="mt-6 rounded-xl bg-brand-primary-soft p-4">
                      <strong>Your answer:</strong> you ranked “{MODE_LABELS[topMode]}” first. Keep that in mind, and test it rather than
                      assume it.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-brand-muted">Check your thinking</p>
                  <fieldset className="mt-2">
                    <legend className="type-h2 text-brand-primary">{CHECK.q}</legend>
                    <div className="mt-5 grid gap-2">
                      {CHECK.options.map((o) => (
                        <label
                          key={o.id}
                          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 ${
                            answer === o.id ? "border-brand-primary bg-brand-primary-soft" : "border-brand-border-strong"
                          }`}
                        >
                          <input
                            type="radio"
                            name="check"
                            checked={answer === o.id}
                            onChange={() => setAnswer(o.id)}
                            className="h-4 w-4 accent-[var(--brand-primary)]"
                          />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {answer && (
                    <p role="status" className="mt-4 rounded-xl bg-brand-surface p-4">
                      <strong>{CHECK.options.find((o) => o.id === answer)?.correct ? "That's the usual answer." : "Not quite."}</strong>{" "}
                      {CHECK.explanation}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Previous
            </Button>
            {step < SECTIONS.length ? (
              <Button variant="secondary" onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={finish} disabled={!answer || done}>
                {done ? "Lesson complete" : "Mark lesson complete"}
              </Button>
            )}
          </div>
        </div>

        {done && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={motionEmphasis} className="mt-8" aria-live="polite">
            <h2 className="type-h2 text-brand-primary">Where to go from here</h2>
            <p className="mt-2 text-brand-muted">
              These are High Impact Professionals&apos; own resources. Impact Start can&apos;t enrol you in anything or add you to the Talent
              Directory. You choose whether to take those steps.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {(["hip-resources", "hip-iap", "hip-home"] as const).map((id) => (
                <li key={id}>
                  <a
                    href={SOURCES[id].url}
                    target="_blank"
                    rel="noreferrer"
                    className="surface-card flex h-full flex-col p-5 transition-shadow hover:shadow-[var(--shadow-lifted)]"
                  >
                    <span className="font-bold text-brand-primary">{SOURCES[id].title}</span>
                    <span className="mt-1 text-sm text-brand-muted">{SOURCES[id].supports}</span>
                    <span className="mt-3 text-sm font-semibold text-brand-info">Visit HIP ↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <LinkButton href="/passport" variant="ghost">
                Back to your Impact Passport
              </LinkButton>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
