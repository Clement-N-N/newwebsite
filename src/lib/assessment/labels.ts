import type { Capability, Cause, Constraint, Mode, Motivation, Readiness } from "./types";

export const CAPABILITY_LABELS: Record<Capability, string> = {
  operations: "Operations",
  leadership: "Leadership",
  research: "Research and analysis",
  technology: "Technology",
  finance: "Financial judgement",
  communication: "Communication",
  people: "Developing people",
  entrepreneurship: "Building from scratch",
  policy: "Policy and institutions",
};

export const MOTIVATION_LABELS: Record<Motivation, string> = {
  systems: "Improving systems",
  building: "Building organisations",
  knowledge: "Generating knowledge",
  longterm: "Long-horizon problems",
  tangible: "Seeing tangible results",
  evidence: "Acting on evidence",
};

export const CAUSE_LABELS: Record<Cause, string> = {
  "global-health": "Global health and development",
  "ai-safety": "Safe and beneficial AI",
  "animal-welfare": "Animal welfare",
  biosecurity: "Pandemics and biosecurity",
  climate: "Climate change",
};

export const MODE_LABELS: Record<Mode, string> = {
  direct: "Working directly on a problem",
  enabling: "Building the organisations that do",
  resources: "Contributing influence, network or money",
};

export const CONSTRAINT_LABELS: Record<Constraint, string> = {
  financial: "Financial sustainability",
  "career-capital": "Long-term career options",
  time: "Limited time right now",
};

export const READINESS_LABELS: Record<Readiness, string> = {
  switch: "Open to a career change",
  stay: "Prefers to contribute from current role",
  "test-first": "Prefers to test before committing",
  "long-horizon": "Thinking about a longer-term transition",
};
