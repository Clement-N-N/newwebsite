"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Hand, Keyboard, MousePointerClick, Network, Sparkles, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DISCOVER_QUESTIONS } from "@/lib/assessment/questions";
import type { Answer, Question, SwipeValue } from "@/lib/assessment/types";
import { track } from "@/lib/analytics";
import { exitSubtle, motionEmphasis, rise, stagger } from "@/lib/design/motion";
import { useLiveMap } from "@/lib/hooks/useLiveMap";
import { SOURCES } from "@/lib/knowledge/sources";
import { useAssessment } from "@/lib/state/AssessmentProvider";
import { ChapterIntro } from "../journey/ChapterIntro";
import { ImpactMap } from "../map/ImpactMap";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { LiveMapPanel } from "./LiveMapPanel";
import { RankCard, SelectCard, TextCard } from "./QuestionCards";
import { StageShell } from "./StageShell";
import { SWIPE_ICONS, SwipeCard, type SwipeCardHandle } from "./SwipeCard";

const SWIPES = DISCOVER_QUESTIONS.filter((q) => q.type === "swipe");

/** A pause in the deck to teach one idea. It is not a question and has no answer. */
type Item = { kind: "question"; q: Question } | { kind: "insight"; id: "insight-halfway" };
const ITEMS: Item[] = DISCOVER_QUESTIONS.flatMap<Item>((q) =>
  q.id === "s-lead" ? [{ kind: "question", q }, { kind: "insight", id: "insight-halfway" }] : [{ kind: "question", q }],
);

const SWIPE_BUTTONS: { value: SwipeValue; label: string; key: string; keyName: string; size: string; tone: string }[] = [
  { value: "no", label: "Doesn't resonate", key: "←", keyName: "ArrowLeft", size: "h-16 w-16", tone: "text-brand-primary" },
  { value: "unsure", label: "Not sure", key: "↓", keyName: "ArrowDown", size: "h-12 w-12", tone: "text-brand-muted" },
  { value: "yes", label: "Resonates", key: "→", keyName: "ArrowRight", size: "h-16 w-16", tone: "text-brand-success" },
];

function HowItWorks() {
  const rows: { icon: typeof Hand; text: string; desktopOnly?: boolean }[] = [
    { icon: Hand, text: "Drag a card right if it resonates, left if it doesn't." },
    { icon: MousePointerClick, text: "Or use the buttons. “Not sure” is useful information too." },
    { icon: Keyboard, text: "Keyboard: ← → ↓.", desktopOnly: true },
    { icon: Undo2, text: "Go back and change any answer, or pause at any time." },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map(({ icon: Icon, text, desktopOnly }) => (
        <li key={text} className={`surface-dark items-start gap-3 p-3.5 text-sm sm:p-4 ${desktopOnly ? "hidden sm:flex" : "flex"}`}>
          <Icon size={18} strokeWidth={1.5} absoluteStrokeWidth className="mt-0.5 shrink-0 text-brand-accent-on-dark" aria-hidden />
          {text}
        </li>
      ))}
    </ul>
  );
}

function InsightCard({ themes, onContinue }: { themes: number; onContinue: () => void }) {
  const source = SOURCES["80k-ops"];
  return (
    <motion.article
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="relative isolate overflow-hidden rounded-[var(--radius-card)] bg-brand-primary p-7 text-brand-on-primary shadow-[var(--shadow-lifted)] sm:p-10"
      aria-labelledby="insight-title"
    >
      <div aria-hidden className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-brand-accent/25 blur-3xl" />
      <motion.p variants={rise} className="type-eyebrow flex items-center gap-2 text-brand-accent-on-dark">
        <Sparkles size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden /> Halfway · A moment to learn
      </motion.p>
      <motion.h2 variants={rise} id="insight-title" className="type-h2 mt-4">
        {themes > 0 ? `Your map already shows ${themes} theme${themes === 1 ? "" : "s"}.` : "Your map is waiting for more answers."}
      </motion.h2>
      <motion.p variants={rise} className="type-lede mt-4 text-brand-on-primary-muted">
        Skills you think of as ordinary can be the scarce ones. Mission-driven organisations have often reported that strong operations
        and management people are hard to find.
      </motion.p>
      <motion.p variants={rise} className="mt-3 text-sm text-brand-on-primary-muted">
        Background:{" "}
        <a href={source.url} target="_blank" rel="noreferrer" className="font-semibold text-brand-on-primary underline underline-offset-2">
          {source.publisher}, {source.title}
        </a>
      </motion.p>
      <motion.div variants={rise} className="mt-8">
        <Button onClick={onContinue} className="ps-4 pe-3.5">
          Keep going <ArrowRight size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
        </Button>
      </motion.div>
    </motion.article>
  );
}

/** Announces themes that an answer has just added to the map. */
function NewThemes({ labels }: { labels: string[] }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-3 z-20 flex justify-center" aria-live="polite">
      <AnimatePresence>
        {labels.length > 0 && (
          <motion.p
            key={labels.join("|")}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: "easeOut" } }}
            exit={exitSubtle}
            className="flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-on-primary shadow-[var(--shadow-lifted)]"
          >
            <Network size={16} strokeWidth={2} absoluteStrokeWidth className="text-brand-accent-on-dark" aria-hidden />
            New on your map: {labels.join(", ")}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DiscoverFlow() {
  const router = useRouter();
  const { hydrated, responses, setAnswer, chaptersSeen } = useAssessment();
  const { map } = useLiveMap();
  const [index, setIndex] = useState<number | null>(null);
  const [newThemes, setNewThemes] = useState<string[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const cardRef = useRef<SwipeCardHandle>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const knownNodes = useRef<Set<string> | null>(null);
  const introOpen = hydrated && !chaptersSeen.includes("discover");

  useEffect(() => {
    if (!hydrated || index !== null) return;
    const first = ITEMS.findIndex((it) => it.kind === "question" && !responses[it.q.id]);
    setIndex(first === -1 ? 0 : first);
  }, [hydrated, index, responses]);

  // Diff the map after each answer so the participant sees their answer become a theme.
  useEffect(() => {
    const ids = new Set(map.nodes.filter((n) => n.group !== "pathway").map((n) => n.id));
    if (knownNodes.current) {
      const added = map.nodes.filter((n) => ids.has(n.id) && !knownNodes.current!.has(n.id)).map((n) => n.label);
      if (added.length) {
        setNewThemes(added);
        const t = window.setTimeout(() => setNewThemes([]), 2200);
        knownNodes.current = ids;
        return () => window.clearTimeout(t);
      }
    }
    knownNodes.current = ids;
  }, [map]);

  const item = index === null ? null : ITEMS[index];
  const question = item?.kind === "question" ? item.q : null;

  useEffect(() => {
    if (question) track("question_viewed", { questionId: question.id, questionType: question.type, stage: "discover" });
  }, [question]);

  // Each card starts at the top of the page, so the deck is never half off-screen on phones.
  useEffect(() => {
    if (index !== null) window.scrollTo({ top: 0 });
  }, [index]);

  const advance = useCallback(() => {
    if (index === null) return;
    if (index >= ITEMS.length - 1) router.push("/crossroads");
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

  // Arrow keys answer swipe cards only when focus is on the page or inside the deck.
  useEffect(() => {
    if (question?.type !== "swipe" || introOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inDeck = deckRef.current?.contains(target) || target === document.body;
      if (!inDeck || e.altKey || e.metaKey || e.ctrlKey || document.querySelector("dialog[open]")) return;
      const keyMap: Record<string, SwipeValue> = { ArrowRight: "yes", ArrowLeft: "no", ArrowDown: "unsure" };
      const value = keyMap[e.key];
      if (value) {
        e.preventDefault();
        cardRef.current?.commit(value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, introOpen]);

  useEffect(() => {
    if (question?.type === "swipe" && !introOpen) deckRef.current?.focus({ preventScroll: true });
  }, [question, introOpen]);

  if (index === null || !item) return <div className="min-h-dvh bg-brand-surface" />;

  const label = "Part 1 · Discover";
  const questionNumber = ITEMS.slice(0, index + 1).filter((it) => it.kind === "question").length;
  const swipeNumber = question ? SWIPES.findIndex((q) => q.id === question.id) + 1 : 0;
  const previous = question ? responses[question.id] : undefined;
  const themeCount = map.nodes.filter((n) => n.group !== "pathway").length;

  return (
    <StageShell
      part={label}
      position={questionNumber}
      total={DISCOVER_QUESTIONS.length}
      onBack={index > 0 ? () => setIndex(index - 1) : () => router.push("/")}
      aside={<LiveMapPanel />}
    >
      <ChapterIntro chapterId="discover">
        <HowItWorks />
      </ChapterIntro>

      {item.kind === "insight" ? (
        <InsightCard themes={themeCount} onContinue={advance} />
      ) : question?.type === "swipe" ? (
        <div
          ref={deckRef}
          tabIndex={-1}
          role="group"
          aria-roledescription="statement card"
          aria-label={`Statement ${swipeNumber} of ${SWIPES.length}: ${question.statement}`}
          aria-describedby="swipe-help"
          className="relative outline-none"
        >
          <NewThemes labels={newThemes} />
          <div className="relative mx-auto h-[min(26rem,54dvh)] w-full max-w-xl [perspective:1100px]">
            <div aria-hidden className="surface-card absolute inset-0 translate-y-6 scale-[0.9] opacity-40" />
            <div aria-hidden className="surface-card absolute inset-0 translate-y-3 scale-[0.95] opacity-75" />
            {/* No AnimatePresence: the outgoing card has already flown away, and keeping it
                mounted would let its unmount clear the shared card ref. */}
            <motion.div
              key={question.id}
              className="absolute inset-0"
              initial={{ scale: 0.95, y: 12, opacity: 0.75 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={motionEmphasis}
            >
              <SwipeCard
                ref={cardRef}
                index={swipeNumber}
                statement={question.statement}
                label={`Statement ${swipeNumber} of ${SWIPES.length}`}
                previous={previous?.type === "swipe" ? previous.value : undefined}
                onCommit={(value) => answer({ type: "swipe", value })}
              />
            </motion.div>
          </div>

          <div className="mx-auto mt-10 flex max-w-md items-start justify-center gap-6 sm:gap-10">
            {SWIPE_BUTTONS.map((b) => {
              const Icon = SWIPE_ICONS[b.value];
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => cardRef.current?.commit(b.value)}
                  aria-keyshortcuts={b.keyName}
                  aria-label={b.label}
                  className="group flex w-24 flex-col items-center gap-2 font-semibold"
                >
                  <span className="grid h-16 place-items-center">
                  <span
                    className={`grid ${b.size} place-items-center rounded-full bg-brand-background shadow-[var(--shadow-soft)] transition-[scale,box-shadow] duration-150 ease-out group-hover:shadow-[var(--shadow-lifted)] group-active:scale-[0.96] ${b.tone}`}
                  >
                    <Icon size={b.value === "unsure" ? 20 : 26} strokeWidth={2.5} absoluteStrokeWidth aria-hidden />
                  </span>
                  </span>
                  <span aria-hidden className="min-h-[2.2em] text-center text-[0.8125rem] leading-tight text-brand-text">
                    {b.label}
                  </span>
                  <span aria-hidden className="hidden text-xs font-normal text-brand-muted sm:block">
                    {b.key}
                  </span>
                </button>
              );
            })}
          </div>
          <p id="swipe-help" className="sr-only">
            Drag the card, use the buttons, or press the left, right or down arrow keys.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={question!.id} initial="hidden" animate="visible" exit={exitSubtle} variants={rise}>
            {question!.type === "select" && <SelectCard question={question!} label={label} previous={previous} onSubmit={answer} />}
            {question!.type === "rank" && <RankCard question={question!} label={label} previous={previous} onSubmit={answer} />}
            {question!.type === "text" && (
              <TextCard question={question!} label={`${label} · Optional`} previous={previous} onSubmit={answer} onSkip={advance} />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Phones and tablets: the live map lives in a sheet behind a pill. */}
      <button
        type="button"
        onClick={() => setMapOpen(true)}
        className="fixed bottom-4 right-4 z-20 flex min-h-11 items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-[var(--shadow-lifted)] transition-[scale] duration-150 ease-out active:scale-[0.96] md:hidden"
      >
        <Network size={16} strokeWidth={2} absoluteStrokeWidth className="text-brand-accent-on-dark" aria-hidden />
        Your map · {themeCount}
      </button>
      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} title="Your Living Impact Map">
        <p className="mb-4 text-sm text-brand-muted">Themes appear here from your own answers.</p>
        <ImpactMap map={map} compact caption="Live preview of your Impact Map" />
      </Dialog>
    </StageShell>
  );
}
