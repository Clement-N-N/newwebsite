"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { motionEmphasis } from "@/lib/design/motion";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { MapMotif } from "./MapMotif";

const STEPS = [
  { n: "01", title: "Swipe Discovery", body: "Quick reactions to statements about your work and what drives you.", time: "4–5 min" },
  { n: "02", title: "Career Crossroads", body: "Three realistic dilemmas that bring out your priorities and constraints.", time: "3–4 min" },
  { n: "03", title: "Your Impact Map", body: "See how your strengths, motivations and possible pathways connect, and correct anything we got wrong.", time: "2 min" },
  { n: "04", title: "Pathways and passport", body: "Three pathways to explore, the unknowns to check, and one experiment for the next seven days.", time: "3–5 min" },
];

const OUTCOMES = [
  "A clearer picture of the strengths your work already shows",
  "The motivations behind your interest in impact",
  "Three credible pathways to explore, and why each might fit",
  "The uncertainties and trade-offs worth checking",
  "One practical experiment you can run in seven days",
  "A next step in HIP's learning resources",
];

export function LandingExperience() {
  const router = useRouter();
  const { responses, loadSample } = useAssessment();
  const [entering, setEntering] = useState(false);
  const hasProgress = Object.keys(responses).length > 0;

  useEffect(() => {
    track("landing_viewed");
  }, []);

  const begin = () => {
    track("assessment_started");
    setEntering(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => router.push("/discover"), reduced ? 0 : 520);
  };

  const trySample = () => {
    loadSample("amara");
    router.push("/reveal");
  };

  return (
    <>
      <section className="relative isolate flex min-h-dvh items-center overflow-hidden bg-brand-primary text-brand-on-primary">
        <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[40%] opacity-80 lg:block">
          <div className="absolute inset-0 flex items-center pr-8">
            <MapMotif />
          </div>
        </div>
        <div className="container-page pb-16 pt-28">
          <motion.p
            className="type-eyebrow text-brand-accent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionEmphasis}
          >
            Impact Start
          </motion.p>
          <motion.h1
            className="type-display mt-5 max-w-[13ch] lg:max-w-[11.5ch]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionEmphasis, delay: 0.08 }}
          >
            What could your experience{" "}
            <span className="relative inline-block whitespace-nowrap">
              make possible?
              <svg aria-hidden viewBox="0 0 300 16" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full sm:-bottom-3 sm:h-4">
                <motion.path
                  d="M2 11 C 80 3, 200 3, 298 9"
                  fill="none"
                  stroke="var(--brand-accent)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.7, ease: "easeInOut" }}
                />
              </svg>
            </span>
          </motion.h1>
          <motion.p
            className="type-lede mt-8 max-w-xl text-brand-on-primary-muted"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionEmphasis, delay: 0.2 }}
          >
            You&apos;ve spent years building skills, knowledge and relationships. Let&apos;s explore where they could make a meaningful
            difference.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionEmphasis, delay: 0.3 }}
          >
            <Button size="lg" onClick={begin}>
              {hasProgress ? "Continue where you left off" : "Discover your impact pathways"}
              <svg aria-hidden width="20" height="20" viewBox="0 0 20 20">
                <path d="M4 10h11m-4-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <a href="#how" className={buttonClass("onDarkGhost", "lg")}>
              See how it works
            </a>
          </motion.div>
          <motion.ul
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-on-primary-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...motionEmphasis, delay: 0.45 }}
          >
            {["About 10–15 minutes", "Free to explore", "Personalised insights"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                {t}
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      <section id="how" className="scroll-mt-16 bg-brand-background py-20 sm:py-28">
        <div className="container-page">
          <p className="type-eyebrow text-brand-accent-text">How it works</p>
          <h2 className="type-h1 mt-3 max-w-2xl text-brand-primary">A short, honest look at where your experience could take you.</h2>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="surface-card flex flex-col p-6">
                <span className="font-display text-3xl font-extrabold text-brand-accent-text">{s.n}</span>
                <h3 className="mt-4 text-xl font-bold text-brand-primary">{s.title}</h3>
                <p className="mt-2 flex-1 text-brand-muted">{s.body}</p>
                <p className="mt-4 text-sm font-semibold text-brand-muted">{s.time}</p>
              </li>
            ))}
          </ol>

          <div className="mt-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="type-h2 text-brand-primary">What you&apos;ll leave with</h2>
              <ul className="mt-6 grid gap-3">
                {OUTCOMES.map((o) => (
                  <li key={o} className="flex gap-3">
                    <svg aria-hidden className="mt-1 shrink-0 text-brand-success" width="20" height="20" viewBox="0 0 20 20">
                      <path d="m4 10.5 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--radius-card)] bg-brand-primary-soft p-6 sm:p-8">
              <h2 className="text-xl font-bold text-brand-primary">What this is, and isn&apos;t</h2>
              <p className="mt-3 text-brand-muted">
                Impact Start is a discovery tool, not a personality test. It won&apos;t tell you your purpose or score your potential.
                It reflects your answers back, suggests hypotheses worth testing, and shows its reasoning so you can disagree with it.
              </p>
              <h3 className="mt-6 font-bold text-brand-primary">Your answers</h3>
              <p className="mt-2 text-brand-muted">
                Your answers stay in this browser tab and disappear when you close it, unless you choose to remember them on this
                device. If AI-assisted wording is switched on, your answers are sent to Anthropic&apos;s API to word your results.
                Impact Start does not store them on a server.
              </p>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-start gap-4 border-t border-brand-border pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-brand-muted">
              Reviewing this as a prototype? You can jump straight to the results for a{" "}
              <strong className="text-brand-text">fictional sample participant</strong>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" onClick={trySample}>
                View a sample profile
              </Button>
              <Button variant="secondary" onClick={begin}>
                Start the assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {entering && (
          <motion.div
            aria-hidden
            className="fixed inset-0 z-40 bg-brand-surface"
            initial={{ clipPath: "circle(0% at 50% 70%)" }}
            animate={{ clipPath: "circle(150% at 50% 70%)" }}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
          />
        )}
      </AnimatePresence>
      <Link href="/discover" className="sr-only">
        Go to the assessment
      </Link>
    </>
  );
}
