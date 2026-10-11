"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Check,
  Compass,
  FlaskConical,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  type LucideIcon,
  MessagesSquare,
  Microscope,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CROSSROADS_QUESTIONS, DISCOVER_QUESTIONS } from "@/lib/assessment/questions";
import type { ScenarioQuestion } from "@/lib/assessment/types";
import { track } from "@/lib/analytics";
import { exitSubtle, rise, stagger } from "@/lib/design/motion";
import { extractProfile } from "@/lib/engine/extract";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { LiveMapPanel } from "../discover/LiveMapPanel";
import { StageShell } from "../discover/StageShell";
import { WordReveal } from "../fx/WordReveal";
import { ChapterIntro } from "../journey/ChapterIntro";
import { Button } from "../ui/Button";

const SCENARIOS = CROSSROADS_QUESTIONS as ScenarioQuestion[];

const OPTION_ICONS: Record<string, LucideIcon> = {
  effectiveness: Microscope,
  influence: Compass,
  finances: Wallet,
  career: TrendingUp,
  direct: Target,
  enabling: Building2,
  resources: HandCoins,
  project: FlaskConical,
  advising: MessagesSquare,
  giving: HeartHandshake,
  prepare: GraduationCap,
};

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
    if (confirmed) reflectionRef.current?.focus({ preventScroll: false });
  }, [confirmed]);

  const chosen = q.options.filter((o) => values.includes(o.id));

  return (
    <motion.article initial="hidden" animate="visible" variants={stagger}>
      <motion.p variants={rise} className="type-eyebrow text-brand-accent-on-dark">
        Crossroads {number} of {SCENARIOS.length} · {q.title}
      </motion.p>
      <WordReveal as="p" text={q.situation} className="mt-5 text-[clamp(1.375rem,1rem+1.6vw,2.125rem)] font-semibold leading-snug" delay={0.15} />

      <motion.h2 variants={rise} id={`${q.id}-prompt`} className="type-h2 mt-12 text-brand-accent-on-dark">
        {q.prompt}
      </motion.h2>
      <motion.p variants={rise} className="mt-1 text-brand-on-primary-muted">
        {q.multiple ? "Choose any that apply." : "Choose one."} There is no right answer.
      </motion.p>

      <motion.div variants={rise} role="group" aria-labelledby={`${q.id}-prompt`} className="mt-6 grid gap-3 sm:grid-cols-2">
        {q.options.map((o) => {
          const on = values.includes(o.id);
          const Icon = OPTION_ICONS[o.id] ?? Target;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.id)}
              className={`group relative flex min-h-20 items-start gap-4 rounded-2xl border px-5 py-4 text-left text-base font-semibold transition-[background-color,box-shadow,scale] duration-150 ease-out active:scale-[0.96] sm:text-[1.0625rem] ${
                on
                  ? "border-transparent bg-brand-on-primary text-brand-primary shadow-[0_0_0_2px_var(--brand-accent)]"
                  : "border-transparent bg-white/[0.06] shadow-[var(--shadow-on-dark)] hover:bg-white/[0.1] hover:shadow-[var(--shadow-on-dark-hover)]"
              }`}
            >
              <span
                aria-hidden
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-[background-color,color] duration-150 ${
                  on ? "bg-brand-accent text-brand-primary" : "bg-white/10 text-brand-accent-on-dark"
                }`}
              >
                {on ? <Check size={20} strokeWidth={2.5} absoluteStrokeWidth /> : <Icon size={20} strokeWidth={2} absoluteStrokeWidth />}
              </span>
              <span className="pt-1.5">{o.label}</span>
            </button>
          );
        })}
      </motion.div>

      <motion.div variants={rise}>
        <label htmlFor={`${q.id}-note`} className="mt-8 block font-semibold">
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
          className="mt-2 w-full rounded-xl border border-white/30 bg-white/[0.06] p-3 text-brand-on-primary placeholder:text-brand-on-primary-muted"
        />
      </motion.div>

      <AnimatePresence initial={false}>
        {confirmed && (
          <motion.div
            ref={reflectionRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } }}
            exit={exitSubtle}
            className="mt-8 outline-none"
            aria-live="polite"
          >
            <div className="rounded-[var(--radius-card)] bg-brand-accent p-6 text-brand-primary">
              <p className="type-eyebrow">What this tells us</p>
              <ul className="mt-3 space-y-2 text-lg font-semibold">
                {chosen.map((o) => (
                  <li key={o.id}>{o.reflection}</li>
                ))}
                {note.trim() && <li>We&apos;ve noted what you added. It will appear in your passport.</li>}
              </ul>
              <p className="mt-3 text-sm">Your map has been updated. You can change this answer at any time.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex justify-end">
        {confirmed ? (
          <Button size="lg" onClick={onDone} className="ps-6 pe-5">
            {number === SCENARIOS.length ? "See your Impact Map" : "Next crossroads"}
            <ArrowRight size={20} strokeWidth={2} absoluteStrokeWidth aria-hidden />
          </Button>
        ) : (
          <Button variant="onDark" size="lg" disabled={values.length === 0 && !note.trim()} onClick={confirm}>
            Confirm
          </Button>
        )}
      </div>
    </motion.article>
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

  if (index === null) return <div className="min-h-dvh bg-brand-primary" />;

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
      dark
      part="Part 2 · Career Crossroads"
      position={index + 1}
      total={SCENARIOS.length}
      onBack={index > 0 ? () => setIndex(index - 1) : () => router.push("/discover")}
      aside={<LiveMapPanel onDark />}
    >
      <ChapterIntro chapterId="crossroads" />
      {missingDiscover > 0 && (
        <p className="mb-6 rounded-xl bg-white/10 p-4 text-sm">
          You skipped {missingDiscover} question{missingDiscover === 1 ? "" : "s"} in Part 1. You can carry on here and go back later.
        </p>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={SCENARIOS[index].id} exit={exitSubtle}>
          <Scenario q={SCENARIOS[index]} number={index + 1} onDone={next} />
        </motion.div>
      </AnimatePresence>
    </StageShell>
  );
}
