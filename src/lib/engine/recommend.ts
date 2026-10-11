import type { Capability, Cause, Motivation } from "../assessment/types";
import { PATHWAYS, type ChangeLevel, type Pathway } from "../knowledge/pathways";
import { scoreOf, type Profile, type Theme } from "./extract";

export const ENGINE_VERSION = "engine-2026.10.1";

export type SkillFit = "Strong" | "Moderate" | "Developing";
export type Feasibility = "Higher" | "Medium" | "Lower";
export type MotivationFit = "Strong" | "Some" | "Unclear";

export interface Fit {
  skill: SkillFit;
  feasibility: Feasibility;
  motivation: MotivationFit;
  learning: Pathway["learning"];
  testability: "Easy to test" | "Takes more set-up";
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

  const fit: Fit = {
    skill: skill >= 0.7 ? "Strong" : skill >= 0.4 ? "Moderate" : "Developing",
    feasibility: feasibility >= 0.85 ? "Higher" : feasibility >= 0.6 ? "Medium" : "Lower",
    motivation: motivation >= 0.6 ? "Strong" : motivation >= 0.25 ? "Some" : "Unclear",
    learning: pathway.learning,
    testability: pathway.change === "stretch" ? "Takes more set-up" : "Easy to test",
  };

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
  const ranked = rankPathways(profile, excluded);
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
