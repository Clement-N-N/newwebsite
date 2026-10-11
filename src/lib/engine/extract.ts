import {
  CAPABILITY_LABELS,
  CAUSE_LABELS,
  CONSTRAINT_LABELS,
  MODE_LABELS,
  MOTIVATION_LABELS,
  READINESS_LABELS,
} from "../assessment/labels";
import { QUESTIONS, REQUIRED_QUESTION_IDS } from "../assessment/questions";
import type {
  Basis,
  Capability,
  Cause,
  Constraint,
  Mode,
  Motivation,
  Readiness,
  Responses,
  Signal,
  SignalKind,
  SwipeQuestion,
} from "../assessment/types";

export interface Evidence {
  questionId: string;
  /** Second-person paraphrase of the participant's answer, e.g. "you have led teams through change". */
  quote: string;
  basis: Basis;
}

export type Confidence = "strong" | "moderate" | "tentative";

export interface Theme<K extends string = string> {
  id: string;
  kind: SignalKind;
  key: K;
  label: string;
  score: number;
  basis: "demonstrated" | "stated" | "both";
  confidence: Confidence;
  evidence: Evidence[];
}

export interface Profile {
  answered: number;
  required: number;
  complete: boolean;
  capabilities: Theme<Capability>[];
  motivations: Theme<Motivation>[];
  causes: Theme<Cause>[];
  modes: Theme<Mode>[];
  constraints: Theme<Constraint>[];
  readiness: Theme<Readiness>[];
  /** Swipe statements the participant marked "Not sure". */
  unsure: SwipeQuestion[];
  proud?: string;
  notes: { questionId: string; text: string }[];
  rejected: string[];
}

const LABELS: Record<SignalKind, Record<string, string>> = {
  capability: CAPABILITY_LABELS,
  motivation: MOTIVATION_LABELS,
  cause: CAUSE_LABELS,
  mode: MODE_LABELS,
  constraint: CONSTRAINT_LABELS,
  readiness: READINESS_LABELS,
};

export const themeId = (kind: SignalKind, key: string) => `${kind}:${key}`;

const ORDINALS = ["first", "second", "third"];

/** Turn every answer into weighted signals, each carrying the evidence that produced it. */
function collectSignals(responses: Responses): { signal: Signal; evidence: Evidence }[] {
  const out: { signal: Signal; evidence: Evidence }[] = [];
  const push = (signals: Signal[], questionId: string, quote: string, scale = 1) => {
    for (const s of signals) {
      out.push({
        signal: { ...s, weight: s.weight * scale },
        evidence: { questionId, quote, basis: s.basis },
      });
    }
  };

  for (const q of QUESTIONS) {
    const a = responses[q.id];
    if (!a) continue;
    if (q.type === "swipe" && a.type === "swipe") {
      if (a.value === "yes") push(q.yes, q.id, q.evidenceYes);
      if (a.value === "no" && q.no && q.evidenceNo) push(q.no, q.id, q.evidenceNo);
    } else if (q.type === "select" && a.type === "select") {
      for (const id of a.values) {
        const opt = q.options.find((o) => o.id === id);
        if (opt) push(opt.signals, q.id, opt.evidence);
      }
    } else if (q.type === "rank" && a.type === "rank") {
      a.order.forEach((id, i) => {
        const opt = q.options.find((o) => o.id === id);
        if (opt) push(opt.signals, q.id, `${opt.evidence} ${ORDINALS[i] ?? "last"}`, q.positionWeights[i] ?? 0);
      });
    } else if (q.type === "scenario" && a.type === "scenario") {
      for (const id of a.values) {
        const opt = q.options.find((o) => o.id === id);
        if (opt) push(opt.signals, q.id, opt.evidence);
      }
    }
  }
  return out;
}

function confidenceFor(score: number, questions: number): Confidence {
  if (questions >= 2 && score >= 3) return "strong";
  if (score >= 2) return "moderate";
  return "tentative";
}

export function isAnswered(responses: Responses, questionId: string): boolean {
  const a = responses[questionId];
  if (!a) return false;
  if (a.type === "text") return a.text.trim().length > 0;
  if (a.type === "scenario") return a.values.length > 0 || Boolean(a.note?.trim());
  return true;
}

export function extractProfile(responses: Responses, rejected: string[] = []): Profile {
  const rejectedSet = new Set(rejected);
  const themes = new Map<string, Theme>();

  for (const { signal, evidence } of collectSignals(responses)) {
    if (signal.weight <= 0) continue;
    const id = themeId(signal.kind, signal.key);
    if (rejectedSet.has(id)) continue;
    const existing =
      themes.get(id) ??
      ({
        id,
        kind: signal.kind,
        key: signal.key,
        label: LABELS[signal.kind][signal.key],
        score: 0,
        basis: evidence.basis,
        confidence: "tentative",
        evidence: [],
      } satisfies Theme);
    existing.score += signal.weight;
    if (existing.basis !== evidence.basis) existing.basis = "both";
    if (!existing.evidence.some((e) => e.questionId === evidence.questionId && e.quote === evidence.quote)) {
      existing.evidence.push(evidence);
    }
    themes.set(id, existing);
  }

  for (const t of themes.values()) {
    const distinctQuestions = new Set(t.evidence.map((e) => e.questionId)).size;
    t.confidence = confidenceFor(t.score, distinctQuestions);
  }

  const byKind = <K extends string>(kind: SignalKind) =>
    [...themes.values()]
      .filter((t) => t.kind === kind)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label)) as Theme<K>[];

  const unsure = QUESTIONS.filter(
    (q): q is SwipeQuestion => q.type === "swipe" && responses[q.id]?.type === "swipe" && (responses[q.id] as { value: string }).value === "unsure",
  );

  const proudAnswer = responses.proud;
  const notes = QUESTIONS.flatMap((q) => {
    const a = responses[q.id];
    return a?.type === "scenario" && a.note?.trim() ? [{ questionId: q.id, text: a.note.trim() }] : [];
  });

  const answered = REQUIRED_QUESTION_IDS.filter((id) => isAnswered(responses, id)).length;

  return {
    answered,
    required: REQUIRED_QUESTION_IDS.length,
    complete: answered === REQUIRED_QUESTION_IDS.length,
    capabilities: byKind<Capability>("capability"),
    motivations: byKind<Motivation>("motivation"),
    causes: byKind<Cause>("cause"),
    modes: byKind<Mode>("mode"),
    constraints: byKind<Constraint>("constraint"),
    readiness: byKind<Readiness>("readiness"),
    unsure,
    proud: proudAnswer?.type === "text" && proudAnswer.text.trim() ? proudAnswer.text.trim() : undefined,
    notes,
    rejected,
  };
}

export const scoreOf = <K extends string>(themes: Theme<K>[], key: K) => themes.find((t) => t.key === key)?.score ?? 0;
