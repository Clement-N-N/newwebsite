"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DISCOVER_QUESTIONS } from "@/lib/assessment/questions";
import type { Answer, SwipeValue } from "@/lib/assessment/types";
import { track } from "@/lib/analytics";
import { motionEmphasis } from "@/lib/design/motion";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { LiveMapPanel } from "./LiveMapPanel";
import { RankCard, SelectCard, TextCard } from "./QuestionCards";
import { StageShell } from "./StageShell";
import { SwipeCard, type SwipeCardHandle } from "./SwipeCard";
import { Tutorial } from "./Tutorial";

const SWIPES = DISCOVER_QUESTIONS.filter((q) => q.type === "swipe");

const SWIPE_BUTTONS: { value: SwipeValue; label: string; key: string; icon: string; tone: string }[] = [
  { value: "no", label: "Doesn't resonate", key: "←", icon: "✕", tone: "border-brand-border-strong text-brand-primary hover:bg-brand-primary-soft" },
  { value: "unsure", label: "Not sure", key: "↓", icon: "?", tone: "border-brand-border-strong text-brand-muted hover:bg-brand-surface" },
  { value: "yes", label: "Resonates", key: "→", icon: "✓", tone: "border-brand-success text-brand-success hover:bg-brand-success-soft" },
];

export function DiscoverFlow() {
  const router = useRouter();
  const { hydrated, responses, setAnswer, tutorialSeen, markTutorialSeen } = useAssessment();
  const [index, setIndex] = useState<number | null>(null);
  const cardRef = useRef<SwipeCardHandle>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated || index !== null) return;
    const first = DISCOVER_QUESTIONS.findIndex((q) => !responses[q.id]);
    setIndex(first === -1 ? 0 : first);
  }, [hydrated, index, responses]);

  const question = index === null ? null : DISCOVER_QUESTIONS[index];

  useEffect(() => {
    if (question) track("question_viewed", { questionId: question.id, questionType: question.type, stage: "discover" });
  }, [question]);

  const advance = useCallback(() => {
    if (index === null) return;
    if (index >= DISCOVER_QUESTIONS.length - 1) router.push("/crossroads");
    else setIndex(index + 1);
  }, [index, router]);

  const answer = useCallback(
    (a: Answer) => {
      if (!question) return;
      setAnswer(question.id, a);
      advance();
    },
    [question, setAnswer, advance],
  );

  // Arrow keys answer swipe cards, but only when focus is on the page body or inside the deck,
  // so they never hijack scrolling in dialogs or keyboard use of other controls.
  useEffect(() => {
    if (question?.type !== "swipe") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inDeck = deckRef.current?.contains(target) || target === document.body;
      if (!inDeck || e.altKey || e.metaKey || e.ctrlKey || document.querySelector("dialog[open]")) return;
      const map: Record<string, SwipeValue> = { ArrowRight: "yes", ArrowLeft: "no", ArrowDown: "unsure" };
      const value = map[e.key];
      if (value) {
        e.preventDefault();
        cardRef.current?.commit(value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question]);

  useEffect(() => {
    if (question?.type === "swipe" && tutorialSeen) deckRef.current?.focus({ preventScroll: true });
  }, [question, tutorialSeen]);

  if (index === null || !question) return <div className="min-h-dvh bg-brand-surface" />;

  const label = `Part 1 · Discover`;
  const swipeNumber = SWIPES.findIndex((q) => q.id === question.id) + 1;
  const previous = responses[question.id];

  return (
    <StageShell
      part={label}
      position={index + 1}
      total={DISCOVER_QUESTIONS.length}
      onBack={index > 0 ? () => setIndex(index - 1) : () => router.push("/")}
      aside={<LiveMapPanel />}
    >
      <Tutorial open={hydrated && !tutorialSeen} onDone={markTutorialSeen} />

      {question.type === "swipe" ? (
        <div
          ref={deckRef}
          tabIndex={-1}
          role="group"
          aria-roledescription="statement card"
          aria-label={`Statement ${swipeNumber} of ${SWIPES.length}: ${question.statement}`}
          aria-describedby="swipe-help"
          className="outline-none"
        >
          <div className="relative mx-auto h-[min(24rem,52dvh)] w-full max-w-xl">
            <div aria-hidden className="surface-card absolute inset-0 translate-y-5 scale-[0.92] opacity-50" />
            <div aria-hidden className="surface-card absolute inset-0 translate-y-2.5 scale-[0.96] opacity-80" />
            {/* No AnimatePresence here: the outgoing card has already animated away, and keeping it
                mounted would let its unmount clear the shared card ref. */}
            <motion.div
              key={question.id}
              className="absolute inset-0"
              initial={{ scale: 0.96, y: 10, opacity: 0.6 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={motionEmphasis}
            >
                <SwipeCard
                  ref={cardRef}
                  statement={question.statement}
                  label={`Statement ${swipeNumber} of ${SWIPES.length}`}
                  previous={previous?.type === "swipe" ? previous.value : undefined}
                onCommit={(value) => answer({ type: "swipe", value })}
              />
            </motion.div>
          </div>

          <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-3">
            {SWIPE_BUTTONS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => cardRef.current?.commit(b.value)}
                aria-keyshortcuts={b.key === "←" ? "ArrowLeft" : b.key === "→" ? "ArrowRight" : "ArrowDown"}
                className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] bg-brand-background px-2 py-2 font-semibold transition-colors active:scale-[0.97] ${b.tone}`}
              >
                <span aria-hidden className="text-xl leading-none">
                  {b.icon}
                </span>
                <span className="text-[0.8125rem] leading-tight sm:text-sm">{b.label}</span>
                <span aria-hidden className="hidden text-xs font-normal text-brand-muted sm:block">
                  {b.key} key
                </span>
              </button>
            ))}
          </div>
          <p id="swipe-help" className="mt-4 text-center text-sm text-brand-muted">
            Drag the card, use the buttons, or press ← → ↓.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={motionEmphasis}
          >
            {question.type === "select" && <SelectCard question={question} label={label} previous={previous} onSubmit={answer} />}
            {question.type === "rank" && <RankCard question={question} label={label} previous={previous} onSubmit={answer} />}
            {question.type === "text" && (
              <TextCard question={question} label={`${label} · Optional`} previous={previous} onSubmit={answer} onSkip={advance} />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </StageShell>
  );
}
