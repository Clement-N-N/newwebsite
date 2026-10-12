"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowRight, Check, Clock, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { rise, stagger } from "@/lib/design/motion";
import { CHAPTERS } from "@/lib/journey";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { Aurora } from "../fx/Aurora";
import { WordReveal } from "../fx/WordReveal";
import { HeroTiles } from "./HeroTiles";
import { ScrollStory } from "./ScrollStory";

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
    window.setTimeout(() => router.push("/discover"), reduced ? 0 : 560);
  };

  const trySample = () => {
    loadSample("amara");
    router.push("/reveal");
  };

  return (
    <div className="relative isolate bg-brand-primary text-brand-on-primary">
      <Aurora tone="primary" className="!fixed" />

      <section className="relative flex min-h-dvh items-center overflow-hidden">
        <div className="container-page grid items-center gap-12 pb-20 pt-28 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.p variants={rise} className="type-eyebrow flex items-center gap-2 text-brand-accent-on-dark">
            <Sparkles size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden /> Impact Career Compass
          </motion.p>
          <WordReveal
            text="What could your experience make possible?"
            highlight={["possible?"]}
            className="type-display mt-6 max-w-[14ch]"
            delay={0.15}
          />
          <motion.p variants={rise} className="type-lede mt-8 max-w-xl text-brand-on-primary-muted" transition={{ delay: 0.7 }}>
            You&apos;ve spent years building skills, knowledge and relationships. Let&apos;s explore where they could make a meaningful
            difference.
          </motion.p>
          <motion.div variants={rise} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" onClick={begin} className="ps-6 pe-5">
              {hasProgress ? "Continue where you left off" : "Discover your impact pathways"}
              <ArrowRight size={20} strokeWidth={2} absoluteStrokeWidth aria-hidden />
            </Button>
            <a
              href="#how"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] px-5 py-3.5 font-semibold shadow-[var(--shadow-on-dark)] transition-[background-color,scale] duration-150 ease-out hover:bg-white/10 active:scale-[0.96] sm:text-lg"
            >
              See how it works <ArrowDown size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
            </a>
          </motion.div>
          <motion.ul variants={rise} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-on-primary-muted">
            {[
              { icon: Clock, t: "About 10–15 minutes" },
              { icon: Check, t: "Free to explore" },
              { icon: Lock, t: "Personalised, and private by default" },
            ].map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-2">
                <Icon size={16} strokeWidth={1.5} absoluteStrokeWidth className="text-brand-accent-on-dark" aria-hidden />
                {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>
        <div className="hidden lg:block">
          <HeroTiles />
        </div>
        </div>
      </section>

      <ScrollStory />

      <section className="relative py-24 sm:py-32" aria-labelledby="chapters-title">
        <div className="container-page">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-15%" }} variants={stagger}>
            <motion.p variants={rise} className="type-eyebrow text-brand-accent-on-dark">
              An immersive learning journey
            </motion.p>
            <motion.h2 variants={rise} id="chapters-title" className="type-h1 mt-3 max-w-3xl">
              Seven chapters. One idea in each.
            </motion.h2>
            <motion.p variants={rise} className="type-lede mt-4 max-w-2xl text-brand-on-primary-muted">
              Every step teaches a concept people use to choose high-impact work, then applies it to you.
            </motion.p>
          </motion.div>
          <motion.ol
            className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {CHAPTERS.map((c) => (
              <motion.li key={c.id} variants={rise} className="surface-dark group flex flex-col p-5 transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-on-dark-hover)]">
                <span className="font-display text-4xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_var(--brand-accent)]">
                  {String(c.n).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
                <p className="mt-1 text-sm text-brand-on-primary-muted">
                  <span className="font-semibold text-brand-on-primary">{c.concept}.</span> {c.stage}
                </p>
              </motion.li>
            ))}
            <motion.li variants={rise} className="flex flex-col justify-between rounded-[var(--radius-card)] bg-brand-accent p-5 text-brand-primary">
              <p className="text-lg font-bold">Ready when you are.</p>
              <button type="button" onClick={begin} className="mt-6 inline-flex min-h-11 items-center gap-2 self-start font-bold underline underline-offset-4">
                Start chapter 1 <ArrowRight size={18} strokeWidth={2.5} absoluteStrokeWidth aria-hidden />
              </button>
            </motion.li>
          </motion.ol>
        </div>
      </section>

      <section className="relative bg-brand-background py-24 text-brand-text sm:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="type-h2 text-brand-primary">What you&apos;ll leave with</h2>
            <ul className="mt-6 grid gap-3">
              {OUTCOMES.map((o) => (
                <li key={o} className="flex gap-3">
                  <Check size={20} strokeWidth={2} absoluteStrokeWidth className="mt-1 shrink-0 text-brand-success" aria-hidden />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius-card)] bg-brand-primary-soft p-6 sm:p-8">
            <h2 className="text-xl font-bold text-brand-primary">What this is, and isn&apos;t</h2>
            <p className="mt-3 text-brand-muted">
              Impact Career Compass is a discovery tool, not a personality test. It won&apos;t tell you your purpose or score your potential. It
              reflects your answers back, suggests hypotheses worth testing, and shows its reasoning so you can disagree with it.
            </p>
            <h3 className="mt-6 font-bold text-brand-primary">Your answers</h3>
            <p className="mt-2 text-brand-muted">
              Your answers stay in this browser tab and disappear when you close it, unless you choose to remember them on this device. If
              AI-assisted wording is switched on, your answers are sent to Anthropic&apos;s API to word your results. Impact Career Compass does not
              store them on a server.
            </p>
          </div>
        </div>
        <div className="container-page mt-16 flex flex-col items-start gap-4 border-t border-brand-border pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-brand-muted">
            Reviewing this as a prototype? Jump straight to the results for a <strong className="text-brand-text">fictional sample participant</strong>.
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
      </section>

      <AnimatePresence>
        {entering && (
          <motion.div
            aria-hidden
            className="fixed inset-0 z-40 bg-brand-primary-deep"
            initial={{ clipPath: "circle(0% at 50% 60%)" }}
            animate={{ clipPath: "circle(150% at 50% 60%)" }}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
