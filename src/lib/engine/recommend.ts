import type { Capability, Cause, Motivation } from "../assessment/types";
import { PATHWAYS, type ChangeLevel, type Pathway } from "../knowledge/pathways";
import { scoreOf, type Profile, type Theme } from "./extract";

export const ENGINE_VERSION = "engine-2026.10.2";

/** Anchored 0–3 scales from the Impact Compass instructions (section 9). Never aggregated into a score. */
export interface Rating {
  score: 0 | 1 | 2 | 3;
  short: string;
  label: string;
}
const scale = (rows: [string, string][]) => (n: 0 | 1 | 2 | 3): Rating => ({ score: n, short: rows[n][0], label: rows[n][1] });
export const SKILL_SCALE = scale([
  ["None", "No relevant evidence"],
  ["Limited", "Limited or indirect evidence"],
  ["Some", "Some demonstrated transferable experience"],
  ["Substantial", "Substantial directly relevant experience"],
]);
export const MOTIVATION_SCALE = scale([
  ["Low", "Little or no interest expressed"],
  ["Mild", "Mild or uncertain interest"],
  ["Clear", "Clear interest with some supporting behaviour"],
  ["Strong", "Strong interest supported by what you've done"],
]);
export const FEASIBILITY_SCALE = scale([
  ["Conflicts", "Conflicts with a constraint you stated"],
  ["Barriers", "Significant unresolved barriers"],
  ["Plausible", "Plausible with further investigation"],
  ["Feasible", "Feasible on what you've told us"],
]);

export type Priority = "Explore now" | "Worth investigating" | "Longer-term possibility" | "Not currently practical";

export interface Fit {
  skill: Rating;
  motivation: Rating;
  feasibility: Rating;
  /** Strength of evidence for the opportunity itself, from the library. Not a probability of success. */
  evidence: Pathway["evidence"];
  learning: Pathway["learning"];
  testability: "Easy to test" | "Takes more set-up";
  priority: Priority;
  priorityReason: string;
}

export interface Candidate {
  pathway: Pathway;
  /** Internal ranking only. Never shown to participants. */
  score: number;
  parts: { skill: number; motivation: number; cause: number; mode: number; feasibility: number };
  fit: Fit;
  matchedCapabilities: Theme<Capability>[];
  matchedMotivations: Theme<Motivation>[];
  matchedCause?: Theme<Cause>;
}

export type Role = "adjacent" | "stretch" | "no-switch";

export const ROLE_LABELS: Record<Role, string> = {
  adjacent: "Builds on what you already do",
  stretch: "A stretch worth testing",
  "no-switch": "Without changing jobs",
};

const WEIGHTS: Record<ChangeLevel, Record<"skill" | "motivation" | "cause" | "mode" | "feasibility", number>> = {
  adjacent: { skill: 0.5, motivation: 0.15, cause: 0.15, mode: 0.1, feasibility: 0.1 },
  stretch: { skill: 0.35, motivation: 0.15, cause: 0.3, mode: 0.1, feasibility: 0.1 },
  "no-switch": { skill: 0.45, motivation: 0.15, cause: 0.1, mode: 0.2, feasibility: 0.1 },
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function scorePathway(pathway: Pathway, profile: Profile): Candidate {
  const capScore = (c: Capability) => clamp(scoreOf(profile.capabilities, c) / 4);

  const matchedCapabilities = pathway.capabilities
    .map((c) => profile.capabilities.find((t) => t.key === c))
    .filter((t): t is Theme<Capability> => Boolean(t))
    .sort((a, b) => b.score - a.score);
  // Generalist pathways need any one strong capability; others depend most on their core capabilities.
  const skill = pathway.generalist
    ? capScore(matchedCapabilities[0]?.key ?? pathway.capabilities[0])
    : clamp(
        0.55 * capScore(pathway.capabilities[0]) +
          0.3 * capScore(pathway.capabilities[1] ?? pathway.capabilities[0]) +
          0.15 * Math.max(0, ...pathway.capabilities.slice(2).map(capScore)),
      );

  const matchedMotivations = pathway.motivations
    .map((m) => profile.motivations.find((t) => t.key === m))
    .filter((t): t is Theme<Motivation> => Boolean(t));
  const motivation = clamp(matchedMotivations.reduce((sum, t) => sum + t.score, 0) / 4);

  const chosenCauses = profile.causes;
  const matchedCause = pathway.cause ? chosenCauses.find((t) => t.key === pathway.cause) : undefined;
  let cause: number;
  if (pathway.cause === null) cause = chosenCauses.length ? 0.55 : 0.6;
  else if (matchedCause) cause = 1;
  else cause = chosenCauses.length ? 0.2 : 0.4;

  const maxMode = Math.max(1, ...profile.modes.map((t) => t.score));
  // A preference, not a filter: even the least preferred mode keeps some weight.
  const mode = 0.4 + 0.6 * clamp(scoreOf(profile.modes, pathway.mode) / maxMode);

  const has = (themes: Theme[], key: string) => themes.some((t) => t.key === key);
  let feasibility = 1;
  const switching = pathway.change !== "no-switch";
  if (has(profile.constraints, "financial") && switching) feasibility -= pathway.change === "stretch" ? 0.25 : 0.15;
  if (has(profile.readiness, "stay") && switching) feasibility -= 0.4;
  if (has(profile.constraints, "time") && !pathway.lowCommitment) feasibility -= 0.2;
  if (has(profile.readiness, "switch") && pathway.change === "stretch") feasibility += 0.1;
  if (has(profile.readiness, "long-horizon") && pathway.change === "stretch") feasibility += 0.1;
  feasibility = clamp(feasibility);

  // A stretch is a move into a new field, so the problem it addresses matters more; for
  // no-switch options, how someone wants to contribute matters more.
  const w = WEIGHTS[pathway.change];
  const score = w.skill * skill + w.motivation * motivation + w.cause * cause + w.mode * mode + w.feasibility * feasibility;

  const fit = rate(pathway, profile, { skill, matchedCapabilities, matchedMotivations, matchedCause, maxMode });

  return {
    pathway,
    score,
    parts: { skill, motivation, cause, mode, feasibility },
    fit,
    matchedCapabilities,
    matchedMotivations,
    matchedCause,
  };
}

function rate(
  pathway: Pathway,
  profile: Profile,
  m: {
    skill: number;
    matchedCapabilities: Theme<Capability>[];
    matchedMotivations: Theme<Motivation>[];
    matchedCause?: Theme<Cause>;
    maxMode: number;
  },
): Fit {
  const has = (themes: Theme[], key: string) => themes.some((t) => t.key === key);

  // Skill fit: demonstrated evidence for the capabilities this work depends on most.
  const primaryMatched = m.matchedCapabilities.some((t) => t.key === pathway.capabilities[0]);
  const demonstrated = m.matchedCapabilities.some((t) => t.basis !== "stated");
  const skill: 0 | 1 | 2 | 3 = m.matchedCapabilities.length === 0 ? 0 : m.skill >= 0.6 && primaryMatched && demonstrated ? 3 : m.skill >= 0.35 ? 2 : 1;

  // Motivation: stated interest in the problem or the kind of work, and whether behaviour backs it.
  const choseOtherCauses = Boolean(pathway.cause) && profile.causes.length > 0 && !m.matchedCause;
  const modeShare = scoreOf(profile.modes, pathway.mode) / m.maxMode;
  const interest =
    clamp(m.matchedMotivations.reduce((sum, t) => sum + t.score, 0) / 4) + (m.matchedCause ? 0.3 : 0) + (modeShare >= 0.6 ? 0.2 : 0);
  const backedByBehaviour = m.matchedMotivations.some((t) => t.basis === "both");
  const motivation: 0 | 1 | 2 | 3 =
    choseOtherCauses && m.matchedMotivations.length === 0 ? 0 : interest >= 0.8 && backedByBehaviour ? 3 : interest >= 0.4 ? 2 : 1;

  // Feasibility: only constraints the participant chose to tell us about.
  const switching = pathway.change !== "no-switch";
  let feasibility = 3 as 0 | 1 | 2 | 3;
  const lower = (n: 0 | 1 | 2 | 3) => {
    if (n < feasibility) feasibility = n;
  };
  if (has(profile.readiness, "stay") && !has(profile.readiness, "switch") && switching) lower(pathway.change === "stretch" ? 0 : 1);
  if (has(profile.constraints, "financial") && switching) lower(pathway.change === "stretch" ? 1 : 2);
  if (has(profile.constraints, "time") && !pathway.lowCommitment) lower(1);

  let priority: Priority;
  let priorityReason: string;
  if (feasibility === 0) {
    priority = "Not currently practical";
    priorityReason = "It would mean changing careers, and you told us you're not looking to right now.";
  } else if (pathway.change === "stretch" && (skill <= 1 || has(profile.readiness, "long-horizon"))) {
    priority = "Longer-term possibility";
    priorityReason = skill <= 1 ? "It would need skills you didn't highlight, so it's one to build towards." : "It fits the longer transition you described.";
  } else if (feasibility >= 2 && skill >= 2) {
    priority = "Explore now";
    priorityReason = "You have relevant experience and nothing you told us rules it out.";
  } else {
    priority = "Worth investigating";
    priorityReason = feasibility <= 1 ? "Promising, but a constraint you mentioned needs working through first." : "Promising, but the evidence of fit is still thin.";
  }

  return {
    skill: SKILL_SCALE(skill),
    motivation: MOTIVATION_SCALE(motivation),
    feasibility: FEASIBILITY_SCALE(feasibility),
    evidence: pathway.evidence,
    learning: pathway.learning,
    testability: pathway.change === "stretch" ? "Takes more set-up" : "Easy to test",
    priority,
    priorityReason,
  };
}

export function rankPathways(profile: Profile, excluded: string[] = []): Candidate[] {
  return PATHWAYS.filter((p) => !excluded.includes(p.id))
    .map((p) => scorePathway(p, profile))
    .sort((a, b) => b.score - a.score || a.pathway.id.localeCompare(b.pathway.id));
}

/**
 * Pick three differentiated hypotheses: by default one adjacent move, one stretch and one way
 * to contribute without switching jobs. People who are not looking to switch get a second
 * no-switch option instead of a stretch.
 */
export function selectPathways(profile: Profile, excluded: string[] = []): { role: Role; candidate: Candidate }[] {
  // Never manufacture three options: drop candidates with no relevant skill and little interest.
  const all = rankPathways(profile, excluded);
  const credible = all.filter((c) => !(c.fit.skill.score === 0 && c.fit.motivation.score <= 1));
  const ranked = credible.length ? credible : all.slice(0, 1);
  const notSwitching = profile.readiness.some((t) => t.key === "stay") && !profile.readiness.some((t) => t.key === "switch");
  const slots: Role[] = notSwitching ? ["no-switch", "adjacent", "no-switch"] : ["adjacent", "stretch", "no-switch"];

  const chosen: { role: Role; candidate: Candidate }[] = [];
  const isDistinct = (c: Candidate) =>
    chosen.every(
      ({ candidate: o }) =>
        o.pathway.id !== c.pathway.id && !(o.pathway.cause && o.pathway.cause === c.pathway.cause && o.pathway.mode === c.pathway.mode),
    );

  for (const role of slots) {
    const pick =
      ranked.find((c) => c.pathway.change === (role as ChangeLevel) && isDistinct(c)) ?? ranked.find((c) => isDistinct(c));
    if (pick) chosen.push({ role: pick.pathway.change as Role, candidate: pick });
  }
  return chosen;
}
