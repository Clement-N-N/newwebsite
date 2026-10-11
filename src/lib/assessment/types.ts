// Core assessment vocabulary. Everything the engine reasons about is one of these keys.

export const CAPABILITIES = [
  "operations",
  "leadership",
  "research",
  "technology",
  "finance",
  "communication",
  "people",
  "entrepreneurship",
  "policy",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

export const MOTIVATIONS = ["systems", "building", "knowledge", "longterm", "tangible", "evidence"] as const;
export type Motivation = (typeof MOTIVATIONS)[number];

export const CAUSES = [
  "global-health",
  "ai-safety",
  "animal-welfare",
  "biosecurity",
  "climate",
] as const;
export type Cause = (typeof CAUSES)[number];

export const MODES = ["direct", "enabling", "resources"] as const;
export type Mode = (typeof MODES)[number];

export const CONSTRAINTS = ["financial", "career-capital", "time"] as const;
export type Constraint = (typeof CONSTRAINTS)[number];

export const READINESS = ["switch", "stay", "test-first", "long-horizon"] as const;
export type Readiness = (typeof READINESS)[number];

/** Demonstrated = something the person says they have done. Stated = a preference or interest. */
export type Basis = "demonstrated" | "stated";

export type Signal =
  | { kind: "capability"; key: Capability; weight: number; basis: Basis }
  | { kind: "motivation"; key: Motivation; weight: number; basis: Basis }
  | { kind: "cause"; key: Cause; weight: number; basis: Basis }
  | { kind: "mode"; key: Mode; weight: number; basis: Basis }
  | { kind: "constraint"; key: Constraint; weight: number; basis: Basis }
  | { kind: "readiness"; key: Readiness; weight: number; basis: Basis };

export type SignalKind = Signal["kind"];

export interface Option {
  id: string;
  label: string;
  /** Short phrase used when quoting this answer back as evidence. */
  evidence: string;
  signals: Signal[];
}

interface BaseQuestion {
  id: string;
  stage: "discover" | "crossroads";
  /** What the engine needs this question for. Shown in the dev review area. */
  purpose: string;
  optional?: boolean;
}

export interface SwipeQuestion extends BaseQuestion {
  type: "swipe";
  statement: string;
  /** Evidence phrase when the participant says it resonates. */
  evidenceYes: string;
  evidenceNo?: string;
  yes: Signal[];
  no?: Signal[];
}

export interface SelectQuestion extends BaseQuestion {
  type: "select";
  prompt: string;
  hint?: string;
  max: number;
  options: Option[];
}

export interface RankQuestion extends BaseQuestion {
  type: "rank";
  prompt: string;
  hint?: string;
  options: Option[];
  /** Weight applied to each rank position (first = most). */
  positionWeights: number[];
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
  prompt: string;
  hint?: string;
  maxLength: number;
}

export interface ScenarioQuestion extends BaseQuestion {
  type: "scenario";
  title: string;
  situation: string;
  prompt: string;
  multiple: boolean;
  options: (Option & { reflection: string })[];
  followUp: string;
}

export type Question = SwipeQuestion | SelectQuestion | RankQuestion | TextQuestion | ScenarioQuestion;

export type SwipeValue = "yes" | "no" | "unsure";

export type Answer =
  | { type: "swipe"; value: SwipeValue }
  | { type: "select"; values: string[] }
  | { type: "rank"; order: string[] }
  | { type: "text"; text: string }
  | { type: "scenario"; values: string[]; note?: string };

export type Responses = Record<string, Answer>;
