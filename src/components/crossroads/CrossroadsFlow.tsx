"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CROSSROADS_QUESTIONS, DISCOVER_QUESTIONS } from "@/lib/assessment/questions";
import type { ScenarioQuestion } from "@/lib/assessment/types";
import { track } from "@/lib/analytics";
import { motionEmphasis } from "@/lib/design/motion";
import { extractProfile } from "@/lib/engine/extract";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { LiveMapPanel } from "../discover/LiveMapPanel";
import { StageShell } from "../discover/StageShell";
import { Button } from "../ui/Button";

const SCENARIOS = CROSSROADS_QUESTIONS as ScenarioQuestion[];

function Scenario({ q, number, onDone }: { q: ScenarioQuestion; number: number; onDone: () => void }) {
  const { responses, setAnswer } = useAssessment();
  const previous = responses[q.id];
  const [values, setValues] = useState<string[]>(previous?.type === "scenario" ? previous.values : []);
  const [note, setNote] = useState(previous?.type === "scenario" ? (previous.note ?? "") : "");
  const [confirmed, setConfirmed] = useState(false);
  const reflectionRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => {
    if (confirmed) setConfirmed(false);
    setValues((v) => (q.multiple ? (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]) : [id]));
  };

  const confirm = () => {
    setAnswer(q.id, { type: "scenario", values, note: note.trim() || undefined });
    track("scenario_completed", { questionId: q.id });
    setConfirmed(true);
  };

  useEffect(() => {
    if (confirmed) reflectionRef.current?.focus();
  }, [confirmed]);

  const chosen = q.options.filter((o) => values.includes(o.id));

  return (
    <article className="overflow-hidden rounded-[calc(var(--radius-card)+0.25rem)] bg-brand-background shadow-[var(--shadow-lifted)]">
      <div className="bg-brand-primary p-6 text-brand-on-primary sm:p-10">
        <p className="type-eyebrow text-brand-accent">
          Crossroads {number} of {SCENARIOS.length} · {q.title}
        </p>
        <p className="type-lede mt-4 font-medium sm:text-[1.375rem] sm:leading-snug">{q.situation}</p>
      </div>

      <div className="p-6 sm:p-10">
        <h2 id={`${q.id}-prompt`} className="type-h2 text-brand-primary">
          {q.prompt}
        </h2>
        <p className="mt-1 text-brand-muted">{q.multiple ? "Choose any that apply." : "Choose one."} There is no right answer.</p>

        <div role="group" aria-labelledby={`${q.id}-prompt`} className="mt-6 grid gap-3">
          {q.options.map((o) => {
            const on = values.includes(o.id);
            return (
              <motion.button
                key={o.id}
                type="button"
                layout
                aria-pressed={on}
                onClick={() => toggle(o.id)}
                whileTap={{ scale: 0.985 }}
                className={`flex min-h-16 items-center gap-4 rounded-2xl border-[1.5px] px-5 py-4 text-left text-base font-semibold transition-colors sm:text-[1.0625rem] ${
                  on ? "border-brand-primary bg-brand-primary-soft text-brand-primary" : "border-brand-border-strong hover:bg-brand-surface"
                }`}
              >
                <span
                  aria-hidden
                  className={`grid h-6 w-6 shrink-0 place-items-center border-[1.5px] ${q.multiple ? "rounded-md" : "rounded-full"} ${
                    on ? "border-brand-primary bg-brand-primary text-brand-on-primary" : "border-brand-border-strong"
                  }`}
                >
                  {on && (q.multiple ? "✓" : <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" />)}
                </span>
                {o.label}
              </motion.button>
            );
          })}
        </div>

        <label htmlFor={`${q.id}-note`} className="mt-6 block font-semibold">
          {q.followUp}
        </label>
        <textarea
          id={`${q.id}-note`}
          value={note}
          maxLength={280}
          onChange={(e) => {
            setNote(e.target.value);
            if (confirmed) setConfirmed(false);
          }}
          rows={2}
          className="mt-2 w-full rounded-xl border-[1.5px] border-brand-border-strong p-3"
        />

        <AnimatePresence initial={false}>
          {confirmed && (
            <motion.div
              ref={reflectionRef}
              tabIndex={-1}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={motionEmphasis}
              className="overflow-hidden outline-none"
              aria-live="polite"
            >
              <div className="mt-6 rounded-2xl bg-brand-surface p-5">
                <p className="type-eyebrow text-brand-accent-text">What this tells us</p>
                <ul className="mt-2 space-y-1.5">
                  {chosen.map((o) => (
                    <li key={o.id}>{o.reflection}</li>
                  ))}
                  {note.trim() && <li>We&apos;ve noted what you added, and it will appear in your passport.</li>}
                </ul>
                <p className="mt-3 text-sm text-brand-muted">Your map has been updated. You can change this answer at any time.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex justify-end">
          {confirmed ? (
            <Button variant="primary" size="lg" onClick={onDone}>
              {number === SCENARIOS.length ? "See your Impact Map" : "Next crossroads"}
            </Button>
          ) : (
            <Button variant="secondary" size="lg" disabled={values.length === 0 && !note.trim()} onClick={confirm}>
              Confirm
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function CrossroadsFlow() {
  const router = useRouter();
  const { hydrated, responses } = useAssessment();
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated || index !== null) return;
    const first = SCENARIOS.findIndex((q) => !responses[q.id]);
    setIndex(first === -1 ? 0 : first);
    track("crossroads_started");
  }, [hydrated, index, responses]);

  useEffect(() => {
    if (index !== null) track("question_viewed", { questionId: SCENARIOS[index].id, questionType: "scenario", stage: "crossroads" });
  }, [index]);

  if (index === null) return <div className="min-h-dvh bg-brand-surface" />;

  const missingDiscover = DISCOVER_QUESTIONS.filter((q) => !q.optional && !responses[q.id]).length;

  const next = () => {
    if (index < SCENARIOS.length - 1) {
      setIndex(index + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    if (extractProfile(responses).complete) track("assessment_completed");
    router.push("/impact-map");
  };

  return (
    <StageShell
      part="Part 2 · Career Crossroads"
      position={index + 1}
      total={SCENARIOS.length}
      onBack={index > 0 ? () => setIndex(index - 1) : () => router.push("/discover")}
      aside={<LiveMapPanel />}
    >
      {missingDiscover > 0 && (
        <p className="mb-4 rounded-xl bg-brand-warning-soft p-4 text-sm text-brand-warning">
          You skipped {missingDiscover} question{missingDiscover === 1 ? "" : "s"} in Part 1. You can carry on here and go back later.
        </p>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={SCENARIOS[index].id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={motionEmphasis}
        >
          <Scenario q={SCENARIOS[index]} number={index + 1} onDone={next} />
        </motion.div>
      </AnimatePresence>
    </StageShell>
  );
}
