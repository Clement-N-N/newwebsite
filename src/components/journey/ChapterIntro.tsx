"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Clock, Lightbulb, Target } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { track } from "@/lib/analytics";
import { rise, stagger } from "@/lib/design/motion";
import { CHAPTER_BY_ID, CHAPTERS, type Chapter } from "@/lib/journey";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { Aurora } from "../fx/Aurora";
import { WordReveal } from "../fx/WordReveal";
import { Button } from "../ui/Button";

/**
 * A full-screen chapter opening: the chapter's number, its one idea, and what the participant
 * will get from it. Shown once per chapter, then remembered for the session.
 */
export function ChapterIntro({ chapterId, children }: { chapterId: Chapter["id"]; children?: ReactNode }) {
  const { hydrated, chaptersSeen, markChapterSeen } = useAssessment();
  const chapter = CHAPTER_BY_ID[chapterId];
  const open = hydrated && !chaptersSeen.includes(chapterId);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => buttonRef.current?.focus({ preventScroll: true }), 350);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  const begin = () => {
    track("question_viewed", { stage: `chapter-${chapterId}` });
    markChapterSeen(chapterId);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="chapter-title"
          aria-describedby="chapter-lesson"
          className="fixed inset-0 z-50 isolate overflow-y-auto overscroll-contain bg-brand-primary text-brand-on-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.3, ease: "easeOut" } }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onKeyDown={(e) => {
            if (e.key === "Escape") begin();
            // The only control is the Begin button, so keep focus inside the dialog.
            if (e.key === "Tab") {
              e.preventDefault();
              buttonRef.current?.focus();
            }
          }}
        >
          <Aurora tone={chapter.n % 2 ? "primary" : "deep"} className="!fixed" />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -right-[4vw] bottom-[-6vw] select-none font-display text-[38vw] font-extrabold leading-none text-transparent [-webkit-text-stroke:2px_oklch(1_0_0/0.09)] lg:text-[30vw]"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {String(chapter.n).padStart(2, "0")}
          </motion.span>
          <div className="container-page relative flex min-h-dvh flex-col justify-center py-12 sm:py-20">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
              <motion.ol variants={rise} className="mb-8 flex items-center gap-1.5 sm:mb-10" aria-label={`Chapter ${chapter.n} of ${CHAPTERS.length}`}>
                {CHAPTERS.map((c) => (
                  <li
                    key={c.id}
                    aria-hidden
                    className={`h-1 rounded-full transition-[width,background-color] duration-300 ${
                      c.n < chapter.n ? "w-6 bg-brand-on-primary/70" : c.n === chapter.n ? "w-12 bg-brand-accent" : "w-6 bg-white/20"
                    }`}
                  />
                ))}
              </motion.ol>
              <motion.p variants={rise} className="type-eyebrow text-brand-accent-on-dark">
                Chapter {String(chapter.n).padStart(2, "0")} · {chapter.stage}
              </motion.p>
              <WordReveal as="h1" id="chapter-title" text={chapter.title} className="type-display mt-5" delay={0.2} />
              <motion.div variants={rise} className="mt-6 grid gap-6 sm:mt-10 sm:grid-cols-[auto_1fr] sm:gap-x-5">
                <span className="hidden h-12 w-12 place-items-center rounded-2xl bg-brand-accent text-brand-primary sm:grid" aria-hidden>
                  <Lightbulb size={22} strokeWidth={2} absoluteStrokeWidth />
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-on-primary-muted">The idea: {chapter.concept}</p>
                  <p id="chapter-lesson" className="type-lede mt-2 max-w-2xl">
                    {chapter.lesson}
                  </p>
                </div>
              </motion.div>
              {children && (
                <motion.div variants={rise} className="mt-6 sm:mt-8">
                  {children}
                </motion.div>
              )}
              <motion.div variants={rise} className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-brand-on-primary-muted sm:mt-10">
                <span className="flex items-center gap-2">
                  <Target size={18} strokeWidth={1.5} absoluteStrokeWidth aria-hidden />
                  {chapter.objective}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={18} strokeWidth={1.5} absoluteStrokeWidth aria-hidden />
                  {chapter.time}
                </span>
              </motion.div>
              <motion.div variants={rise} className="mt-8 sm:mt-10">
                <Button ref={buttonRef} size="lg" onClick={begin} className="ps-6 pe-5">
                  Begin chapter {chapter.n}
                  <ArrowRight size={20} strokeWidth={2} absoluteStrokeWidth aria-hidden />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
