"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { REQUIRED_QUESTION_IDS } from "@/lib/assessment/questions";
import { isAnswered } from "@/lib/engine/extract";
import { CHAPTERS, type Chapter } from "@/lib/journey";
import { useAssessment } from "@/lib/state/AssessmentProvider";

/** Orientation across the whole journey: where you are, what's done, what's reachable. */
export function JourneyRail({ current, onDark }: { current: Chapter; onDark: boolean }) {
  const { responses, report, lessonsCompleted, chaptersSeen } = useAssessment();
  const complete = REQUIRED_QUESTION_IDS.every((id) => isAnswered(responses, id));
  const started = Object.keys(responses).length > 0;

  const state = (c: Chapter): { reachable: boolean; done: boolean } => {
    switch (c.id) {
      case "discover":
        return { reachable: true, done: REQUIRED_QUESTION_IDS.filter((id) => !id.startsWith("x-")).every((id) => isAnswered(responses, id)) };
      case "crossroads":
        return { reachable: started, done: ["x-paycut", "x-transfer", "x-time"].every((id) => isAnswered(responses, id)) };
      case "map":
        return { reachable: started, done: complete && chaptersSeen.includes("reveal") };
      case "reveal":
        return { reachable: complete, done: Boolean(report) && chaptersSeen.includes("pathways") };
      case "pathways":
        return { reachable: complete, done: chaptersSeen.includes("passport") };
      case "passport":
        return { reachable: complete, done: chaptersSeen.includes("learn") };
      case "learn":
        return { reachable: true, done: lessonsCompleted.length > 0 };
    }
  };

  const muted = onDark ? "text-brand-on-primary-muted" : "text-brand-muted";

  return (
    <nav aria-label="Journey" className="flex min-w-0 items-center gap-3">
      <p className={`hidden whitespace-nowrap text-xs font-semibold lg:block ${muted}`}>
        <span className={onDark ? "text-brand-on-primary" : "text-brand-primary"}>Chapter {current.n}</span> · {current.title}
      </p>
      <p className={`whitespace-nowrap text-xs font-semibold sm:hidden ${muted}`}>
        Chapter {current.n} of {CHAPTERS.length}
      </p>
      <ol className="hidden items-center gap-1 sm:flex">
        {CHAPTERS.map((c) => {
          const { reachable, done } = state(c);
          const isCurrent = c.id === current.id;
          const dot = (
            <span
              className={`grid h-6 place-items-center rounded-full text-[0.6875rem] font-bold tabular-nums transition-[width,background-color,color] duration-300 ${
                isCurrent
                  ? "w-10 bg-brand-accent text-brand-primary"
                  : done
                    ? `w-6 ${onDark ? "bg-white/20 text-brand-on-primary" : "bg-brand-primary text-brand-on-primary"}`
                    : `w-6 ${onDark ? "bg-white/[0.06] text-brand-on-primary-muted" : "bg-brand-primary-soft text-brand-muted"}`
              }`}
            >
              {done && !isCurrent ? <Check size={12} strokeWidth={2.5} absoluteStrokeWidth aria-hidden /> : c.n}
            </span>
          );
          const label = `Chapter ${c.n}: ${c.title}${isCurrent ? " (current)" : done ? " (done)" : ""}`;
          return (
            <li key={c.id}>
              {reachable && !isCurrent ? (
                <Link href={c.href} aria-label={label} title={label} className="grid h-11 min-w-7 place-items-center rounded-full">
                  {dot}
                </Link>
              ) : (
                <span aria-label={label} aria-current={isCurrent ? "step" : undefined} title={label} className="grid h-11 min-w-7 place-items-center" role="img">
                  {dot}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
