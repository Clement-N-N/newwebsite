import { CAUSE_LABELS } from "../assessment/labels";
import { QUESTION_BANK_VERSION } from "../assessment/questions";
import type { Capability, Responses } from "../assessment/types";
import { LIBRARY_VERSION } from "../knowledge/pathways";
import { extractProfile, type Evidence, type Profile, type Theme } from "./extract";
import { buildMap } from "./map";
import { ENGINE_VERSION, ROLE_LABELS, selectPathways, type Candidate, type Role } from "./recommend";
import type { Claim, EvidenceRef, Insight, PathwayRec, Report } from "./schema";

export class IncompleteAssessmentError extends Error {
  constructor(public missing: number) {
    super(`Assessment incomplete: ${missing} required question(s) unanswered.`);
  }
}

export interface ReportOptions {
  rejectedThemes?: string[];
  rejectedPathways?: string[];
  selectedPathwayId?: string | null;
  sample?: boolean;
  now?: Date;
}

const CAPABILITY_MEANING: Record<Capability, string> = {
  operations: "Making organisations work: processes, coordination and getting things done reliably.",
  leadership: "Setting direction and taking people with you, especially through change.",
  research: "Turning messy information into clear judgements.",
  technology: "Building and running technical systems.",
  finance: "Judging money, risk and trade-offs carefully.",
  communication: "Making complex ideas clear and persuading people who start out sceptical.",
  people: "Helping people grow and making teams work well together.",
  entrepreneurship: "Starting things where nothing existed and coping with uncertainty.",
  policy: "Understanding how institutions, rules and decisions work.",
};

/** Impact Compass §16.2: why each capability might be useful in a different context. */
const CAPABILITY_TRANSFER: Record<Capability, string> = {
  operations: "Effective organisations are often limited by delivery and systems, not ideas. Reliable operations can let a small team do far more of its core work.",
  leadership: "Growing organisations need people who can set direction and hold teams together through change.",
  research: "Choosing where effort goes depends on judging evidence well, in research teams, funders and evaluators alike.",
  technology: "Many effective organisations have few engineers, so technical skill can multiply a small team's output.",
  finance: "Judging cost, risk and trade-offs is central to deciding which work gets funded.",
  communication: "Clear explanation brings funding, talent and support to work that is otherwise easy to overlook.",
  people: "Hiring and keeping good people is a frequent bottleneck for growing nonprofits.",
  entrepreneurship: "Some promising interventions have no organisation delivering them yet; someone has to build one.",
  policy: "Many problems are shaped by rules and institutions, so understanding how decisions get made can be a lever.",
};

const ref = (e: Evidence): EvidenceRef => ({ questionId: e.questionId, quote: e.quote });
const refs = (t: Theme) => t.evidence.map(ref);

/** "a", "a and b", "a, b and c" */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function buildStory(profile: Profile): Report["story"] {
  const paragraphs: Claim[] = [];
  const background = profile.capabilities.flatMap((t) => t.evidence).filter((e) => e.questionId === "background");
  const uniqueBackground = background.filter((e, i) => background.findIndex((o) => o.quote === e.quote) === i);
  const top = profile.capabilities.slice(0, 2);

  if (uniqueBackground.length) {
    paragraphs.push({
      text: `You told us ${joinList(uniqueBackground.map((e) => e.quote))}.`,
      evidence: uniqueBackground.map(ref),
      sources: [],
    });
  }

  const behaviour = top.flatMap((t) => t.evidence.filter((e) => e.basis === "demonstrated" && e.questionId !== "background")).slice(0, 3);
  if (top.length) {
    paragraphs.push({
      text: behaviour.length
        ? `Across your answers, ${joinList(top.map((t) => t.label.toLowerCase()))} come up most often. You said ${joinList(
            behaviour.map((e) => e.quote),
          )}.`
        : `Across your answers, ${joinList(top.map((t) => t.label.toLowerCase()))} come up most often.`,
      evidence: (behaviour.length ? behaviour : top.flatMap((t) => t.evidence)).map(ref),
      sources: [],
    });
  }

  if (profile.proud) {
    paragraphs.push({
      text: `In your own words: “${profile.proud}”`,
      evidence: [{ questionId: "proud", quote: "your own description of work you are proud of" }],
      sources: [],
    });
  }

  const [a, b] = profile.capabilities.slice(0, 2).map((t) => t.label.toLowerCase());
  const headline = a
    ? `Your ${b ? `${a} and ${b}` : a} experience may travel further than you think.`
    : "Your career has equipped you with more than a job title.";
  const discovery = a
    ? `Your answers show the clearest evidence for ${b ? `${a} and ${b}` : a}. Below are the strengths behind that, the possibilities that look most worth testing, and one small experiment for this week. Everything here is a hypothesis you can check, not a conclusion.`
    : "Below is what your answers suggest so far. Everything here is a hypothesis you can check, not a conclusion.";
  return { headline, discovery, paragraphs };
}

function buildStrengths(profile: Profile): Insight[] {
  return profile.capabilities.slice(0, 5).map((t) => ({
    id: t.id,
    label: t.label,
    description: `${CAPABILITY_MEANING[t.key]} You told us ${joinList(bestEvidence([t], 1).concat(t.evidence.filter((e) => e !== bestEvidence([t], 1)[0])).slice(0, 2).map((e) => e.quote))}.`,
    transfer: CAPABILITY_TRANSFER[t.key],
    // A behaviour statement is explicit evidence; inferring a skill from a field of work is not.
    evidenceType: t.evidence.some((e) => e.basis === "demonstrated" && e.questionId !== "background") ? "Explicit evidence" : "Reasonable inference",
    confidence: t.confidence,
    basis: t.basis,
    evidence: refs(t),
  }));
}

function buildMotivations(profile: Profile): Insight[] {
  const demonstratedQuestions = new Set(
    profile.capabilities.flatMap((t) => t.evidence.filter((e) => e.basis === "demonstrated").map((e) => e.questionId)),
  );
  return profile.motivations.slice(0, 4).map((t) => {
    const backedByExperience = t.evidence.some((e) => demonstratedQuestions.has(e.questionId));
    return {
      id: t.id,
      label: t.label,
      description: backedByExperience
        ? `Something you say matters to you, and your experience shows it too: ${t.evidence[0].quote}.`
        : `Something you say matters to you: ${t.evidence[0].quote}.`,
      confidence: t.confidence,
      basis: backedByExperience ? "both" : "stated",
      evidence: refs(t),
    };
  });
}

/** Prefer behaviour statements over the background question, and never repeat a quote. */
function bestEvidence(themes: Theme[], limit: number, avoid: Set<string> = new Set()): Evidence[] {
  const out: Evidence[] = [];
  // Themes with not-yet-quoted evidence come first; otherwise keep the given priority.
  const fresh = (t: Theme) => t.evidence.some((e) => !avoid.has(e.quote));
  const prioritised = [...themes.filter(fresh), ...themes.filter((t) => !fresh(t))];
  for (const t of prioritised) {
    const ordered = [...t.evidence].sort(
      (a, b) =>
        Number(avoid.has(a.quote)) - Number(avoid.has(b.quote)) ||
        Number(b.basis === "demonstrated") - Number(a.basis === "demonstrated") ||
        Number(a.questionId === "background") - Number(b.questionId === "background"),
    );
    const pick = ordered.find((e) => !out.some((o) => o.quote === e.quote));
    if (pick) out.push(pick);
    if (out.length >= limit) break;
  }
  return out;
}

/** Evidence about how someone wants to contribute, skipping answers that only imply it. */
function modeEvidence(theme: Theme | undefined): Evidence | undefined {
  if (!theme) return undefined;
  return (
    theme.evidence.find((e) => e.questionId === "x-transfer") ??
    theme.evidence.find((e) => e.questionId === "contribution" && / (first|second)$/.test(e.quote)) ??
    theme.evidence.find((e) => e.questionId === "s-behind")
  );
}

/**
 * Explain a pathway with the capabilities it depends on most (in the pathway's own priority
 * order), preferring evidence not already quoted for an earlier pathway so the three
 * explanations don't read as copies of each other.
 */
function buildWhy(c: Candidate, profile: Profile, used: Set<string>): Claim {
  const byPathwayPriority = [...c.matchedCapabilities].sort(
    (a, b) => c.pathway.capabilities.indexOf(a.key) - c.pathway.capabilities.indexOf(b.key),
  );
  const capEvidence = bestEvidence(byPathwayPriority, 2, used);
  capEvidence.forEach((e) => used.add(e.quote));
  const parts: string[] = [];
  const evidence: EvidenceRef[] = [];

  if (capEvidence.length) {
    parts.push(`You told us ${joinList(capEvidence.map((e) => e.quote))}, which this work relies on.`);
    evidence.push(...capEvidence.map(ref));
  } else {
    parts.push("This would mean building skills you did not highlight, so treat it as a genuine stretch.");
  }
  if (c.matchedCause) {
    parts.push(`You also said ${c.matchedCause.evidence[0].quote}.`);
    evidence.push(ref(c.matchedCause.evidence[0]));
  }
  const mode = modeEvidence(profile.modes.find((t) => t.key === c.pathway.mode));
  if (mode && evidence.length < 3) {
    parts.push(`It fits how you'd like to contribute: ${mode.quote}.`);
    evidence.push(ref(mode));
  }
  if (!evidence.length) {
    const fallback = profile.capabilities[0]?.evidence[0];
    if (fallback) evidence.push(ref(fallback));
  }
  return { text: parts.join(" "), evidence, sources: c.pathway.sources };
}

function buildUncertainties(c: Candidate, profile: Profile): string[] {
  const out: string[] = [];
  const has = (themes: Theme[], key: string) => themes.some((t) => t.key === key);
  if (has(profile.constraints, "financial") && c.pathway.change !== "no-switch") {
    out.push("Whether pay in this area fits your financial commitments.");
  }
  if (has(profile.constraints, "time") && !c.pathway.lowCommitment) {
    out.push("Whether you can make room for this alongside your current responsibilities.");
  }
  if (c.fit.skill.score <= 1) out.push("How much new learning you'd need before you could contribute.");
  if (c.pathway.cause && !c.matchedCause && profile.causes.length) {
    out.push(`You didn't choose ${CAUSE_LABELS[c.pathway.cause].toLowerCase()}, so check whether it holds your interest.`);
  }
  if (!profile.causes.length && c.pathway.cause) {
    out.push("You haven't chosen a cause yet, so this is one example among several you could compare.");
  }
  return out;
}

function toRec(role: Role, c: Candidate, profile: Profile, used: Set<string>): PathwayRec {
  const p = c.pathway;
  return {
    id: p.id,
    role,
    roleLabel: ROLE_LABELS[role],
    title: p.title,
    cause: p.cause,
    need: p.need,
    mechanism: p.mechanism,
    why: buildWhy(c, profile, used),
    capabilities: c.matchedCapabilities.slice(0, 3).map((t) => t.label),
    fit: c.fit,
    assumptions: p.assumptions,
    uncertainties: buildUncertainties(c, profile),
    constraints: p.constraints,
    counterfactual: p.counterfactual,
    requirements: p.requirements,
    reviseIf: p.reviseIf,
    experiment: { pathwayId: p.id, ...p.experiment },
    sources: p.sources,
    resources: p.resources,
  };
}

function buildUnknowns(profile: Profile, recs: PathwayRec[]): Claim[] {
  const out: Claim[] = [];
  const constraint = (key: string) => profile.constraints.find((t) => t.key === key);

  const financial = constraint("financial");
  if (financial) {
    out.push({
      text: "Financial sustainability matters in your decisions. Find out what roles you're curious about actually pay before ruling them in or out.",
      evidence: refs(financial),
      sources: [],
    });
  }
  const time = constraint("time");
  if (time) {
    out.push({
      text: "Time is tight right now. Your first experiments should fit inside a normal week.",
      evidence: refs(time),
      sources: [],
    });
  }
  for (const q of profile.unsure.slice(0, 2)) {
    out.push({
      text: `You weren't sure whether “${q.statement}” That uncertainty is worth exploring, not resolving today.`,
      evidence: [{ questionId: q.id, quote: "you answered “Not sure”" }],
      sources: [],
    });
  }
  if (!profile.causes.length) {
    out.push({
      text: "You haven't settled on a problem to focus on. Comparing a few problems is one of the most useful early steps.",
      evidence: [{ questionId: "causes", quote: "you did not choose a cause yet" }],
      sources: ["80k-problems"],
    });
  }
  const tentative = profile.capabilities.slice(0, 5).find((t) => t.confidence === "tentative");
  if (tentative) {
    out.push({
      text: `We have only a little evidence for ${tentative.label.toLowerCase()}. Ask a colleague whether they would describe you that way.`,
      evidence: refs(tentative),
      sources: [],
    });
  }
  const first = recs[0];
  if (first) {
    // The assumption behind the leading pathway could change the recommendation most, so it goes second.
    out.splice(Math.min(1, out.length), 0, {
      text: `For “${first.title}”, the biggest assumption to check is: ${first.assumptions[0].charAt(0).toLowerCase()}${first.assumptions[0].slice(1)}`,
      evidence: first.why.evidence,
      sources: first.sources,
    });
  }
  // Impact Compass §16.6: two or three unknowns, the ones most likely to change the decision.
  return out.slice(0, 3);
}

/** §16.5: how the pathways differ, without pretending to know which will matter most. */
function buildTradeoffs(recs: PathwayRec[], profile: Profile): Report["tradeoffs"] {
  if (recs.length < 2) return [];
  const by = <T,>(f: (p: PathwayRec) => T) => recs.map((p) => ({ p, v: f(p) }));
  const name = (p: PathwayRec) => `“${p.title}”`;
  const out: Report["tradeoffs"] = [];

  const fit = by((p) => p.fit.skill.score).sort((x, y) => y.v - x.v);
  out.push({
    dimension: "Personal fit",
    text:
      fit[0].v > fit[fit.length - 1].v
        ? `${name(fit[0].p)} draws most directly on what you've done. ${name(fit[fit.length - 1].p)} relies more on skills you didn't highlight.`
        : "Your experience is similarly relevant to each of these, so interest and feasibility may decide between them.",
  });

  const learning = recs.filter((p) => p.fit.learning === "High");
  out.push({
    dimension: "Time and effort",
    text: learning.length
      ? `${joinList(learning.map(name))} would take the most new learning. The others could be explored with less preparation.`
      : "None of these needs extensive retraining to start exploring.",
  });

  const stay = recs.filter((p) => p.role === "no-switch");
  const move = recs.filter((p) => p.role !== "no-switch");
  const financial = profile.constraints.some((t) => t.key === "financial");
  out.push({
    dimension: "Financial sustainability and risk",
    text:
      stay.length && move.length
        ? `${joinList(stay.map(name))} keeps your current income and job. ${joinList(move.map(name))} would likely mean a move, where pay${
            financial ? ", which you told us matters," : ""
          } varies and is worth checking early.`
        : stay.length
          ? "All of these work alongside your current job, so the financial risk is low; the trade-off is that your time is limited."
          : `Each of these would likely mean a move${financial ? ", so check pay early, as you told us it matters" : ""}.`,
  });

  const stretch = recs.find((p) => p.role === "stretch");
  out.push({
    dimension: "Learning and career capital",
    text: stretch
      ? `${name(stretch)} would build the most new career capital, at the cost of more uncertainty. The others deepen what you already have and keep options open.`
      : "These options mainly deepen and redeploy what you already have, which keeps future options open.",
  });
  return out;
}

/** §14: seven days by default; one weekly action when time is tight. */
/** Exported so the UI can rebuild the plan when the participant picks a different experiment. */
export function buildPlan(experiment: Report["experiment"], chosenTitle: string | undefined, weekly: boolean): Report["plan"] {
  const title = chosenTitle ? `“${chosenTitle}”` : "your chosen pathway";
  if (weekly) {
    return {
      mode: "weekly",
      steps: [
        { when: "This week", task: `${experiment.title}: ${experiment.steps[0]}` },
        { when: "When you have time", task: experiment.steps.slice(1).join(" ") || "Write down what you learned." },
        { when: "End of the week", task: `Decide. ${experiment.decisionRule}` },
      ],
    };
  }
  return {
    mode: "daily",
    steps: [
      { when: "Day 1", task: `Review your results and confirm you want to test ${title}.` },
      { when: "Day 2", task: experiment.steps[0] },
      { when: "Day 3", task: experiment.steps[1] ?? "Identify a person, organisation or resource to learn from." },
      { when: "Day 4", task: experiment.steps[2] ?? "Start a conversation or a small exploratory task." },
      { when: "Day 5", task: `Write down what you found. Look for: ${experiment.evidence.charAt(0).toLowerCase()}${experiment.evidence.slice(1)}` },
      { when: "Day 6", task: "Reflect on fit, feasibility and how this work would actually make a difference." },
      { when: "Day 7", task: `Decide whether to continue, revise or try another pathway. ${experiment.decisionRule}` },
    ],
  };
}

/** §16.9: one question specific to this profile and its next decision. */
function buildReflectiveQuestion(profile: Profile, recs: PathwayRec[]): string {
  const has = (themes: Theme[], key: string) => themes.some((t) => t.key === key);
  const stretch = recs.find((p) => p.role === "stretch");
  const first = recs[0];
  if (has(profile.readiness, "stay") && !has(profile.readiness, "switch")) {
    return "If you stayed in your current role for the next two years, what is one decision at work you could influence that matters for a problem you care about?";
  }
  if (has(profile.constraints, "financial") && stretch) {
    return `What income would you need for a move like “${stretch.title}” to feel safe, and what is the quickest way to find out what such roles actually pay?`;
  }
  if (!profile.causes.length) {
    return "Which problem in the world would you be most disappointed never to have worked on, and why that one?";
  }
  if (profile.unsure.length) {
    return `You weren't sure whether “${profile.unsure[0].statement}” What would you need to see in yourself to answer that with confidence?`;
  }
  return first
    ? `What result from your experiment on “${first.title}” would genuinely change your mind about it?`
    : "What would you need to learn this week to feel confident about your next step?";
}

const has = (themes: Theme[], key: string) => themes.some((t) => t.key === key);

export function buildReport(responses: Responses, options: ReportOptions = {}): Report {
  const profile = extractProfile(responses, options.rejectedThemes ?? []);
  if (!profile.complete) throw new IncompleteAssessmentError(profile.required - profile.answered);

  const selected = selectPathways(profile, options.rejectedPathways ?? []);
  const used = new Set<string>();
  const pathways = selected.map(({ role, candidate }) => toRec(role, candidate, profile, used));
  const chosen = pathways.find((p) => p.id === options.selectedPathwayId) ?? pathways[0];
  const experiment = chosen.experiment;

  const map = buildMap(
    profile,
    selected.map((s) => s.candidate),
  );

  const insight = (t: Theme, description: string): Insight => ({
    id: t.id,
    label: t.label,
    description,
    confidence: t.confidence,
    basis: t.basis,
    evidence: refs(t),
  });

  return {
    meta: {
      generatedAt: (options.now ?? new Date()).toISOString(),
      questionBankVersion: QUESTION_BANK_VERSION,
      engineVersion: ENGINE_VERSION,
      libraryVersion: LIBRARY_VERSION,
      promptVersion: null,
      narrative: "rules",
      sample: options.sample ?? false,
    },
    story: buildStory(profile),
    strengths: buildStrengths(profile),
    motivations: buildMotivations(profile),
    causes: profile.causes.map((t) => insight(t, capitalise(`${t.evidence[0].quote}.`))),
    constraints: profile.constraints.map((t) => insight(t, capitalise(`${t.evidence[0].quote}.`))),
    map,
    pathways,
    tradeoffs: buildTradeoffs(pathways, profile),
    unknowns: buildUnknowns(profile, pathways),
    experiment,
    plan: buildPlan(experiment, chosen?.title, profile.constraints.some((t) => t.key === "time")),
    learning: {
      lesson: "Lesson 1 · Judging whether a career path is high-impact",
      why: profile.causes.length
        ? "It shows how people compare problems and test pathways, so you can judge these hypotheses for yourself."
        : "You haven't chosen a problem yet, and this lesson shows how people compare problems before choosing.",
      href: "/learn",
      followOn: has(profile.readiness, "switch") && !has(profile.readiness, "stay") ? "hip-iap" : "hip-resources",
    },
    reflectiveQuestion: buildReflectiveQuestion(profile, pathways),
    nextSteps: [
      {
        title: "Explore HIP's free resources",
        description: "Career-planning guides and tools from High Impact Professionals.",
        sourceId: "hip-resources",
      },
      {
        title: "Learn about the Impact Accelerator Program",
        description: "A structured programme for professionals planning their next steps. Completing Impact Career Compass does not enrol you.",
        sourceId: "hip-iap",
      },
      {
        title: "See how HIP supports professionals",
        description: "Including the Talent Directory and Pledge Club. Neither is joined automatically by using this tool.",
        sourceId: "hip-home",
      },
    ],
  };
}

