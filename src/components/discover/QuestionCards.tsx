"use client";

import { Reorder, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { useState } from "react";
import type { Answer, RankQuestion, SelectQuestion, TextQuestion } from "@/lib/assessment/types";
import { Button } from "../ui/Button";

function CardFrame({ label, title, hint, children }: { label: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="surface-card flex flex-col p-6 shadow-[var(--shadow-lifted)] sm:p-9">
      <p className="type-eyebrow text-brand-accent-text">{label}</p>
      <h2 className="type-card mt-3 text-brand-primary" id="question-title">
        {title}
      </h2>
      {hint && <p className="mt-2 text-brand-muted">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function SelectCard({
  question,
  label,
  previous,
  onSubmit,
}: {
  question: SelectQuestion;
  label: string;
  previous?: Answer;
  onSubmit: (answer: Answer) => void;
}) {
  const [values, setValues] = useState<string[]>(previous?.type === "select" ? previous.values : []);
  const required = question.id === "background";
  const atMax = values.length >= question.max;

  const toggle = (id: string) =>
    setValues((v) => (v.includes(id) ? v.filter((x) => x !== id) : v.length >= question.max ? v : [...v, id]));

  return (
    <CardFrame label={label} title={question.prompt} hint={question.hint}>
      <div role="group" aria-labelledby="question-title" className="grid gap-2.5 sm:grid-cols-2">
        {question.options.map((o) => {
          const on = values.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              disabled={!on && atMax}
              onClick={() => toggle(o.id)}
              className={`flex min-h-14 items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left font-semibold transition-[background-color,color,border-color,scale] duration-150 ease-out enabled:active:scale-[0.96] disabled:opacity-45 ${
                on ? "border-brand-primary bg-brand-primary text-brand-on-primary" : "border-brand-border-strong bg-brand-background hover:bg-brand-primary-soft"
              }`}
            >
              <span
                aria-hidden
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-[1.5px] ${on ? "border-brand-accent bg-brand-accent text-brand-primary" : "border-current"}`}
              >
                {on && <Check size={14} strokeWidth={2.5} absoluteStrokeWidth />}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-brand-muted" aria-live="polite">
        {values.length} of {question.max} selected
      </p>
      <div className="mt-5 flex justify-end">
        <Button variant="secondary" disabled={required && values.length === 0} onClick={() => onSubmit({ type: "select", values })}>
          {values.length === 0 && !required ? "Continue without choosing" : "Continue"}
        </Button>
      </div>
    </CardFrame>
  );
}

export function RankCard({
  question,
  label,
  previous,
  onSubmit,
}: {
  question: RankQuestion;
  label: string;
  previous?: Answer;
  onSubmit: (answer: Answer) => void;
}) {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState<string[]>(previous?.type === "rank" ? previous.order : question.options.map((o) => o.id));
  const [announcement, setAnnouncement] = useState("");
  const byId = Object.fromEntries(question.options.map((o) => [o.id, o]));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    setAnnouncement(`${byId[next[target]].label} moved to position ${target + 1} of ${next.length}.`);
  };

  return (
    <CardFrame label={label} title={question.prompt} hint={question.hint}>
      <Reorder.Group axis="y" values={order} onReorder={setOrder} className="grid gap-2.5" aria-labelledby="question-title">
        {order.map((id, i) => (
          <Reorder.Item
            key={id}
            value={id}
            dragListener={!reduced}
            className="flex min-h-16 cursor-grab touch-none items-center gap-3 rounded-xl border-[1.5px] border-brand-border-strong bg-brand-background px-3 py-2 active:cursor-grabbing"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary font-display font-extrabold text-brand-on-primary">
              {i + 1}
            </span>
            <span className="flex-1 font-semibold">{byId[id].label}</span>
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move “${byId[id].label}” up`}
                className="grid h-11 w-11 place-items-center rounded-lg border border-brand-border-strong disabled:opacity-30"
              >
                <ArrowUp size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                aria-label={`Move “${byId[id].label}” down`}
                className="grid h-11 w-11 place-items-center rounded-lg border border-brand-border-strong disabled:opacity-30"
              >
                <ArrowDown size={18} strokeWidth={2} absoluteStrokeWidth aria-hidden />
              </button>
            </span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={() => onSubmit({ type: "rank", order })}>
          Confirm order
        </Button>
      </div>
    </CardFrame>
  );
}

export function TextCard({
  question,
  label,
  previous,
  onSubmit,
  onSkip,
}: {
  question: TextQuestion;
  label: string;
  previous?: Answer;
  onSubmit: (answer: Answer) => void;
  onSkip: () => void;
}) {
  const [text, setText] = useState(previous?.type === "text" ? previous.text : "");
  return (
    <CardFrame label={label} title={question.prompt} hint={question.hint}>
      <label htmlFor="proud" className="sr-only">
        {question.prompt}
      </label>
      <textarea
        id="proud"
        value={text}
        maxLength={question.maxLength}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="w-full rounded-xl border-[1.5px] border-brand-border-strong bg-brand-background p-4 text-base"
        placeholder="For example: I rebuilt our onboarding process so new hires were productive in half the time."
      />
      <p className="mt-1 text-right text-sm text-brand-muted">
        {text.length}/{question.maxLength}
      </p>
      <div className="mt-4 flex justify-end gap-3">
        <Button variant="ghost" onClick={onSkip}>
          Skip
        </Button>
        <Button variant="secondary" disabled={!text.trim()} onClick={() => onSubmit({ type: "text", text: text.trim() })}>
          Save and continue
        </Button>
      </div>
    </CardFrame>
  );
}
